import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

import { EventosRepository } from '../eventos/eventos.repository';
import { MENSAJE_SENDER, MensajeSender } from './mensaje-sender';
import { MensajeBuilder } from './mensaje.builder';
import { RecurrenciaService } from './recurrencia.service';

export interface TickResult {
  encontrados: number;
  enviados: number;
  fallidos: number;
  descartados: number;
}

/**
 * Orquesta un ciclo del scheduler:
 *   1. Liberar 'stuck' (crashes en 'enviando').
 *   2. Descartar vencidos por ventana de gracia (recurrentes se reprograman, no se cierran).
 *   3. Claim atómico -> enviar -> marcar enviado / reprogramar (recurrente) / volver a pendiente.
 */
@Injectable()
export class RecordatoriosService {
  private readonly logger = new Logger(RecordatoriosService.name);
  private readonly graciaMin: number;
  private readonly stuckMin: number;

  constructor(
    private readonly repo: EventosRepository,
    private readonly builder: MensajeBuilder,
    @Inject(MENSAJE_SENDER) private readonly sender: MensajeSender,
    private readonly recurrencia: RecurrenciaService,
    config: ConfigService,
  ) {
    this.graciaMin = config.get<number>('SCHEDULER_GRACIA_MIN', 60);
    this.stuckMin = config.get<number>('STUCK_TIMEOUT_MIN', 5);
  }

  async procesarTick(): Promise<TickResult> {
    const ahora = DateTime.utc();

    const liberados = await this.repo.liberarStuck(this.stuckMin);
    if (liberados > 0) {
      this.logger.warn(`Liberados ${liberados} evento(s) colgados en 'enviando'.`);
    }

    // ── Descarte por gracia (recurrentes se ruedan hacia adelante) ──
    const descartados = await this.repo.descartarVencidos(this.graciaMin);
    for (const d of descartados) {
      const proxima = d.recurrencia
        ? this.recurrencia.proximaFutura(d.fechaHoraUtc, d.recurrencia, ahora)
        : null;
      if (proxima) {
        await this.repo.reprogramar(d.id, proxima);
        this.logger.warn(
          `Evento ${d.id} vencido por gracia pero recurrente → reprogramado a ${proxima} UTC.`,
        );
      } else {
        this.logger.warn(
          `Descartado por gracia (>${this.graciaMin} min): evento ${d.id} (${d.fechaHoraUtc} UTC) — no se envía.`,
        );
      }
    }

    // ── Envío de los que toca avisar ──
    const candidatos = await this.repo.claimDue(this.graciaMin);
    let enviados = 0;
    let fallidos = 0;

    for (const ev of candidatos) {
      const texto = this.builder.build(ev);
      let ok = false;
      try {
        ok = await this.sender.enviar(ev.numero, texto);
      } catch (err) {
        this.logger.error(
          `Error enviando recordatorio ${ev.id}`,
          err instanceof Error ? err.stack : String(err),
        );
      }

      if (ok) {
        const proxima = ev.recurrencia
          ? this.recurrencia.proximaFutura(ev.fechaHoraUtc, ev.recurrencia, ahora)
          : null;
        if (proxima) {
          await this.repo.reprogramar(ev.id, proxima);
        } else {
          await this.repo.marcarEnviado(ev.id);
        }
        enviados++;
      } else {
        // Sin marcar notificado: se reintenta el próximo tick mientras esté dentro de la gracia.
        await this.repo.volverAPendiente(ev.id);
        fallidos++;
      }
    }

    const result: TickResult = {
      encontrados: candidatos.length,
      enviados,
      fallidos,
      descartados: descartados.length,
    };
    this.logger.log(
      `Tick: encontrados=${result.encontrados} enviados=${result.enviados} ` +
        `fallidos=${result.fallidos} descartados=${result.descartados}`,
    );
    return result;
  }
}
