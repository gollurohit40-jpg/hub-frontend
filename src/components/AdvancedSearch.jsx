import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const AdvancedSearch = ({ onSearch, departments }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    semester: '',
    subject: '',
    unit: '',
    sortBy: 'recent'
  });
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (filters.department && filters.semester) {
      const dept = departments.find(d => d._id === filters.department);
      const semester = dept?.semesters?.find(s => s.semesterNumber === parseInt(filters.semester));
      setSubjects(semester?.subjects || []);
    }
  }, [filters.department, filters.semester]);

  useEffect(() => {
    if (filters.subject) {
      const subject = subjects.find(s => s.name === filters.subject);
      setUnits(subject?.units || []);
    }
  }, [filters.subject]);

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      department: '',
      semester: '',
      subject: '',
      unit: '',
      sortBy: 'recent'
    });
    setSubjects([]);
    setUnits([]);
    onSearch({ keyword: '', department: '', semester: '', subject: '', unit: '', sortBy: 'recent' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Search size={20} className="text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search materials by title, description, or subject..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        <button onClick={handleSearch} className="btn-primary">Search</button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X size={14} /> Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value, semester: '', subject: '', unit: '' })}
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value, subject: '', unit: '' })}
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
              disabled={!filters.department}
            >
              <option value="">All Semesters</option>
              {departments.find(d => d._id === filters.department)?.semesters?.map(sem => (
                <option key={sem.semesterNumber} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>
              ))}
            </select>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value, unit: '' })}
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
              disabled={!filters.semester}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.name} value={subject.name}>{subject.name}</option>
              ))}
            </select>
            <select
              value={filters.unit}
              onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
              disabled={!filters.subject}
            >
              <option value="">All Units</option>
              {units.map(unit => (
                <option key={unit.unitNumber} value={unit.unitNumber}>Unit {unit.unitNumber}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex justify-end">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm w-48"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;