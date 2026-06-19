import { EventosRepository } from './eventos.repository';

// `filas` es un helper estático privado; lo accedemos por cast solo para el test.
const filas = (r: unknown): unknown[] =>
  (EventosRepository as unknown as { filas: (r: unknown) => unknown[] }).filas(r);

describe('EventosRepository.filas (normalizador de resultados de query)', () => {
  it('devuelve el arreglo de filas cuando query() retorna las filas directo', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(filas(rows)).toBe(rows);
  });

  it('extrae las filas cuando query() retorna el tuple [filas, count]', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(filas([rows, 2])).toBe(rows);
  });

  it('tuple con filas vacías [ [], 0 ] → []', () => {
    expect(filas([[], 0])).toEqual([]);
  });

  it('resultado no-array → []', () => {
    expect(filas(undefined)).toEqual([]);
    expect(filas(null)).toEqual([]);
  });
});
