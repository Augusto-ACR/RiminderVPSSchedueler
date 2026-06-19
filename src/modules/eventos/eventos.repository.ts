import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DATA_SOURCE } from '../../database/database.module';
import { EventoDescartado, EventoDue } from './eventos.types';

/**
 * Acceso a la tabla compartida `eventos`. Encapsula el claim atómico y las transiciones
 * de estado de notificación.
 *
 * Todo se compara en **UTC** usando `timezone('UTC', now())` (no depende de la zona de la
 * sesión ni de la VPS). `fecha_hora` se devuelve como texto ISO sin zona para evitar que el
 * driver de Postgres lo reinterprete en la zona local del proceso Node.
 */
@Injectable()
export class EventosRepository {
  // Columnas a devolver en el claim, como texto UTC seguro.
  private static readonly RETURNING_DUE = `
    id,
    numero,
    titulo,
    to_char(fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS "fechaHoraUtc",
    descripcion,
    recurrencia,
    aviso_min AS "avisoMin"`;

  constructor(@Inject(DATA_SOURCE) private readonly ds: DataSource) {}

  /**
   * Normaliza el resultado de `query()`: TypeORM/pg puede devolver el arreglo de filas
   * directo, o un tuple `[filas, cantidadAfectada]` para UPDATE...RETURNING. Devolvemos
   * siempre el arreglo de filas.
   */
  private static filas<T>(result: unknown): T[] {
    if (!Array.isArray(result)) {
      return [];
    }
    // Tuple [filas, count]: el primer elemento es a su vez un arreglo.
    if (result.length > 0 && Array.isArray(result[0])) {
      return result[0] as T[];
    }
    return result as T[];
  }

  /**
   * Devuelve a 'pendiente' los eventos que quedaron colgados en 'enviando' por un crash
   * (su intento es más viejo que `stuckMin`). Retorna cuántos liberó.
   */
  async liberarStuck(stuckMin: number): Promise<number> {
    const result = await this.ds.query(
      `UPDATE eventos
         SET notif_estado = 'pendiente'
       WHERE notif_estado = 'enviando'
         AND notif_intento_at < timezone('UTC', now()) - make_interval(mins => $1::int)
       RETURNING id`,
      [stuckMin],
    );
    return EventosRepository.filas(result).length;
  }

  /**
   * Marca como 'descartado' (notificado, sin enviar) los pendientes cuyo momento de aviso
   * quedó atrasado más que la ventana de gracia. Anti-spam tras una caída.
   */
  async descartarVencidos(graciaMin: number): Promise<EventoDescartado[]> {
    const result = await this.ds.query(
      `UPDATE eventos
         SET notif_estado = 'descartado', notificado = true
       WHERE notificado = false
         AND notif_estado = 'pendiente'
         AND (fecha_hora - make_interval(mins => GREATEST(COALESCE(aviso_min, 0), 0)))
             <= timezone('UTC', now()) - make_interval(mins => $1::int)
       RETURNING
         id,
         numero,
         to_char(fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS "fechaHoraUtc",
         recurrencia`,
      [graciaMin],
    );
    return EventosRepository.filas<EventoDescartado>(result);
  }

  /**
   * Claim atómico: selecciona los eventos cuyo momento de aviso ya llegó (dentro de la
   * ventana de gracia) y los marca 'enviando' en el MISMO statement, de modo que ningún
   * otro tick (ni el agente) los vuelva a tomar. Retorna las filas reclamadas.
   */
  async claimDue(graciaMin: number, limite = 200): Promise<EventoDue[]> {
    const result = await this.ds.query(
      `UPDATE eventos
         SET notif_estado = 'enviando', notif_intento_at = timezone('UTC', now())
       WHERE id IN (
         SELECT id FROM eventos
          WHERE notificado = false
            AND notif_estado = 'pendiente'
            AND (fecha_hora - make_interval(mins => GREATEST(COALESCE(aviso_min, 0), 0)))
                <= timezone('UTC', now())
            AND (fecha_hora - make_interval(mins => GREATEST(COALESCE(aviso_min, 0), 0)))
                > timezone('UTC', now()) - make_interval(mins => $1::int)
          ORDER BY fecha_hora
          LIMIT $2
          FOR UPDATE SKIP LOCKED
       )
       RETURNING ${EventosRepository.RETURNING_DUE}`,
      [graciaMin, limite],
    );
    return EventosRepository.filas<EventoDue>(result);
  }

  /** Cierra un evento enviado con éxito. */
  async marcarEnviado(id: number): Promise<void> {
    await this.ds.query(
      `UPDATE eventos
         SET notif_estado = 'enviado', notificado = true,
             notif_enviado_at = timezone('UTC', now())
       WHERE id = $1`,
      [id],
    );
  }

  /** Devuelve un evento a 'pendiente' tras un fallo de envío (se reintenta el próximo tick). */
  async volverAPendiente(id: number): Promise<void> {
    await this.ds.query(`UPDATE eventos SET notif_estado = 'pendiente' WHERE id = $1`, [id]);
  }

  /**
   * Rueda un evento recurrente a su próxima ocurrencia: mueve `fecha_hora` y lo deja listo
   * para volver a avisar (`pendiente`, `notificado=false`). `nuevaFechaUtc` es ISO sin zona.
   */
  async reprogramar(id: number, nuevaFechaUtc: string): Promise<void> {
    await this.ds.query(
      `UPDATE eventos
         SET fecha_hora = $2::timestamp,
             notificado = false,
             notif_estado = 'pendiente',
             notif_intento_at = NULL,
             notif_enviado_at = NULL
       WHERE id = $1`,
      [id, nuevaFechaUtc],
    );
  }
}
