import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Database,
  Search,
  RefreshCw,
  Eye,
  Copy,
  Check,
  X,
  AlertCircle,
  FileJson,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Server,
  Users,
  BookOpen,
  Award,
  HelpCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Flag,
  Bell,
  Code,
  FolderOpen
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import exportService from '../../../services/export.service';

const getDatasetIcon = (key) => {
  switch (key) {
    case 'users':
    case 'student-profiles':
    case 'instructor-profiles':
      return Users;
    case 'categories':
      return FolderOpen;
    case 'courses':
    case 'units':
    case 'lessons':
    case 'resources':
      return BookOpen;
    case 'quizzes':
    case 'quiz-questions':
    case 'quiz-submissions':
      return HelpCircle;
    case 'exams':
    case 'exam-questions':
    case 'exam-attempts':
      return Award;
    case 'assignments':
    case 'assignment-submissions':
      return FileText;
    case 'discussions':
    case 'messages':
      return MessageSquare;
    case 'certificates':
      return Sparkles;
    case 'reviews':
      return Award;
    case 'practice-challenges':
    case 'practice-submissions':
      return Code;
    case 'reports':
      return Flag;
    case 'notifications':
      return Bell;
    default:
      return Database;
  }
};

const AdminExportCenter = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [downloadingKeys, setDownloadingKeys] = useState({});

  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await exportService.getCatalog();
      if (res?.success) {
        setCatalog(res.data || []);
      } else {
        setError(res?.message || 'Failed to load export catalog');
      }
    } catch (err) {
      setError(err?.message || 'Failed to connect to export service');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = async (datasetKey, e) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingKeys((prev) => ({ ...prev, [datasetKey]: true }));
      await exportService.downloadDataset(datasetKey);
    } catch (err) {
      alert(`Failed to download dataset: ${err?.message || 'Unknown error'}`);
    } finally {
      setDownloadingKeys((prev) => ({ ...prev, [datasetKey]: false }));
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsExportingAll(true);
      await exportService.downloadCompleteExport();
    } catch (err) {
      alert(`Failed to download complete export: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsExportingAll(false);
    }
  };

  const openPreview = async (dataset, page = 1) => {
    setSelectedDataset(dataset);
    setCurrentPage(page);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError('');
    setCopied(false);

    try {
      const res = await exportService.getPreview(dataset.key, page, pageSize);
      if (res?.success) {
        setPreviewData(res.data);
      } else {
        setPreviewError(res?.message || 'Failed to load preview');
      }
    } catch (err) {
      setPreviewError(err?.message || 'Failed to fetch preview records');
    } finally {
      setPreviewLoading(false);
    }
  };

  const changePreviewPage = async (newPage) => {
    if (!selectedDataset || previewLoading) return;
    openPreview(selectedDataset, newPage);
  };

  const handleCopyJson = () => {
    if (!previewData?.records) return;
    const jsonString = JSON.stringify(previewData.records, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [catalog, searchQuery]);

  const totalPlatformRecords = useMemo(() => {
    return catalog.reduce((sum, item) => sum + (item.recordCount || 0), 0);
  }, [catalog]);

  return (
    <DashboardLayout roleTitle="ADMIN" pageTitle="Data Export Center">
      <div className="space-y-6 max-w-[1600px] mx-auto">
       
        <div className="lms-glass-card rounded-2xl p-6 border border-[var(--lms-border)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] text-[11px] font-bold uppercase tracking-wider">
                <Database size={12} /> Live Database Export Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--lms-text-primary)] tracking-tight">
                Data Export Center
              </h1>
              <p className="text-sm text-[var(--lms-text-secondary)] max-w-2xl">
                Inspect live database collections in formatted JSON, copy records to clipboard, and download individual datasets or a complete platform export.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchCatalog}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                title="Refresh datasets"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                onClick={handleDownloadAll}
                disabled={isExportingAll || loading || catalog.length === 0}
                className="lms-btn lms-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                <Download size={16} className={isExportingAll ? 'animate-bounce' : ''} />
                {isExportingAll ? 'Generating Full Export...' : 'Export All Data (JSON)'}
              </button>
            </div>
          </div>

        
          <div className="mt-6 pt-5 border-t border-[var(--lms-border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Datasets</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--lms-text-primary)] mt-0.5">{catalog.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Total Records</p>
              <p className="text-lg sm:text-xl font-extrabold text-indigo-500 mt-0.5">{totalPlatformRecords.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Export Format</p>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-500 mt-0.5">JSON (Sanitized)</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Security</p>
              <p className="text-lg sm:text-xl font-extrabold text-amber-500 mt-0.5">Admin-Only</p>
            </div>
          </div>
        </div>

       
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
            <input
              type="text"
              placeholder="Search datasets by name or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-[var(--lms-accent)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs text-[var(--lms-text-muted)] font-semibold self-end sm:self-center">
            Showing {filteredCatalog.length} of {catalog.length} datasets
          </div>
        </div>

    
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

  
        {loading && (
          <div className="flex items-center justify-center p-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
              <p className="text-xs text-[var(--lms-text-muted)] font-medium">Scanning LMS collections & record counts...</p>
            </div>
          </div>
        )}

       
        {!loading && filteredCatalog.length === 0 && (
          <div className="text-center py-20 lms-glass-card rounded-2xl border border-[var(--lms-border)] p-8">
            <FileJson className="mx-auto text-[var(--lms-text-muted)] mb-3 opacity-60" size={48} />
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">No Datasets Found</h3>
            <p className="text-xs text-[var(--lms-text-secondary)] mt-1 max-w-sm mx-auto">
              {searchQuery ? `No datasets match "${searchQuery}". Try a different keyword.` : 'No exportable collections are currently active.'}
            </p>
          </div>
        )}

        {!loading && filteredCatalog.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCatalog.map((dataset) => {
              const IconComponent = getDatasetIcon(dataset.key);
              const isDownloading = downloadingKeys[dataset.key];

              return (
                <div
                  key={dataset.key}
                  className="lms-glass-card rounded-2xl p-5 border border-[var(--lms-border)] flex flex-col justify-between hover:border-[var(--lms-accent)]/40 hover:shadow-lg transition-all duration-200 group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
                        <IconComponent size={18} />
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-[10px] font-mono font-bold text-[var(--lms-text-muted)]">
                        {dataset.key}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[var(--lms-text-primary)] group-hover:text-[var(--lms-accent)] transition-colors">
                        {dataset.name}
                      </h3>
                      <p className="text-xs text-[var(--lms-text-secondary)] line-clamp-2 mt-1 min-h-[32px]">
                        {dataset.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--lms-border)] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--lms-text-muted)] font-medium">Record Count</span>
                      <span className="font-bold text-[var(--lms-text-primary)] bg-[var(--lms-surface-subtle)] px-2 py-0.5 rounded-lg border border-[var(--lms-border)]">
                        {dataset.recordCount.toLocaleString()} {dataset.recordCount === 1 ? 'doc' : 'docs'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => openPreview(dataset, 1)}
                        className="w-full py-2 px-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye size={14} /> View Data
                      </button>

                      <button
                        onClick={(e) => handleDownloadSingle(dataset.key, e)}
                        disabled={isDownloading}
                        className="w-full py-2 px-3 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] hover:bg-[var(--lms-accent)] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Download size={14} className={isDownloading ? 'animate-bounce' : ''} />
                        {isDownloading ? 'Saving...' : 'Download'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[var(--lms-surface-elevated)] rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl border border-[var(--lms-border)] flex flex-col overflow-hidden animate-scale-in">
          
            <div className="px-6 py-4 border-b border-[var(--lms-border)] flex items-center justify-between bg-[var(--lms-surface-subtle)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
                  <FileJson size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[var(--lms-text-primary)] truncate">
                      {selectedDataset?.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--lms-surface)] text-[var(--lms-text-muted)] border border-[var(--lms-border)]">
                      {selectedDataset?.key}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--lms-text-secondary)] truncate">
                    {previewData ? `Showing page ${previewData.page} of ${previewData.totalPages} (${previewData.totalRecords} total records in DB)` : 'Loading records...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyJson}
                  disabled={previewLoading || !previewData?.records}
                  className="px-3 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Copy formatted JSON to clipboard"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>

                <button
                  onClick={() => handleDownloadSingle(selectedDataset?.key)}
                  disabled={downloadingKeys[selectedDataset?.key]}
                  className="lms-btn lms-btn-primary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  title="Download complete dataset as JSON"
                >
                  <Download size={14} />
                  Download Full JSON
                </button>

                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)] rounded-xl transition-colors ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

         
            <div className="flex-1 min-h-0 bg-[#0d1117] text-[#c9d1d9] p-4 overflow-auto font-mono text-xs leading-relaxed selection:bg-indigo-500/40 relative">
              {previewLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 font-sans">Fetching sanitized database records...</p>
                  </div>
                </div>
              ) : previewError ? (
                <div className="flex h-full items-center justify-center text-rose-400 p-6 text-center font-sans">
                  <div className="space-y-2 max-w-md">
                    <AlertCircle size={32} className="mx-auto" />
                    <p className="font-bold">{previewError}</p>
                  </div>
                </div>
              ) : previewData?.records?.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500 font-sans">
                  <p>No records found in this dataset collection.</p>
                </div>
              ) : (
                <pre className="whitespace-pre overflow-x-auto text-[11px] sm:text-xs text-emerald-400">
                  <code>{JSON.stringify(previewData?.records, null, 2)}</code>
                </pre>
              )}
            </div>

       
            <div className="px-6 py-3 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-[var(--lms-text-muted)] font-medium text-center sm:text-left">
                {previewData?.records?.length > 0 ? (
                  <span>
                    Displaying records <strong className="text-[var(--lms-text-primary)]">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-[var(--lms-text-primary)]">{Math.min(currentPage * pageSize, previewData.totalRecords)}</strong> of <strong className="text-[var(--lms-text-primary)]">{previewData.totalRecords}</strong>
                  </span>
                ) : (
                  <span>0 records</span>
                )}
              </div>

              {previewData && previewData.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changePreviewPage(currentPage - 1)}
                    disabled={currentPage <= 1 || previewLoading}
                    className="p-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-primary)] disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-3 py-1 font-bold text-[var(--lms-text-primary)]">
                    {currentPage} / {previewData.totalPages}
                  </span>

                  <button
                    onClick={() => changePreviewPage(currentPage + 1)}
                    disabled={currentPage >= previewData.totalPages || previewLoading}
                    className="p-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-primary)] disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminExportCenter;
