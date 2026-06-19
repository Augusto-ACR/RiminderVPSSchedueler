import { Injectable, Logger } from '@nestjs/common';

import { MensajeSender } from './mensaje-sender';

/**
 * Sender de desarrollo (Hito 2): NO envía a WhatsApp, solo loguea el mensaje y simula éxito.
 * Permite probar el claim atómico, la idempotencia y la ventana de gracia sin tocar OpenWA.
 * En Hito 3 se reemplaza por el cliente real de OpenWA.
 */
@Injectable()
export class LoggingSender implements MensajeSender {
  private readonly logger = new Logger('LoggingSender');

  async enviar(numero: string, texto: string): Promise<boolean> {
    this.logger.log(`[MOCK] Enviaría a ${numero}:\n${texto}`);
    return true;
  }
}
