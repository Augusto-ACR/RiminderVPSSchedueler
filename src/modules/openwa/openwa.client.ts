import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { MensajeSender } from '../recordatorios/mensaje-sender';

/**
 * Cliente de envío por OpenWA (gateway self-hosted de WhatsApp).
 *
 * Replica el contrato ya validado por el agente Python:
 *   POST {OPENWA_URL}/api/sessions/{OPENWA_SESSION_ID}/messages/send-text
 *   header X-API-Key, body { chatId, text }
 *
 * Nunca loguea la API key.
 */
@Injectable()
export class OpenwaClient implements MensajeSender {
  // Teléfono pelado, o jid '...@c.us' / '...@lid'. Cualquier otra cosa no se envía.
  private static readonly NUMERO_VALIDO = /^[0-9]+(@(c\.us|lid))?$/;

  private readonly logger = new Logger('OpenwaClient');
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly sessionId: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = (config.get<string>('OPENWA_URL') ?? '').replace(/\/+$/, '');
    this.apiKey = config.get<string>('OPENWA_API_KEY') ?? '';
    this.sessionId = config.get<string>('OPENWA_SESSION_ID') ?? '';
  }

  /**
   * Deriva el chatId desde el `numero` guardado. COPIA TEXTUAL de la regla del agente
   * (providers/openwa.py): si ya trae '@' (p. ej. un jid '...@lid') va tal cual; si es un
   * teléfono pelado, se le agrega '@c.us'. NO inventar otra regla (riesgo @lid).
   */
  private chatId(numero: string): string {
    return numero.includes('@') ? numero : `${numero}@c.us`;
  }

  async enviar(numero: string, texto: string): Promise<boolean> {
    if (!this.baseUrl || !this.apiKey || !this.sessionId) {
      this.logger.warn('OpenWA no configurado (URL/API_KEY/SESSION_ID); no se envía.');
      return false;
    }

    if (!OpenwaClient.NUMERO_VALIDO.test(numero)) {
      this.logger.error(`Número con formato inesperado, no se envía: ${numero}`);
      return false;
    }

    const url = `${this.baseUrl}/api/sessions/${this.sessionId}/messages/send-text`;
    try {
      const res = await firstValueFrom(
        this.http.post(
          url,
          { chatId: this.chatId(numero), text: texto },
          {
            headers: { 'X-API-Key': this.apiKey, 'Content-Type': 'application/json' },
            timeout: 10_000,
            // Manejamos los códigos nosotros (no queremos que axios tire excepción en 4xx/5xx).
            validateStatus: () => true,
          },
        ),
      );

      if (res.status !== 200 && res.status !== 201) {
        this.logger.error(`OpenWA respondió ${res.status}: ${JSON.stringify(res.data)}`);
        return false;
      }
      return true;
    } catch (err) {
      // Timeout / red caída / OpenWA inalcanzable → false; el tick reintenta dentro de la gracia.
      this.logger.error(
        'Error de red enviando a OpenWA',
        err instanceof Error ? err.message : String(err),
      );
      return false;
    }
  }
}
