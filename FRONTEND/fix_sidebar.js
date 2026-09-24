const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('findstr /S /M /C:\"sidebarItems=\" src\\\\*.jsx', { encoding: 'utf-8' }).trim().split('\r\n');

for (const file of files) {
  if (file.includes('DashboardLayout.jsx') || !file) continue;
  
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/sidebarItems=\{sidebarItems\}\s*/g, '');
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

