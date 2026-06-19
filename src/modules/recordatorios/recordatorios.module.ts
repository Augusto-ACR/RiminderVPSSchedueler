import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EventosModule } from '../eventos/eventos.module';
import { OpenwaClient } from '../openwa/openwa.client';
import { OpenwaModule } from '../openwa/openwa.module';
import { LoggingSender } from './logging.sender';
import { MENSAJE_SENDER, MensajeSender } from './mensaje-sender';
import { MensajeBuilder } from './mensaje.builder';
import { RecordatoriosService } from './recordatorios.service';
import { RecurrenciaService } from './recurrencia.service';

@Module({
  imports: [EventosModule, OpenwaModule],
  providers: [
    RecordatoriosService,
    MensajeBuilder,
    RecurrenciaService,
    LoggingSender,
    {
      // Elige el canal de envío según SENDER_DRIVER (default 'openwa').
      // 'mock' (LoggingSender) sirve para probar contra la BD sin tocar WhatsApp.
      provide: MENSAJE_SENDER,
      inject: [ConfigService, OpenwaClient, LoggingSender],
      useFactory: (
        config: ConfigService,
        openwa: OpenwaClient,
        mock: LoggingSender,
      ): MensajeSender => {
        return config.get<string>('SENDER_DRIVER', 'openwa') === 'mock' ? mock : openwa;
      },
    },
  ],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
