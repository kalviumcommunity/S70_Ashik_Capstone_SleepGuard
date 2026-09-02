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
        setMessage('A 6-digit security OTP has been sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(userId, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center px-4 py-12 text-slate-100 font-sans">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </div>
          <span className="font-bold text-slate-100 text-xl tracking-tight">SleepGuard</span>
        </Link>
        <h1 className="text-xl font-bold text-slate-100">
          {step === 1 ? 'Sign in to your account' : 'Enter security verification'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {step === 1 ? 'Access your bedtime analytics & telemetry portal' : 'Enter the 6-digit one-time password'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="saas-card w-full max-w-md p-8">
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-md mb-5 text-xs font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-md mb-5 text-xs font-medium">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
              <input 
                type="email" 
                className="saas-input w-full" 
                placeholder="name@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                className="saas-input w-full" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="saas-btn-primary w-full py-2.5 mt-2">
              Continue with Password
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase font-semibold">Or Quick Demo Login</span>
              <div className="flex-grow border-t border-slate-800"></div>
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
                className="saas-btn-secondary text-xs py-2"
              >
                🎓 Demo Student
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
                className="saas-btn-secondary text-xs py-2"
              >
                🛡️ Demo Parent
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 text-center">Verification Code</label>
              <input 
                type="text" 
                maxLength="6" 
                placeholder="000000" 
                className="saas-input w-full text-center text-2xl tracking-[0.4em] font-mono py-3" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                autoFocus
              />
            </div>

            {previewUrl ? (
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-center text-xs font-medium text-indigo-400 hover:underline"
              >
                ✉️ Open Simulated Email Inbox (Ethereal) →
              </a>
            ) : (
              <p className="block text-center text-xs text-slate-400">
                Please check your registered inbox for the code.
              </p>
            )}

            <button type="submit" className="saas-btn-primary w-full py-2.5 mt-2">
              Verify Code & Sign In
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="saas-btn-secondary w-full py-2"
            >
              Back to Sign In
            </button>
          </form>
        )}

      </div>

      {step === 1 && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Create an account
          </Link>
        </p>
      )}

    </div>
  );
};

export default Login;
