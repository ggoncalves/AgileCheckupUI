/**
 * Utility functions for generating tenant IDs
 */

import { isValidTenantId, canBeNormalizedToTenantId } from './tenantIdValidator';

/**
 * Configuration for tenant ID generation
 */
const GENERATION_CONFIG = {
  RANDOM_SUFFIX_LENGTH: 5,
  RANDOM_CHARS: 'abcdefghijklmnopqrstuvwxyz0123456789'
} as const;

/**
 * Generates a random string of specified length using lowercase alphanumeric characters
 * @param length - The length of the random string to generate
 * @returns A random string of the specified length
 */
function generateRandomString(length: number): string {
  const { RANDOM_CHARS } = GENERATION_CONFIG;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
  }
  return result;
}

/**
 * Normalizes a company name to be used in tenant ID generation
 * @param companyName - The company name to normalize
 * @returns A normalized string suitable for tenant ID
 */
export function normalizeCompanyName(companyName: string): string {
  return companyName
    .toLowerCase()
    .normalize('NFD') // Normalize Unicode to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks (accents)
    .replace(/[^a-z0-9\s-]/g, '') // Remove remaining special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a tenant ID based on company name
 * Format: {normalized-company-name}-{5-random-chars}
 * @param companyName - The company name to base the tenant ID on
 * @returns A generated tenant ID
 */
export function generateTenantId(companyName: string): string {
  if (!companyName || companyName.trim().length === 0) {
    return '';
  }

  // Check if the input can be normalized to a valid tenant ID part
  if (!canBeNormalizedToTenantId(companyName)) {
    return '';
  }

  const normalizedName = normalizeCompanyName(companyName.trim());
  if (normalizedName.length === 0) {
    return '';
  }

  const randomSuffix = generateRandomString(GENERATION_CONFIG.RANDOM_SUFFIX_LENGTH);
  const tenantId = `${normalizedName}-${randomSuffix}`;

  // Validate the generated tenant ID
  if (!isValidTenantId(tenantId)) {
    console.warn(`Generated invalid tenant ID: ${tenantId}`);
    // In production, you might want to retry or throw an error
  }

  return tenantId;
}

/**
 * Regenerates only the random suffix of an existing tenant ID
 * Useful when you want to keep the base but change the random part
 * @param existingTenantId - The existing tenant ID
 * @returns A new tenant ID with the same base but different suffix
 */
export function regenerateTenantIdSuffix(existingTenantId: string): string {
  if (!existingTenantId || !isValidTenantId(existingTenantId)) {
    return '';
  }

  const lastHyphenIndex = existingTenantId.lastIndexOf('-');
  if (lastHyphenIndex === -1) {
    return existingTenantId;
  }

  const base = existingTenantId.substring(0, lastHyphenIndex);
  const newSuffix = generateRandomString(GENERATION_CONFIG.RANDOM_SUFFIX_LENGTH);
  
  return `${base}-${newSuffix}`;
}