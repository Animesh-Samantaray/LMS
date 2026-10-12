import React from 'react';
import { Download, FileText, Table } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ExportButton = ({ data, filename, columns }) => {
  const handleExportExcel = () => {
    if (!data || !data.length) return;
    const exportData = data.map(item => {
      let row = {};
      columns.forEach(col => {
        row[col.header] = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
      });
      return row;
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!data || !data.length) return;
    const doc = new jsPDF();
    
    const head = [columns.map(col => col.header)];
    const body = data.map(item => 
      columns.map(col => {
        const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
        return val != null ? String(val) : '';
      })
    );
    
    doc.text(`${filename}`, 14, 15);
    autoTable(doc, {
      head: head,
      body: body,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] }
    });
    
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="relative group inline-block z-10">
      <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-primary)] transition-all">
        <Download size={14} />
        Export
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
        <button onClick={handleExportPDF} className="flex items-center gap-2 text-left px-4 py-2.5 text-xs font-bold text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] border-b border-[var(--lms-border)]">
          <FileText size={14} className="text-rose-500" />
          As PDF
        </button>
        <button onClick={handleExportExcel} className="flex items-center gap-2 text-left px-4 py-2.5 text-xs font-bold text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)]">
          <Table size={14} className="text-emerald-500" />
          As Excel
        </button>
      </div>
    </div>
  );
};
