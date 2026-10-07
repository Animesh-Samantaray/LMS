import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, XCircle, ArrowRight, ArrowLeft, Loader, LayoutGrid } from 'lucide-react';
import quizService from '../../../services/quiz.service';
import QuizCameraPreview from '../../../components/QuizCameraPreview';

const QuizTest = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const quizRes = await quizService.getQuizById(quizId);
      if (quizRes.success) {
        setQuiz(quizRes.quiz);
        if (quizRes.quiz.duration) {
          setTimeLeft(quizRes.quiz.duration * 60);
        } else {
          setTimeLeft(30 * 60);
        }
      }
      
      const qRes = await quizService.getQuizQuestions(quizId);
      if (qRes.success) {
        setQuestions(qRes.questions);
      }
    } catch (err) {
      setError(
        err.response?.data?.code === 'MAX_ATTEMPTS_REACHED'
          ? 'Quiz submitted. You have no attempts remaining.'
          : err.response?.data?.message || 'Failed to load quiz'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft === null || result || submitting) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, result, submitting]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      clearInterval(timerRef.current);
      
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedOption: answers[qId]
      }));

      const res = await quizService.evaluateQuiz(quizId, formattedAnswers);
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lms-background)] flex items-center justify-center">
        <Loader size={48} className="animate-spin text-[var(--lms-accent)]" />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-[var(--lms-background)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--lms-surface)] p-6 rounded-2xl shadow-sm border border-rose-500/30 text-center">
          <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--lms-text-primary)] mb-2">Quiz Error</h2>
          <p className="text-sm text-[var(--lms-text-secondary)] mb-6">{error}</p>
          <button onClick={() => navigate('/student/quizzes')} className="lms-btn lms-btn-primary w-full py-2.5">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const passThreshold = result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : 0;
    const isPass = passThreshold >= 50;

    return (
      <div className="min-h-screen bg-[var(--lms-background)] p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-3xl w-full space-y-6">
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl p-8 shadow-sm text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isPass ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
              {isPass ? <CheckCircle size={40} /> : <XCircle size={40} />}
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--lms-text-primary)] mb-2">Quiz Completed!</h1>
            <p className="text-sm text-[var(--lms-text-secondary)] mb-8">You have successfully submitted the quiz. Your result has been sent to your registered email.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                <span className="block text-4xl font-black text-[var(--lms-accent)] mb-1">{result.totalScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Score Obtained</span>
              </div>
              <div className="p-6 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                <span className="block text-4xl font-black text-[var(--lms-text-primary)] mb-1">{result.maxScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Total Marks</span>
              </div>
            </div>

            <button onClick={() => navigate('/student/quizzes')} className="lms-btn lms-btn-primary px-8 py-3 rounded-xl font-bold">
              Return to Quizzes
            </button>
          </div>

          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-[var(--lms-text-primary)] mb-4">Detailed Results</h3>
            {result.results.map((res, idx) => {
              const q = questions.find(q => q._id === res.questionId);
              if (!q) return null;
              
              return (
                <div key={res.questionId} className={`p-5 rounded-2xl border ${res.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`mt-0.5 shrink-0 ${res.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {res.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[var(--lms-text-primary)] leading-relaxed">
                        <span className="text-[var(--lms-text-muted)] mr-2">{idx + 1}.</span>
                        {q.question}
                      </h4>
                      <p className="text-xs font-bold mt-1 text-[var(--lms-text-muted)]">Marks: {res.marksAwarded} / {q.marks || 1}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                    {['A', 'B', 'C', 'D'].map(optKey => {
                      const isSelected = res.selectedOption === optKey;
                      const isActuallyCorrect = res.correctOption === optKey;
                      const opt = q.options.find(o => o.key === optKey);
                      if(!opt) return null;
                      
                      let optClass = "border-[var(--lms-border)] bg-[var(--lms-surface)] opacity-50";
                      
                      if (isActuallyCorrect) {
                        optClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold";
                      } else if (isSelected && !res.isCorrect) {
                        optClass = "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold";
                      }

                      return (
                        <div key={optKey} className={`p-3 rounded-xl border text-sm ${optClass}`}>
                          <span className="font-bold mr-2">{optKey})</span> {opt.text}
                          {isSelected && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider opacity-70">(Your Answer)</span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  {q.explanation && (
                    <div className="mt-4 pl-8">
                      <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-xs text-[var(--lms-text-secondary)]">
                        <span className="font-bold text-[var(--lms-text-primary)] block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const isFirstQuestion = currentQuestionIdx === 0;

  const timerColorClass = timeLeft <= 60 
    ? "bg-rose-500 text-white animate-pulse border-rose-500" 
    : "bg-emerald-500 text-white border-emerald-500";

  return (
    <div className="min-h-screen bg-[var(--lms-background)] flex flex-col">
      <header className="bg-[var(--lms-surface)] border-b border-[var(--lms-border)] px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="font-bold text-lg text-[var(--lms-text-primary)]">{quiz?.title}</h1>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors border ${timerColorClass}`}>
          <Clock size={16} /> {formatTime(timeLeft)}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        
        <div className="flex-1 flex flex-col">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {currentQ ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl p-6 sm:p-8 shadow-sm flex-1 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--lms-text-muted)]">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <span className="px-3 py-1 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-lg text-xs font-bold text-[var(--lms-text-secondary)]">
                    {currentQ.marks || 1} Marks
                  </span>
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold text-[var(--lms-text-primary)] mb-8 leading-relaxed">
                  {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {currentQ.options.map(opt => {
                    const optKey = opt.key;
                    const isSelected = answers[currentQ._id] === optKey;
                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectOption(currentQ._id, optKey)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                          isSelected 
                            ? 'border-[var(--lms-accent)] bg-[var(--lms-accent-subtle)]' 
                            : 'border-[var(--lms-border)] hover:border-[var(--lms-accent-border)] hover:bg-[var(--lms-surface-hover)]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                          isSelected ? 'bg-[var(--lms-accent)] text-white' : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] group-hover:text-[var(--lms-text-primary)]'
                        }`}>
                          {optKey}
                        </div>
                        <span className={`flex-1 font-semibold text-sm sm:text-base ${isSelected ? 'text-[var(--lms-accent-text)]' : 'text-[var(--lms-text-primary)]'}`}>
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  disabled={isFirstQuestion}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                    isFirstQuestion ? 'opacity-50 cursor-not-allowed text-[var(--lms-text-muted)] bg-[var(--lms-surface)] border border-[var(--lms-border)]' : 'text-[var(--lms-text-primary)] bg-[var(--lms-surface)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)]'
                  }`}
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all disabled:opacity-70 disabled:cursor-wait"
                  >
                    {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white shadow-sm transition-colors"
                  >
                    Save & Next <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--lms-text-muted)] font-bold">
              No questions found for this quiz.
            </div>
          )}
        </div>

        
        <div className="md:w-72 shrink-0">
          <QuizCameraPreview active={!result && !loading && !!quiz} />

          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={18} className="text-[var(--lms-text-secondary)]" />
              <h3 className="font-bold text-[var(--lms-text-primary)]">Question Palette</h3>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q._id];
                const isActive = currentQuestionIdx === idx;
                
                let btnClass = "border border-[var(--lms-border)] text-[var(--lms-text-secondary)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)]";
                
                if (isActive) {
                  btnClass = "border-[var(--lms-accent)] bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] ring-2 ring-[var(--lms-accent)] ring-offset-2 ring-offset-[var(--lms-background)]";
                } else if (isAnswered) {
                  btnClass = "border-emerald-500 bg-emerald-500 text-white";
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t border-[var(--lms-border)] text-xs font-semibold text-[var(--lms-text-secondary)]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500"></div> Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]"></div> Not Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[var(--lms-accent-subtle)] border border-[var(--lms-accent)]"></div> Current
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 py-3 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Finish & Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizTest;
