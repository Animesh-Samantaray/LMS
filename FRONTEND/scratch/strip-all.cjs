const fs = require('fs');
const path = require('path');

function stripComments(content) {
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/(^|\s+)\/\/[^\n]*\n/g, '$1\n');
  content = content.replace(/(^|\s+)\/\/[^\n]*$/g, '$1');
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  return content;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const cleaned = stripComments(content);
      if (content !== cleaned) {
        fs.writeFileSync(fullPath, cleaned, 'utf8');
        console.log(`Cleaned: ${fullPath}`);
      }
    }
  });
}

processDirectory(path.join(__dirname, '..', 'src'));
console.log('Finished processing all files.');
