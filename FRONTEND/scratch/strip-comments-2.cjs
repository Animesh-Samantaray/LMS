const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/context/AuthContext.jsx',
  'src/pages/Login.jsx',
  'src/pages/Signup.jsx',
  'src/services/api.service.js',
  'src/services/authService.js'
];

function stripComments(content) {
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/(^|\s+)\/\/[^\n]*\n/g, '$1\n');
  content = content.replace(/(^|\s+)\/\/[^\n]*$/g, '$1');
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  return content;
}

filesToClean.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = stripComments(content);
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`Cleaned: ${file}`);
  }
});
