import { Injectable } from '@nestjs/common';
import { DateTime, DurationLikeObject } from 'luxon';

type Unidad = 'days' | 'weeks' | 'months' | 'years';

/**
 * Cálculo de la próxima ocurrencia de un evento recurrente.
 *
 * Reglas: diaria +1d, semanal +7d, mensual +1 mes, anual +1 año.
 * Los días borde se ajustan al último día válido del mes (31 → 30/28/29; 29-feb → 28-feb
 * en años no bisiestos): luxon hace ese clamping nativo en `plus`.
 *
 * Se avanza SIEMPRE desde la fecha ORIGINAL (multiplicador k) y no encadenando, para no
 * derivar el día del mes (ej: 31-ene +2 meses = 31-mar, no 28-mar).
 */
@Injectable()
export class RecurrenciaService {
  /**
   * Devuelve la primera ocurrencia ESTRICTAMENTE futura respecto de `ahora`, en ISO UTC sin
   * zona ('YYYY-MM-DDTHH:mm:ss'). Si la recurrencia no es válida, devuelve null.
   * Si se perdieron varias ocurrencias (server caído), salta hasta la primera futura sin
   * enviar por cada salto.
   */
  proximaFutura(
    fechaUtcIso: string,
    recurrencia: string | null,
    ahora: DateTime = DateTime.utc(),
  ): string | null {
    const unidad = this.unidad(recurrencia);
    if (!unidad) {
      return null;
    }

    const base = DateTime.fromISO(fechaUtcIso, { zone: 'utc' });
    if (!base.isValid) {
      return null;
    }

    let k = 1;
    let next = base.plus(this.duracion(unidad, k));
    // Tope de seguridad por si la fecha base fuera absurdamente vieja.
    while (next <= ahora && k < 100_000) {
      k += 1;
      next = base.plus(this.duracion(unidad, k));
    }

    return next.toFormat("yyyy-MM-dd'T'HH:mm:ss");
  }

  private duracion(unidad: Unidad, k: number): DurationLikeObject {
    return { [unidad]: k };
  }

  private unidad(recurrencia: string | null): Unidad | null {
    switch ((recurrencia ?? '').trim().toLowerCase()) {
      case 'diaria':
        return 'days';
      case 'semanal':
        return 'weeks';
      case 'mensual':
        return 'months';
      case 'anual':
        return 'years';
      default:
        return null;
    }
  }
}
