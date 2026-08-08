import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden text-slate-100 font-sans py-12">
      <div className="absolute top-[10%] right-[-5%] w-[35vw] h-[35vw] bg-blue-600/20 rounded-full blur-[100px] floating-blob"></div>
      <div className="absolute bottom-[5%] left-[-10%] w-[45vw] h-[45vw] bg-emerald-600/10 rounded-full blur-[100px] floating-blob" style={{ animationDelay: '3s' }}></div>

      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 mx-4 border-t border-l border-white/20 relative">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-emerald-300">
            Join SleepGuard
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Protect your sleep cycles starting today</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium backdrop-blur-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Full Name</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-100 placeholder-slate-500" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Email Address</label>
            <input type="email" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-100 placeholder-slate-500" placeholder="hello@sleepguard.app" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Password</label>
            <input type="password" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-100 placeholder-slate-500" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Account Type</label>
            <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-100" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="Student">Student (Track my sleep)</option>
              <option value="Parent">Parent (Monitor my child)</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/25 mt-6">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
