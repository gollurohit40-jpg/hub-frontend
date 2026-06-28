import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, X, Edit2, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BookmarkButton = ({ materialId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarkId, setBookmarkId] = useState(null);

  useEffect(() => {
    checkBookmarkStatus();
  }, [materialId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await axios.get(`/api/bookmarks/check/${materialId}`);
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await axios.delete(`/api/bookmarks/${materialId}`);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        const response = await axios.post('/api/bookmarks', { materialId, note: '' });
        setIsBookmarked(true);
        setBookmarkId(response.data.bookmark._id);
        toast.success('Bookmark added');
        setShowNoteModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    }
  };

  const saveNote = async () => {
    if (!bookmarkId) return;
    try {
      await axios.put(`/api/bookmarks/${bookmarkId}`, { note });
      toast.success('Note saved');
      setShowNoteModal(false);
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>;
  }

  return (
    <>
      <button
        onClick={toggleBookmark}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
      >
        {isBookmarked ? (
          <BookmarkCheck size={20} className="text-blue-600 dark:text-blue-400" />
        ) : (
          <Bookmark size={20} className="text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
              rows="4"
              placeholder="Add a note to remember why you bookmarked this material..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={saveNote} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Save size={16} /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookmarkButton;