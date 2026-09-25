const fs = require("fs");
const content = `import React, { useState, useEffect, useCallback } from "react";
import { X, Users, CheckCircle, Clock, AlertCircle, FileText, Download, ExternalLink, Loader } from "lucide-react";
import assignmentService from "../services/assignment.service";

const AssignmentSubmissionsModal = ({ isOpen, assignment, onClose }) => {
  const [submissionsData, setSubmissionsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [evaluatingSub, setEvaluatingSub] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState("");

  const fetchSubmissions = useCallback(async () => {
    if (!assignment) return;
    try {
      setLoading(true);
      setError("");
      const res = await assignmentService.getAssignmentSubmissions(assignment._id);
      setSubmissionsData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [assignment]);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchSubmissions();
    } else {
      setSubmissionsData(null);
      setEvaluatingSub(null);
    }
  }, [isOpen, assignment, fetchSubmissions]);

  const handleEvaluateClick = (sub) => {
    setEvaluatingSub(sub);
    setMarks(sub.marks !== null ? String(sub.marks) : "");
    setFeedback(sub.feedback || "");
    setEvalError("");
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingSub) return;
    
    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > assignment.maximumMarks) {
      setEvalError("Marks must be between 0 and " + assignment.maximumMarks);
      return;
    }

    try {
      setEvalLoading(true);
      setEvalError("");
      await assignmentService.evaluateSubmission(evaluatingSub._id, numericMarks, feedback);
      setEvaluatingSub(null);
      fetchSubmissions();
    } catch (err) {
      setEvalError(err.response?.data?.message || err.message || "Failed to evaluate submission");
    } finally {
      setEvalLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return \`\${kb.toFixed(1)} KB\`;
    return \`\${(kb / 1024).toFixed(1)} MB\`;
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--lms-surface-elevated)] rounded-3xl w-full max-w-5xl shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                {assignment.title} - Submissions
              </h3>
              <p className="text-xs font-semibold text-[var(--lms-text-muted)] mt-0.5">
                Maximum Marks: {assignment.maximumMarks}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-2 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="p-4 mb-6 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-bold flex flex-col items-center justify-center">
              <AlertCircle size={24} className="mb-2" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader size={32} className="animate-spin text-[var(--lms-accent)] mb-3" />
              <p className="text-sm font-semibold text-[var(--lms-text-muted)]">Loading submissions...</p>
            </div>
          ) : submissionsData ? (
            <>
              {evaluatingSub ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
                      <button onClick={() => setEvaluatingSub(null)} className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]">&larr;</button>
                      Evaluating {evaluatingSub.studentId?.name}
                    </h4>
                    {evaluatingSub.isLate && (
                      <span className="px-2 py-1 bg-rose-500/15 text-rose-500 border border-rose-500/30 rounded-md text-xs font-bold uppercase">
                        Late Submission (Auto Zero)
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                    <h5 className="text-xs font-bold uppercase text-[var(--lms-text-muted)] mb-3">Submitted Files</h5>
                    <div className="space-y-2">
                      {evaluatingSub.answerFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-blue-500" />
                            <div>
                              <p className="text-sm font-semibold text-[var(--lms-text-primary)]">{f.originalName}</p>
                              <p className="text-[10px] text-[var(--lms-text-muted)]">{formatFileSize(f.fileSize)}</p>
                            </div>
                          </div>
                          <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs font-bold flex items-center gap-1">
                            <ExternalLink size={12} /> Open
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!evaluatingSub.isLate ? (
                    <form onSubmit={handleSaveEvaluation} className="space-y-4">
                      {evalError && <p className="text-xs text-rose-500 font-bold">{evalError}</p>}
                      <div>
                        <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Marks (Max {assignment.maximumMarks})</label>
                        <input
                          type="number"
                          value={marks}
                          onChange={(e) => setMarks(e.target.value)}
                          min="0"
                          max={assignment.maximumMarks}
                          required
                          className="w-full px-4 py-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Feedback</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows="4"
                          className="w-full px-4 py-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none resize-none"
                          placeholder="Provide constructive feedback..."
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--lms-border)]">
                        <button type="button" onClick={() => setEvaluatingSub(null)} className="px-5 py-2 rounded-xl text-sm font-bold border border-[var(--lms-border)] hover:bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] transition-colors">
                          Cancel
                        </button>
                        <button type="submit" disabled={evalLoading} className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
                          {evalLoading && <Loader size={14} className="animate-spin" />}
                          Save Evaluation
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
                      <p className="text-sm font-bold text-rose-500">This submission was late and automatically received 0 marks.</p>
                      <button onClick={() => setEvaluatingSub(null)} className="mt-4 px-5 py-2 rounded-xl text-sm font-bold border border-[var(--lms-border)] hover:bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] transition-colors">
                        Go Back
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-center">
                      <p className="text-[10px] font-bold uppercase text-[var(--lms-text-muted)]">Enrolled</p>
                      <p className="text-lg font-extrabold text-[var(--lms-text-primary)]">{submissionsData.totalEnrolled}</p>
                    </div>
                    <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-center">
                      <p className="text-[10px] font-bold uppercase text-[var(--lms-text-muted)]">Submitted</p>
                      <p className="text-lg font-extrabold text-blue-500">{submissionsData.submitted}</p>
                    </div>
                    <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-center">
                      <p className="text-[10px] font-bold uppercase text-[var(--lms-text-muted)]">Pending</p>
                      <p className="text-lg font-extrabold text-amber-500">{submissionsData.pending}</p>
                    </div>
                    <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-center">
                      <p className="text-[10px] font-bold uppercase text-[var(--lms-text-muted)]">Marked</p>
                      <p className="text-lg font-extrabold text-emerald-500">{submissionsData.marked}</p>
                    </div>
                    <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-center">
                      <p className="text-[10px] font-bold uppercase text-[var(--lms-text-muted)]">To Evaluate</p>
                      <p className="text-lg font-extrabold text-indigo-500">{submissionsData.toEvaluate}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[var(--lms-border)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] text-[10px] uppercase tracking-wider font-bold">
                          <th className="p-4 border-b border-[var(--lms-border)]">Student</th>
                          <th className="p-4 border-b border-[var(--lms-border)]">Submitted At</th>
                          <th className="p-4 border-b border-[var(--lms-border)]">Status</th>
                          <th className="p-4 border-b border-[var(--lms-border)]">Marks</th>
                          <th className="p-4 border-b border-[var(--lms-border)]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--lms-surface)]">
                        {submissionsData.submissions.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-sm font-semibold text-[var(--lms-text-muted)]">
                              No submissions yet.
                            </td>
                          </tr>
                        ) : (
                          submissionsData.submissions.map(sub => (
                            <tr key={sub._id} className="border-b border-[var(--lms-border)] last:border-0 hover:bg-[var(--lms-surface-subtle)] transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] flex items-center justify-center overflow-hidden shrink-0">
                                    {sub.studentId?.profileImage ? (
                                      <img src={sub.studentId.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Users size={14} className="text-[var(--lms-text-muted)]" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[var(--lms-text-primary)]">{sub.studentId?.name || "Unknown"}</p>
                                    <p className="text-[10px] text-[var(--lms-text-muted)]">{sub.studentId?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-xs font-semibold text-[var(--lms-text-secondary)]">
                                {new Date(sub.submittedAt).toLocaleString()}
                                {sub.isLate && <span className="ml-2 px-1.5 py-0.5 bg-rose-500/15 text-rose-500 rounded text-[9px] uppercase tracking-wider">Late</span>}
                              </td>
                              <td className="p-4">
                                {sub.status === "marked" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase">
                                    <CheckCircle size={10} /> Marked
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase">
                                    <Clock size={10} /> Pending
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-xs font-bold text-[var(--lms-text-primary)]">
                                {sub.status === "marked" ? \`\${sub.marks} / \${assignment.maximumMarks}\` : "-"}
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleEvaluateClick(sub)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 dark:text-blue-400 text-xs font-bold transition-colors"
                                >
                                  {sub.status === "marked" ? "View/Edit" : "Evaluate"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmissionsModal;
`
fs.writeFileSync("FRONTEND/src/components/AssignmentSubmissionsModal.jsx", content);

