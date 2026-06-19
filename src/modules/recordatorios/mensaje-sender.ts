/** Puerto de envío de mensajes. En Hito 2 lo implementa un mock que loguea; en Hito 3, OpenWA. */
export const MENSAJE_SENDER = 'MENSAJE_SENDER';

export interface MensajeSender {
  /** Envía el texto al número/chat. Retorna true solo si el envío fue confirmado. */
  enviar(numero: string, texto: string): Promise<boolean>;
}
