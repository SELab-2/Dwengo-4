import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateEmail,
  validateMinLength,
  validateForm,
  validatePositiveNumber,
} from '@/util/shared/validation';

describe('Validation utilities', () => {
  describe('validateRequired', () => {
    it('geeft foutmelding bij lege string', () => {
      expect(validateRequired('')).toBe('Dit veld is verplicht');
    });

    it('geeft foutmelding bij alleen spaties', () => {
      expect(validateRequired('   ')).toBe('Dit veld is verplicht');
    });

    it('geeft geen foutmelding bij niet-lege string', () => {
      expect(validateRequired('abc')).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('geeft foutmelding bij ongeldig e-mailformaat', () => {
      expect(validateEmail('geen-email')).toBe(
        'Voer een geldig e-mailadres in',
      );
      expect(validateEmail('foo@bar')).toBe('Voer een geldig e-mailadres in');
      expect(validateEmail('foo@bar.')).toBe('Voer een geldig e-mailadres in');
      expect(validateEmail('@domain.com')).toBe(
        'Voer een geldig e-mailadres in',
      );
    });

    it('geeft geen foutmelding bij geldig e-mailformaat', () => {
      expect(validateEmail('test@example.com')).toBe('');
      expect(validateEmail('foo.bar+baz@sub.domain.co')).toBe('');
    });
  });

  describe('validateMinLength', () => {
    it('geeft foutmelding als string korter is dan standaard 6', () => {
      expect(validateMinLength('12345')).toBe(
        'Moet ten minste 6 tekens lang zijn',
      );
    });

    it('geeft geen foutmelding bij exact 6 tekens', () => {
      expect(validateMinLength('123456')).toBe('');
    });

    it('geeft geen foutmelding bij meer dan 6 tekens', () => {
      expect(validateMinLength('1234567')).toBe('');
    });

    it('geeft foutmelding bij custom minimum', () => {
      expect(validateMinLength('abc', 4)).toBe(
        'Moet ten minste 4 tekens lang zijn',
      );
      expect(validateMinLength('abcd', 4)).toBe('');
    });
  });

  describe('validateForm', () => {
    const alwaysError = () => 'error';
    const neverError = () => '';

    it('geeft eerste foutmelding terug wanneer meerdere rules', () => {
      const msg = validateForm('foo', [alwaysError, () => 'should not appear']);
      expect(msg).toBe('error');
    });

    it('geeft lege string als geen rule faalt', () => {
      const msg = validateForm('foo', [neverError, neverError]);
      expect(msg).toBe('');
    });

    it('geeft lege string als geen rules zijn doorgegeven', () => {
      expect(validateForm('foo')).toBe('');
    });
  });

  describe('validatePositiveNumber', () => {
    it('geeft foutmelding bij NaN', () => {
      expect(validatePositiveNumber('abc')).toBe('Voer een positief getal in');
    });

    it('geeft foutmelding bij negatieve nummers', () => {
      expect(validatePositiveNumber(-1)).toBe('Voer een positief getal in');
      expect(validatePositiveNumber('-5')).toBe('Voer een positief getal in');
    });

    it('geeft foutmelding bij nul', () => {
      expect(validatePositiveNumber(0)).toBe('Voer een positief getal in');
      expect(validatePositiveNumber('0')).toBe('Voer een positief getal in');
    });

    it('geeft geen foutmelding bij positief getal', () => {
      expect(validatePositiveNumber(1)).toBe('');
      expect(validatePositiveNumber('3.14')).toBe('');
      expect(validatePositiveNumber('42')).toBe('');
    });
  });
});
