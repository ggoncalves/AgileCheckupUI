/**
 * Test suite for tenantIdGenerator
 */

import {
  normalizeCompanyName,
  generateTenantId,
  regenerateTenantIdSuffix
} from '../tenantIdGenerator';
import { isValidTenantId } from '../tenantIdValidator';

// Mock Math.random for predictable testing
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

describe('tenantIdGenerator', () => {
  describe('normalizeCompanyName', () => {
    describe('basic normalization', () => {
      it.each([
        ['Acme Corporation', 'acme-corporation', 'basic company name'],
        ['Test Company', 'test-company', 'company with space'],
        ['ABC Inc', 'abc-inc', 'abbreviation with space'],
        ['123 Industries', '123-industries', 'name starting with numbers'],
        ['Company-Name', 'company-name', 'name with existing hyphen'],
        ['UPPERCASE COMPANY', 'uppercase-company', 'all uppercase'],
        ['MixedCase Company', 'mixedcase-company', 'mixed case']
      ])('should normalize %s to %s (%s)', (input, expected) => {
        expect(normalizeCompanyName(input)).toBe(expected);
      });
    });

    describe('Unicode character handling', () => {
      it.each([
        ['Café Corporation', 'cafe-corporation', 'accent é'],
        ['Naïve Company', 'naive-company', 'accent ï'],
        ['Piñata Inc', 'pinata-inc', 'tilde ñ'],
        ['São Paulo Tech', 'sao-paulo-tech', 'tilde ã'],
        ['Zürich Corp', 'zurich-corp', 'umlaut ü'],
        ['Résumé Services', 'resume-services', 'accent é'],
        ['múltiple açcénts', 'multiple-accents', 'multiple accents']
      ])('should normalize %s to %s (%s)', (input, expected) => {
        expect(normalizeCompanyName(input)).toBe(expected);
      });
    });

    describe('special character removal', () => {
      it.each([
        ['Company@#$%Name', 'companyname', 'special characters'],
        ['Test!@#Company', 'testcompany', 'exclamation and symbols'],
        ['Company (LLC)', 'company-llc', 'parentheses'],
        ['A&B Corporation', 'ab-corporation', 'ampersand'],
        ['Company.com', 'companycom', 'dot'],
        ['Test/Company', 'testcompany', 'slash'],
        ['Company_Name', 'companyname', 'underscore removed']
      ])('should normalize %s to %s (%s)', (input, expected) => {
        expect(normalizeCompanyName(input)).toBe(expected);
      });
    });

    describe('space and hyphen handling', () => {
      it.each([
        ['  Spaces  Everywhere  ', 'spaces-everywhere', 'multiple spaces'],
        ['Test    Company', 'test-company', 'consecutive spaces'],
        ['Company---Name', 'company-name', 'consecutive hyphens'],
        [' -Test Company- ', 'test-company', 'leading/trailing hyphens and spaces'],
        ['A - B - C', 'a-b-c', 'spaces around hyphens'],
        ['Test-  -Company', 'test-company', 'spaces between hyphens']
      ])('should normalize %s to %s (%s)', (input, expected) => {
        expect(normalizeCompanyName(input)).toBe(expected);
      });
    });

    describe('edge cases', () => {
      it.each([
        ['', '', 'empty string'],
        ['   ', '', 'only spaces'],
        ['@#$%^&*()', '', 'only special characters'],
        ['---', '', 'only hyphens'],
        ['   ---   ', '', 'hyphens with spaces'],
        ['日本株式会社', '', 'Japanese characters'],
        ['a', 'a', 'single character'],
        ['1', '1', 'single number'],
        ['A', 'a', 'single uppercase']
      ])('should handle %s -> %s (%s)', (input, expected) => {
        expect(normalizeCompanyName(input)).toBe(expected);
      });
    });
  });

  describe('generateTenantId', () => {
    describe('valid company names', () => {
      it('should generate tenant ID with correct format', () => {
        const result = generateTenantId('Acme Corporation');
        expect(result).toMatch(/^acme-corporation-[a-z0-9]{5}$/);
      });

      it('should generate tenant ID with normalized company name', () => {
        const result = generateTenantId('Test@#$ Company!');
        expect(result).toMatch(/^test-company-[a-z0-9]{5}$/);
      });

      it('should generate tenant ID with Unicode normalization', () => {
        const result = generateTenantId('Café Corporation');
        expect(result).toMatch(/^cafe-corporation-[a-z0-9]{5}$/);
      });

      it('should generate different suffixes for same company name', () => {
        // Reset Math.random to use real randomness for this test
        const originalMath = global.Math;
        global.Math = Object.create(global.Math);
        global.Math.random = jest.fn()
          .mockReturnValueOnce(0.1)  // First call
          .mockReturnValueOnce(0.9); // Second call
        
        const result1 = generateTenantId('Test Company');
        const result2 = generateTenantId('Test Company');
        
        expect(result1).toMatch(/^test-company-[a-z0-9]{5}$/);
        expect(result2).toMatch(/^test-company-[a-z0-9]{5}$/);
        expect(result1).not.toBe(result2);
        
        // Restore original
        global.Math = originalMath;
      });

      it('should generate valid tenant IDs', () => {
        const testCases = [
          'Acme Corporation',
          'Test Company',
          '123 Industries',
          'Simple Name'
        ];

        testCases.forEach(companyName => {
          const result = generateTenantId(companyName);
          expect(isValidTenantId(result)).toBe(true);
        });
      });
    });

    describe('invalid inputs', () => {
      it.each([
        ['', 'empty string'],
        ['   ', 'only spaces'],
        ['@#$%^&*()', 'only special characters'],
        ['---', 'only hyphens'],
        ['日本株式会社', 'only non-latin characters']
      ])('should return empty string for %s (%s)', (input) => {
        expect(generateTenantId(input)).toBe('');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for null input', () => {
        expect(generateTenantId(null as unknown as string)).toBe('');
      });

      it('should return empty string for undefined input', () => {
        expect(generateTenantId(undefined as unknown as string)).toBe('');
      });

      it('should handle whitespace-only input', () => {
        expect(generateTenantId('   \t\n   ')).toBe('');
      });
    });

    describe('random suffix generation', () => {
      it('should generate 5-character random suffix', () => {
        const result = generateTenantId('Test Company');
        const suffix = result.split('-').pop();
        expect(suffix).toHaveLength(5);
        expect(suffix).toMatch(/^[a-z0-9]{5}$/);
      });

      it('should use lowercase alphanumeric characters only', () => {
        // Use real randomness to test character set
        global.Math = Math;
        
        const results = [];
        for (let i = 0; i < 10; i++) {
          results.push(generateTenantId('Test Company'));
        }
        
        results.forEach(result => {
          const suffix = result.split('-').pop();
          expect(suffix).toMatch(/^[a-z0-9]{5}$/);
        });
        
        // Restore mock
        global.Math = mockMath;
      });
    });
  });

  describe('regenerateTenantIdSuffix', () => {
    describe('valid tenant IDs', () => {
      it('should regenerate suffix while preserving base', () => {
        const existingId = 'test-company-abc12';
        const result = regenerateTenantIdSuffix(existingId);
        
        expect(result).toMatch(/^test-company-[a-z0-9]{5}$/);
        expect(result).not.toBe(existingId);
        expect(result.split('-').slice(0, -1).join('-')).toBe('test-company');
      });

      it('should handle tenant ID with multiple hyphens in base', () => {
        const existingId = 'multi-part-company-name-xyz89';
        const result = regenerateTenantIdSuffix(existingId);
        
        expect(result).toMatch(/^multi-part-company-name-[a-z0-9]{5}$/);
        expect(result).not.toBe(existingId);
        expect(result.split('-').slice(0, -1).join('-')).toBe('multi-part-company-name');
      });

      it('should generate new random suffix', () => {
        // Use different random values to verify different suffixes
        const originalMath = global.Math;
        global.Math = Object.create(global.Math);
        global.Math.random = jest.fn()
          .mockReturnValueOnce(0.2)  // First call
          .mockReturnValueOnce(0.8); // Second call
        
        const existingId = 'test-company-abc12';
        const result1 = regenerateTenantIdSuffix(existingId);
        const result2 = regenerateTenantIdSuffix(existingId);
        
        expect(result1).not.toBe(result2);
        expect(result1.split('-').pop()).not.toBe(result2.split('-').pop());
        
        // Restore original
        global.Math = originalMath;
      });

      it('should generate valid tenant IDs', () => {
        const testCases = [
          'acme-corp-12345',
          'test-company-abc12',
          'simple-name-xyz89',
          'multi-word-company-name-def45'
        ];

        testCases.forEach(existingId => {
          const result = regenerateTenantIdSuffix(existingId);
          expect(isValidTenantId(result)).toBe(true);
        });
      });
    });

    describe('invalid inputs', () => {
      it.each([
        ['', 'empty string'],
        ['invalid', 'no hyphens'],
        ['short123', 'too short without hyphen'],
        ['UPPERCASE-ID-12345', 'uppercase letters'],
        ['invalid@char-12345', 'special characters'],
        ['-starts-with-hyphen-12345', 'starts with hyphen'],
        ['ends-with-hyphen-12345-', 'ends with hyphen'],
        ['has--double--hyphens-12345', 'consecutive hyphens']
      ])('should return empty string for %s (%s)', (input) => {
        expect(regenerateTenantIdSuffix(input)).toBe('');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for null input', () => {
        expect(regenerateTenantIdSuffix(null as unknown as string)).toBe('');
      });

      it('should return empty string for undefined input', () => {
        expect(regenerateTenantIdSuffix(undefined as unknown as string)).toBe('');
      });

      it('should return original ID if no hyphens found', () => {
        const input = 'nohyphens123456789';
        const result = regenerateTenantIdSuffix(input);
        expect(result).toBe(input);
      });

      it('should handle single part tenant ID with hyphen', () => {
        const input = 'single-12345';
        const result = regenerateTenantIdSuffix(input);
        expect(result).toMatch(/^single-[a-z0-9]{5}$/);
        expect(result).not.toBe(input);
      });
    });

    describe('suffix generation', () => {
      it('should generate 5-character suffix', () => {
        const input = 'test-company-old12';
        const result = regenerateTenantIdSuffix(input);
        const suffix = result.split('-').pop();
        expect(suffix).toHaveLength(5);
        expect(suffix).toMatch(/^[a-z0-9]{5}$/);
      });
    });
  });

  describe('integration with validation', () => {
    it('should generate tenant IDs that pass validation', () => {
      const testCompanies = [
        'Acme Corporation',
        'Test Company Inc',
        '123 Industries',
        'Café & Associates',
        'Multi-Word Company Name'
      ];

      testCompanies.forEach(company => {
        const tenantId = generateTenantId(company);
        if (tenantId) { // Skip empty results for invalid inputs
          expect(isValidTenantId(tenantId)).toBe(true);
        }
      });
    });

    it('should regenerate tenant IDs that pass validation', () => {
      const testIds = [
        'acme-corp-12345',
        'test-company-abc12',
        'multi-word-name-xyz89'
      ];

      testIds.forEach(existingId => {
        const newId = regenerateTenantIdSuffix(existingId);
        if (newId) {
          expect(isValidTenantId(newId)).toBe(true);
        }
      });
    });
  });
});