import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  CheckCircle,
  Users,
  Building2,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  BarChart3,
  MessageSquare,
  Bookmark,
  UserPlus
} from 'lucide-react';

// Notification Component for Sidebar
const NotificationBell = ({ isCollapsed }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="relative" ref={notificationRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-full flex justify-center py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {showNotifications && (
          <div className="absolute left-full ml-2 top-0 w-80 bg-white rounded-lg shadow-xl border z-50">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif._id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notif.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markNotificationRead(notif._id)}
                  >
                    <p className="text-xs font-medium text-gray-800">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1.5 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={18} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No notifications</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markNotificationRead(notif._id)}
                >
                  <div className="flex items-start gap-2">
                    {notif.type === 'material_approved' && (
                      <CheckCircle size={14} className="text-green-500 mt-0.5" />
                    )}
                    {notif.type === 'material_rejected' && (
                      <div className="text-red-500 mt-0.5">❌</div>
                    )}
                    {notif.type === 'material_upload' && (
                      <Bell size={14} className="text-yellow-500 mt-0.5" />
                    )}
                    {notif.type === 'student_approved' && (
                      <CheckCircle size={14} className="text-green-500 mt-0.5" />
                    )}
                    {notif.type === 'student_rejected' && (
                      <div className="text-red-500 mt-0.5">❌</div>
                    )}
                    {notif.type === 'student_registration' && (
                      <UserPlus size={14} className="text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ onLogout }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [expandedDept, setExpandedDept] = useState(null);
  const [expandedSem, setExpandedSem] = useState({});
  const [expandedSubject, setExpandedSubject] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchDepartments();
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  const toggleDepartment = (deptId) => {
    if (isCollapsed) return;
    setExpandedDept(expandedDept === deptId ? null : deptId);
  };

  const toggleSemester = (deptId, semNum) => {
    if (isCollapsed) return;
    setExpandedSem(prev => ({
      ...prev,
      [`${deptId}-${semNum}`]: !prev[`${deptId}-${semNum}`]
    }));
  };

  const toggleSubject = (deptId, semNum, subjectName) => {
    if (isCollapsed) return;
    setExpandedSubject(prev => ({
      ...prev,
      [`${deptId}-${semNum}-${subjectName}`]: !prev[`${deptId}-${semNum}-${subjectName}`]
    }));
  };

  // ============================================
  // NAVIGATION LINKS - Added Student Approvals
  // ============================================
  const navLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'faculty', 'cr', 'student'] },
    { path: '/materials', icon: FolderOpen, label: 'Browse Materials', roles: ['admin', 'faculty', 'cr', 'student'] },
    { path: '/upload', icon: Upload, label: 'Upload Material', roles: ['admin', 'faculty', 'cr'] },
    { path: '/forum', icon: MessageSquare, label: 'Discussion Forum', roles: ['admin', 'faculty', 'cr', 'student'] },
    { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks', roles: ['admin', 'faculty', 'cr', 'student'] },
    { path: '/approvals', icon: CheckCircle, label: 'Pending Approvals', roles: ['admin'] },
    // ============================================
    // STUDENT APPROVALS LINK - Admin only (NEW)
    // ============================================
    { path: '/student-approvals', icon: UserPlus, label: 'Student Approvals', roles: ['admin'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'faculty', 'student'] },
    { path: '/admin', icon: Users, label: 'User Management', roles: ['admin'] },
    { path: '/departments', icon: Building2, label: 'Departments', roles: ['admin'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role));
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-80';

  return (
    <aside className={`${sidebarWidth} bg-white shadow-lg h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header with Toggle Button */}
      <div className={`p-4 border-b ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Academic Hub</h1>
                <p className="text-xs text-gray-500">Learning Resource Management</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRightIcon size={20} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {/* Navigation Links */}
          <div className="space-y-1">
            {filteredLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'active bg-primary-50 text-primary-600' : ''
                  }`
                }
                title={isCollapsed ? link.label : ''}
              >
                <link.icon size={20} />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* Academic Structure - Only show when expanded */}
          {!isCollapsed && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Academic Structure
              </h3>
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {departments.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    No departments yet.<br />
                    <span className="text-xs">Add departments in Admin panel</span>
                  </div>
                ) : (
                  departments.map((dept) => (
                    <div key={dept._id}>
                      <button
                        onClick={() => toggleDepartment(dept._id)}
                        className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-sm">{dept.name}</span>
                        {expandedDept === dept._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      
                      {expandedDept === dept._id && dept.semesters?.map((sem) => (
                        <div key={sem.semesterNumber} className="ml-3 mt-1">
                          <button
                            onClick={() => toggleSemester(dept._id, sem.semesterNumber)}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <span>Semester {sem.semesterNumber}</span>
                            {expandedSem[`${dept._id}-${sem.semesterNumber}`] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                          
                          {expandedSem[`${dept._id}-${sem.semesterNumber}`] && (
                            <div className="ml-3 mt-1 space-y-1">
                              {sem.subjects?.map((subject, idx) => (
                                <div key={idx}>
                                  <button
                                    onClick={() => toggleSubject(dept._id, sem.semesterNumber, subject.name)}
                                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-600 rounded-lg hover:bg-gray-100"
                                  >
                                    <span className="truncate">{subject.name}</span>
                                    {expandedSubject[`${dept._id}-${sem.semesterNumber}-${subject.name}`] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                  </button>
                                  
                                  {expandedSubject[`${dept._id}-${sem.semesterNumber}-${subject.name}`] && (
                                    <div className="ml-3 mt-1 space-y-1 max-h-48 overflow-y-auto">
                                      {subject.units?.map((unit) => (
                                        <NavLink
                                          key={unit.unitNumber}
                                          to={`/materials?department=${dept._id}&semester=${sem.semesterNumber}&subject=${encodeURIComponent(subject.name)}&unit=${unit.unitNumber}`}
                                          className={({ isActive }) =>
                                            `block px-2 py-1 text-xs text-gray-500 rounded-lg hover:bg-gray-100 ${isActive ? 'bg-primary-50 text-primary-600' : ''}`
                                          }
                                        >
                                          {unit.title || `Unit ${unit.unitNumber}`}
                                        </NavLink>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Section with Notification Bell */}
      <div className="border-t bg-white p-3">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              {(user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'cr') && (
                <NotificationBell isCollapsed={false} />
              )}
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {(user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'cr') && (
              <NotificationBell isCollapsed={true} />
            )}
            <button
              onClick={onLogout}
              className="flex justify-center w-full py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;