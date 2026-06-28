import React, { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const RatingStars = ({ materialId, initialRating, onRatingUpdate }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  const handleRating = async (value) => {
    setLoading(true);
    try {
      await axios.post(`/api/materials/${materialId}/rate`, {
        rating: value,
        comment
      });
      setRating(value);
      onRatingUpdate?.();
      toast.success('Rating submitted!');
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !loading && handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
            disabled={loading}
          >
            <Star
              size={24}
              className={`${
                star <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          {rating > 0 ? `${rating}/5` : 'Rate this material'}
        </span>
      </div>
      {rating > 0 && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 input-field text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default RatingStars;