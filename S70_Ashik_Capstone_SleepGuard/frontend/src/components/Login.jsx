import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { loginStep1, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginStep1(email, password);
      if (data.requiresOtp) {
        setUserId(data.userId);
        setPreviewUrl(data.previewUrl);
        setStep(2);
        setMessage('Secure OTP sent to your email address.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(userId, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden text-slate-100 font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[100px] floating-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-purple-600/20 rounded-full blur-[100px] floating-blob" style={{ animationDelay: '2s' }}></div>

      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 mx-4 border-t border-l border-white/20 relative">
        
        <div className="mb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
            {step === 1 ? 'Welcome Back' : 'Security Check'}
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            {step === 1 ? 'Enter your details to access SleepGuard' : 'Enter the 6-digit verification code'}
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium backdrop-blur-sm">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm text-center font-medium backdrop-blur-sm">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-100 placeholder-slate-500" placeholder="hello@sleepguard.app" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Password</label>
              <input type="password" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-100 placeholder-slate-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/25 mt-4">
              Access Dashboard
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2 text-center">6-Digit Code</label>
              <input type="text" maxLength="6" placeholder="000000" className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-100 text-center text-3xl tracking-[0.5em] font-mono" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition mt-2">
                ✉️ Open your Email Inbox to view OTP
              </a>
            )}
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/25 mt-2">
              Verify Identity
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium py-3 rounded-xl transition mt-2">
              Cancel
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            New to SleepGuard? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline transition">Create account</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
