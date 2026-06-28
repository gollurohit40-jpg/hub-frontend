import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Mail, Lock, Eye, EyeOff, GraduationCap,
  Users, Briefcase, UserCheck, AlertCircle,
  UserCog, Shield, UserPlus, Clock, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [roleMismatch, setRoleMismatch] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Role configurations - ONLY Admin, Faculty, CR (NO Student)
  const roles = [
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      email: '',
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      hoverColor: 'hover:border-purple-500/60',
      textColor: 'text-purple-400',
      description: 'Full System Access',
      password: ''
    },
    {
      id: 'faculty',
      label: 'Faculty',
      icon: UserCog,
      email: '',
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      hoverColor: 'hover:border-blue-500/60',
      textColor: 'text-blue-400',
      description: 'Content Creator',
      password: ''
    },
    {
      id: 'cr',
      label: 'CR',
      icon: Users,
      email: '',
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      hoverColor: 'hover:border-green-500/60',
      textColor: 'text-green-400',
      description: 'Class Representative',
      password: ''
    }
    // Student role REMOVED
  ];

  // Animated Background Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    const animate = () => {
      time += 0.01;
      ctx.fillStyle = '#0a0e1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const orbs = [
        { x: 0.2, y: 0.2, color: 'rgba(37, 99, 235, 0.05)', size: 400 },
        { x: 0.8, y: 0.3, color: 'rgba(124, 58, 237, 0.05)', size: 350 },
        { x: 0.5, y: 0.8, color: 'rgba(236, 72, 153, 0.04)', size: 300 }
      ];

      for (const orb of orbs) {
        const gradient = ctx.createRadialGradient(
          orb.x * canvas.width, orb.y * canvas.height, 0,
          orb.x * canvas.width, orb.y * canvas.height, orb.size
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 200, 255, ${p.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setApprovalStatus(null);
    setApprovalMessage('');
    setRoleMismatch(false);
    setEmail('');
    setPassword('');
    setError('');
    setShowStudentLogin(false);
    setShowLoginForm(true);
    toast.success(`Selected: ${role.label}`, { icon: '👤' });
  };

  // Go back to role selection
  const goBackToRoles = () => {
    setSelectedRole(null);
    setShowLoginForm(false);
    setShowStudentLogin(false);
    setApprovalStatus(null);
    setApprovalMessage('');
    setRoleMismatch(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Handle Student Login (show student login form)
  const handleStudentLoginClick = () => {
    setSelectedRole(null);
    setShowLoginForm(false);
    setShowStudentLogin(true);
    setApprovalStatus(null);
    setApprovalMessage('');
    setRoleMismatch(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Handle Register Navigation
  const handleRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/register');
  };

  // Handle login submit with role validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setApprovalStatus(null);
    setApprovalMessage('');
    setRoleMismatch(false);

    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      // Send expected role to backend
      const result = await login(email, password, selectedRole?.id);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Check for role mismatch
        if (result.roleMismatch) {
          setRoleMismatch(true);
          setError(result.error || `This login panel is for ${selectedRole?.label} only.`);
          toast.error(result.error || `Please use the ${selectedRole?.label} login panel.`);
          return;
        }
        
        if (result.requiresApproval) {
          setApprovalStatus(result.approvalStatus || 'pending');
          setApprovalMessage(result.error || 'Your account is pending admin approval.');
          
          if (result.approvalStatus === 'pending') {
            toast.error('Account pending admin approval. You will be notified once approved.');
          } else if (result.approvalStatus === 'rejected') {
            toast.error('Your account has been rejected. Contact admin for more information.');
          }
          return;
        }
        
        if (result.requiresVerification ||
            (result.error && result.error.toLowerCase().includes('verify'))) {
          navigate(`/verify?email=${encodeURIComponent(email)}`);
          toast.error('Please verify your email first.');
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
          toast.error(result.error || 'Login failed');
        }
      }
    } catch (error) {
      if (error.response?.data?.roleMismatch) {
        setRoleMismatch(true);
        setError(error.response?.data?.message || `This login panel is for ${selectedRole?.label} only.`);
        toast.error(error.response?.data?.message || `Please use the ${selectedRole?.label} login panel.`);
        return;
      }
      
      if (error.response?.data?.requiresApproval) {
        const status = error.response?.data?.approvalStatus || 'pending';
        setApprovalStatus(status);
        setApprovalMessage(error.response?.data?.message || 'Your account is pending admin approval.');
        
        if (status === 'pending') {
          toast.error('Account pending admin approval. You will be notified once approved.');
        } else if (status === 'rejected') {
          toast.error('Your account has been rejected. Contact admin for more information.');
        }
        return;
      }
      
      if (error.response?.data?.requiresVerification) {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
        toast.error('Please verify your email first.');
      } else {
        console.error('Login error:', error);
        setError('An unexpected error occurred. Please try again.');
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole?.id);

  // Render approval status
  const renderApprovalStatus = () => {
    if (!approvalStatus) return null;

    if (approvalStatus === 'pending') {
      return (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-start gap-3">
          <Clock size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-200 font-medium">Account Pending Approval</p>
            <p className="text-yellow-200/70 text-sm mt-1">{approvalMessage}</p>
            <p className="text-yellow-200/50 text-xs mt-2">
              You will receive a notification once your account is approved.
            </p>
          </div>
        </div>
      );
    }

    if (approvalStatus === 'rejected') {
      return (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
          <XCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-200 font-medium">Account Rejected</p>
            <p className="text-red-200/70 text-sm mt-1">{approvalMessage}</p>
            <p className="text-red-200/50 text-xs mt-2">
              Please contact the administrator for more information.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0e1e]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Side - Welcome Section */}
            <div className="hidden lg:flex flex-col justify-center text-white p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                    <BookOpen className="h-10 w-10 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Academic Hub
                    </h1>
                    <p className="text-white/60 mt-1 text-sm tracking-wider">CENTRALIZED LEARNING PLATFORM</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
                    <GraduationCap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white/90">For Students</h3>
                    <p className="text-white/50 text-sm">Access study materials, notes, and previous papers</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
                    <Briefcase className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white/90">For Faculty</h3>
                    <p className="text-white/50 text-sm">Upload resources, manage content, track student progress</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white/90">For Institutions</h3>
                    <p className="text-white/50 text-sm">Department-wise organization, role-based access control</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
                    <UserCheck className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white/90">24/7 Access</h3>
                    <p className="text-white/50 text-sm">Learn anytime, anywhere with cloud-based platform</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-bold text-white/90">5000+</p>
                  <p className="text-white/40 text-xs">Study Materials</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-bold text-white/90">1000+</p>
                  <p className="text-white/40 text-xs">Happy Students</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-2xl font-bold text-white/90">50+</p>
                  <p className="text-white/40 text-xs">Expert Faculty</p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 lg:p-10 hover:border-blue-500/30 transition-all duration-500">

              {!showLoginForm && !showStudentLogin ? (
                // ============================================
                // ROLE SELECTION VIEW - ONLY 3 BUTTONS
                // ============================================
                <div>
                  <div className="text-center mb-8">
                    <div className="lg:hidden flex justify-center mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
                    <p className="text-white/50 mt-2 text-sm">Select your role to continue</p>
                  </div>

                  {/* Role Cards - ONLY 3 BUTTONS (Admin, Faculty, CR) */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 group
                          ${role.bgColor} ${role.borderColor} ${role.hoverColor}
                          hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-3 rounded-full bg-white/10 backdrop-blur-sm mb-3
                            group-hover:scale-110 transition-transform duration-300`}>
                            <role.icon className={`h-8 w-8 ${role.textColor}`} />
                          </div>
                          <span className={`text-sm font-bold ${role.textColor}`}>{role.label}</span>
                          <span className="text-[10px] text-white/40 mt-1">{role.description}</span>
                          <div className={`mt-2 w-full h-0.5 rounded-full bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* ============================================
                      STUDENT LOGIN & REGISTER LINKS
                  ============================================ */}
                  <div className="mt-4 text-center space-y-3">
                    <p className="text-sm text-white/50">
                      <span className="text-white/30">Are you a student?</span>
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleStudentLoginClick}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline text-sm"
                      >
                        Student Login
                      </button>
                      <span className="text-white/30">|</span>
                      <Link
                        to="/register"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline text-sm"
                      >
                        Create Account
                      </Link>
                    </div>
                    <p className="text-xs text-white/30">
                      Faculty/Staff? Contact administrator for account creation.
                    </p>
                  </div>
                </div>
              ) : showStudentLogin ? (
                // ============================================
                // STUDENT LOGIN FORM - SEPARATE
                // ============================================
                <div>
                  <button
                    onClick={goBackToRoles}
                    className="mb-4 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
                  >
                    <span>&larr;</span> Back to roles
                  </button>

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-500/20 mb-3">
                      <GraduationCap className="h-7 w-7 text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Student Login</h2>
                    <p className="text-white/40 text-sm mt-1">Enter your student email and password</p>
                    <p className="text-xs text-white/20 mt-1">
                      <span className="font-medium text-white/40">Note:</span> This login is for students only.
                    </p>
                  </div>

                  {renderApprovalStatus()}
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-2">
                      <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="studentEmail" className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'studentEmail' ? 'scale-[1.02]' : ''}`}>
                        <div className={`absolute inset-0 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 ${focusedField === 'studentEmail' ? 'opacity-100' : 'opacity-0'}`} />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Mail className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'studentEmail' ? 'text-blue-400' : 'text-white/30'}`} />
                        </div>
                        <input
                          id="studentEmail"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('studentEmail')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-white/30 relative z-10"
                          placeholder="your.student@email.com"
                          autoComplete="off"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="studentPassword" className="block text-sm font-medium text-white/70 mb-2">Password</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'studentPassword' ? 'scale-[1.02]' : ''}`}>
                        <div className={`absolute inset-0 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 ${focusedField === 'studentPassword' ? 'opacity-100' : 'opacity-0'}`} />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Lock className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'studentPassword' ? 'text-blue-400' : 'text-white/30'}`} />
                        </div>
                        <input
                          id="studentPassword"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('studentPassword')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-white/30 relative z-10"
                          placeholder="Enter your password"
                          autoComplete="new-password"
                          required
                          aria-required="true"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5 text-white/30 hover:text-white/60 transition-colors" /> : <Eye className="h-5 w-5 text-white/30 hover:text-white/60 transition-colors" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer group">
                        <input type="checkbox" id="remember" name="remember" className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0" />
                        <span className="ml-2 text-sm text-white/50 group-hover:text-white/70 transition-colors">Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Signing in...
                        </div>
                      ) : (
                        'Sign In as Student'
                      )}
                    </button>
                  </form>

                  {/* ============================================
                      CREATE ACCOUNT LINK - PLACED HERE
                  ============================================ */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-white/30">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                        Create Account
                      </Link>
                    </p>
                  </div>
                  {/* ============================================ */}
                </div>
              ) : (
                // ============================================
                // LOGIN FORM FOR ADMIN/FACULTY/CR
                // ============================================
                <div>
                  <button
                    onClick={goBackToRoles}
                    className="mb-4 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
                  >
                    <span>&larr;</span> Back to roles
                  </button>

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r ${selectedRoleData?.color} mb-3 shadow-lg`}>
                      {selectedRoleData && <selectedRoleData.icon className="h-7 w-7 text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Welcome{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {selectedRoleData?.label}
                      </span>!
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Enter your credentials to continue</p>
                    <p className="text-xs text-white/20 mt-1">
                      <span className="font-medium text-white/40">Note:</span> This login panel is for <span className="text-white/40">{selectedRoleData?.label}</span> only.
                    </p>
                  </div>

                  {renderApprovalStatus()}
                  
                  {roleMismatch && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <XCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-200 font-medium">Role Mismatch</p>
                        <p className="text-red-200/70 text-sm mt-1">{error}</p>
                        <p className="text-red-200/50 text-xs mt-2">
                          Please use the correct login panel for your role.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && !roleMismatch && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-2">
                      <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                        <div className={`absolute inset-0 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`} />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Mail className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-400' : 'text-white/30'}`} />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-white/30 relative z-10"
                          placeholder={`Enter your ${selectedRoleData?.label} email`}
                          autoComplete="off"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                      <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                        <div className={`absolute inset-0 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`} />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Lock className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-400' : 'text-white/30'}`} />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 text-white placeholder-white/30 relative z-10"
                          placeholder="Enter your password"
                          autoComplete="new-password"
                          required
                          aria-required="true"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5 text-white/30 hover:text-white/60 transition-colors" /> : <Eye className="h-5 w-5 text-white/30 hover:text-white/60 transition-colors" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer group">
                        <input type="checkbox" id="remember" name="remember" className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0" />
                        <span className="ml-2 text-sm text-white/50 group-hover:text-white/70 transition-colors">Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-gradient-to-r ${selectedRoleData?.color || 'from-blue-600 to-purple-600'} text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Signing in as {selectedRoleData?.label}...
                        </div>
                      ) : (
                        `Sign In as ${selectedRoleData?.label}`
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-xs text-white/30">
                      New student?{' '}
                      <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-white/20 text-xs mt-8">
            <p>&copy; 2024 Academic Hub. All rights reserved. | Secure Learning Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;