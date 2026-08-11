import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [message, setMessage] = useState('');
  const [usageData, setUsageData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get('/profile');
        setProfile(profileRes.data);
        setBedtime(profileRes.data.bedtime);
        setWakeTime(profileRes.data.wakeTime);

        const usageRes = await axios.get('/usage');
        setUsageData(usageRes.data);

        const notifRes = await axios.get('/notifications');
        setNotifications(notifRes.data);

        const insightsRes = await axios.get('/reports/insights');
        setInsights(insightsRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/profile/bedtime', { bedtime, wakeTime });
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 3000);
      setProfile({...profile, bedtime, wakeTime});
    } catch (error) {
      setMessage('Failed to save schedule');
    }
  };

  const simulateMobileUsage = async () => {
    try {
      const mockData = {
        startTime: new Date(new Date().setHours(0, 15, 0, 0)),
        endTime: new Date(new Date().setHours(1, 30, 0, 0)),
        totalScreenTime: 75,
        appsUsed: [
          { appName: 'Instagram', durationMinutes: 45, category: 'Social Media' },
          { appName: 'Call of Duty', durationMinutes: 20, category: 'Games' }
        ]
      };
      const res = await axios.post('/usage/record', mockData);
      setUsageData([res.data.session, ...usageData]);
      
      const notifRes = await axios.get('/notifications');
      setNotifications(notifRes.data);
      const insightsRes = await axios.get('/reports/insights');
      setInsights(insightsRes.data);

      setMessage('Usage simulated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to simulate usage');
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  // NEW FEATURE: Sleep Health Score Calculation
  const getHealthScore = () => {
    if (!insights || insights.totalSessions === 0) return { score: 100, color: 'text-indigo-400', msg: 'Perfect' };
    const score = Math.max(0, 100 - (insights.averageScreenTime * 0.8));
    if (score >= 80) return { score: Math.round(score), color: 'text-emerald-400', msg: 'Excellent' };
    if (score >= 50) return { score: Math.round(score), color: 'text-yellow-400', msg: 'Needs Work' };
    return { score: Math.round(score), color: 'text-red-400', msg: 'Critical' };
  };
  
  const healthData = getHealthScore();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 flex justify-between items-center border-t border-l border-white/10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-white">SleepGuard Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition border border-slate-700">Logout</button>
        </div>
        
        {/* Profile & Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{user?.role === 'Parent' ? 'Parent Profile' : 'Student Profile'}</div>
              <div className="text-xl font-bold text-white">{user?.name}</div>
              <div className="text-slate-400 text-sm mt-1">{user?.email}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>

          {/* NEW FEATURE: Sleep Health Score */}
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 flex items-center justify-between">
            <div>
               <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Health Score</div>
               <div className={`text-4xl font-bold ${healthData.color}`}>{healthData.score}</div>
               <div className="text-slate-400 text-sm mt-1">{healthData.msg}</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
               <svg className="absolute w-full h-full transform -rotate-90">
                 <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" />
                 <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="none" className={healthData.color} strokeDasharray="163" strokeDashoffset={163 - (163 * healthData.score) / 100} style={{ transition: 'stroke-dashoffset 1s ease' }} />
               </svg>
            </div>
          </div>

          {/* Schedule Form */}
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Schedule</div>
            </div>
            <form onSubmit={handleSaveSchedule} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                 <label className="text-xs text-slate-400 mb-1 block">Bedtime</label>
                 <input type="time" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
              </div>
              <div className="flex-1">
                 <label className="text-xs text-slate-400 mb-1 block">Wake Time</label>
                 <input type="time" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-lg shadow-indigo-500/25">Update</button>
              </div>
            </form>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-medium shadow-sm backdrop-blur-sm ${message.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message}
          </div>
        )}

        {/* AI Insights Panel */}
        {insights && (
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-300">
                ✨ AI Sleep Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-2">
                  <p className="text-lg leading-relaxed text-slate-200">
                    {insights.aiSuggestion}
                  </p>
                  <div className="mt-6 flex gap-4">
                    <div className="bg-slate-900/50 px-4 py-3 rounded-xl border border-white/5">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Screen Time</div>
                      <div className="text-2xl font-bold text-white">{insights.averageScreenTime} <span className="text-sm font-normal text-slate-400">mins</span></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Time Drains</h3>
                  <div className="space-y-4">
                    {insights.topApps.length > 0 ? insights.topApps.map((app, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-slate-200">{app.name}</span>
                          <span className="text-indigo-300">{app.duration}m</span>
                        </div>
                        <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min((app.duration / (insights.averageScreenTime || 1)) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500">No app data recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Panel */}
          <div className="glass-panel rounded-2xl p-6 border-t border-l border-white/10">
            <h2 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
              ⚠️ Parent Alerts
            </h2>
            {notifications.length === 0 ? (
               <p className="text-slate-500 text-sm italic">No active alerts.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {notifications.map(n => (
                  <div key={n._id} className={`p-4 rounded-xl flex justify-between items-start ${n.isRead ? 'bg-slate-800/30 border border-slate-700/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
                    <div>
                      <h4 className={`text-sm font-bold ${n.isRead ? 'text-slate-500' : 'text-orange-300'}`}>{n.title}</h4>
                      <p className={`text-sm mt-1 leading-snug ${n.isRead ? 'text-slate-600' : 'text-orange-100/80'}`}>{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n._id)} className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 font-bold ml-3 transition">
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Data */}
          <div className="glass-panel rounded-2xl p-6 border-t border-l border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Late Night Usage Logs</h2>
              <button onClick={simulateMobileUsage} className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-500/30 transition">
                + Simulate Data
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2">
              {usageData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No sessions recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {usageData.map((session, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 mb-3">
                        <span className="font-bold text-slate-300 text-sm">
                          {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md font-bold">
                          {session.totalScreenTime} mins
                        </span>
                      </div>
                      <div className="space-y-2">
                        {session.appsUsed.map((app, appIdx) => (
                          <div key={appIdx} className="flex justify-between text-sm items-center">
                            <span className="text-slate-300 font-medium flex items-center gap-2">
                              {app.appName} 
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${app.category === 'Educational' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {app.category}
                              </span>
                            </span>
                            <span className="text-slate-400 font-medium">{app.durationMinutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
