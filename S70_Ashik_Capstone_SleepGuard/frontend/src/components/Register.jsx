import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
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
          Create your account
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Set up real-time bedtime monitoring and sleep hygiene protection
        </p>
      </div>

      {/* Auth Card */}
      <div className="saas-card w-full max-w-md p-8">
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-md mb-5 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full name</label>
            <input 
              type="text" 
              className="saas-input w-full" 
              placeholder="e.g. Sarah Jenkins" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
            <input 
              type="email" 
              className="saas-input w-full" 
              placeholder="sarah@example.com" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
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
              placeholder="At least 6 characters" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Role</label>
            <select 
              className="saas-input w-full cursor-pointer" 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Student">Student (Personal sleep & habit analytics)</option>
              <option value="Parent">Parent (Curfew oversight & alert feed)</option>
            </select>
          </div>
          
          <button type="submit" className="saas-btn-primary w-full py-2.5 mt-2">
            Create Account & Get Started
          </button>
        </form>

      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>

    </div>
  );
};

export default Register;
