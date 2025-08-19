#!/usr/bin/env node

/**
 * Export AgileCheckupUI translations to CSV for spreadsheet editing
 * Usage: node export-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = 'public/locales';
const OUTPUT_FILE = 'translations.csv';

// Function to flatten nested JSON object
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

// Function to get all translation files
function getTranslationFiles() {
  const files = {};
  
  try {
    const locales = fs.readdirSync(LOCALES_DIR);
    
    for (const locale of locales) {
      const localeDir = path.join(LOCALES_DIR, locale);
      if (fs.statSync(localeDir).isDirectory()) {
        const commonFile = path.join(localeDir, 'common.json');
        if (fs.existsSync(commonFile)) {
          const content = JSON.parse(fs.readFileSync(commonFile, 'utf8'));
          files[locale] = flattenObject(content);
        }
      }
    }
  } catch (error) {
    console.error('Error reading translation files:', error.message);
    process.exit(1);
  }
  
  return files;
}

// Function to escape CSV values
function escapeCSV(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  // Escape quotes and wrap in quotes if necessary
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

// Main export function
function exportToCSV() {
  console.log('🌍 Exporting AgileCheckupUI translations to CSV...');
  
  const translations = getTranslationFiles();
  const languages = Object.keys(translations);
  
  if (languages.length === 0) {
    console.error('❌ No translation files found!');
    process.exit(1);
  }
  
  console.log(`📂 Found languages: ${languages.join(', ')}`);
  
  // Get all unique keys
  const allKeys = new Set();
  for (const lang of languages) {
    Object.keys(translations[lang]).forEach(key => allKeys.add(key));
  }
  
  const keysList = Array.from(allKeys).sort();
  console.log(`🔑 Total translation keys: ${keysList.length}`);
  
  // Create CSV content
  const csvLines = [];
  
  // Header row
  const header = ['Key', 'Context', ...languages];
  csvLines.push(header.map(escapeCSV).join(','));
  
  // Data rows
  for (const key of keysList) {
    const row = [key];
    
    // Add context (parent key for reference)
    const context = key.includes('.') ? key.split('.').slice(0, -1).join('.') : '';
    row.push(context);
    
    // Add translations for each language
    for (const lang of languages) {
      const value = translations[lang][key] || '';
      row.push(value);
    }
    
    csvLines.push(row.map(escapeCSV).join(','));
  }
  
  // Write CSV file
  const csvContent = csvLines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf8');
  
  console.log(`✅ Exported to ${OUTPUT_FILE}`);
  console.log(`📊 ${keysList.length} rows × ${header.length} columns`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Open translations.csv in Excel/Numbers/Google Sheets');
  console.log('2. Edit translations in the spreadsheet');
  console.log('3. Run import-translations.js to update JSON files');
}

// Run export
exportToCSV();