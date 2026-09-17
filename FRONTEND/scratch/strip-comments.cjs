const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/components/DashboardLayout.jsx',
  'src/pages/dashboards/StudentDashboard.jsx',
  'src/pages/dashboards/InstructorDashboard.jsx',
  'src/pages/dashboards/AdminDashboard.jsx',
  'src/services/student.service.js',
  'src/services/instructor.service.js',
  'src/services/admin.service.js',
  'src/routes/AppRoutes.jsx'
];

function stripComments(content) {
  // Remove JSX comments {/* ... */}
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  
  // Remove block comments /* ... */
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove single line comments // ... but avoid matching inside URLs like http://
  content = content.replace(/(^|\s+)\/\/[^\n]*\n/g, '$1\n');
  content = content.replace(/(^|\s+)\/\/[^\n]*$/g, '$1');

  // Clean up extra blank lines left by comment removal
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
