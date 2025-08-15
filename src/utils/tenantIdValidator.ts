/**
 * Tenant ID validation utilities
 * Provides validation rules and error messages for tenant IDs
 */

/**
 * Validation rules and constraints for tenant IDs
 */
export const TENANT_ID_RULES = {
  MIN_LENGTH: 9,
  PATTERN: /^[a-z0-9-]+$/,
  FORBIDDEN_PATTERNS: {
    STARTS_WITH_HYPHEN: /^-/,
    ENDS_WITH_HYPHEN: /-$/,
    CONSECUTIVE_HYPHENS: /--/
  }
} as const;

/**
 * Translation keys for tenant ID validation failures
 */
export const TENANT_ID_ERROR_KEYS = {
  REQUIRED: 'company.form.validation.tenantIdRequired',
  TOO_SHORT: 'company.form.validation.tenantIdTooShort',
  INVALID_CHARS: 'company.form.validation.tenantIdInvalidChars',
  INVALID_HYPHEN_START: 'company.form.validation.tenantIdInvalidHyphenStart',
  INVALID_HYPHEN_END: 'company.form.validation.tenantIdInvalidHyphenEnd',
  CONSECUTIVE_HYPHENS: 'company.form.validation.tenantIdConsecutiveHyphens'
} as const;

/**
 * Validation result type for detailed validation feedback
 */
export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Validates if a tenant ID follows the correct format
 * @param tenantId - The tenant ID to validate
 * @returns True if the tenant ID is valid, false otherwise
 */
export function isValidTenantId(tenantId: string): boolean {
  if (typeof tenantId !== 'string' || !tenantId || tenantId.length < TENANT_ID_RULES.MIN_LENGTH) {
    return false;
  }

  if (!TENANT_ID_RULES.PATTERN.test(tenantId)) {
    return false;
  }

  const { STARTS_WITH_HYPHEN, ENDS_WITH_HYPHEN, CONSECUTIVE_HYPHENS } = TENANT_ID_RULES.FORBIDDEN_PATTERNS;
  
  if (STARTS_WITH_HYPHEN.test(tenantId) || 
      ENDS_WITH_HYPHEN.test(tenantId) || 
      CONSECUTIVE_HYPHENS.test(tenantId)) {
    return false;
  }

  return true;
}

/**
 * Gets validation translation key for tenant ID
 * @param tenantId - The tenant ID to validate
 * @returns Translation key for validation error or null if valid
 */
export function getTenantIdValidationKey(tenantId: string): string | null {
  if (!tenantId || tenantId.length === 0) {
    return TENANT_ID_ERROR_KEYS.REQUIRED;
  }

  if (tenantId.length < TENANT_ID_RULES.MIN_LENGTH) {
    return TENANT_ID_ERROR_KEYS.TOO_SHORT;
  }

  if (!TENANT_ID_RULES.PATTERN.test(tenantId)) {
    return TENANT_ID_ERROR_KEYS.INVALID_CHARS;
  }

  if (TENANT_ID_RULES.FORBIDDEN_PATTERNS.STARTS_WITH_HYPHEN.test(tenantId)) {
    return TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_START;
  }

  if (TENANT_ID_RULES.FORBIDDEN_PATTERNS.ENDS_WITH_HYPHEN.test(tenantId)) {
    return TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_END;
  }

  if (TENANT_ID_RULES.FORBIDDEN_PATTERNS.CONSECUTIVE_HYPHENS.test(tenantId)) {
    return TENANT_ID_ERROR_KEYS.CONSECUTIVE_HYPHENS;
  }

  return null;
}

/**
 * Gets validation message for tenant ID (deprecated - use getTenantIdValidationKey with translation)
 * @param tenantId - The tenant ID to validate
 * @returns Validation error message or null if valid
 * @deprecated Use getTenantIdValidationKey with i18n translation instead
 */
export function getTenantIdValidationMessage(tenantId: string): string | null {
  const key = getTenantIdValidationKey(tenantId);
  if (!key) return null;
  
  // Fallback messages for backward compatibility (should not be used in production)
  const fallbackMessages: Record<string, string> = {
    [TENANT_ID_ERROR_KEYS.REQUIRED]: 'Tenant ID is required',
    [TENANT_ID_ERROR_KEYS.TOO_SHORT]: `Tenant ID must be at least ${TENANT_ID_RULES.MIN_LENGTH} characters long`,
    [TENANT_ID_ERROR_KEYS.INVALID_CHARS]: 'Tenant ID must contain only lowercase letters, numbers, and hyphens',
    [TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_START]: 'Tenant ID cannot start with a hyphen',
    [TENANT_ID_ERROR_KEYS.INVALID_HYPHEN_END]: 'Tenant ID cannot end with a hyphen',
    [TENANT_ID_ERROR_KEYS.CONSECUTIVE_HYPHENS]: 'Tenant ID cannot contain consecutive hyphens'
  };
  
  return fallbackMessages[key] || 'Invalid tenant ID format';
}

/**
 * Validates tenant ID and returns detailed result with translation key
 * @param tenantId - The tenant ID to validate
 * @returns Validation result with boolean and optional error translation key
 */
export function validateTenantId(tenantId: string): ValidationResult {
  const errorKey = getTenantIdValidationKey(tenantId);
  return {
    isValid: errorKey === null,
    error: errorKey || undefined
  };
}

/**
 * Checks if a string can be used as part of a tenant ID
 * (useful for validating input before generation)
 * @param input - The input string to check
 * @returns True if the input can be normalized to a valid tenant ID part
 */
export function canBeNormalizedToTenantId(input: string): boolean {
  if (!input || input.trim().length === 0) {
    return false;
  }

  // After removing invalid characters, check if anything remains
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized.length > 0;
}