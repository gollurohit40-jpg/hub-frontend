import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';

// Public Pages
import Login from './pages/Login';
import CreateStudentAccount from './pages/CreateStudentAccount'; // NEW component
import VerifyCode from './pages/VerifyCode';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Upload from './pages/Upload';
import Approvals from './pages/Approvals';
import AdminPanel from './pages/AdminPanel';
import DepartmentManager from './pages/DepartmentManager';
import Analytics from './pages/Analytics';
import Forum from './pages/Forum';
import Bookmarks from './pages/Bookmarks';
import StudentApprovals from './pages/StudentApprovals';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* ==========================================
              PUBLIC ROUTES (No authentication required)
          ========================================== */}
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Student Registration - NEW component with rollNumber, department, semester */}
          <Route path="/register" element={<CreateStudentAccount />} />
          
          {/* Email Verification Pages */}
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Forgot & Reset Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* ==========================================
              REDIRECTS
          ========================================== */}
          
          {/* Root redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* ==========================================
              PROTECTED ROUTES (Require authentication)
          ========================================== */}
          
          {/* Dashboard - All authenticated users */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Browse Materials - All authenticated users */}
          <Route 
            path="/materials" 
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            } 
          />
          
          {/* Upload Material - Admin, Faculty, CR only */}
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'faculty', 'cr']}>
                <Upload />
              </ProtectedRoute>
            } 
          />
          
          {/* Pending Approvals - Admin only */}
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Approvals />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Approvals - Admin only */}
          <Route 
            path="/student-approvals" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentApprovals />
              </ProtectedRoute>
            } 
          />
          
          {/* Analytics Dashboard - All authenticated users */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          {/* Discussion Forum - All authenticated users */}
          <Route 
            path="/forum" 
            element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            } 
          />
          
          {/* Bookmarks - All authenticated users */}
          <Route 
            path="/bookmarks" 
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            } 
          />
          
          {/* User Management - Admin only */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Department Management - Admin only */}
          <Route 
            path="/departments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DepartmentManager />
              </ProtectedRoute>
            } 
          />
          
          {/* ==========================================
              CATCH-ALL ROUTE
          ========================================== */}
          
          {/* Any unknown route redirects to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        
        {/* ==========================================
            GLOBAL COMPONENTS
        ========================================== */}
        
        {/* Chatbot - Only shows for authenticated users */}
        <ProtectedRoute>
          <Chatbot />
        </ProtectedRoute>
        
      </AuthProvider>
    </Router>
  );
}

export default App;