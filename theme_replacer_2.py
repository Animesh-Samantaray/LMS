import re

with open('FRONTEND/src/pages/dashboards/student/CourseLearn.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'text-slate-200': 'text-[var(--lms-border)]',
    'bg-slate-900 hover:bg-slate-800 text-white': 'bg-[var(--lms-text-primary)] hover:opacity-90 text-[var(--lms-surface)]',
    'border-slate-50': 'border-[var(--lms-surface-subtle)]',
    'shadow-slate-900/20': 'shadow-[var(--lms-text-primary)]/10',
    'bg-slate-900': 'bg-gray-900', 
}

new_content = content
for old, new in replacements.items():
    new_content = new_content.replace(old, new)

with open('FRONTEND/src/pages/dashboards/student/CourseLearn.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
