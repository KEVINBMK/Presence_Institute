import { describe, expect, it } from 'vitest';
import { validateTelephone } from './validation';

describe('validateTelephone', () => {
  it('refuse un champ vide', () => {
    expect(validateTelephone('')).toMatch(/obligatoire/);
    expect(validateTelephone('   ')).toMatch(/obligatoire/);
  });

  it('accepte un numéro local de 10 chiffres', () => {
    expect(validateTelephone('0890000002')).toBeNull();
  });

  it('accepte un numéro international avec indicatif', () => {
    expect(validateTelephone('+243 890 000 002')).toBeNull();
  });

  it('tolère les séparateurs usuels', () => {
    expect(validateTelephone('089-000-00-02')).toBeNull();
    expect(validateTelephone('089.000.00.02')).toBeNull();
  });

  it('refuse un numéro trop court', () => {
    expect(validateTelephone('12345')).toMatch(/invalide/);
  });

  it('refuse un numéro trop long', () => {
    expect(validateTelephone('1234567890123456')).toMatch(/invalide/);
  });

  it('refuse les lettres', () => {
    expect(validateTelephone('08abc00002')).toMatch(/invalide/);
  });
});
