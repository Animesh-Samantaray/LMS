const fs = require('fs');

let content = fs.readFileSync('FRONTEND/src/pages/dashboards/student/CourseLearn.jsx', 'utf-8');

content = content.replace(/api\.get\(\/api\/courses\/\)/g, 'api.get(\/api/courses/\\)');
content = content.replace(/api\.get\(\/api\/content\/course\/\/units\)/g, 'api.get(\/api/content/course/\/units\)');
content = content.replace(/api\.get\(\/api\/resources\/lesson\/\)/g, 'api.get(\/api/resources/lesson/\\)');
content = content.replace(/api\.get\(\/api\/courses\/\/progress\)/g, 'api.get(\/api/courses/\/progress\)');
content = content.replace(/api\.post\(\/api\/courses\/\/lessons\/\/complete\)/g, 'api.post(\/api/courses/\/lessons/\/complete\)');

fs.writeFileSync('FRONTEND/src/pages/dashboards/student/CourseLearn.jsx', content);

