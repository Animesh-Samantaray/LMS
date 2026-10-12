import os

filepath = 'FRONTEND/src/components/ExportButton.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import 'jspdf-autotable';", "import autoTable from 'jspdf-autotable';")
content = content.replace("doc.autoTable({", "autoTable(doc, {")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
