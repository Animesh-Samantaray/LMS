const fs = require("fs");
let content = `import React, { useState, useEffect } from "react";
import { X, Clock, Globe, User, Calendar, Award, FileText, ExternalLink, Upload, Loader, CheckCircle, AlertCircle } from "lucide-react";
import assignmentService from "../services/assignment.service";

const AssignmentDetailModal = ({
  isOpen,
  assignment,
  onClose,
  studentMode = false,
}) => {
  const [submission, setSubmission] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    if (isOpen && assignment && studentMode) {
      fetchMySubmission();
    }
  }, [isOpen, assignment, studentMode]);

  const fetchMySubmission = async () => {
    try {
      setLoadingSub(true);
      setSubmitError("");
      const res = await assignmentService.getMySubmission(assignment._id);
      if (res.success) {
        setSubmission(res.submission);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setSubmitError("Failed to check submission status.");
      }
    } finally {
      setLoadingSub(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedFiles.length + newFiles.length > 10) {
        setSubmitError("You can upload a maximum of 10 files.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setSubmitError("");
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setSubmitError("Please select at least one file to submit.");
      return;
    }
    try {
      setSubmitting(true);
      setSubmitError("");
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("answerFiles", file);
      });
      const res = await assignmentService.submitAssignment(assignment._id, formData);
      if (res.success) {
        setSubmitSuccess("Assignment submitted successfully!");
        setSubmission(res.submission);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "Failed to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !assignment) return null;

  const isDraft = assignment.status === "draft";
  const deadlineDate = assignment.deadline ? new Date(assignment.deadline) : null;
  const createdDate = assignment.createdAt ? new Date(assignment.createdAt) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return \`\${kb.toFixed(1)} KB\`;
    return \`\${(kb / 1024).toFixed(1)} MB\`;
  };

  const creatorName = assignment.createdBy?.name || "Instructor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--lms-surface-elevated)] rounded-3xl w-full max-w-2xl shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Assignment Details
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {isDraft ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <Clock size={10} /> Draft
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <Globe size={10} /> Published
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--lms-text-primary)] mb-2">
              {assignment.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--lms-text-muted)]">
              <div className="flex items-center gap-1.5">
                <User size={13} />
                <span>Created by <span className="font-semibold text-[var(--lms-text-primary)]">{creatorName}</span></span>
              </div>
              {createdDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Posted on {createdDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                  Maximum Marks
                </span>
                <span className="text-base font-extrabold text-[var(--lms-text-primary)]">
                  {assignment.maximumMarks}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl flex items-center gap-3">
              <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${isPastDeadline ? "bg-rose-500/15 text-rose-500" : "bg-blue-500/15 text-blue-500"}\`}>
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                  Deadline
                </span>
                <span className={\`text-xs sm:text-sm font-bold \${isPastDeadline ? "text-rose-500" : "text-[var(--lms-text-primary)]"}\`}>
                  {deadlineDate ? deadlineDate.toLocaleString() : "No deadline"}
                </span>
              </div>
            </div>
          </div>

          {assignment.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-2">
                Instructions / Description
              </h4>
              <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl text-xs sm:text-sm text-[var(--lms-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {assignment.description}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-2">
              Assignment Question File
            </h4>
            {assignment.questionFile?.url ? (
              <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-[var(--lms-text-primary)] truncate">
                      {assignment.questionFile.originalName || "Assignment Questions"}
                    </p>
                    {assignment.questionFile.fileSize > 0 && (
                      <p className="text-[10px] text-[var(--lms-text-muted)] mt-0.5">
                        {formatFileSize(assignment.questionFile.fileSize)}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={assignment.questionFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lms-btn lms-btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
                >
                  <ExternalLink size={14} /> Open Question File
                </a>
              </div>
            ) : (
              <p className="text-xs text-[var(--lms-text-muted)] italic">
                No question file attached.
              </p>
            )}
          </div>

          {studentMode && (
            <div className="pt-4 border-t border-[var(--lms-border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-4">
                Your Submission
              </h4>

              {loadingSub ? (
                <div className="flex flex-col items-center py-6">
                  <Loader size={24} className="animate-spin text-[var(--lms-accent)] mb-2" />
                  <span className="text-xs text-[var(--lms-text-muted)]">Checking submission status...</span>
                </div>
              ) : submission ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {submission.status === "marked" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 text-emerald-600 rounded text-[10px] font-bold uppercase">
                              <CheckCircle size={12} /> Marked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-600 rounded text-[10px] font-bold uppercase">
                              <Clock size={12} /> Submitted
                            </span>
                          )}
                          {submission.isLate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/15 text-rose-500 rounded text-[10px] font-bold uppercase">
                              Late Submission
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--lms-text-muted)]">
                          Submitted on {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-[var(--lms-text-muted)] mb-1">Marks Obtained</p>
                        {submission.status === "marked" ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-[var(--lms-text-primary)]">{submission.marks}</span>
                            <span className="text-sm font-bold text-[var(--lms-text-muted)]">/ {assignment.maximumMarks}</span>
                            <span className="text-xs font-bold text-emerald-500 ml-2">
                              ({Math.round((submission.marks / assignment.maximumMarks) * 100)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-[var(--lms-text-secondary)]">Not evaluated yet</span>
                        )}
                      </div>
                    </div>
                    
                    {submission.feedback && (
                      <div className="mt-4 p-3 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-1">Instructor Feedback</p>
                        <p className="text-xs sm:text-sm font-medium text-[var(--lms-text-primary)] whitespace-pre-wrap">{submission.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-[var(--lms-text-muted)]">Submitted Files</p>
                    {submission.answerFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-semibold text-[var(--lms-text-primary)]">{file.originalName}</p>
                            <p className="text-[10px] text-[var(--lms-text-muted)]">{formatFileSize(file.fileSize)}</p>
                          </div>
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs font-bold flex items-center gap-1">
                          <ExternalLink size={12} /> Open
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={16} />
                      <p>{submitError}</p>
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
                      <CheckCircle size={16} />
                      <p>{submitSuccess}</p>
                    </div>
                  )}

                  <div className="p-4 border-2 border-dashed border-[var(--lms-border)] rounded-2xl bg-[var(--lms-surface-subtle)] text-center relative hover:bg-[var(--lms-surface-hover)] transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={submitting}
                    />
                    <Upload size={32} className="mx-auto text-[var(--lms-border)] mb-2" />
                    <p className="text-sm font-bold text-[var(--lms-text-primary)] mb-1">Click or drag files to upload</p>
                    <p className="text-xs text-[var(--lms-text-muted)]">Max 10 files allowed. PDF, Word, Images, Zip.</p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-sm">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-[var(--lms-text-secondary)]" />
                            <span className="font-semibold text-[var(--lms-text-primary)] truncate max-w-[200px] sm:max-w-[300px]">{f.name}</span>
                          </div>
                          <button onClick={() => removeFile(idx)} disabled={submitting} className="text-rose-500 hover:text-rose-600 p-1">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || selectedFiles.length === 0}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                      Submit Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;
`
fs.writeFileSync("FRONTEND/src/components/AssignmentDetailModal.jsx", content);

