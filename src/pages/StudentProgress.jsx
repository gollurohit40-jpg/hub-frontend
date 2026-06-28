// frontend/src/pages/StudentProgress.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, BookOpen, Award } from 'lucide-react';
import axios from 'axios';

const StudentProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    totalMaterials: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    subjects: []
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/student/progress');
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <BookOpen size={24} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{progress.totalMaterials}</p>
          <p className="text-sm text-gray-500">Total Materials</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <CheckCircle size={24} className="text-green-600 mb-2" />
          <p className="text-2xl font-bold">{progress.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Clock size={24} className="text-yellow-600 mb-2" />
          <p className="text-2xl font-bold">{progress.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Award size={24} className="text-purple-600 mb-2" />
          <p className="text-2xl font-bold">75%</p>
          <p className="text-sm text-gray-500">Overall Progress</p>
        </div>
      </div>
    </div>
  );
};