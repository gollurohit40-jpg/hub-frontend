import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle, Trash2, Eye, Info, Layers, BookOpen, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [userMaterials, setUserMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [currentUnitForBook, setCurrentUnitForBook] = useState(null);
  const [bookDetails, setBookDetails] = useState({
    bookTitle: '',
    author: '',
    edition: '',
    publisher: '',
    year: '',
    isbn: '',
    bookFile: null,
    bookLink: ''
  });
  const [showAllUnitsModal, setShowAllUnitsModal] = useState(false);
  const [allUnitsData, setAllUnitsData] = useState([]);
  const [uploadingAll, setUploadingAll] = useState(false);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [unitBooks, setUnitBooks] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchUserMaterials();
  }, []);

  useEffect(() => {
    if (selectedDept && selectedSemester) {
      const dept = departments.find(d => d._id === selectedDept);
      const semester = dept?.semesters?.find(s => s.semesterNumber === parseInt(selectedSemester));
      setSubjects(semester?.subjects || []);
      setSelectedSubject('');
      setSelectedUnit('');
      setUnits([]);
      setExistingMaterials([]);
      setDuplicateWarning(null);
    }
  }, [selectedDept, selectedSemester, departments]);

  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.name === selectedSubject);
      setUnits(subject?.units || []);
      setSelectedUnit('');
      setExistingMaterials([]);
      setDuplicateWarning(null);
    }
  }, [selectedSubject, subjects]);

  useEffect(() => {
    if (selectedDept && selectedSemester && selectedSubject && selectedUnit) {
      checkExistingMaterials();
    } else {
      setExistingMaterials([]);
      setDuplicateWarning(null);
    }
  }, [selectedDept, selectedSemester, selectedSubject, selectedUnit]);

  useEffect(() => {
    if (title && existingMaterials.length > 0) {
      const duplicate = existingMaterials.find(m => m.title.toLowerCase() === title.toLowerCase());
      if (duplicate) {
        setDuplicateWarning({
          message: `A material with title "${duplicate.title}" already exists for this subject and unit.`,
          existing: duplicate
        });
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [title, existingMaterials]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchUserMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await axios.get('/api/materials');
      const userSpecificMaterials = response.data.materials.filter(material => material.uploadedBy?._id === user?.id);
      setUserMaterials(userSpecificMaterials);
    } catch (error) {
      console.error('Failed to fetch user materials:', error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const checkExistingMaterials = async () => {
    setCheckingExisting(true);
    try {
      const response = await axios.get('/api/materials', {
        params: { department: selectedDept, semester: selectedSemester, subject: selectedSubject, unit: selectedUnit }
      });
      setExistingMaterials(response.data.materials);
    } catch (error) {
      console.error('Failed to check existing materials:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await axios.delete(`/api/materials/${materialId}`);
      toast.success('Material deleted successfully');
      fetchUserMaterials();
      if (selectedSubject && selectedUnit) checkExistingMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handlePreview = (material) => {
    window.open(material.fileUrl, '_blank');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const maxSize = 10 * 1024 * 1024;
      if (droppedFile.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
    }
  };

  const openBookModal = (unitNumber, unitTitle) => {
    setCurrentUnitForBook({ number: unitNumber, title: unitTitle });
    const existingBook = unitBooks[`${selectedSubject}-${unitNumber}`];
    if (existingBook) {
      setBookDetails(existingBook);
    } else {
      setBookDetails({ bookTitle: '', author: '', edition: '', publisher: '', year: '', isbn: '', bookFile: null, bookLink: '' });
    }
    setShowBookModal(true);
  };

  const saveBookDetails = () => {
    if (!bookDetails.bookTitle && !bookDetails.bookLink && !bookDetails.bookFile) {
      toast.error('Please add at least book title, link, or file');
      return;
    }
    const bookKey = `${selectedSubject}-${currentUnitForBook.number}`;
    setUnitBooks(prev => ({ ...prev, [bookKey]: { ...bookDetails, unitNumber: currentUnitForBook.number, unitTitle: currentUnitForBook.title } }));
    toast.success(`Book reference saved for Unit ${currentUnitForBook.number}`);
    setShowBookModal(false);
  };

  const removeBookReference = (unitNumber) => {
    const bookKey = `${selectedSubject}-${unitNumber}`;
    const newBooks = { ...unitBooks };
    delete newBooks[bookKey];
    setUnitBooks(newBooks);
    toast.success(`Book reference removed for Unit ${unitNumber}`);
  };

  const handleBookFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = 20 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast.error('Book file size must be less than 20MB');
        return;
      }
      setBookDetails(prev => ({ ...prev, bookFile: selectedFile }));
    }
  };

  const openAllUnitsModal = () => {
    if (!selectedDept || !selectedSemester || !selectedSubject) {
      toast.error('Please select Department, Semester, and Subject first');
      return;
    }
    const unitsList = units.map(unit => ({
      unitNumber: unit.unitNumber,
      title: unit.title || `Unit ${unit.unitNumber}`,
      file: null,
      titleName: '',
      description: '',
      hasBook: !!unitBooks[`${selectedSubject}-${unit.unitNumber}`]
    }));
    setAllUnitsData(unitsList);
    setShowAllUnitsModal(true);
  };

  const updateUnitFile = (index, file) => {
    const updated = [...allUnitsData];
    updated[index].file = file;
    setAllUnitsData(updated);
  };

  const updateUnitTitle = (index, title) => {
    const updated = [...allUnitsData];
    updated[index].titleName = title;
    setAllUnitsData(updated);
  };

  const updateUnitDescription = (index, description) => {
    const updated = [...allUnitsData];
    updated[index].description = description;
    setAllUnitsData(updated);
  };

  const uploadAllUnits = async () => {
    const selectedSubjectObj = subjects.find(s => s.name === selectedSubject);
    const missingFiles = allUnitsData.filter(unit => !unit.file);
    if (missingFiles.length > 0) {
      toast.error(`Please upload files for ${missingFiles.length} unit(s)`);
      return;
    }
    setUploadingAll(true);
    let successCount = 0;
    let failCount = 0;
    for (const unit of allUnitsData) {
      const formData = new FormData();
      formData.append('title', unit.titleName || `${selectedSubject} - Unit ${unit.unitNumber}`);
      formData.append('description', unit.description || `Study material for ${selectedSubject} - Unit ${unit.unitNumber}`);
      formData.append('department', selectedDept);
      formData.append('semester', selectedSemester);
      formData.append('subject', selectedSubject);
      formData.append('subjectCode', selectedSubjectObj?.code || '');
      formData.append('unit', unit.unitNumber);
      formData.append('file', unit.file);
      const bookRef = unitBooks[`${selectedSubject}-${unit.unitNumber}`];
      if (bookRef) {
        formData.append('bookTitle', bookRef.bookTitle);
        formData.append('bookAuthor', bookRef.author);
        formData.append('bookEdition', bookRef.edition);
        formData.append('bookLink', bookRef.bookLink);
      }
      try {
        await axios.post('/api/materials/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to upload unit ${unit.unitNumber}:`, error);
      }
    }
    if (successCount > 0) toast.success(`Successfully uploaded ${successCount} unit(s). Awaiting admin approval.`);
    if (failCount > 0) toast.error(`Failed to upload ${failCount} unit(s)`);
    setShowAllUnitsModal(false);
    fetchUserMaterials();
    navigate('/materials');
    setUploadingAll(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedDept || !selectedSemester || !selectedSubject || !selectedUnit || !file) {
      toast.error('Please fill all required fields');
      return;
    }
    if (duplicateWarning && !confirm(`${duplicateWarning.message}\n\nDo you still want to upload this material?`)) return;
    
    const selectedSubjectObj = subjects.find(s => s.name === selectedSubject);
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('department', selectedDept);
    formData.append('semester', selectedSemester);
    formData.append('subject', selectedSubject);
    formData.append('subjectCode', selectedSubjectObj?.code || '');
    formData.append('unit', selectedUnit);
    formData.append('file', file);
    
    const bookRef = unitBooks[`${selectedSubject}-${selectedUnit}`];
    if (bookRef) {
      formData.append('bookTitle', bookRef.bookTitle);
      formData.append('bookAuthor', bookRef.author);
      formData.append('bookEdition', bookRef.edition);
      formData.append('bookPublisher', bookRef.publisher);
      formData.append('bookYear', bookRef.year);
      formData.append('bookISBN', bookRef.isbn);
      formData.append('bookLink', bookRef.bookLink);
      if (bookRef.bookFile) formData.append('bookFile', bookRef.bookFile);
    }
    
    try {
      const response = await axios.post('/api/materials/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Material uploaded successfully! Awaiting admin approval.', { duration: 5000, icon: '📢' });
      setTitle(''); setDescription(''); setSelectedDept(''); setSelectedSemester(''); setSelectedSubject(''); setSelectedUnit(''); setFile(null);
      fetchUserMaterials(); setExistingMaterials([]); setDuplicateWarning(null);
      navigate('/materials');
    } catch (error) {
      if (error.response?.status === 409) toast.error('A material with this title already exists for this subject and unit!');
      else toast.error(error.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const selectedDepartment = departments.find(d => d._id === selectedDept);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <UploadIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upload Material</h1>
                <p className="text-white/80 text-sm">Share academic resources with your department</p>
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
          {/* Admin Approval Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Bell size={20} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Admin Approval Required</p>
              <p className="text-xs mt-1">All uploaded materials require admin approval before they become visible to students.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upload New Material</h2>
                {selectedSubject && units.length > 0 && (
                  <button onClick={openAllUnitsModal} className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors">
                    <Layers size={16} /> Add All Units
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g., Database Management Systems Notes" required />
                  {duplicateWarning && (
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {duplicateWarning.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows="3" placeholder="Brief description of the material..." />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSemester(''); setSelectedSubject(''); setSelectedUnit(''); }} className="input-field" required>
                      <option value="">Select Department</option>
                      {departments.map(dept => (<option key={dept._id} value={dept._id}>{dept.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                    <select value={selectedSemester} onChange={(e) => { setSelectedSemester(e.target.value); setSelectedSubject(''); setSelectedUnit(''); }} className="input-field" disabled={!selectedDept} required>
                      <option value="">Select Semester</option>
                      {selectedDepartment?.semesters?.map(sem => (<option key={sem.semesterNumber} value={sem.semesterNumber}>Semester {sem.semesterNumber}</option>))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-field" disabled={!selectedSemester} required>
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (<option key={subject.name} value={subject.name}>{subject.name} ({subject.code})</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <div className="flex gap-2">
                      <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="input-field flex-1" disabled={!selectedSubject} required>
                        <option value="">Select Unit</option>
                        {units.map(unit => (<option key={unit.unitNumber} value={unit.unitNumber}>{unit.title || `Unit ${unit.unitNumber}`}</option>))}
                      </select>
                      {selectedSubject && selectedUnit && (
                        <button type="button" onClick={() => openBookModal(parseInt(selectedUnit), units.find(u => u.unitNumber === parseInt(selectedUnit))?.title || `Unit ${selectedUnit}`)} className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${unitBooks[`${selectedSubject}-${selectedUnit}`] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          <BookOpen size={18} /> {unitBooks[`${selectedSubject}-${selectedUnit}`] ? 'Book Added' : 'Add Book'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedSubject && selectedUnit && unitBooks[`${selectedSubject}-${selectedUnit}`] && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <BookOpen size={16} className="text-green-600 mt-0.5" />
                        <div className="text-sm text-green-700">
                          <p className="font-medium">Book Reference Added:</p>
                          <p className="text-xs">{unitBooks[`${selectedSubject}-${selectedUnit}`].bookTitle}</p>
                          {unitBooks[`${selectedSubject}-${selectedUnit}`].author && (<p className="text-xs">Author: {unitBooks[`${selectedSubject}-${selectedUnit}`].author}</p>)}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeBookReference(parseInt(selectedUnit))} className="text-red-600 hover:text-red-700"><X size={16} /></button>
                    </div>
                  </div>
                )}

                {selectedSubject && selectedUnit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Existing Materials:</p>
                        {checkingExisting ? <p className="text-xs">Checking...</p> : existingMaterials.length === 0 ? <p className="text-xs">No materials found.</p> : (
                          <ul className="text-xs mt-1 space-y-1">
                            {existingMaterials.map(m => (<li key={m._id} className="flex items-center justify-between"><span>📄 {m.title}</span><span className={`px-1 rounded ${m.status === 'approved' ? 'bg-green-100 text-green-700' : m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span></li>))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                  <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                    {file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <File size={32} className="text-primary-500" />
                          <div className="text-left"><p className="font-medium text-gray-800">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                        </div>
                        <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
                      </div>
                    ) : (
                      <>
                        <UploadIcon size={40} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">Drag & drop your file here or</p>
                        <label className="mt-2 inline-block">
                          <span className="btn-primary inline-block cursor-pointer">Browse Files</span>
                          <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" />
                        </label>
                        <p className="text-xs text-gray-500 mt-3">PDF, DOC, PPT, JPG, PNG (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
                
                {user.role === 'cr' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700"><p className="font-medium">Pending Approval</p><p>Your upload requires approval from admin.</p></div>
                  </div>
                )}
                
                {user.role === 'faculty' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700"><p className="font-medium">Pending Admin Approval</p><p>Your upload requires approval from admin.</p></div>
                  </div>
                )}
                
                <button type="submit" disabled={uploading} className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Uploading...</>) : (<><UploadIcon size={18} /> Upload Material (Requires Admin Approval)</>)}
                </button>
              </form>
            </div>

            {/* User's Uploaded Materials */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Uploaded Materials</h2>
              {loadingMaterials ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : userMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><File size={40} className="mx-auto mb-2 text-gray-300" /><p>No materials uploaded yet</p></div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {userMaterials.map((material) => (
                    <div key={material._id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">{material.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{material.department?.name} • Sem {material.semester} • {material.subject} • Unit {material.unit}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${material.status === 'approved' ? 'bg-green-100 text-green-700' : material.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {material.status === 'approved' ? 'Approved' : material.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(material.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handlePreview(material)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Preview"><Eye size={16} /></button>
                          <button onClick={() => handleDeleteMaterial(material._id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="text-lg font-semibold text-gray-800">Add Book Reference</h3><p className="text-sm text-gray-500">{selectedSubject} - {currentUnitForBook?.title}</p></div>
              <button onClick={() => setShowBookModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Book Title *</label><input type="text" value={bookDetails.bookTitle} onChange={(e) => setBookDetails(prev => ({ ...prev, bookTitle: e.target.value }))} className="input-field" placeholder="Enter book title" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Author(s)</label><input type="text" value={bookDetails.author} onChange={(e) => setBookDetails(prev => ({ ...prev, author: e.target.value }))} className="input-field" placeholder="Enter author name(s)" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Edition</label><input type="text" value={bookDetails.edition} onChange={(e) => setBookDetails(prev => ({ ...prev, edition: e.target.value }))} className="input-field" placeholder="e.g., 2nd Edition" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><input type="text" value={bookDetails.year} onChange={(e) => setBookDetails(prev => ({ ...prev, year: e.target.value }))} className="input-field" placeholder="2024" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label><input type="text" value={bookDetails.publisher} onChange={(e) => setBookDetails(prev => ({ ...prev, publisher: e.target.value }))} className="input-field" placeholder="Publisher name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label><input type="text" value={bookDetails.isbn} onChange={(e) => setBookDetails(prev => ({ ...prev, isbn: e.target.value }))} className="input-field" placeholder="ISBN number" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Book Link (URL)</label><input type="url" value={bookDetails.bookLink} onChange={(e) => setBookDetails(prev => ({ ...prev, bookLink: e.target.value }))} className="input-field" placeholder="https://..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Upload Book File (PDF)</label><input type="file" accept=".pdf" onChange={handleBookFileChange} className="text-sm w-full" />{bookDetails.bookFile && <p className="text-xs text-green-600 mt-1">✓ {bookDetails.bookFile.name} ({(bookDetails.bookFile.size / 1024 / 1024).toFixed(2)} MB)</p>}</div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button onClick={saveBookDetails} className="flex-1 btn-primary py-2">Save Book Reference</button>
              <button onClick={() => setShowBookModal(false)} className="flex-1 btn-secondary py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* All Units Modal */}
      {showAllUnitsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="text-lg font-semibold text-gray-800">Upload All Units</h3><p className="text-sm text-gray-500">{selectedDepartment?.name} • Semester {selectedSemester} • {selectedSubject}</p></div>
              <button onClick={() => setShowAllUnitsModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {allUnitsData.map((unit, index) => (
                <div key={unit.unitNumber} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3"><h4 className="font-medium text-gray-800">Unit {unit.unitNumber}: {unit.title}</h4>{unit.hasBook && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><BookOpen size={12} /> Book Added</span>}</div>
                  <div className="grid grid-cols-1 gap-3">
                    <input type="text" placeholder="Material Title (optional)" value={unit.titleName} onChange={(e) => updateUnitTitle(index, e.target.value)} className="input-field text-sm" />
                    <textarea placeholder="Description (optional)" value={unit.description} onChange={(e) => updateUnitDescription(index, e.target.value)} className="input-field text-sm" rows="2" />
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Upload File for Unit {unit.unitNumber} *</label><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" onChange={(e) => updateUnitFile(index, e.target.files[0])} className="text-sm w-full" />{unit.file && <p className="text-xs text-green-600 mt-1">✓ {unit.file.name} ({(unit.file.size / 1024 / 1024).toFixed(2)} MB)</p>}</div>
                    <button type="button" onClick={() => openBookModal(unit.unitNumber, unit.title)} className="text-sm text-purple-600 border border-dashed border-purple-300 rounded-lg py-1.5 hover:bg-purple-50 flex items-center justify-center gap-1"><BookOpen size={14} />{unit.hasBook ? 'Edit Book Reference' : 'Add Book Reference'}</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button onClick={uploadAllUnits} disabled={uploadingAll} className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                {uploadingAll ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</>) : (<><Layers size={16} /> Upload All {allUnitsData.length} Units</>)}
              </button>
              <button onClick={() => setShowAllUnitsModal(false)} className="flex-1 btn-secondary py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;