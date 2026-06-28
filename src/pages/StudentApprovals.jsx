import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, UserPlus, CheckCircle, XCircle, Clock, 
  Mail, Calendar, AlertCircle, RefreshCw, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentApprovals = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [reviewComment, setReviewComment] = useState({});

  useEffect(() => {
    fetchPendingStudents();
    const interval = setInterval(fetchPendingStudents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/pending-students');
      setPendingStudents(response.data.students);
    } catch (error) {
      console.error('Failed to fetch pending students:', error);
      toast.error('Failed to load pending students');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (studentId, status) => {
    const comment = reviewComment[studentId] || '';
    
    if (status === 'rejected' && !comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingId(studentId);
    try {
      await axios.put(`/api/auth/approve-student/${studentId}`, {
        status,
        comment
      });
      
      toast.success(`Student ${status} successfully`);
      setReviewComment(prev => ({ ...prev, [studentId]: '' }));
      fetchPendingStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Only admin can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="flex">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
            <p className="text-gray-500 mt-2">Only administrators can access this page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Approvals</h1>
                <p className="text-white/80 text-sm">Review and approve new student registrations</p>
              </div>
            </div>
          </div>
          <div className="relative h-4">
            <svg className="absolute bottom-0 w-full h-6 text-gray-50" viewBox="0 0 1440 48" fill="none">
              <path d="M0 48L60 40C120 32 240 16 360 13.3C480 11 600 21 720 26.7C840 32 960 32 1080 29.3C1200 27 1320 21 1380 18.7L1440 16V48H0Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-800">{pendingStudents.length}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">-</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Auto-Refresh</p>
                  <p className="text-sm font-semibold text-green-600">Every 30s</p>
                </div>
                <button onClick={fetchPendingStudents} className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors">
                  <RefreshCw size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Pending Students List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingStudents.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
              <UserCheck size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-800">No Pending Approvals</h3>
              <p className="text-gray-500 mt-1">All student registrations have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingStudents.map((student) => (
                <div key={student._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {student.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={14} /> {student.email}
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock size={12} /> Pending
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-4">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Department:</span>
                          <p className="font-medium">{student.department?.name || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Semester:</span>
                          <p className="font-medium">{student.semester || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Registered:</span>
                          <p className="font-medium">{new Date(student.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Review Comment {student.approvalStatus === 'pending' ? '(Required for rejection)' : ''}
                        </label>
                        <textarea
                          value={reviewComment[student._id] || ''}
                          onChange={(e) => setReviewComment(prev => ({ ...prev, [student._id]: e.target.value }))}
                          className="input-field"
                          rows="2"
                          placeholder="Add feedback for the student..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleApproval(student._id, 'approved')}
                      disabled={processingId === student._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processingId === student._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApproval(student._id, 'rejected')}
                      disabled={processingId === student._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {processingId === student._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <XCircle size={18} />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentApprovals;