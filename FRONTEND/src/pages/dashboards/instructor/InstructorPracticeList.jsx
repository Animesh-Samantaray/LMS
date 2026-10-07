import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../../services/api.service';
import DashboardLayout from '../../../components/DashboardLayout';

const InstructorPracticeList = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/api/practice');
      if (res.data.success) {
        setChallenges(res.data.data);
      }
    } catch (err) {
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        await api.delete(`/api/practice/${id}`);
        setChallenges(challenges.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete challenge.');
      }
    }
  };

  return (
    <DashboardLayout roleTitle="INSTRUCTOR" pageTitle="Practice Challenges">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--lms-text-primary)]">Practice Arena</h2>
            <p className="text-[var(--lms-text-secondary)] mt-1">Manage the DSA challenges available to your students.</p>
          </div>
          <button 
            onClick={() => navigate('/instructor/practice/create')}
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2"
          >
            <Plus size={20} /> Create New Practice Question
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-indigo-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--lms-text-primary)] mb-2">No Challenges Yet</h3>
            <p className="text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">You haven't created any coding challenges for the Practice Arena. Get started by creating your first problem.</p>
            <button 
              onClick={() => navigate('/instructor/practice/create')}
              className="bg-indigo-100 text-indigo-700 font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              Create First Challenge
            </button>
          </div>
        ) : (
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)]">
                    <th className="p-4 text-xs font-extrabold text-[var(--lms-text-muted)] uppercase tracking-wider">Title</th>
                    <th className="p-4 text-xs font-extrabold text-[var(--lms-text-muted)] uppercase tracking-wider">Difficulty</th>
                    <th className="p-4 text-xs font-extrabold text-[var(--lms-text-muted)] uppercase tracking-wider">Language</th>
                    <th className="p-4 text-xs font-extrabold text-[var(--lms-text-muted)] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border)]">
                  {challenges.map((challenge) => (
                    <tr key={challenge._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="p-4 font-bold text-[var(--lms-text-primary)]">
                        {challenge.title}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${
                          challenge.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                          challenge.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-[var(--lms-text-secondary)] uppercase bg-[var(--lms-surface)] border border-[var(--lms-border)] px-2 py-1 rounded">
                          {challenge.language || 'Multiple'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          
                          <button 
                            onClick={() => navigate(`/instructor/practice/edit/${challenge._id}`)}
                            title="Edit"
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(challenge._id)}
                            title="Delete"
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructorPracticeList;
