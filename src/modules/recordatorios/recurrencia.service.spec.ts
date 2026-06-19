import { DateTime } from 'luxon';

import { RecurrenciaService } from './recurrencia.service';

const ahora = (iso: string): DateTime => DateTime.fromISO(iso, { zone: 'utc' });

describe('RecurrenciaService', () => {
  const svc = new RecurrenciaService();

  it('diaria: +1 día', () => {
    expect(svc.proximaFutura('2026-06-19T21:00:00', 'diaria', ahora('2026-06-19T22:00:00'))).toBe(
      '2026-06-20T21:00:00',
    );
  });

  it('semanal: +7 días', () => {
    expect(svc.proximaFutura('2026-06-19T09:00:00', 'semanal', ahora('2026-06-20T00:00:00'))).toBe(
      '2026-06-26T09:00:00',
    );
  });

  it('mensual desde el 31: ajusta a fin de mes (31-ene → 28-feb)', () => {
    expect(svc.proximaFutura('2026-01-31T08:00:00', 'mensual', ahora('2026-02-01T00:00:00'))).toBe(
      '2026-02-28T08:00:00',
    );
  });

  it('mensual: avanza desde la fecha ORIGINAL, no desde la ajustada (recupera el 31)', () => {
    // A 1-mar, la próxima desde 31-ene es 31-mar (no 28-mar).
    expect(svc.proximaFutura('2026-01-31T08:00:00', 'mensual', ahora('2026-03-01T00:00:00'))).toBe(
      '2026-03-31T08:00:00',
    );
  });

  it('anual desde 29-feb: ajusta a 28-feb en año no bisiesto', () => {
    expect(svc.proximaFutura('2024-02-29T12:00:00', 'anual', ahora('2024-06-01T00:00:00'))).toBe(
      '2025-02-28T12:00:00',
    );
  });

  it('saltos perdidos: devuelve la PRIMERA futura, una sola', () => {
    // Diaria desde el 1, ahora el 5 12:00 → próxima 6, sin pasar por 2,3,4,5.
    expect(svc.proximaFutura('2026-06-01T00:00:00', 'diaria', ahora('2026-06-05T12:00:00'))).toBe(
      '2026-06-06T00:00:00',
    );
  });

  it('recurrencia inválida o nula → null', () => {
    expect(svc.proximaFutura('2026-06-19T21:00:00', null, ahora('2026-06-19T22:00:00'))).toBeNull();
    expect(
      svc.proximaFutura('2026-06-19T21:00:00', 'quincenal', ahora('2026-06-19T22:00:00')),
    ).toBeNull();
  });
});
