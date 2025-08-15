/**
 * Test suite for tenantIdValidator
 */

import {
  isValidTenantId,
  getTenantIdValidationMessage,
  getTenantIdValidationKey,
  validateTenantId,
  canBeNormalizedToTenantId,
  TENANT_ID_RULES,
  TENANT_ID_ERROR_KEYS
} from '../tenantIdValidator';
import { normalizeCompanyName } from '../tenantIdGenerator';

describe('tenantIdValidator', () => {
  describe('isValidTenantId', () => {
    describe('valid tenant IDs', () => {
      it.each([
        ['tenant-id-12345', 'basic valid format'],
        ['a-b-c-d-e-f', 'multiple hyphens'],
        ['123456789', 'only numbers (9 chars)'],
        ['abcdefghi', 'only letters (9 chars)'],
        ['test-company-x7k2m', 'typical generated format'],
        ['very-long-tenant-id-with-many-parts-12345', 'long tenant ID'],
        ['a1b2c3d4e5', 'mixed alphanumeric']
      ])('should return true for %s (%s)', (tenantId) => {
        expect(isValidTenantId(tenantId)).toBe(true);
      });
    });

    describe('invalid tenant IDs', () => {
      it.each([
        ['', 'empty string'],
        ['short', 'too short (< 9 chars)'],
        ['12345678', 'exactly 8 chars (one less than minimum)'],
        ['UPPERCASE', 'uppercase letters'],
        ['Mixed-Case', 'mixed case letters'],
        ['special@char', 'special character @'],
        ['caféchar', 'special character é'],
        ['çao', 'special character ç'],
        ['cão', 'special character ã'],
        ['space here', 'contains space'],
        ['-starts-with-hyphen', 'starts with hyphen'],
        ['ends-with-hyphen-', 'ends with hyphen'],
        ['has--double--hyphens', 'consecutive hyphens'],
        ['under_score', 'contains underscore'],
        ['dot.included', 'contains dot'],
        ['tenant/id', 'contains slash']
      ])('should return false for %s (%s)', (tenantId) => {
        expect(isValidTenantId(tenantId)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false for null', () => {
        expect(isValidTenantId(null as unknown as string)).toBe(false);
      });

      it('should return false for undefined', () => {
        expect(isValidTenantId(undefined as unknown as string)).toBe(false);
      });

      it('should return false for number input', () => {
        expect(isValidTenantId(123456789 as unknown as string)).toBe(false);
      });

      it('should return false for object input', () => {
        expect(isValidTenantId({} as unknown as string)).toBe(false);
      });

      it('should return false for array input', () => {
        expect(isValidTenantId([] as unknown as string)).toBe(false);
      });
    });
  });

  describe('getTenantIdValidationMessage', () => {
    describe('error messages', () => {
      it('should return required message for empty string', () => {
        const result = getTenantIdValidationMessage('');
        expect(result).toContain('required');
      });

      it('should return required message for null', () => {
        const result = getTenantIdValidationMessage(null as unknown as string);
        expect(result).toContain('required');
      });

      it('should return required message for undefined', () => {
        const result = getTenantIdValidationMessage(undefined as unknown as string);
        expect(result).toContain('required');
      });

      it('should return too short message for short strings', () => {
        const result1 = getTenantIdValidationMessage('short');
        const result2 = getTenantIdValidationMessage('12345678');
        expect(result1).toContain('9 characters');
        expect(result2).toContain('9 characters');
      });

      it('should return invalid chars message for uppercase', () => {
        const result = getTenantIdValidationMessage('UPPERCASE-ID');
        expect(result).toContain('lowercase');
      });

      it('should return invalid chars message for special characters', () => {
        const result1 = getTenantIdValidationMessage('tenant@id!');
        const result2 = getTenantIdValidationMessage('tenant_id_here');
        expect(result1).toContain('lowercase');
        expect(result2).toContain('lowercase');
      });

      it('should return invalid chars message for spaces', () => {
        const result = getTenantIdValidationMessage('tenant id here');
        expect(result).toContain('lowercase');
      });

      it('should return start hyphen error for tenant IDs starting with hyphen', () => {
        const result = getTenantIdValidationMessage('-starts-with-hyphen');
        expect(result).toContain('start');
      });

      it('should return end hyphen error for tenant IDs ending with hyphen', () => {
        const result = getTenantIdValidationMessage('ends-with-hyphen-');
        expect(result).toContain('end');
      });

      it('should return consecutive hyphens error', () => {
        const result = getTenantIdValidationMessage('has--double--hyphens');
        expect(result).toContain('consecutive');
      });
    });

    describe('valid cases', () => {
      it.each([
        'tenant-id-12345',
        'a-b-c-d-e-f',
        '123456789',
        'abcdefghi',
        'test-company-x7k2m'
      ])('should return null for valid tenant ID: %s', (tenantId) => {
        expect(getTenantIdValidationMessage(tenantId)).toBeNull();
      });
    });

    describe('error priority', () => {
      it('should prioritize length error over pattern error', () => {
        const result = getTenantIdValidationMessage('SHORT!');
        expect(result).toContain('9 characters');
      });

      it('should prioritize pattern error over hyphen errors', () => {
        const result = getTenantIdValidationMessage('UPPERCASE--ID-');
        expect(result).toContain('lowercase');
      });

      it('should check hyphen start before hyphen end', () => {
        const result = getTenantIdValidationMessage('-valid-length-');
        expect(result).toContain('start');
      });

      it('should check hyphen end before consecutive hyphens', () => {
        const result = getTenantIdValidationMessage('valid-length--test-');
        expect(result).toContain('end');
      });
    });
  });

  describe('getTenantIdValidationKey', () => {
    describe('error keys', () => {
      it('should return required key for empty string', () => {
        expect(getTenantIdValidationKey('')).toBe(TENANT_ID_ERROR_KEYS.REQUIRED);
      });

      it('should return required key for null', () => {
        expect(getTenantIdValidationKey(null as unknown as string)).toBe(TENANT_ID_ERROR_KEYS.REQUIRED);
      });

      it('should return required key for undefined', () => {
        expect(getTenantIdValidationKey(undefined as unknown as string)).toBe(TENANT_ID_ERROR_KEYS.REQUIRED);
      });

      it('should return too short key for short strings', () => {
        expect(getTenantIdValidationKey('short')).toBe(TENANT_ID_ERROR_KEYS.TOO_SHORT);
        expect(getTenantIdValidationKey('12345678')).toBe(TENANT_ID_ERROR_KEYS.TOO_SHORT);
      });

      it('should return invalid chars key for uppercase', () => {
        expect(getTenantIdValidationKey('UPPERCASE-ID')).toBe(TENANT_ID_ERROR_KEYS.INVALID_CHARS);
      });

      it('should return invalid chars key for special characters', () => {
        expect(getTenantIdValidationKey('tenant@id!')).toBe(TENANT_ID_ERROR_KEYS.INVALID_CHARS);
        expect(getTenantIdValidationKey('tenant_id_here')).toBe(TENANT_ID_ERROR_KEYS.INVALID_CHARS);
      });

      it('should return invalid chars key for spaces', () => {
        expect(getTenantIdValidationKey('tenant id here')).toBe(TENANT_ID_ERROR_KEYS.INVALID_CHARS);
      });

      it('should return start hyphen error key for tenant IDs starting with hyphen', () => {
        expect(getTenantIdValidationKey('-starts-with-hyphen')).toBe(TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_START);
      });

      it('should return end hyphen error key for tenant IDs ending with hyphen', () => {
        expect(getTenantIdValidationKey('ends-with-hyphen-')).toBe(TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_END);
      });

      it('should return consecutive hyphens error key', () => {
        expect(getTenantIdValidationKey('has--double--hyphens')).toBe(TENANT_ID_ERROR_KEYS.CONSECUTIVE_HYPHENS);
      });
    });

    describe('valid cases', () => {
      it.each([
        'tenant-id-12345',
        'a-b-c-d-e-f',
        '123456789',
        'abcdefghi',
        'test-company-x7k2m'
      ])('should return null for valid tenant ID: %s', (tenantId) => {
        expect(getTenantIdValidationKey(tenantId)).toBeNull();
      });
    });

    describe('error priority', () => {
      it('should prioritize length error over pattern error', () => {
        const result = getTenantIdValidationKey('SHORT!');
        expect(result).toBe(TENANT_ID_ERROR_KEYS.TOO_SHORT);
      });

      it('should prioritize pattern error over hyphen errors', () => {
        const result = getTenantIdValidationKey('UPPERCASE--ID-');
        expect(result).toBe(TENANT_ID_ERROR_KEYS.INVALID_CHARS);
      });

      it('should check hyphen start before hyphen end', () => {
        const result = getTenantIdValidationKey('-valid-length-');
        expect(result).toBe(TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_START);
      });

      it('should check hyphen end before consecutive hyphens', () => {
        const result = getTenantIdValidationKey('valid-length--test-');
        expect(result).toBe(TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_END);
      });
    });
  });

  describe('validateTenantId', () => {
    describe('valid cases', () => {
      it('should return valid result for correct tenant ID', () => {
        const result = validateTenantId('tenant-id-12345');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should handle minimum length tenant ID', () => {
        const result = validateTenantId('123456789');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('invalid cases', () => {
      it('should return invalid result with error key for empty string', () => {
        const result = validateTenantId('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(TENANT_ID_ERROR_KEYS.REQUIRED);
      });

      it('should return invalid result with error key for short ID', () => {
        const result = validateTenantId('short');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(TENANT_ID_ERROR_KEYS.TOO_SHORT);
      });

      it('should return invalid result with appropriate error key', () => {
        const result = validateTenantId('INVALID-ID');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(TENANT_ID_ERROR_KEYS.INVALID_CHARS);
      });
    });

    describe('consistency with other validators', () => {
      const testCases = [
        'valid-tenant-id',
        'invalid!',
        '',
        'short',
        '-invalid',
        'invalid-',
        'has--double'
      ];

      it.each(testCases)('should be consistent with isValidTenantId for: %s', (tenantId) => {
        const validateResult = validateTenantId(tenantId);
        const isValidResult = isValidTenantId(tenantId);
        expect(validateResult.isValid).toBe(isValidResult);
      });

      it.each(testCases)('should be consistent with getTenantIdValidationKey for: %s', (tenantId) => {
        const validateResult = validateTenantId(tenantId);
        const keyResult = getTenantIdValidationKey(tenantId);
        expect(validateResult.error).toBe(keyResult || undefined);
      });
    });
  });

  describe('canBeNormalizedToTenantId', () => {
    describe('valid inputs for normalization', () => {
      it.each([
        ['Acme Corporation', 'normal company name'],
        ['123 Company!', 'name with numbers and special chars'],
        ['  Spaces  Everywhere  ', 'multiple spaces'],
        ['Special@#$%Name', 'many special characters'],
        ['UPPERCASE COMPANY', 'all uppercase'],
        ['Mixed-Case-Name', 'mixed case with hyphens'],
        ['Company!!!', 'name with exclamation marks'],
        ['  a  ', 'single character with spaces']
      ])('should return true for %s (%s)', (input) => {
        expect(canBeNormalizedToTenantId(input)).toBe(true);
      });
    });

    describe('invalid inputs for normalization', () => {
      it.each([
        ['', 'empty string'],
        ['   ', 'only spaces'],
        ['@#$%^', 'only special characters'],
        ['---', 'only hyphens'],
        ['   ---   ', 'only hyphens with spaces'],
        ['!@#$%^&*()', 'only special characters without letters/numbers']
      ])('should return false for %s (%s)', (input) => {
        expect(canBeNormalizedToTenantId(input)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false for null', () => {
        expect(canBeNormalizedToTenantId(null as unknown as string)).toBe(false);
      });

      it('should return false for undefined', () => {
        expect(canBeNormalizedToTenantId(undefined as unknown as string)).toBe(false);
      });

      it('should handle single valid character', () => {
        expect(canBeNormalizedToTenantId('a')).toBe(true);
        expect(canBeNormalizedToTenantId('1')).toBe(true);
      });

      it('should handle Unicode characters', () => {
        expect(canBeNormalizedToTenantId('Café')).toBe(true); // 'Caf' remains after normalization
        expect(canBeNormalizedToTenantId('日本')).toBe(false); // No valid chars remain
      });
    });
  });

  describe('normalizeCompanyName (from tenantIdGenerator)', () => {
    describe('Unicode character normalization', () => {
      it('should normalize café to caf', () => {
        expect(normalizeCompanyName('café')).toBe('cafe');
      });

      it('should normalize Café to caf', () => {
        expect(normalizeCompanyName('Café')).toBe('cafe');
      });

      it('should normalize çao to ao (ç is removed)', () => {
        expect(normalizeCompanyName('çao')).toBe('cao');
      });

      it('should normalize cão to co (ã is removed)', () => {
        expect(normalizeCompanyName('cão')).toBe('cao');
      });

      it('should normalize múltiple açcénts to mltiple-acnts (accented chars removed)', () => {
        expect(normalizeCompanyName('múltiple açcénts')).toBe('multiple-accents');
      });

      it('should handle mixed Unicode and regular characters', () => {
        expect(normalizeCompanyName('Café Corporation Ltd')).toBe('cafe-corporation-ltd');
      });
    });

    describe('special character handling', () => {
      it('should remove special characters and preserve structure', () => {
        expect(normalizeCompanyName('Test@#$%Company')).toBe('testcompany');
      });

      it('should convert spaces to hyphens', () => {
        expect(normalizeCompanyName('Test Company Name')).toBe('test-company-name');
      });

      it('should handle consecutive spaces', () => {
        expect(normalizeCompanyName('Test    Company')).toBe('test-company');
      });

      it('should remove leading and trailing hyphens', () => {
        expect(normalizeCompanyName(' -Test Company- ')).toBe('test-company');
      });

      it('should collapse consecutive hyphens', () => {
        expect(normalizeCompanyName('Test---Company')).toBe('test-company');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(normalizeCompanyName('')).toBe('');
      });

      it('should handle only special characters', () => {
        expect(normalizeCompanyName('@#$%^&*()')).toBe('');
      });

      it('should handle only accented characters', () => {
        expect(normalizeCompanyName('àáâãäåæçèéêë')).toBe('aaaaaaceeee');
      });

      it('should handle Japanese characters', () => {
        expect(normalizeCompanyName('日本株式会社')).toBe('');
      });
    });
  });

  describe('TENANT_ID_RULES constants', () => {
    it('should have correct minimum length', () => {
      expect(TENANT_ID_RULES.MIN_LENGTH).toBe(9);
    });

    it('should have correct pattern regex', () => {
      expect(TENANT_ID_RULES.PATTERN.test('valid-id-123')).toBe(true);
      expect(TENANT_ID_RULES.PATTERN.test('INVALID')).toBe(false);
    });

    it('should have all forbidden patterns', () => {
      expect(TENANT_ID_RULES.FORBIDDEN_PATTERNS).toHaveProperty('STARTS_WITH_HYPHEN');
      expect(TENANT_ID_RULES.FORBIDDEN_PATTERNS).toHaveProperty('ENDS_WITH_HYPHEN');
      expect(TENANT_ID_RULES.FORBIDDEN_PATTERNS).toHaveProperty('CONSECUTIVE_HYPHENS');
    });

    it('forbidden patterns should work correctly', () => {
      const { STARTS_WITH_HYPHEN, ENDS_WITH_HYPHEN, CONSECUTIVE_HYPHENS } = TENANT_ID_RULES.FORBIDDEN_PATTERNS;
      
      expect(STARTS_WITH_HYPHEN.test('-starts')).toBe(true);
      expect(STARTS_WITH_HYPHEN.test('valid')).toBe(false);
      
      expect(ENDS_WITH_HYPHEN.test('ends-')).toBe(true);
      expect(ENDS_WITH_HYPHEN.test('valid')).toBe(false);
      
      expect(CONSECUTIVE_HYPHENS.test('has--double')).toBe(true);
      expect(CONSECUTIVE_HYPHENS.test('single-hyphen')).toBe(false);
    });
  });

  describe('TENANT_ID_ERROR_KEYS constants', () => {
    it('should have all required error keys', () => {
      expect(TENANT_ID_ERROR_KEYS).toHaveProperty('REQUIRED');
      expect(TENANT_ID_ERROR_KEYS).toHaveProperty('TOO_SHORT');
      expect(TENANT_ID_ERROR_KEYS).toHaveProperty('INVALID_CHARS');
      expect(TENANT_ID_ERROR_KEYS).toHaveProperty('INVALID_HYPHEN_START');
      expect(TENANT_ID_ERROR_KEYS).toHaveProperty('INVALID_HYPHEN_END');
      expect(TENANT_ID_ERROR_KEYS).toHaveProperty('CONSECUTIVE_HYPHENS');
    });

    it('should have correct translation key format', () => {
      expect(TENANT_ID_ERROR_KEYS.REQUIRED).toBe('company.form.validation.tenantIdRequired');
      expect(TENANT_ID_ERROR_KEYS.TOO_SHORT).toBe('company.form.validation.tenantIdTooShort');
      expect(TENANT_ID_ERROR_KEYS.INVALID_CHARS).toBe('company.form.validation.tenantIdInvalidChars');
      expect(TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_START).toBe('company.form.validation.tenantIdInvalidHyphenStart');
      expect(TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_END).toBe('company.form.validation.tenantIdInvalidHyphenEnd');
      expect(TENANT_ID_ERROR_KEYS.CONSECUTIVE_HYPHENS).toBe('company.form.validation.tenantIdConsecutiveHyphens');
    });
  });
});