import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PremiumBackground from '../components/PremiumBackground';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast.success('Email verified!');
        
        setTimeout(() => {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Invalid or expired verification link');
      toast.error('Verification failed');
    }
  };

  const resendVerification = async () => {
    try {
      toast.info('Please go to the login page and click "Resend Verification"');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to resend verification');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PremiumBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-4">
                    <Loader size={40} className="text-blue-400 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verifying Your Email</h2>
                  <p className="text-white/60 mt-2">Please wait while we verify your account...</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle size={40} className="text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Email Verified! 🎉</h2>
                  <p className="text-white/60 mt-2">{message}</p>
                  <p className="text-white/40 text-sm mt-4">
                    Redirecting to dashboard in a few seconds...
                  </p>
                  <Link to="/login" className="mt-6 inline-block text-blue-400 hover:text-blue-300 transition-colors">
                    Go to Login <ArrowRight size={16} className="inline ml-1" />
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
                    <XCircle size={40} className="text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                  <p className="text-white/60 mt-2">{message}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Go to Login
                    </Link>
                    <button
                      onClick={resendVerification}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      Request new verification link
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;