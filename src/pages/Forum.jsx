import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageSquare, ThumbsUp, Reply, Send, Search, 
  Filter, ChevronDown, ChevronUp, User, Clock, Eye,
  X  // <-- ADDED X HERE
} from 'lucide-react';
import toast from 'react-hot-toast';

const Forum = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    department: '',
    semester: '',
    subject: '',
    unit: ''
  });
  const [replyContent, setReplyContent] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    semester: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (newQuestion.department && newQuestion.semester) {
      const dept = departments.find(d => d._id === newQuestion.department);
      const semester = dept?.semesters?.find(s => s.semesterNumber === parseInt(newQuestion.semester));
      setSubjects(semester?.subjects || []);
    }
  }, [newQuestion.department, newQuestion.semester]);

  useEffect(() => {
    if (newQuestion.subject) {
      const subject = subjects.find(s => s.name === newQuestion.subject);
      setUnits(subject?.units || []);
    }
  }, [newQuestion.subject]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.department) params.append('department', filters.department);
      if (filters.semester) params.append('semester', filters.semester);

      const response = await axios.get(`/api/forum/questions?${params.toString()}`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      await axios.post('/api/forum/questions', newQuestion);
      toast.success('Question posted successfully!');
      setShowAskModal(false);
      setNewQuestion({ title: '', content: '', department: '', semester: '', subject: '', unit: '' });
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to post question');
    }
  };

  const handleReply = async (questionId) => {
    const content = replyContent[questionId];
    if (!content || !content.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await axios.post(`/api/forum/questions/${questionId}/replies`, { content });
      toast.success('Reply added!');
      setReplyContent({ ...replyContent, [questionId]: '' });
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleLike = async (questionId) => {
    try {
      await axios.put(`/api/forum/questions/${questionId}/like`);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to like question');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleExpand = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Discussion Forum</h1>
                  <p className="text-white/80 text-sm">Ask questions, share knowledge, and help others</p>
                </div>
              </div>
              <button
                onClick={() => setShowAskModal(true)}
                className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Send size={16} /> Ask Question
              </button>
            </div>
          </div>
          <div className="relative h-4">
            <svg className="absolute bottom-0 w-full h-6 text-gray-50 dark:text-gray-900" viewBox="0 0 1440 48" fill="none">
              <path d="M0 48L60 40C120 32 240 16 360 13.3C480 11 600 21 720 26.7C840 32 960 32 1080 29.3C1200 27 1320 21 1380 18.7L1440 16V48H0Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchQuestions()}
                    className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 w-40"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 w-40"
                disabled={!filters.department}
              >
                <option value="">All Semesters</option>
                {departments.find(d => d._id === filters.department)?.semesters?.map(sem => (
                  <option key={sem.semesterNumber} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>
                ))}
              </select>
              <button onClick={fetchQuestions} className="btn-primary">Apply Filters</button>
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">No questions yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Be the first to ask a question!</p>
              <button onClick={() => setShowAskModal(true)} className="mt-4 btn-primary">Ask a Question</button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                            {q.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>By {q.user?.name}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(q.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Eye size={14} /> {q.viewCount} views</span>
                            {q.department && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">{q.department?.name}</span>}
                            {q.semester && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">Sem {q.semester}</span>}
                            {q.subject && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">{q.subject}</span>}
                          </div>
                        </div>
                        {q.isAnswered && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                            ✅ Answered
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-2">
                        {q.content}
                      </p>

                      <div className="flex items-center gap-4 mt-4">
                        <button
                          onClick={() => handleLike(q._id)}
                          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <ThumbsUp size={16} /> {q.likes?.length || 0}
                        </button>
                        <button
                          onClick={() => toggleExpand(q._id)}
                          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Reply size={16} /> {q.replies?.length || 0} replies
                        </button>
                      </div>

                      {/* Replies Section */}
                      {expandedQuestion === q._id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          {/* Reply Input */}
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyContent[q._id] || ''}
                              onChange={(e) => setReplyContent({ ...replyContent, [q._id]: e.target.value })}
                              className="flex-1 input-field text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <button
                              onClick={() => handleReply(q._id)}
                              className="btn-primary py-2 px-4 text-sm"
                            >
                              Reply
                            </button>
                          </div>

                          {/* Existing Replies */}
                          {q.replies?.map((reply, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-800 dark:text-white">{reply.user?.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ask a Question</h2>
              <button onClick={() => setShowAskModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} />  {/* NOW X IS DEFINED */}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="What's your question about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  rows="4"
                  placeholder="Describe your question in detail..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <select
                    value={newQuestion.department}
                    onChange={(e) => setNewQuestion({ ...newQuestion, department: e.target.value, semester: '', subject: '', unit: '' })}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <select
                    value={newQuestion.semester}
                    onChange={(e) => setNewQuestion({ ...newQuestion, semester: e.target.value })}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    disabled={!newQuestion.department}
                  >
                    <option value="">Select Semester</option>
                    {departments.find(d => d._id === newQuestion.department)?.semesters?.map(sem => (
                      <option key={sem.semesterNumber} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <select
                    value={newQuestion.subject}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    disabled={!newQuestion.semester}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.name} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <select
                    value={newQuestion.unit}
                    onChange={(e) => setNewQuestion({ ...newQuestion, unit: e.target.value })}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    disabled={!newQuestion.subject}
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit.unitNumber} value={unit.unitNumber}>Unit {unit.unitNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleAskQuestion} className="flex-1 btn-primary">Post Question</button>
                <button onClick={() => setShowAskModal(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;