import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, FileText, Eye, Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Approvals = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchPendingMaterials();
    fetchNotifications();
    const interval = setInterval(() => { fetchPendingMaterials(); fetchNotifications(); }, 10000);
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

  const fetchPendingMaterials = async () => {
    try {
      const response = await axios.get('/api/materials?status=pending');
      setPendingMaterials(response.data.materials);
    } catch (error) {
      console.error('Failed to fetch pending materials:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleReview = async (materialId, status) => {
    try {
      await axios.put(`/api/materials/${materialId}/status`, { status, reviewComment: reviewComment[materialId] || '' });
      toast.success(`Material ${status} successfully`);
      fetchPendingMaterials();
      fetchNotifications();
      setReviewComment(prev => ({ ...prev, [materialId]: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review failed');
    }
  };

  const handlePreview = (material) => {
    setPreviewMaterial(material);
  };

  const closePreview = () => {
    setPreviewMaterial(null);
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
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center"><XCircle size={48} className="mx-auto text-red-500 mb-4" /><h2 className="text-xl font-semibold text-gray-800">Access Denied</h2><p className="text-gray-500 mt-2">Only administrators can access this page.</p></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pending Approvals</h1>
                  <p className="text-white/80 text-sm">Review and manage materials uploaded by Faculty and CRs</p>
                </div>
              </div>
              
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/20 rounded-full transition-colors">
                  <Bell size={24} className="text-white" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
                    <div className="flex justify-between items-center p-3 border-b">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {notifications.length > 0 && <button onClick={markAllNotificationsRead} className="text-xs text-primary-600 hover:text-primary-700">Mark all as read</button>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500"><Bell size={32} className="mx-auto mb-2 text-gray-300" /><p className="text-sm">No notifications</p></div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif._id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`} onClick={() => markNotificationRead(notif._id)}>
                            <div className="flex items-start gap-2">
                              {notif.type === 'material_approved' && <CheckCircle size={16} className="text-green-500 mt-0.5" />}
                              {notif.type === 'material_rejected' && <XCircle size={16} className="text-red-500 mt-0.5" />}
                              {notif.type === 'material_upload' && <Bell size={16} className="text-yellow-500 mt-0.5" />}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : pendingMaterials.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-800">No Pending Approvals</h3>
              <p className="text-gray-500 mt-1">All materials have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMaterials.map((material) => (
                <div key={material._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText size={24} className="text-yellow-500" />
                        <h3 className="text-lg font-semibold text-gray-800">{material.title}</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                      </div>
                      {material.description && <p className="text-gray-600 text-sm mb-3">{material.description}</p>}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                        <div className="bg-gray-50 p-2 rounded"><span className="text-gray-500">Department:</span><p className="font-medium">{material.department?.name}</p></div>
                        <div className="bg-gray-50 p-2 rounded"><span className="text-gray-500">Semester:</span><p className="font-medium">Semester {material.semester}</p></div>
                        <div className="bg-gray-50 p-2 rounded"><span className="text-gray-500">Subject:</span><p className="font-medium">{material.subject}</p></div>
                        <div className="bg-gray-50 p-2 rounded"><span className="text-gray-500">Unit:</span><p className="font-medium">Unit {material.unit}</p></div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded mb-4">
                        <p className="text-sm"><span className="font-medium">Uploaded by:</span> {material.uploadedBy?.name} <span className="text-gray-500 ml-2">({material.uploadedBy?.role})</span></p>
                        <p className="text-xs text-gray-500 mt-1">Uploaded on: {new Date(material.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Comment (Optional)</label>
                        <textarea value={reviewComment[material._id] || ''} onChange={(e) => setReviewComment(prev => ({ ...prev, [material._id]: e.target.value }))} className="input-field" rows="2" placeholder="Add feedback for the uploader..." />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => handlePreview(material)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Eye size={18} /> Preview
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button onClick={() => handleReview(material._id, 'approved')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button onClick={() => handleReview(material._id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="font-semibold text-gray-800">{previewMaterial.title}</h3><p className="text-xs text-gray-500 mt-1">{previewMaterial.department?.name} • Semester {previewMaterial.semester} • {previewMaterial.subject} • Unit {previewMaterial.unit}</p></div>
              <button onClick={closePreview} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewMaterial.fileType === 'pdf' ? (
                <iframe src={previewMaterial.fileUrl} className="w-full h-[70vh]" title={previewMaterial.title} />
              ) : previewMaterial.fileType === 'jpg' || previewMaterial.fileType === 'png' ? (
                <img src={previewMaterial.fileUrl} alt={previewMaterial.title} className="max-w-full h-auto mx-auto" />
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Preview not available for this file type.</p>
                  <button onClick={() => window.open(previewMaterial.fileUrl, '_blank')} className="mt-4 btn-primary">Download to view</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;