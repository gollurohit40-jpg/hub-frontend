import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download, Eye, Search, Filter, Trash2, X, RefreshCw, ChevronLeft, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Materials = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    department: searchParams.get('department') || '',
    semester: searchParams.get('semester') || '',
    subject: searchParams.get('subject') || '',
    unit: searchParams.get('unit') || '',
    status: 'approved'
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters, currentPage]);

  useEffect(() => {
    if (filters.department && filters.semester) {
      const dept = departments.find(d => d._id === filters.department);
      const semester = dept?.semesters?.find(s => s.semesterNumber === parseInt(filters.semester));
      setSubjects(semester?.subjects || []);
      setFilters(prev => ({ ...prev, subject: '', unit: '' }));
      setUnits([]);
    } else {
      setSubjects([]);
    }
  }, [filters.department, filters.semester, departments]);

  useEffect(() => {
    if (filters.subject) {
      const subject = subjects.find(s => s.name === filters.subject);
      setUnits(subject?.units || []);
      setFilters(prev => ({ ...prev, unit: '' }));
    } else {
      setUnits([]);
    }
  }, [filters.subject, subjects]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department && filters.department !== 'all') params.append('department', filters.department);
      if (filters.semester && filters.semester !== 'all') params.append('semester', filters.semester);
      if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
      if (filters.unit && filters.unit !== 'all') params.append('unit', filters.unit);
      if (filters.status && user.role !== 'student') params.append('status', filters.status);
      
      params.append('limit', itemsPerPage);
      params.append('page', currentPage);
      
      const response = await axios.get(`/api/materials?${params.toString()}`);
      let filteredMaterials = response.data.materials || [];
      
      if (searchTerm.trim()) {
        filteredMaterials = filteredMaterials.filter(material =>
          material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.subject?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setMaterials(filteredMaterials);
      setTotalMaterials(response.data.total || filteredMaterials.length);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      toast.error('Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      await axios.put(`/api/materials/${material._id}/download`);
      let fileUrl = material.fileUrl;
      if (fileUrl.startsWith('/uploads/')) {
        fileUrl = `${API_BASE_URL}${fileUrl}`;
      }
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = material.fileName || `${material.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const handlePreview = (material) => {
    let fileUrl = material.fileUrl;
    if (fileUrl.startsWith('/uploads/')) {
      fileUrl = `${API_BASE_URL}${fileUrl}`;
    }
    window.open(fileUrl, '_blank');
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await axios.delete(`/api/materials/${materialId}`);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    const newParams = { ...filters, [key]: value };
    Object.keys(newParams).forEach(k => {
      if (!newParams[k]) delete newParams[k];
    });
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      semester: '',
      subject: '',
      unit: '',
      status: 'approved'
    });
    setSearchTerm('');
    setCurrentPage(1);
    setSearchParams({});
    toast.success('All filters cleared');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalPages = Math.ceil(totalMaterials / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalMaterials);
  const selectedDepartment = departments.find(d => d._id === filters.department);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Learning Materials</h1>
                <p className="text-white/80 text-sm">Browse, preview, and download academic resources</p>
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
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title, description, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchMaterials()}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <h2 className="font-semibold text-gray-800">Filter Materials</h2>
              </div>
              <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <RefreshCw size={14} /> Clear All Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <select value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)} className="input-field">
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              
              <select value={filters.semester} onChange={(e) => handleFilterChange('semester', e.target.value)} className="input-field" disabled={!filters.department}>
                <option value="">All Semesters</option>
                {selectedDepartment?.semesters?.map(sem => (
                  <option key={sem.semesterNumber} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>
                ))}
              </select>
              
              <select value={filters.subject} onChange={(e) => handleFilterChange('subject', e.target.value)} className="input-field" disabled={!filters.semester}>
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.name} value={subject.name}>{subject.name}</option>
                ))}
              </select>
              
              <select value={filters.unit} onChange={(e) => handleFilterChange('unit', e.target.value)} className="input-field" disabled={!filters.subject}>
                <option value="">All Units</option>
                {units.map(unit => (
                  <option key={unit.unitNumber} value={unit.unitNumber}>Unit {unit.unitNumber}</option>
                ))}
              </select>

              {user.role !== 'student' && (
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="input-field">
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All Status</option>
                </select>
              )}
            </div>
            
            {!loading && materials.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">Found {totalMaterials} material(s) (Showing {startIndex}-{endIndex})</div>
            )}
          </div>

          {/* Materials List */}
          {loading ? (
            <LoadingSkeleton />
          ) : materials.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800">No materials found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or check back later</p>
              <button onClick={clearAllFilters} className="mt-4 btn-secondary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {materials.map((material) => (
                  <div key={material._id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <FileText size={24} className="text-primary-500 flex-shrink-0" />
                          <h3 className="text-lg font-semibold text-gray-800 truncate">{material.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            material.status === 'approved' ? 'bg-green-100 text-green-700' :
                            material.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{material.status}</span>
                        </div>
                        
                        {material.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{material.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>📚 {material.department?.name || 'N/A'}</span>
                          <span>📖 Semester {material.semester}</span>
                          <span>📘 {material.subject || 'General'}</span>
                          <span>📗 Unit {material.unit}</span>
                          <span>📄 {material.fileType?.toUpperCase()}</span>
                          <span>📅 {new Date(material.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye size={14} /> {material.viewCount} views</span>
                          <span className="flex items-center gap-1"><Download size={14} /> {material.downloadCount} downloads</span>
                          <span>Uploaded by: {material.uploadedBy?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handlePreview(material)} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          <Eye size={18} /> <span className="hidden sm:inline">Preview</span>
                        </button>
                        <button onClick={() => handleDownload(material)} className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                          <Download size={18} /> <span className="hidden sm:inline">Download</span>
                        </button>
                        {(user.role === 'admin' || user.role === 'faculty' || material.uploadedBy?._id === user?.id) && (
                          <button onClick={() => handleDelete(material._id)} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 size={18} /> <span className="hidden sm:inline">Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Materials;