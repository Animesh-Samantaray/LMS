import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api.service';
import DashboardLayout from '../../../components/DashboardLayout';

const AddPracticeChallenge = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    instructions: '',
    language: 'javascript',
    initialCode: '',
    timeLimit: 1000,
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      fetchChallenge();
    }
  }, [id]);

  const fetchChallenge = async () => {
    try {
      const res = await api.get(`/api/practice/${id}`);
      if (res.data.success) {
        setFormData(res.data.data);
      }
    } catch (err) {
      setError('Failed to load challenge details.');
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData(prev => ({ ...prev, testCases: newTestCases }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, testCases: newTestCases }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/api/practice/${id}`, formData);
        toast.success('Challenge successfully updated!');
      } else {
        await api.post('/api/practice', formData);
        toast.success('Challenge successfully published!');
      }
      setTimeout(() => {
        navigate('/instructor/practice'); // Redirect back to list
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Error creating challenge');
      setError(err.message || 'Error creating challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout roleTitle="INSTRUCTOR" pageTitle={isEditMode ? "Edit Practice Challenge" : "Add Practice Challenge"}>
      <div className="p-6 max-w-5xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--lms-text-primary)]">{isEditMode ? "Edit Challenge" : "Create Challenge"}</h2>
            <p className="text-[var(--lms-text-secondary)] mt-1">{isEditMode ? "Update the details of your DSA problem." : "Design a new DSA problem and publish it to the student Practice Arena."}</p>
          </div>
        </div>



        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold border-b border-[var(--lms-border)] pb-3 mb-4 text-[var(--lms-text-primary)]">Basic Details</h3>
            
            <div>
              <label className="block mb-2 text-sm font-bold text-[var(--lms-text-secondary)]">Problem Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Two Sum"
                className="w-full p-3 border rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-bold text-[var(--lms-text-secondary)]">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows="4"
                placeholder="Explain the problem clearly..."
                className="w-full p-3 border rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-bold text-[var(--lms-text-secondary)]">Difficulty</label>
                <select 
                  name="difficulty" 
                  value={formData.difficulty} 
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-[var(--lms-text-secondary)]">Default Language</label>
                <select 
                  name="language" 
                  value={formData.language} 
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                >
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-[var(--lms-text-secondary)]">Implementation Instructions</label>
              <textarea 
                name="instructions" 
                value={formData.instructions} 
                onChange={handleChange} 
                rows="3"
                placeholder="e.g. You must solve the problem in O(n) time complexity."
                className="w-full p-3 border rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--lms-border)]">
              <h3 className="text-lg font-bold text-[var(--lms-text-primary)]">Test Cases</h3>
              <button 
                type="button" 
                onClick={addTestCase}
                className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Add Test Case
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.testCases.map((tc, idx) => (
                <div key={idx} className="p-5 border border-[var(--lms-border)] rounded-xl bg-[var(--lms-surface-subtle)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md text-sm">Test Case {idx + 1}</span>
                    {formData.testCases.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTestCase(idx)}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-2">Input (STDIN)</label>
                      <textarea 
                        value={tc.input} 
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        required
                        rows="2"
                        placeholder="e.g. [1, 2, 3]"
                        className="w-full font-mono p-3 border rounded-lg bg-[var(--lms-surface)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-2">Expected Output</label>
                      <textarea 
                        value={tc.expectedOutput} 
                        onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        required
                        rows="2"
                        placeholder="e.g. 6"
                        className="w-full font-mono p-3 border rounded-lg bg-[var(--lms-surface)] text-[var(--lms-text-primary)] border-[var(--lms-border)] focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={`hidden-${idx}`}
                      checked={tc.isHidden}
                      onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor={`hidden-${idx}`} className="text-sm font-medium text-[var(--lms-text-secondary)] cursor-pointer">
                      Hide this test case from students (Evaluated silently)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-70"
            >
              <CheckCircle2 size={20} />
              {loading ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Challenge' : 'Publish to Practice Arena')}
            </button>
          </div>
        </form>
      </div>
      
      
    </DashboardLayout>
  );
};

export default AddPracticeChallenge;
