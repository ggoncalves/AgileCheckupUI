const fs = require('fs');
const path = require('path');

// Define source and destination paths
const sources = [
  {
    from: path.resolve(__dirname, '../node_modules/jquery/dist/jquery.min.js'),
    to: path.resolve(__dirname, '../public/jquery.min.js')
  },
  {
    from: path.resolve(__dirname, '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'),
    to: path.resolve(__dirname, '../public/bootstrap.bundle.min.js')
  },
  {
    from: path.resolve(__dirname, '../node_modules/admin-lte/dist/js/adminlte.min.js'),
    to: path.resolve(__dirname, '../public/adminlte.min.js')
  }
];

// Ensure the public directory exists
if (!fs.existsSync(path.resolve(__dirname, '../public'))) {
  fs.mkdirSync(path.resolve(__dirname, '../public'), { recursive: true });
}

// Copy each file
sources.forEach(({ from, to }) => {
  try {
    fs.copyFileSync(from, to);
    console.log(`Successfully copied: ${from} -> ${to}`);
  } catch (error) {
    console.error(`Error copying file ${from}:`, error);
  }
});
