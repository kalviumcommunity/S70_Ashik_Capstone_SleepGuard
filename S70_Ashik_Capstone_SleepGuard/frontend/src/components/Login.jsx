import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { loginStep1, verifyOtp, demoLogin } = useContext(AuthContext);
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
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-100 placeholder-slate-500 pr-12" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/25 mt-4">
              Access Dashboard
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-700/60"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase font-semibold">Or Quick Access</span>
              <div className="flex-grow border-t border-slate-700/60"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await demoLogin('Student');
                    navigate('/dashboard');
                  } catch (err) {
                    setError('Demo login failed');
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                <span>🎓</span> Demo Student
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await demoLogin('Parent');
                    navigate('/dashboard');
                  } catch (err) {
                    setError('Demo login failed');
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                <span>🛡️</span> Demo Parent
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2 text-center">6-Digit Code</label>
              <input type="text" maxLength="6" placeholder="000000" className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-100 text-center text-3xl tracking-[0.5em] font-mono" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            {previewUrl ? (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition mt-2">
                ✉️ Open your Email Inbox to view OTP
              </a>
            ) : (
              <p className="block text-center text-sm font-medium text-emerald-400 mt-2">
                ✉️ Please check your email inbox for the OTP
              </p>
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
