/** Evento reclamado por el tick, listo para avisar. `fechaHoraUtc` es ISO sin zona (UTC). */
export interface EventoDue {
  id: number;
  numero: string;
  titulo: string;
  fechaHoraUtc: string; // 'YYYY-MM-DDTHH:mm:ss' en UTC
  descripcion: string | null;
  recurrencia: string | null;
  avisoMin: number;
}

/** Evento descartado por vencimiento de la ventana de gracia (no se envía). */
export interface EventoDescartado {
  id: number;
  numero: string;
  fechaHoraUtc: string;
  recurrencia: string | null;
}
