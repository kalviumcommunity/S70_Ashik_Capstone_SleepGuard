import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [screenTimeLimit, setScreenTimeLimit] = useState(45);
  const [message, setMessage] = useState('');
  const [usageData, setUsageData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [insights, setInsights] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, usageRes, notifRes, insightsRes] = await Promise.all([
        axios.get('/profile'),
        axios.get('/usage'),
        axios.get('/notifications'),
        axios.get('/reports/insights')
      ]);

      setProfile(profileRes.data);
      setBedtime(profileRes.data.bedtime || '22:00');
      setWakeTime(profileRes.data.wakeTime || '06:00');
      setScreenTimeLimit(profileRes.data.screenTimeLimit || 45);
      setUsageData(usageRes.data || []);
      setNotifications(notifRes.data || []);
      setInsights(insightsRes.data || null);
    } catch (error) {
      console.error("Error loading dashboard data", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/profile/bedtime', { bedtime, wakeTime, screenTimeLimit: Number(screenTimeLimit) });
      setMessage(res.data.message || 'Schedule updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setProfile({ ...profile, bedtime, wakeTime, screenTimeLimit: Number(screenTimeLimit) });
      const insightsRes = await axios.get('/reports/insights');
      setInsights(insightsRes.data);
    } catch (error) {
      console.error(error);
      setMessage('Failed to save schedule');
    }
  };

  const runSimulation = async (type) => {
    setSimulating(true);
    try {
      let mockData;
      const now = new Date();

      if (type === 'gaming') {
        mockData = {
          startTime: new Date(now.setHours(0, 30, 0, 0)),
          endTime: new Date(now.setHours(1, 45, 0, 0)),
          totalScreenTime: 75,
          appsUsed: [
            { appName: 'Call of Duty Mobile', durationMinutes: 50, category: 'Games' },
            { appName: 'Discord', durationMinutes: 25, category: 'Social Media' }
          ]
        };
      } else if (type === 'social') {
        mockData = {
          startTime: new Date(now.setHours(23, 45, 0, 0)),
          endTime: new Date(now.setHours(0, 35, 0, 0)),
          totalScreenTime: 50,
          appsUsed: [
            { appName: 'Instagram', durationMinutes: 35, category: 'Social Media' },
            { appName: 'TikTok', durationMinutes: 15, category: 'Social Media' }
          ]
        };
      } else {
        // Study / Educational
        mockData = {
          startTime: new Date(now.setHours(22, 15, 0, 0)),
          endTime: new Date(now.setHours(22, 45, 0, 0)),
          totalScreenTime: 30,
          appsUsed: [
            { appName: 'Duolingo', durationMinutes: 20, category: 'Educational' },
            { appName: 'Quizlet', durationMinutes: 10, category: 'Educational' }
          ]
        };
      }

      const res = await axios.post('/usage/record', mockData);
      setUsageData([res.data.session, ...usageData]);

      const [notifRes, insightsRes] = await Promise.all([
        axios.get('/notifications'),
        axios.get('/reports/insights')
      ]);

      setNotifications(notifRes.data);
      setInsights(insightsRes.data);

      setMessage(`Simulated: ${type.toUpperCase()} session recorded.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to simulate usage');
    } finally {
      setSimulating(false);
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

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  // Health Score Calculation
  const getHealthScore = () => {
    if (!insights || insights.totalSessions === 0) return { score: 98, color: 'text-emerald-400', ring: 'stroke-emerald-400', msg: 'Optimal' };
    const score = Math.max(0, Math.min(100, Math.round(100 - (insights.averageScreenTime * 0.75))));
    if (score >= 80) return { score, color: 'text-emerald-400', ring: 'stroke-emerald-400', msg: 'Excellent' };
    if (score >= 55) return { score, color: 'text-yellow-400', ring: 'stroke-yellow-400', msg: 'Moderate' };
    return { score, color: 'text-red-400', ring: 'stroke-red-400', msg: 'Critical Risk' };
  };

  const healthData = getHealthScore();
  const maxWeeklyMins = Math.max(...(insights?.weeklyTrend?.map(w => w.screenTime) || [60]), 60);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation Bar */}
        <header className="glass-panel rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 border-t border-l border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">SleepGuard</h1>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-500/30">
                  {user?.role === 'Parent' ? '🛡️ Parental Hub' : '🎓 Student Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Late-Night Mobile Usage & Sleep Cycle Defense</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition border border-slate-700/60 shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Role Banner / Context */}
        {user?.role === 'Parent' && (
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border border-blue-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍👩‍👧</span>
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-blue-300">Active Parental Monitoring</div>
                <div className="text-sm font-semibold text-white">Monitoring: <span className="text-indigo-300">{insights?.monitoredStudentName || 'Alex Jenkins (Student)'}</span></div>
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              ⚡ Alerts trigger automatically when non-educational apps run after bedtime
            </div>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Profile</div>
              <div className="text-xl font-bold text-white truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs mt-1 truncate">{user?.email}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Target Bedtime:</span>
              <span className="text-sm font-bold text-indigo-300">{bedtime}</span>
            </div>
          </div>

          {/* Sleep Health Score Card */}
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Sleep Score</div>
              <div className={`text-4xl font-extrabold ${healthData.color}`}>{healthData.score}</div>
              <div className="text-slate-400 text-xs mt-1 font-medium">{healthData.msg}</div>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center relative shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="none" className="text-slate-800" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  strokeWidth="5" 
                  fill="none" 
                  className={healthData.ring} 
                  strokeDasharray="163" 
                  strokeDashoffset={163 - (163 * healthData.score) / 100} 
                  style={{ transition: 'stroke-dashoffset 1s ease' }} 
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-300">{healthData.score}%</span>
            </div>
          </div>

          {/* Bedtime & Limit Settings Form */}
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 md:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {user?.role === 'Parent' ? "Child's Sleep Schedule & Restrictions" : 'My Sleep Schedule'}
              </div>
            </div>
            <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Bedtime</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none" 
                  value={bedtime} 
                  onChange={(e) => setBedtime(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Wake Up</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none" 
                  value={wakeTime} 
                  onChange={(e) => setWakeTime(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Limit (Mins)</label>
                <input 
                  type="number" 
                  min="0"
                  max="180"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 outline-none" 
                  value={screenTimeLimit} 
                  onChange={(e) => setScreenTimeLimit(e.target.value)} 
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2.5 rounded-lg text-xs font-bold transition shadow-lg shadow-indigo-500/25"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Status Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl font-medium shadow-sm backdrop-blur-sm transition-all duration-300 ${message.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}`}>
            {message}
          </div>
        )}

        {/* AI Sleep Analysis & Weekly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Insights Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-7 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-indigo-500/15 rounded-full blur-[90px]"></div>
            
            <div className="relative z-10 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                  <span>✨</span> AI Sleep & Screen Analysis
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-semibold border border-indigo-500/30">
                  {insights?.adherenceRate || 85}% Goal Adherence
                </span>
              </div>
              
              <p className="text-base leading-relaxed text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                {insights?.aiSuggestion || 'Analyzing your sleep sessions...'}
              </p>

              {/* Weekly Trend Bar Chart */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between">
                  <span>7-Day Late Night Usage Trend</span>
                  <span className="text-slate-500">Target: &lt; {screenTimeLimit}m/night</span>
                </h3>
                
                <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  {(insights?.weeklyTrend || []).map((w, idx) => {
                    const heightPercent = Math.max(8, Math.min(100, Math.round((w.screenTime / (maxWeeklyMins || 60)) * 100)));
                    const isOverLimit = w.screenTime > screenTimeLimit;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition">
                          {w.screenTime}m
                        </div>
                        <div 
                          className={`w-full rounded-t-md transition-all duration-500 ${isOverLimit ? 'bg-gradient-to-t from-red-600 to-orange-500' : 'bg-gradient-to-t from-indigo-600 to-purple-500'}`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-[10px] text-slate-400 font-medium">{w.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Top Distracting Apps */}
          <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Late-Night Apps</h3>
              
              <div className="space-y-4">
                {(insights?.topApps || []).length > 0 ? (
                  insights.topApps.map((app, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-200 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${app.category === 'Educational' ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                          {app.name}
                        </span>
                        <span className="text-indigo-300 font-bold">{app.duration} mins</span>
                      </div>
                      <div className="w-full bg-slate-900/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div 
                          className={`h-1.5 rounded-full ${app.category === 'Educational' ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-indigo-500'}`} 
                          style={{ width: `${Math.min(100, Math.round((app.duration / ((insights.averageScreenTime || 1) * 1.5)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No usage recorded yet.</p>
                )}
              </div>
            </div>

            {/* Quick Testing Simulator */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Simulate Live Scenarios</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  disabled={simulating}
                  onClick={() => runSimulation('social')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-bold rounded-lg border border-slate-700 transition truncate"
                  title="Simulate Social Media Scroll"
                >
                  📱 Social (+50m)
                </button>
                <button
                  disabled={simulating}
                  onClick={() => runSimulation('gaming')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-orange-300 text-[10px] font-bold rounded-lg border border-slate-700 transition truncate"
                  title="Simulate Late Night Gaming"
                >
                  🎮 Games (+75m)
                </button>
                <button
                  disabled={simulating}
                  onClick={() => runSimulation('study')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold rounded-lg border border-slate-700 transition truncate"
                  title="Simulate Educational Study"
                >
                  📚 Study (+30m)
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Parent Alerts & Usage Log Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Notifications Panel */}
          <div className="glass-panel rounded-2xl p-6 border-t border-l border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-orange-400 flex items-center gap-2">
                <span>⚠️</span> Parent Alert Feed
              </h2>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs text-slate-400 hover:text-slate-200 transition underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-slate-500 text-xs italic py-4">No active bedtime alerts. All clear!</p>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {notifications.map(n => (
                  <div 
                    key={n._id} 
                    className={`p-3.5 rounded-xl flex justify-between items-start transition ${n.isRead ? 'bg-slate-900/40 border border-slate-800 text-slate-500' : 'bg-orange-500/10 border border-orange-500/30'}`}
                  >
                    <div>
                      <h4 className={`text-xs font-bold ${n.isRead ? 'text-slate-500' : 'text-orange-300'}`}>{n.title}</h4>
                      <p className={`text-xs mt-1 leading-snug ${n.isRead ? 'text-slate-600' : 'text-orange-100/90'}`}>{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n._id)} 
                        className="text-[10px] bg-orange-500/20 text-orange-300 px-2.5 py-1 rounded-lg hover:bg-orange-500/30 font-bold ml-2 transition shrink-0"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Data History */}
          <div className="glass-panel rounded-2xl p-6 border-t border-l border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white">Late-Night Session Log</h2>
              <span className="text-xs text-slate-400">{usageData.length} recorded</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[280px] pr-2">
              {usageData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs py-8">
                  No sessions recorded yet. Use the simulation buttons to generate test data.
                </div>
              ) : (
                <div className="space-y-3">
                  {usageData.map((session, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2.5">
                        <span className="font-bold text-slate-300 text-xs">
                          {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-700">
                          {session.totalScreenTime} mins
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {(session.appsUsed || []).map((app, appIdx) => (
                          <div key={appIdx} className="flex justify-between text-xs items-center">
                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                              {app.appName} 
                              <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${app.category === 'Educational' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
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
