#!/usr/bin/env node

/**
 * Import translations from CSV back to JSON files
 * Usage: node import-translations.js [csv-file]
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = 'public/locales';
const INPUT_FILE = process.argv[2] || 'translations.csv';

// Function to unflatten object keys back to nested structure
function unflattenObject(flatObj) {
  const result = {};
  
  for (const key in flatObj) {
    const value = flatObj[key];
    if (!value) continue; // Skip empty values
    
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  return result;
}

// Function to parse CSV
function parseCSV(csvContent) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentLine += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' && !inQuotes) {
      // End of line
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  
  // Add last line if exists
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines.map(line => {
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        columns.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    columns.push(current);
    return columns;
  });
}

// Main import function
function importFromCSV() {
  console.log('📥 Importing translations from CSV...');
  
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ CSV file not found: ${INPUT_FILE}`);
    process.exit(1);
  }
  
  // Read and parse CSV
  const csvContent = fs.readFileSync(INPUT_FILE, 'utf8');
  const rows = parseCSV(csvContent);
  
  if (rows.length === 0) {
    console.error('❌ Empty CSV file!');
    process.exit(1);
  }
  
  // Parse header
  const header = rows[0];
  const keyColumn = 0;
  const contextColumn = 1;
  const languageColumns = header.slice(2);
  
  console.log(`📂 Languages found: ${languageColumns.join(', ')}`);
  console.log(`🔑 Processing ${rows.length - 1} translation keys...`);
  
  // Process translations
  const translations = {};
  languageColumns.forEach(lang => {
    translations[lang] = {};
  });
  
  // Process each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const key = row[keyColumn];
    
    if (!key) continue;
    
    languageColumns.forEach((lang, index) => {
      const value = row[contextColumn + 1 + index] || '';
      if (value.trim()) {
        translations[lang][key] = value.trim();
      }
    });
  }
  
  // Convert back to nested structure and save files
  for (const lang of languageColumns) {
    const nestedTranslations = unflattenObject(translations[lang]);
    const outputDir = path.join(LOCALES_DIR, lang);
    const outputFile = path.join(outputDir, 'common.json');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write JSON file with proper formatting
    const jsonContent = JSON.stringify(nestedTranslations, null, 2);
    fs.writeFileSync(outputFile, jsonContent, 'utf8');
    
    const keyCount = Object.keys(translations[lang]).length;
    console.log(`✅ ${lang}: ${keyCount} translations → ${outputFile}`);
  }
  
  console.log('');
  console.log('🎉 Import completed successfully!');
  console.log('💡 Tip: Check your changes with git diff before committing');
}

// Run import
importFromCSV();