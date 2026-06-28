import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bookmark, FileText, X, Edit2, Save, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Bookmarks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookmarks');
      setBookmarks(response.data.bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (materialId) => {
    if (!confirm('Remove this bookmark?')) return;
    try {
      await axios.delete(`/api/bookmarks/${materialId}`);
      toast.success('Bookmark removed');
      fetchBookmarks();
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const saveNote = async (bookmarkId) => {
    try {
      await axios.put(`/api/bookmarks/${bookmarkId}`, { note: noteContent });
      toast.success('Note saved');
      setEditingNote(null);
      fetchBookmarks();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Bookmark className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Bookmarks</h1>
                <p className="text-white/80 text-sm">Your saved materials and notes</p>
              </div>
            </div>
          </div>
          <div className="relative h-4">
            <svg className="absolute bottom-0 w-full h-6 text-gray-50 dark:text-gray-900" viewBox="0 0 1440 48" fill="none">
              <path d="M0 48L60 40C120 32 240 16 360 13.3C480 11 600 21 720 26.7C840 32 960 32 1080 29.3C1200 27 1320 21 1380 18.7L1440 16V48H0Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">No bookmarks yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Start saving materials you find useful!</p>
              <button onClick={() => navigate('/materials')} className="mt-4 btn-primary">Browse Materials</button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div key={bookmark._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-primary-500" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {bookmark.material?.title || 'Untitled'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>📚 {bookmark.material?.department?.name || 'N/A'}</span>
                        <span>📖 Semester {bookmark.material?.semester}</span>
                        <span>📘 {bookmark.material?.subject || 'General'}</span>
                        <span>📗 Unit {bookmark.material?.unit}</span>
                      </div>
                      
                      {/* Note Section */}
                      <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        {editingNote === bookmark._id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              className="flex-1 input-field text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
                              placeholder="Add your note..."
                              autoFocus
                            />
                            <button onClick={() => saveNote(bookmark._id)} className="btn-primary py-1 px-3 text-sm">
                              <Save size={16} />
                            </button>
                            <button onClick={() => setEditingNote(null)} className="btn-secondary py-1 px-3 text-sm">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {bookmark.note || 'No note added yet'}
                            </p>
                            <button
                              onClick={() => {
                                setEditingNote(bookmark._id);
                                setNoteContent(bookmark.note || '');
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              <Edit2 size={14} /> Edit Note
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => window.open(bookmark.material?.fileUrl, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => removeBookmark(bookmark.material?._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Remove Bookmark"
                      >
                        <X size={18} />
                      </button>
                    </div>
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

export default Bookmarks;