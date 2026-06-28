// FILE: src/pages/StudentDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, GraduationCap, Calendar, Clock, 
  FileText, Users, MessageSquare, Bookmark,
  TrendingUp, Award, CheckCircle, ArrowRight,
  Bell, Search, User, LogOut, Home, Grid,
  FolderOpen, Upload, Settings, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalBookmarks: 0,
    totalDownloads: 0,
    pendingAssignments: 0
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalMaterials: 156,
        totalBookmarks: 23,
        totalDownloads: 45,
        pendingAssignments: 3
      });
      setLoading(false);
    }, 500);
  }, []);

  // Quick actions for students
  const quickActions = [
    {
      title: 'Browse Materials',
      icon: FolderOpen,
      color: 'bg-blue-500',
      path: '/materials',
      description: 'Access study materials'
    },
    {
      title: 'My Bookmarks',
      icon: Bookmark,
      color: 'bg-green-500',
      path: '/bookmarks',
      description: 'Saved resources'
    },
    {
      title: 'Discussion Forum',
      icon: MessageSquare,
      color: 'bg-purple-500',
      path: '/forum',
      description: 'Ask questions & discuss'
    },
    {
      title: 'Analytics',
      icon: TrendingUp,
      color: 'bg-orange-500',
      path: '/analytics',
      description: 'Track your progress'
    }
  ];

  // Recent materials
  const recentMaterials = [
    { id: 1, title: 'Data Structures Notes', subject: 'Computer Science', date: '2024-01-15' },
    { id: 2, title: 'Algorithm Practice Problems', subject: 'Computer Science', date: '2024-01-14' },
    { id: 3, title: 'Database Management Systems', subject: 'DBMS', date: '2024-01-13' },
    { id: 4, title: 'Operating Systems Concepts', subject: 'OS', date: '2024-01-12' }
  ];

  // Upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Mid-Term Exams', date: '2024-02-15', type: 'Exam' },
    { id: 2, title: 'Project Submission', date: '2024-02-20', type: 'Deadline' },
    { id: 3, title: 'Guest Lecture', date: '2024-02-25', type: 'Event' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">Academic Hub</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'student@email.com'}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-blue-100 mt-1">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/materials" 
                className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-lg hover:bg-white/30 transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Browse Materials
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalMaterials}</p>
                <p className="text-sm text-gray-500">Total Materials</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Bookmark className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalBookmarks}</p>
                <p className="text-sm text-gray-500">Bookmarks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDownloads}</p>
                <p className="text-sm text-gray-500">Downloads</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingAssignments}</p>
                <p className="text-sm text-gray-500">Pending Tasks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - Left Column */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.path}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Materials */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Materials</h2>
                <Link to="/materials" className="text-sm text-blue-600 hover:text-blue-700">
                  View All →
                </Link>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {recentMaterials.map((material, index) => (
                  <div 
                    key={material.id}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      index !== recentMaterials.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">{material.title}</p>
                        <p className="text-sm text-gray-500">{material.subject}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{material.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Events */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`pb-4 ${index !== upcomingEvents.length - 1 ? 'border-b border-gray-100 mb-4' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      event.type === 'Exam' ? 'bg-red-100' : 
                      event.type === 'Deadline' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <Calendar className={`h-4 w-4 ${
                        event.type === 'Exam' ? 'text-red-600' : 
                        event.type === 'Deadline' ? 'text-orange-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.type === 'Exam' ? 'bg-red-100 text-red-700' : 
                          event.type === 'Deadline' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-sm text-gray-400">{event.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">Learning Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Completion</span>
                    <span className="text-gray-800 font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Study Streak</span>
                    <span className="text-gray-800 font-medium">12 days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 rounded-full h-2" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing Download icon import
const Download = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default StudentDashboard;