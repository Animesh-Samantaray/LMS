import re

with open('FRONTEND/src/pages/dashboards/student/CourseLearn.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'bg-white': 'bg-[var(--lms-surface)]',
    'bg-slate-50/50': 'bg-[var(--lms-surface-subtle)]',
    'bg-slate-50': 'bg-[var(--lms-surface-subtle)]',
    'bg-[#f8f9fa]': 'bg-[var(--lms-bg)]',
    'bg-slate-100': 'bg-[var(--lms-surface-elevated)]',
    'bg-slate-200': 'bg-[var(--lms-border)]',
    
    'border-slate-200': 'border-[var(--lms-border)]',
    'border-slate-100': 'border-[var(--lms-border)]/50',
    
    'text-slate-900': 'text-[var(--lms-text-primary)]',
    'text-slate-800': 'text-[var(--lms-text-primary)]',
    'text-slate-700': 'text-[var(--lms-text-secondary)]',
    'text-slate-600': 'text-[var(--lms-text-secondary)]',
    'text-slate-500': 'text-[var(--lms-text-muted)]',
    'text-slate-400': 'text-[var(--lms-text-muted)]/70',
    'text-slate-300': 'text-[var(--lms-text-muted)]/40',
    
    'hover:bg-slate-50/50': 'hover:bg-[var(--lms-surface-subtle)]',
    'hover:bg-slate-50': 'hover:bg-[var(--lms-surface-subtle)]',
    'hover:bg-slate-100': 'hover:bg-[var(--lms-surface-elevated)]',
    'hover:bg-slate-200': 'hover:bg-[var(--lms-surface-elevated)]',
    'hover:bg-white': 'hover:bg-[var(--lms-surface-elevated)]',
    
    'hover:border-slate-200': 'hover:border-[var(--lms-border)]',
    
    'hover:text-slate-800': 'hover:text-[var(--lms-text-primary)]',
    'hover:text-slate-900': 'hover:text-[var(--lms-text-primary)]',
}

new_content = content
for old, new in replacements.items():
    new_content = re.sub(rf'\b{re.escape(old)}\b', new, new_content)

with open('FRONTEND/src/pages/dashboards/student/CourseLearn.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
