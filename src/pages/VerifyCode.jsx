import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get('email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    setStatus('idle');
    try {
      const response = await axios.post('/api/auth/verify-code', { email, code });
      if (response.data.success) {
        setStatus('success');
        setMessage('Email verified successfully! Waiting for admin approval.');
        toast.success('Email verified! Waiting for admin approval.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed');
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      const newCode = response.data.verificationCode;
      alert(`Your new verification code is: ${newCode}`);
      toast.success('New code sent. Check the alert for the code.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
            <p className="text-gray-500 mt-2">
              Enter the 6-digit code sent to <br />
              <span className="text-blue-600 font-medium">{email}</span>
            </p>
          </div>

          {status === 'success' && (
            <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg text-green-700 text-center">
              ✅ {message}
            </div>
          )}
          {status === 'error' && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700 text-center">
              ❌ {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                maxLength="6"
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Enter the 6-digit code you received
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={resendCode}
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={14} />
              Resend code
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center gap-2">
              Back to Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;