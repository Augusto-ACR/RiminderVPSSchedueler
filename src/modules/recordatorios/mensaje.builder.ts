import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

import { EventoDue } from '../eventos/eventos.types';

/**
 * Arma el texto del recordatorio con una plantilla fija (sin LLM).
 * Convierte la `fecha_hora` (UTC) a la zona local del usuario (`TIMEZONE`) solo para mostrarla.
 */
@Injectable()
export class MensajeBuilder {
  private readonly zona: string;

  constructor(config: ConfigService) {
    this.zona = config.get<string>('TIMEZONE', 'America/Argentina/Buenos_Aires');
  }

  build(evento: EventoDue): string {
    const cuando = DateTime.fromISO(evento.fechaHoraUtc, { zone: 'utc' })
      .setZone(this.zona)
      .setLocale('es')
      .toFormat("cccc dd/MM/yyyy 'a las' HH:mm");

    const lineas = [`Recordatorio: ${evento.titulo}`, cuando];
    if (evento.descripcion) {
      lineas.push(evento.descripcion);
    }
    return lineas.join('\n');
  }
}
