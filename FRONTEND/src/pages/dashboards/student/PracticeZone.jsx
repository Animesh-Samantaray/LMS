
import React, { useState, useEffect } from 'react';
import api from '../../../services/api.service';
import DashboardLayout from '../../../components/DashboardLayout';
import Editor from '@monaco-editor/react';
import { Play, Send, Check } from 'lucide-react';

const PracticeZone = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [bottomTab, setBottomTab] = useState('testcases');
  const [solvedCount, setSolvedCount] = useState(0);

  const boilerplates = {
    javascript: "function solve() {\n  // Write your code here\n}\n\n// console.log(solve());",
    python: "def solve():\n    # Write your code here\n    pass\n\n# print(solve())",
    java: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}"
  };

  const [codes, setCodes] = useState({});

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/api/practice');
      setChallenges(res.data.data);
      const solved = res.data.data.filter(c => c.status === 'Completed').length;
      setSolvedCount(solved);
    } catch (err) {
      setError('Failed to load practice challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSelect = async (challenge) => {
    setSelectedChallenge(challenge);
    setResult(null);
    setBottomTab('testcases');
    const lang = challenge.language?.toLowerCase() || 'javascript';
    setSelectedLanguage(lang);
    
    // Default boilerplate
    let initial = challenge.initialCode || boilerplates[lang];
    
    // Try to fetch saved code
    try {
      const saved = await api.get(`/api/practice/${challenge._id}/code`);
      if (saved.data.success && saved.data.data?.code) {
        initial = saved.data.data.code;
        if (saved.data.data.language) {
            setSelectedLanguage(saved.data.data.language.toLowerCase());
        }
      }
    } catch (e) {
      // Ignore if no saved code
    }

    setCode(initial);
    setCodes({ [lang]: initial });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setCodes(prev => ({ ...prev, [selectedLanguage]: code }));
    setSelectedLanguage(newLang);
    setCode(codes[newLang] || boilerplates[newLang]);
  };

  const handleBack = () => {
    fetchChallenges(); // Refresh status on back
    setSelectedChallenge(null);
    setResult(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    setResult(null);
    setBottomTab('testresults');
    try {
      const res = await api.post(`/api/practice/${selectedChallenge._id}/run`, {
        code,
        language: selectedLanguage
      });
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, message: 'Execution failed.', results: [{ actualOutput: err.message || 'Error running code' }] });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setResult(null);
    setBottomTab('testresults');
    try {
      const res = await api.post(`/api/practice/${selectedChallenge._id}/submit`, {
        code,
        language: selectedLanguage
      });
      setResult(res.data);
      if (res.data.passed) {
         fetchChallenges(); // update completed status silently
      }
    } catch (err) {
      setResult({ success: false, message: 'Execution failed.', results: [{ actualOutput: err.message || 'Error submitting code' }] });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout roleTitle="STUDENT" pageTitle="Practice Zone">
        <div className="p-8 text-center">Loading challenges...</div>
      </DashboardLayout>
    );
  }
  
  if (error && !selectedChallenge) {
    return (
      <DashboardLayout roleTitle="STUDENT" pageTitle="Practice Zone">
        <div className="p-8 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  if (selectedChallenge) {
    return (
      <DashboardLayout roleTitle="STUDENT" pageTitle="Practice Zone">
      <div className="flex flex-col h-[calc(100vh-100px)] p-6 bg-[var(--lms-bg)] text-[var(--lms-text-primary)]">
        <div className="mb-4 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="text-[var(--lms-primary)] hover:underline"
          >
            &larr; Back to Challenges
          </button>
          <h2 className="text-xl font-bold">{selectedChallenge.title}</h2>
          <span className={`px-3 py-1 rounded text-sm ${selectedChallenge.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : selectedChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {selectedChallenge.difficulty}
          </span>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left panel: Description */}
          <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 rounded-lg lms-scrollbar">
            <div className="bg-[var(--lms-surface-elevated)] p-5 rounded-xl shadow-sm h-full overflow-y-auto">
              <h3 className="font-bold mb-3 text-lg pb-2">Description</h3>
              <p className="whitespace-pre-wrap leading-relaxed text-[var(--lms-text-secondary)]">{selectedChallenge.description}</p>
              
              <h3 className="font-bold mt-6 mb-3 text-lg pb-2">Instructions</h3>
              <p className="whitespace-pre-wrap leading-relaxed text-[var(--lms-text-secondary)]">{selectedChallenge.instructions}</p>
              
              {selectedChallenge.testCases && selectedChallenge.testCases.filter(tc => !tc.isHidden).length > 0 && (
                <div className="mt-6 space-y-6">
                  <h3 className="font-bold text-lg">Examples</h3>
                  {selectedChallenge.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                    <div key={idx} className="bg-[var(--lms-surface-subtle)] p-4 rounded-lg border border-[var(--lms-border)]">
                      <p className="font-bold text-sm text-[var(--lms-text-muted)] mb-2">Example {idx + 1}:</p>
                      <div className="mb-2"><span className="font-bold text-sm">Input:</span> <code className="bg-[var(--lms-surface)] px-2 py-1 rounded text-sm font-mono border border-[var(--lms-border)]">{tc.input}</code></div>
                      <div><span className="font-bold text-sm">Output:</span> <code className="bg-[var(--lms-surface)] px-2 py-1 rounded text-sm font-mono border border-[var(--lms-border)]">{tc.expectedOutput}</code></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Editor & Terminal matching screenshot perfectly */}
          <div className="w-2/3 flex flex-col gap-0 rounded-xl overflow-hidden bg-[#1e1e1e] border border-[#2d2d2d] shadow-2xl relative">
            <div className="bg-[#252526] px-4 py-2 flex justify-between items-center border-b border-[#333333]">
              <select 
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-[#3c3c3c] text-white border border-[#444444] rounded px-3 py-1 text-sm font-medium outline-none cursor-pointer hover:bg-[#4a4a4a] transition-colors"
              >
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
              <div className="text-[#cccccc] text-xs">
                Solve in {selectedLanguage.toUpperCase()}. Read from stdin, print to stdout.
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <Editor
                height="100%"
                language={selectedLanguage === 'c' || selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: true, scale: 0.75 },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 3,
                  padding: { top: 16 },
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  snippetSuggestions: "top"
                }}
              />
            </div>

            {/* Terminal Panel */}
            <div className="h-64 bg-[#1e1e1e] border-t border-[#333333] flex flex-col shrink-0 relative">
              <div className="flex items-center px-2 bg-[#252526] border-b border-[#333333] h-10">
                <button onClick={() => setBottomTab('testcases')} className={`px-4 h-full text-xs font-bold transition-colors border-b-2 flex items-center ${bottomTab === 'testcases' ? 'text-indigo-300 border-indigo-400' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>Test Cases</button>
                <button onClick={() => setBottomTab('testresults')} className={`px-4 h-full text-xs font-bold transition-colors border-b-2 flex items-center ${bottomTab === 'testresults' ? 'text-emerald-400 border-emerald-400' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>Test Results</button>
                <button onClick={() => setBottomTab('console')} className={`px-4 h-full text-xs font-bold transition-colors border-b-2 flex items-center ${bottomTab === 'console' ? 'text-gray-200 border-gray-200' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>Console</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {bottomTab === 'testcases' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Input</p>
                      <div className="bg-[#282828] rounded-md p-3 font-mono text-sm text-gray-300 border border-[#3a3a3a]">
                        {selectedChallenge?.testCases?.[0]?.input || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Output</p>
                      <div className="bg-[#282828] rounded-md p-3 font-mono text-sm text-gray-300 border border-[#3a3a3a]">
                        {selectedChallenge?.testCases?.[0]?.expectedOutput || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
                {bottomTab === 'testresults' && (
                  <div className="font-mono text-sm">
                    {result ? (
                      <div className={`space-y-4 ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <div className="font-bold text-lg">{result.message}</div>
                        {result.results?.map((r, i) => (
                           <div key={i} className="space-y-2">
                              <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Input</p>
                                <div className="bg-[#282828] rounded-md p-2 text-gray-300 border border-[#3a3a3a]">{r.input}</div>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Output</p>
                                <div className="bg-[#282828] rounded-md p-2 text-gray-300 border border-[#3a3a3a]">{r.expectedOutput}</div>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Actual Output</p>
                                <div className={`bg-[#282828] rounded-md p-2 border border-[#3a3a3a] ${r.passed ? 'text-emerald-300' : 'text-rose-400 whitespace-pre-wrap'}`}>{r.actualOutput}</div>
                              </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">Submit your code to view detailed test results.</div>
                    )}
                  </div>
                )}
                {bottomTab === 'console' && (
                  <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                    {result?.results?.[0]?.actualOutput || 'Run your code to see output here...'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-4 right-4 flex gap-3">
                <button 
                  onClick={handleRunCode}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#3a3a3a] text-gray-200 font-bold px-4 py-1.5 rounded-full hover:bg-[#2a2a2a] transition-colors"
                >
                  <Play size={14} className={running ? 'animate-pulse text-emerald-400' : 'text-emerald-400'} fill="currentColor" /> 
                  Run
                </button>
                <button 
                  onClick={handleSubmitCode}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-full hover:bg-emerald-500 transition-colors"
                >
                  <Send size={14} /> 
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout roleTitle="STUDENT" pageTitle="Practice Zone">
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
          Problem List <span className="text-gray-500 text-lg">&gt;</span>
        </h1>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-gray-500"></div>
          {solvedCount}/{challenges.length} Solved
        </div>
      </div>
      
      {challenges.length === 0 ? (
        <p className="text-[var(--lms-text-secondary)]">No challenges available right now.</p>
      ) : (
        <div className="bg-[var(--lms-surface-elevated)] rounded-xl p-4 shadow-lg border border-[var(--lms-border)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-[var(--lms-surface-subtle)] px-3 py-1.5 rounded-full border border-[var(--lms-border)]">
              <svg className="w-4 h-4 text-[var(--lms-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search questions" 
                className="bg-transparent border-none outline-none text-sm text-[var(--lms-text-primary)] placeholder-[var(--lms-text-muted)] w-48"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            {challenges.map((challenge, index) => (
              <div 
                key={challenge._id} 
                onClick={() => handleSelect(challenge)}
                className={`flex items-center justify-between p-3.5 rounded-lg cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-[var(--lms-surface)]' : 'bg-transparent'} hover:bg-[var(--lms-surface-subtle)] border border-transparent hover:border-[var(--lms-border)]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {challenge.status === 'Completed' && <Check size={16} className="text-emerald-500 stroke-[3px]" />}
                  </div>
                  <span className="text-[var(--lms-text-primary)] font-medium text-[15px]">
                    {index + 1}. {challenge.title}
                  </span>
                </div>
                <div>
                  <span className={`text-[13px] font-medium ${
                    challenge.difficulty === 'Easy' ? 'text-emerald-500' :
                    challenge.difficulty === 'Medium' ? 'text-amber-500' :
                    'text-rose-500'
                  }`}>
                    {challenge.difficulty === 'Medium' ? 'Med.' : challenge.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default PracticeZone;
