# 🌍 AgileCheckupUI Translation Workflow

This guide explains how to manage translations using a spreadsheet-style workflow with CSV export/import scripts.

## 📁 Project Structure

```
AgileCheckupUI/
├── public/locales/
│   ├── en-US/common.json    # Source language (English)
│   └── pt-BR/common.json    # Target language (Portuguese)
├── export-translations.js   # Export JSON → CSV
├── import-translations.js   # Import CSV → JSON
└── TRANSLATION_WORKFLOW.md  # This guide
```

## 🚀 Quick Start

### 1. Export to Spreadsheet
```bash
# Navigate to project directory
cd /Users/ggoncalves/dev/AgileCheckup/AgileCheckupUI

# Export translations to CSV
node export-translations.js

# Open in your preferred spreadsheet app
open translations.csv
```

### 2. Edit in Spreadsheet
- Open `translations.csv` in Excel, Numbers, or Google Sheets
- Edit translations in the spreadsheet interface
- Save the file when done

### 3. Import Back to JSON
```bash
# Import changes back to JSON files
node import-translations.js

# Or specify a different CSV file
node import-translations.js my-translations.csv
```

### 4. Commit Changes
```bash
# Review changes
git diff public/locales/

# Commit updates
git add public/locales/
git commit -m "i18n: Update translations"
```

## 📊 CSV File Structure

The exported CSV contains these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `Key` | Translation key path | `company.form.validation.nameRequired` |
| `Context` | Parent section | `company.form.validation` |
| `en-US` | English text | `Company name is required` |
| `pt-BR` | Portuguese text | `Nome da empresa é obrigatório` |

## 🛠️ Script Usage

### Export Script (`export-translations.js`)

**Purpose**: Convert JSON translation files to CSV format for spreadsheet editing.

**Usage**:
```bash
node export-translations.js
```

**Output**:
- Creates `translations.csv` in project root
- Flattens nested JSON structure to dot-notation keys
- Includes all languages found in `public/locales/`

**Features**:
- ✅ Handles nested JSON objects
- ✅ Preserves special characters and quotes
- ✅ Auto-detects all language directories
- ✅ Provides context column for easier navigation

### Import Script (`import-translations.js`)

**Purpose**: Convert CSV back to nested JSON translation files.

**Usage**:
```bash
# Import from default file
node import-translations.js

# Import from specific file
node import-translations.js path/to/translations.csv
```

**Output**:
- Updates JSON files in `public/locales/`
- Recreates nested object structure
- Preserves existing file formatting

**Features**:
- ✅ Handles CSV with quotes and special characters
- ✅ Recreates nested JSON structure from dot-notation
- ✅ Creates missing language directories
- ✅ Validates JSON output

## 📋 Spreadsheet Workflow Tips

### Finding Missing Translations
1. **Sort by language columns** to group empty cells
2. **Filter by empty cells** in Portuguese column
3. **Use conditional formatting** to highlight missing translations
4. **Add comments** for translator context

### Bulk Operations
- **Find & Replace**: Update common terms across all translations
- **Copy formulas**: Auto-translate similar patterns
- **Data validation**: Prevent empty required fields
- **Freeze panes**: Keep key column visible while scrolling

### Quality Assurance
- **Spell check**: Use spreadsheet spell check features
- **Length validation**: Compare text lengths between languages
- **Placeholder consistency**: Ensure `{{variables}}` are preserved
- **Format validation**: Check for proper punctuation and capitalization

## 🔄 Team Collaboration Workflows

### Option 1: Google Sheets Collaboration
1. **Export to CSV**: `node export-translations.js`
2. **Upload to Google Sheets**: Import CSV file
3. **Share with translators**: Set edit permissions
4. **Download when complete**: Export as CSV
5. **Import changes**: `node import-translations.js downloaded-file.csv`

### Option 2: File-based Collaboration
1. **Export**: Create CSV and share via email/Slack
2. **Translate**: Team members edit and return CSV
3. **Merge**: Import multiple CSV files sequentially
4. **Review**: Use Git diff to review changes

