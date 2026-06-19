import { validateEnv } from './env.validation';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

describe('validateEnv', () => {
  it('falla si falta DATABASE_URL', () => {
    expect(() => validateEnv({ SENDER_DRIVER: 'mock' })).toThrow(/DATABASE_URL/);
  });

  it('con SENDER_DRIVER=openwa exige las OPENWA_*', () => {
    expect(() => validateEnv({ ...base, SENDER_DRIVER: 'openwa' })).toThrow(/OPENWA/);
  });

  it('con SENDER_DRIVER=openwa y OPENWA_* válidas (hostname interno), pasa', () => {
    expect(() =>
      validateEnv({
        ...base,
        SENDER_DRIVER: 'openwa',
        OPENWA_URL: 'http://openwa-api:2785',
        OPENWA_API_KEY: 'k',
        OPENWA_SESSION_ID: 's',
      }),
    ).not.toThrow();
  });

  it('con SENDER_DRIVER=mock NO exige OPENWA_*', () => {
    expect(() => validateEnv({ ...base, SENDER_DRIVER: 'mock' })).not.toThrow();
  });

  it('aplica defaults numéricos', () => {
    const v = validateEnv({ ...base, SENDER_DRIVER: 'mock' });
    expect(v.PORT).toBe(3000);
    expect(v.SCHEDULER_GRACIA_MIN).toBe(60);
    expect(v.STUCK_TIMEOUT_MIN).toBe(5);
  });
});
