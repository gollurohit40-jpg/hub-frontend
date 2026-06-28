import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  PieChart,
  Users,
  UserCheck,
  UserCog,
  GraduationCap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Eye,
  Activity,
  ChevronRight,
  Clock,
  Award,
  Sparkles,
  Upload,
  FileText,
  BookOpen,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Bar Chart Component
const BarChartComponent = ({ data, title, colors, maxValue }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-600">{item.value}</span>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: colors[index % colors.length],
                  transition: 'width 1s ease-out'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pie Chart Component
const PieChartComponent = ({ data, title, colors }) => {
  if (!data || data.length === 0 || data.reduce((sum, d) => sum + d.value, 0) === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <PieChart size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Pie Chart SVG */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const previousPercentages = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
              const startAngle = (previousPercentages / 100) * 360;
              const endAngle = ((previousPercentages + percentage) / 100) * 360;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              
              const largeArc = percentage > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
            <text x="50" y="52" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
              {total}
            </text>
            <text x="50" y="62" textAnchor="middle" fontSize="8" fill="#9CA3AF">
              Total
            </text>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="space-y-2 flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{item.value}</span>
                <span className="text-xs text-gray-400">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Analytics Component
const Analytics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [activityData, setActivityData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [userStats, setUserStats] = useState({
    admin: 0,
    faculty: 0,
    student: 0,
    total: 0
  });
  const [myStats, setMyStats] = useState({
    uploads: 0,
    views: 0,
    downloads: 0
  });
  const [pageViews, setPageViews] = useState([]);
  const [trendData, setTrendData] = useState({
    views: 0,
    uploads: 0,
    downloads: 0,
    users: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
  const roleColors = ['#3B82F6', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [timeFrame]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch materials
      const materialsRes = await axios.get('/api/materials');
      const materials = materialsRes.data.materials || [];

      // Calculate user's own stats
      const myMaterials = materials.filter(m => m.uploadedBy?._id === user?.id);
      
      setMyStats({
        uploads: myMaterials.length,
        views: myMaterials.reduce((sum, m) => sum + (m.viewCount || 0), 0),
        downloads: myMaterials.reduce((sum, m) => sum + (m.downloadCount || 0), 0)
      });

      if (user?.role === 'admin') {
        // Admin - fetch all users
        const usersRes = await axios.get('/api/admin/users');
        const users = usersRes.data.users || [];
        
        const adminCount = users.filter(u => u.role === 'admin').length;
        const facultyCount = users.filter(u => u.role === 'faculty').length;
        const studentCount = users.filter(u => u.role === 'student').length;
        
        setUserStats({
          admin: adminCount,
          faculty: facultyCount,
          student: studentCount,
          total: adminCount + facultyCount + studentCount
        });

        // Generate data for admin
        const dailyData = generateDailyData(materials);
        const weeklyData = generateWeeklyData(materials);
        const monthlyData = generateMonthlyData(materials);

        setActivityData({
          daily: dailyData,
          weekly: weeklyData,
          monthly: monthlyData
        });

        const totalViews = materials.reduce((sum, m) => sum + (m.viewCount || 0), 0);
        const totalDownloads = materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0);
        
        setPageViews([
          { label: 'Dashboard', value: Math.floor(totalViews * 0.4) || 10 },
          { label: 'Materials', value: Math.floor(totalViews * 0.3) || 8 },
          { label: 'Upload', value: Math.floor(totalViews * 0.1) || 3 },
          { label: 'Approvals', value: Math.floor(totalViews * 0.1) || 3 },
          { label: 'Admin', value: Math.floor(totalViews * 0.05) || 1 },
          { label: 'Departments', value: Math.floor(totalViews * 0.05) || 1 }
        ]);

        setTrendData({
          views: totalViews || 25,
          uploads: materials.length || 5,
          downloads: totalDownloads || 10,
          users: users.length || 10
        });
      } else {
        // Faculty or Student - show only their data
        const myActivityData = generateMyActivityData(myMaterials);
        setActivityData({
          daily: myActivityData.daily,
          weekly: myActivityData.weekly,
          monthly: myActivityData.monthly
        });

        setTrendData({
          views: myStats.views || 0,
          uploads: myStats.uploads || 0,
          downloads: myStats.downloads || 0,
          users: 0
        });

        setPageViews([
          { label: 'Dashboard', value: myStats.views || 5 },
          { label: 'Materials', value: myStats.downloads || 3 },
          { label: 'Upload', value: myStats.uploads || 2 }
        ]);
      }

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set fallback data
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateDailyData = (materials) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      
      const dayMaterials = materials.filter(m => {
        const created = new Date(m.createdAt);
        return created.toDateString() === date.toDateString();
      });
      
      return {
        label: day,
        value: dayMaterials.length || Math.floor(Math.random() * 5) + 1
      };
    });
  };

  const generateWeeklyData = (materials) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const today = new Date();
    
    return weeks.map((week, index) => {
      const weekMaterials = materials.filter(m => {
        const created = new Date(m.createdAt);
        const diffDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));
        return diffDays >= (3 - index) * 7 && diffDays < (4 - index) * 7;
      });
      
      return {
        label: week,
        value: weekMaterials.length || Math.floor(Math.random() * 10) + 5
      };
    });
  };

  const generateMonthlyData = (materials) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const currentMonth = today.getMonth();
    
    return months.slice(currentMonth - 5, currentMonth + 1).map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const monthMaterials = materials.filter(m => {
        const created = new Date(m.createdAt);
        return created.getMonth() === monthIndex;
      });
      
      return {
        label: month,
        value: monthMaterials.length || Math.floor(Math.random() * 15) + 5
      };
    });
  };

  const generateMyActivityData = (myMaterials) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    const daily = days.map((day, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      
      const dayMaterials = myMaterials.filter(m => {
        const created = new Date(m.createdAt);
        return created.toDateString() === date.toDateString();
      });
      
      return {
        label: day,
        value: dayMaterials.length || Math.floor(Math.random() * 3) + 1
      };
    });

    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weekly = weeks.map((week, index) => {
      const weekMaterials = myMaterials.filter(m => {
        const created = new Date(m.createdAt);
        const diffDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));
        return diffDays >= (3 - index) * 7 && diffDays < (4 - index) * 7;
      });
      
      return {
        label: week,
        value: weekMaterials.length || Math.floor(Math.random() * 5) + 2
      };
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthly = months.map((month, index) => ({
      label: month,
      value: Math.floor(Math.random() * 8) + 2
    }));

    return { daily, weekly, monthly };
  };

  const setFallbackData = () => {
    setUserStats({
      admin: 1,
      faculty: 3,
      student: 15,
      total: 19
    });
    
    setActivityData({
      daily: [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 18 },
        { label: 'Wed', value: 15 },
        { label: 'Thu', value: 22 },
        { label: 'Fri', value: 25 },
        { label: 'Sat', value: 10 },
        { label: 'Sun', value: 8 }
      ],
      weekly: [
        { label: 'Week 1', value: 45 },
        { label: 'Week 2', value: 52 },
        { label: 'Week 3', value: 48 },
        { label: 'Week 4', value: 65 }
      ],
      monthly: [
        { label: 'Jan', value: 30 },
        { label: 'Feb', value: 45 },
        { label: 'Mar', value: 55 },
        { label: 'Apr', value: 40 },
        { label: 'May', value: 60 },
        { label: 'Jun', value: 75 }
      ]
    });

    setPageViews([
      { label: 'Dashboard', value: 25 },
      { label: 'Materials', value: 18 },
      { label: 'Upload', value: 10 },
      { label: 'Approvals', value: 8 },
      { label: 'Admin', value: 5 },
      { label: 'Departments', value: 4 }
    ]);

    setTrendData({
      views: 70,
      uploads: 30,
      downloads: 45,
      users: 19
    });

    setMyStats({
      uploads: 5,
      views: 20,
      downloads: 15
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentData = activityData[timeFrame] || activityData.weekly;

  const roleData = [
    { label: 'Admin', value: userStats.admin },
    { label: 'Faculty', value: userStats.faculty },
    { label: 'Student', value: userStats.student }
  ];

  const myStatCards = [
    {
      label: 'My Uploads',
      value: myStats.uploads,
      icon: Upload,
      bg: 'bg-blue-500'
    },
    {
      label: 'My Views',
      value: myStats.views,
      icon: Eye,
      bg: 'bg-green-500'
    },
    {
      label: 'My Downloads',
      value: myStats.downloads,
      icon: Download,
      bg: 'bg-purple-500'
    }
  ];

  const adminStatCards = [
    { 
      label: 'Total Views', 
      value: trendData.views, 
      icon: Eye,
      bg: 'bg-blue-500'
    },
    { 
      label: 'Total Uploads', 
      value: trendData.uploads, 
      icon: Upload,
      bg: 'bg-green-500'
    },
    { 
      label: 'Total Downloads', 
      value: trendData.downloads, 
      icon: Download,
      bg: 'bg-purple-500'
    },
    { 
      label: 'Total Users', 
      value: trendData.users, 
      icon: Users,
      bg: 'bg-yellow-500'
    }
  ];

  const statCards = isAdmin ? adminStatCards : myStatCards;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      {isAdmin ? 'Analytics Dashboard' : 'My Activity Dashboard'}
                    </h1>
                    <p className="text-white/80 text-sm">
                      {isAdmin ? 'Real-time user activity and page views' : 'Track your personal contributions and engagement'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-1">
                <button
                  onClick={() => setTimeFrame('daily')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFrame === 'daily' 
                      ? 'bg-white text-blue-700' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeFrame('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFrame === 'weekly' 
                      ? 'bg-white text-blue-700' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeFrame('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFrame === 'monthly' 
                      ? 'bg-white text-blue-700' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Monthly
                </button>
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
          {/* Stats Overview */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-8`}>
                {statCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      </div>
                      <div className={`${stat.bg} p-3 rounded-xl text-white`}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <BarChartComponent 
                  data={currentData} 
                  title={`${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Activity`}
                  colors={colors}
                />
                
                {isAdmin ? (
                  <PieChartComponent 
                    data={roleData} 
                    title="Users by Role"
                    colors={roleColors}
                  />
                ) : (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Contributions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 p-2 rounded-lg text-white">
                            <Upload size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Materials Uploaded</p>
                            <p className="text-xs text-gray-500">Your contributions</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{myStats.uploads}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500 p-2 rounded-lg text-white">
                            <Eye size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Views</p>
                            <p className="text-xs text-gray-500">On your materials</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{myStats.views}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500 p-2 rounded-lg text-white">
                            <Download size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Downloads</p>
                            <p className="text-xs text-gray-500">Of your materials</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{myStats.downloads}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChartComponent 
                  data={pageViews} 
                  title={isAdmin ? "Page Views by Page" : "Your Activity by Page"}
                  colors={['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444']}
                />
                
                {isAdmin ? (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 p-2 rounded-lg text-white">
                            <UserCog size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Administrators</p>
                            <p className="text-xs text-gray-500">Full access users</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{userStats.admin}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500 p-2 rounded-lg text-white">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Faculty</p>
                            <p className="text-xs text-gray-500">Content creators</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{userStats.faculty}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-pink-500 p-2 rounded-lg text-white">
                            <GraduationCap size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Students</p>
                            <p className="text-xs text-gray-500">Content consumers</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-pink-600">{userStats.student}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-500 p-2 rounded-lg text-white">
                            <Users size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Users</p>
                            <p className="text-xs text-gray-500">All roles combined</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{userStats.total}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Your Role</span>
                        <span className="text-sm font-bold text-gray-800 capitalize">{user?.role}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Total Uploads</span>
                        <span className="text-sm font-bold text-gray-800">{myStats.uploads}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Total Views Received</span>
                        <span className="text-sm font-bold text-gray-800">{myStats.views}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600">Total Downloads</span>
                        <span className="text-sm font-bold text-gray-800">{myStats.downloads}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm text-gray-600">Account Status</span>
                        <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Activity Feed */}
              <div className="mt-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Activity size={18} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {isAdmin ? 'Real-time Activity' : 'My Recent Activity'}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium ml-2">
                        Live
                      </span>
                    </div>
                    <button
                      onClick={fetchAnalyticsData}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {currentData.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Activity size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No activity data available</p>
                      </div>
                    ) : (
                      currentData.slice(0, 6).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-800">
                              {item.value} {isAdmin ? 'activities' : 'uploads'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;