### Option 3: Version Control Integration
```bash
# Create translation branch
git checkout -b translations/portuguese-updates

# Export and edit
node export-translations.js
# ... edit in spreadsheet ...
node import-translations.js

# Commit and create PR
git add .
git commit -m "i18n: Update Portuguese translations"
git push origin translations/portuguese-updates
```

## 🎯 Best Practices

### Before Exporting
- ✅ Ensure all JSON files are valid
- ✅ Commit current state to Git
- ✅ Run your application to verify existing translations

### During Translation
- 🎯 **Preserve placeholders**: Keep `{{variable}}` and `{count}` intact
- 🎯 **Maintain formatting**: Preserve HTML tags and markdown
- 🎯 **Context awareness**: Use the Context column to understand usage
- 🎯 **Consistency**: Use same terms for common concepts

### After Importing
- ✅ **Test the application**: Verify translations display correctly
- ✅ **Check JSON syntax**: Ensure import didn't break file structure
- ✅ **Review diffs**: Use `git diff` to verify changes
- ✅ **Update documentation**: Note any new translation keys added

## 🚨 Troubleshooting

### Export Issues

**Problem**: "No translation files found"
```bash
# Solution: Verify directory structure
ls -la public/locales/
```

**Problem**: "Error reading translation files"
```bash
# Solution: Check JSON syntax
node -e "JSON.parse(require('fs').readFileSync('public/locales/en-US/common.json', 'utf8'))"
```

### Import Issues

**Problem**: "CSV file not found"
```bash
# Solution: Check file exists
ls -la translations.csv
```

**Problem**: "Invalid JSON after import"
```bash
# Solution: Restore from git and re-import
git checkout public/locales/
node import-translations.js
```

### Spreadsheet Issues

**Problem**: Special characters appear as `�`
- **Solution**: Ensure CSV is saved with UTF-8 encoding

**Problem**: Quotes break CSV structure
- **Solution**: Don't edit the Key and Context columns

**Problem**: Missing translations after import
- **Solution**: Check for empty cells in CSV file

## 📊 Translation Statistics

### Check Completion Status
```bash
# Export and analyze
node export-translations.js
wc -l translations.csv  # Total rows
grep ',""' translations.csv | wc -l  # Missing translations
```

### Progress Tracking
Use spreadsheet formulas to track progress:
```excel
# In Google Sheets/Excel
=COUNTIF(D:D,"<>""")  # Count non-empty Portuguese translations
=COUNTA(D:D)-1        # Total Portuguese cells (minus header)
```

## 🔄 Advanced Workflows

### Adding New Languages
1. **Create language directory**: `mkdir public/locales/es-ES`
2. **Copy source file**: `cp public/locales/en-US/common.json public/locales/es-ES/`
3. **Export to CSV**: Will include new language column
4. **Translate in spreadsheet**
5. **Import back**: Creates complete translation file

### Handling Large Files
For projects with 1000+ translation keys:
```bash
# Split export by sections
node -e "
const script = require('./export-translations.js');
// Add filtering logic here
"
```

### Automated Workflows
```bash
# Create npm scripts in package.json
{
  "scripts": {
    "i18n:export": "node export-translations.js",
    "i18n:import": "node import-translations.js",
    "i18n:check": "node export-translations.js && grep ',\"\"' translations.csv"
  }
}
```

## 📚 Additional Resources

- **React i18next Documentation**: https://react.i18next.com/
- **ICU Message Format**: For pluralization and complex formatting
- **Google Translate**: For initial translation assistance
- **Translation Memory Tools**: For consistency across projects

## 🤝 Contributing Translations

### For Translators
1. **Get the CSV file** from the development team
2. **Open in your preferred spreadsheet application**
3. **Translate only the target language columns** (don't modify Key/Context)
4. **Save and return the CSV file**
5. **Include notes** about any unclear translations

### For Developers
1. **Export before major releases** to catch new strings
2. **Provide context** for complex technical terms
3. **Test translations** in the actual application
4. **Document translation guidelines** for your specific domain

---

**Need help?** Check the troubleshooting section above or reach out to the development team.