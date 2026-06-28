import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Plus, Edit2, Trash2, BookOpen, Layers, FolderTree, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DepartmentManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semesters: []
  });

  const mcaSemesters = [
    { number: 1, subjects: 6, hasProject: false },
    { number: 2, subjects: 6, hasProject: false },
    { number: 3, subjects: 6, hasProject: false },
    { number: 4, subjects: 3, hasProject: true, projectTitle: 'Major Project' }
  ];

  const subjectNames = {
    1: ['Programming Fundamentals', 'Digital Logic & Design', 'Discrete Mathematics', 'Communication Skills', 'Web Technologies', 'Database Management Systems'],
    2: ['Data Structures', 'Object Oriented Programming', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Python Programming'],
    3: ['Algorithm Design', 'Web Development', 'Cloud Computing', 'Mobile App Development', 'Machine Learning', 'Cyber Security'],
    4: ['Big Data Analytics', 'Project Management', 'DevOps']
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await axios.put(`/api/departments/${editingDept._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await axios.post('/api/departments', formData);
        toast.success('Department created successfully');
      }
      setShowAddModal(false);
      setEditingDept(null);
      setFormData({ name: '', code: '', semesters: [] });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (deptId) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`/api/departments/${deptId}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  const addSemester = () => {
    const newSemesterNumber = formData.semesters.length + 1;
    setFormData({ ...formData, semesters: [...formData.semesters, { semesterNumber: newSemesterNumber, subjects: [], hasProject: false, projectTitle: '' }] });
  };

  const removeSemester = (semesterNumber) => {
    if (!confirm('Are you sure you want to remove this semester?')) return;
    const updatedSemesters = formData.semesters.filter(s => s.semesterNumber !== semesterNumber);
    const renumberedSemesters = updatedSemesters.map((sem, idx) => ({ ...sem, semesterNumber: idx + 1 }));
    setFormData({ ...formData, semesters: renumberedSemesters });
    toast.success('Semester removed');
  };

  const addSubjectToSemester = (semesterNum, subjectName) => {
    const semesterIndex = formData.semesters.findIndex(s => s.semesterNumber === semesterNum);
    if (semesterIndex !== -1) {
      const units = [];
      for (let u = 1; u <= 5; u++) units.push({ unitNumber: u, title: `Unit ${u}` });
      const updatedSemesters = [...formData.semesters];
      updatedSemesters[semesterIndex].subjects.push({
        name: subjectName,
        code: `${semesterNum}${String(updatedSemesters[semesterIndex].subjects.length + 1).padStart(2, '0')}`,
        units: units
      });
      setFormData({ ...formData, semesters: updatedSemesters });
      toast.success('Subject added');
    }
  };

  const editSubject = (semesterNumber, subjectIndex, newName) => {
    const semesterIndex = formData.semesters.findIndex(s => s.semesterNumber === semesterNumber);
    if (semesterIndex !== -1) {
      const updatedSemesters = [...formData.semesters];
      updatedSemesters[semesterIndex].subjects[subjectIndex].name = newName;
      setFormData({ ...formData, semesters: updatedSemesters });
    }
  };

  const deleteSubject = (semesterNumber, subjectIndex) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    const semesterIndex = formData.semesters.findIndex(s => s.semesterNumber === semesterNumber);
    if (semesterIndex !== -1) {
      const updatedSemesters = [...formData.semesters];
      updatedSemesters[semesterIndex].subjects.splice(subjectIndex, 1);
      setFormData({ ...formData, semesters: updatedSemesters });
      toast.success('Subject deleted');
    }
  };

  const addUnitToSubject = (semesterNumber, subjectIndex) => {
    const semesterIndex = formData.semesters.findIndex(s => s.semesterNumber === semesterNumber);
    if (semesterIndex !== -1) {
      const updatedSemesters = [...formData.semesters];
      const currentUnits = updatedSemesters[semesterIndex].subjects[subjectIndex].units.length;
      if (currentUnits < 5) {
        updatedSemesters[semesterIndex].subjects[subjectIndex].units.push({ unitNumber: currentUnits + 1, title: `Unit ${currentUnits + 1}` });
        setFormData({ ...formData, semesters: updatedSemesters });
        toast.success('Unit added');
      } else {
        toast.error('Maximum 5 units per subject');
      }
    }
  };

  const deleteUnit = (semesterNumber, subjectIndex, unitIndex) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    const semesterIndex = formData.semesters.findIndex(s => s.semesterNumber === semesterNumber);
    if (semesterIndex !== -1) {
      const updatedSemesters = [...formData.semesters];
      updatedSemesters[semesterIndex].subjects[subjectIndex].units.splice(unitIndex, 1);
      updatedSemesters[semesterIndex].subjects[subjectIndex].units.forEach((unit, idx) => { unit.unitNumber = idx + 1; });
      setFormData({ ...formData, semesters: updatedSemesters });
      toast.success('Unit deleted');
    }
  };

  const updateUnitTitle = (semesterNumber, subjectIndex, unitIndex, newTitle) => {
    const semesterIndex = formData.semesters.findIndex(s => s.semesterNumber === semesterNumber);
    if (semesterIndex !== -1) {
      const updatedSemesters = [...formData.semesters];
      updatedSemesters[semesterIndex].subjects[subjectIndex].units[unitIndex].title = newTitle;
      setFormData({ ...formData, semesters: updatedSemesters });
    }
  };

  const initializeMCADepartment = () => {
    const semesters = mcaSemesters.map(sem => {
      const subjects = [];
      const subjectList = subjectNames[sem.number] || [];
      for (let i = 0; i < sem.subjects; i++) {
        const units = [];
        for (let u = 1; u <= 5; u++) units.push({ unitNumber: u, title: `Unit ${u}: ${getDefaultUnitTitle(sem.number, i, u)}` });
        subjects.push({ name: subjectList[i] || `Subject ${i + 1}`, code: `${sem.number}${String(i + 1).padStart(2, '0')}`, units: units });
      }
      return { semesterNumber: sem.number, subjects: subjects, hasProject: sem.hasProject, projectTitle: sem.hasProject ? 'Major Project' : '' };
    });
    setFormData({ name: 'MCA', code: 'MCA', semesters: semesters });
    toast.success('MCA structure loaded!');
  };

  const getDefaultUnitTitle = (semester, subjectIndex, unitNumber) => {
    const unitTopics = { 1: ['Introduction', 'Basic Concepts', 'Advanced Topics', 'Applications', 'Case Studies'], 2: ['Foundations', 'Core Concepts', 'Implementation', 'Best Practices', 'Review'], 3: ['Overview', 'Deep Dive', 'Practical Applications', 'Current Trends', 'Future Directions'] };
    const topics = unitTopics[semester] || unitTopics[1];
    return topics[unitNumber - 1] || `Topic ${unitNumber}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const departmentNames = ['MCA', 'MBA', 'Chemistry', 'English', 'Journalism', 'MA Economics'];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar onLogout={handleLogout} />
      
      <main className="flex-1 min-h-screen">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Department Management</h1>
                <p className="text-white/80 text-sm">Configure academic departments, subjects, and units</p>
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
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <button onClick={initializeMCADepartment} className="btn-secondary flex items-center gap-2"><FolderTree size={18} /> Quick Setup MCA</button>
              <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Department</button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {departments.map((dept) => (
                <div key={dept._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center"><Building2 size={24} className="text-primary-600" /></div>
                      <div><h3 className="font-bold text-gray-800">{dept.name}</h3><p className="text-sm text-gray-500">Code: {dept.code}</p></div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingDept(dept); setFormData({ name: dept.name, code: dept.code, semesters: dept.semesters || [] }); setShowAddModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(dept._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><BookOpen size={16} /><span>{dept.semesters?.length || 0} Semesters</span></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Layers size={16} /><span>Total Subjects: {dept.semesters?.reduce((sum, sem) => sum + (sem.subjects?.length || 0), 0) || 0}</span></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><FileText size={16} /><span>Total Units: {dept.semesters?.reduce((sum, sem) => sum + (sem.subjects?.reduce((sSum, sub) => sSum + (sub.units?.length || 0), 0) || 0), 0) || 0}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">View Structure ({dept.semesters?.length} Semesters)</summary>
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {dept.semesters?.map(sem => (<div key={sem.semesterNumber} className="pl-2"><span className="font-medium">Semester {sem.semesterNumber}:</span><span className="text-gray-500 ml-1">{sem.subjects?.length} subjects{sem.hasProject && ` + ${sem.projectTitle}`}</span></div>))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editingDept ? 'Edit Department' : 'Add New Department'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditingDept(null); setFormData({ name: '', code: '', semesters: [] }); }} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            {formData.name === 'MCA' && <div className="mb-4 p-3 bg-blue-50 rounded-lg"><p className="text-sm text-blue-700">ℹ️ MCA Structure: Sem1-3: 6 subjects each (5 units/subject) | Sem4: 3 subjects + Major Project</p></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <select value={formData.name} onChange={(e) => { const name = e.target.value; setFormData({ ...formData, name: name }); if (name === 'MCA') initializeMCADepartment(); }} className="input-field" required>
                  <option value="">Select Department</option>{departmentNames.map(name => (<option key={name} value={name}>{name}</option>))}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="input-field" placeholder="e.g., MCA, MBA, CHEM" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2"><label className="block text-sm font-medium text-gray-700">Semesters & Subjects</label><button type="button" onClick={addSemester} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"><Plus size={14} /> Add Semester</button></div>
                <div className="space-y-4">
                  {formData.semesters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">No semesters added yet. Click "Add Semester" to get started.</div>
                  ) : (
                    formData.semesters.map((semester, semIdx) => (
                      <div key={semester.semesterNumber} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-gray-800">Semester {semester.semesterNumber}</h3><button type="button" onClick={() => removeSemester(semester.semesterNumber)} className="text-red-600 hover:text-red-700 text-sm">Remove Semester</button></div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center"><label className="text-sm font-medium text-gray-600">Subjects</label><button type="button" onClick={() => { const newSubjectName = prompt('Enter subject name:'); if (newSubjectName && newSubjectName.trim()) addSubjectToSemester(semester.semesterNumber, newSubjectName.trim()); }} className="text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 flex items-center gap-1"><Plus size={14} /> Add Subject</button></div>
                          {semester.subjects?.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm border-2 border-dashed rounded-lg">No subjects added yet. Click "Add Subject".</div>
                          ) : (
                            semester.subjects?.map((subject, subIdx) => (
                              <div key={subIdx} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <input type="text" value={subject.name} onChange={(e) => editSubject(semester.semesterNumber, subIdx, e.target.value)} className="font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none px-1" placeholder="Subject Name" />
                                    <span className="text-xs text-gray-400">({subject.code})</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button type="button" onClick={() => addUnitToSubject(semester.semesterNumber, subIdx)} className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded flex items-center gap-1" title="Add Unit"><Plus size={14} /> Unit</button>
                                    <button type="button" onClick={() => deleteSubject(semester.semesterNumber, subIdx)} className="text-red-600 hover:text-red-700 p-1 rounded" title="Delete Subject"><Trash2 size={14} /></button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                  {subject.units?.map((unit, unitIdx) => (
                                    <div key={unit.unitNumber} className="relative">
                                      <input type="text" value={unit.title} onChange={(e) => updateUnitTitle(semester.semesterNumber, subIdx, unitIdx, e.target.value)} className="text-xs input-field py-1 px-2 pr-6 w-full" placeholder={`Unit ${unit.unitNumber}`} />
                                      <button type="button" onClick={() => deleteUnit(semester.semesterNumber, subIdx, unitIdx)} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700" title="Delete Unit"><X size={12} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {semester.hasProject && <div className="mt-3 p-2 bg-green-50 rounded-lg"><label className="text-sm text-green-700">Project: {semester.projectTitle}</label></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">{editingDept ? 'Update Department' : 'Create Department'}</button>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingDept(null); setFormData({ name: '', code: '', semesters: [] }); }} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;