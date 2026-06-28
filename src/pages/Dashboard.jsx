import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, Users, BookOpen, CheckCircle, TrendingUp, Download, Upload, 
  Clock, Award, Calendar, Bell, ChevronRight, Star, Activity, 
  BarChart3, FolderOpen, ThumbsUp, Eye, GraduationCap, Sparkles, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [materialsRes] = await Promise.all([
        axios.get('/api/materials?limit=5')
      ]);
      
      setRecentMaterials(materialsRes.data.materials || []);
      
      if (user.role === 'admin') {
        const statsRes = await axios.get('/api/admin/stats');
        setStats(statsRes.data.stats);
      } else if (user.role === 'faculty') {
        const pendingRes = await axios.get('/api/materials?status=pending');
        setStats({
          totalMaterials: materialsRes.data.materials?.length || 0,
          pendingApprovals: pendingRes.data.materials?.length || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminStatCards = [
    { 
      label: 'Total Materials', 
      value: stats?.totalMaterials || 0, 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      description: 'All uploaded resources'
    },
    { 
      label: 'Pending Approval', 
      value: stats?.pendingMaterials || 0, 
      icon: Clock, 
      color: 'from-yellow-500 to-yellow-600',
      bgGradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconBg: 'bg-yellow-500',
      description: 'Awaiting review'
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'from-green-500 to-green-600',
      bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      description: 'Active members'
    },
    { 
      label: 'Departments', 
      value: stats?.totalDepartments || 0, 
      icon: BookOpen, 
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      description: 'Academic departments'
    },
  ];

  const facultyStatCards = [
    { 
      label: 'My Materials', 
      value: stats?.totalMaterials || 0, 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      description: 'Uploaded by you'
    },
    { 
      label: 'Pending Reviews', 
      value: stats?.pendingApprovals || 0, 
      icon: Clock, 
      color: 'from-yellow-500 to-yellow-600',
      bgGradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconBg: 'bg-yellow-500',
      description: 'Need your approval'
    },
  ];

  const statCards = user.role === 'admin' ? adminStatCards : 
                    user.role === 'faculty' ? facultyStatCards : 
                    [];

  return (
    <div className="flex bg-gray-50">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Top Header with Gradient - ACADEMIC HUB HIGHLIGHTED */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-8">
            <div className="flex justify-between items-start">
              <div>
                {/* ACADEMIC HUB - Large Highlighted Text */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                      ACADEMIC HUB
                    </h1>
                    <p className="text-white/80 text-sm mt-0.5">Centralized Learning Resource Management</p>
                  </div>
                </div>
                
                {/* Welcome Message */}
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-300" />
                    <p className="text-white/90 text-lg">
                      {greeting}, <span className="font-semibold text-white">{user?.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-white/60" />
                    <p className="text-white/60 text-sm">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Role Badge - ADMINISTRATOR HIGHLIGHTED */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-center border border-white/30 shadow-lg">
                <p className="text-xs text-white/70 uppercase tracking-wider">Your Role</p>
                <p className="text-xl md:text-2xl font-bold capitalize mt-1">
                  {user?.role === 'admin' ? 'ADMINISTRATOR' : user?.role}
                </p>
                {user?.role === 'admin' && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star size={12} className="text-yellow-300 fill-yellow-300" />
                    <span className="text-[10px] text-white/80">Full Access</span>
                    <Star size={12} className="text-yellow-300 fill-yellow-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative Wave */}
          <div className="relative h-4">
            <svg className="absolute bottom-0 w-full h-6 text-gray-50" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 48L60 40C120 32 240 16 360 13.3C480 11 600 21 720 26.7C840 32 960 32 1080 29.3C1200 27 1320 21 1380 18.7L1440 16V48H0Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Stats Cards Grid */}
          {statCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div 
                  key={index} 
                  className={`${stat.bgGradient} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-white/50`}
                  onClick={() => {
                    if (stat.label === 'Pending Approval' || stat.label === 'Pending Reviews') {
                      navigate('/approvals');
                    } else if (stat.label === 'Total Materials' || stat.label === 'My Materials') {
                      navigate('/materials');
                    } else if (stat.label === 'Total Users') {
                      navigate('/admin');
                    } else if (stat.label === 'Departments') {
                      navigate('/departments');
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.iconBg} p-3 rounded-xl text-white shadow-lg`}>
                      <stat.icon size={24} />
                    </div>
                    <ChevronRight size={20} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-600 text-sm font-medium mt-1">{stat.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{stat.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Materials Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Recent Materials</h2>
                </div>
                <button 
                  onClick={() => navigate('/materials')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="space-y-3">
                {recentMaterials.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <FolderOpen size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No materials uploaded yet</p>
                    <button 
                      onClick={() => navigate('/upload')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Upload your first material →
                    </button>
                  </div>
                ) : (
                  recentMaterials.map((material) => (
                    <div 
                      key={material._id} 
                      className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200 cursor-pointer"
                      onClick={() => navigate('/materials')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            material.fileType === 'pdf' ? 'bg-red-100' :
                            material.fileType === 'doc' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <FileText size={20} className={`${
                              material.fileType === 'pdf' ? 'text-red-600' :
                              material.fileType === 'doc' ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{material.title}</h3>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} /> {material.department?.name}
                              </span>
                              <span>Semester {material.semester}</span>
                              <span>Unit {material.unit}</span>
                              <span className="capitalize">{material.fileType}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Eye size={12} /> {material.viewCount || 0} views
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Download size={12} /> {material.downloadCount || 0} downloads
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                material.status === 'approved' ? 'bg-green-100 text-green-600' :
                                material.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {material.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar - Administrator Section Highlighted */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Target size={16} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/upload')}
                    className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2.5 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Upload size={16} />
                      Upload Material
                    </span>
                    <ChevronRight size={14} />
                  </button>
                  {(user.role === 'admin' || user.role === 'faculty') && (
                    <button 
                      onClick={() => navigate('/approvals')}
                      className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2.5 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} />
                        Review Pending
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/materials')}
                    className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2.5 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <FolderOpen size={16} />
                      Browse Materials
                    </span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Your Activity Card - ADMINISTRATOR Highlighted */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Activity size={18} className="text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-base">Administrator Profile</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Role</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-700 capitalize">{user?.role}</span>
                      {user?.role === 'admin' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Full Access
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Total Uploads</span>
                    <span className="text-sm font-bold text-gray-800">{recentMaterials.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Account Status</span>
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} /> Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Member Since</span>
                    <span className="text-sm font-medium text-gray-800">2024</span>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-orange-100 p-1.5 rounded-lg">
                    <Award size={16} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Pro Tip</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {user.role === 'admin' 
                    ? 'Use the Department Manager to organize subjects and units efficiently. You have full control over all system settings.'
                    : user.role === 'faculty'
                    ? 'Review pending materials regularly to keep content fresh for students. Your contributions help the learning community.'
                    : 'Bookmark important materials for quick access later. Stay updated with new uploads in your department.'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Specific - System Overview */}
          {user.role === 'admin' && stats?.usersByRole && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChart3 size={18} className="text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">System Overview</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.usersByRole?.map((roleStat, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                    <p className="text-2xl font-bold text-gray-800">{roleStat.count}</p>
                    <p className="text-sm text-gray-500 capitalize">{roleStat._id}s</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;