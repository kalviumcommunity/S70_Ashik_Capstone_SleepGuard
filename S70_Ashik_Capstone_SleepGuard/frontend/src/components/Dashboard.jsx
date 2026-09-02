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

  // Wind-Down & 4-7-8 Breathing Mode
  const [isWindDownActive, setIsWindDownActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

  // App Permission Toggle State
  const [appLocks, setAppLocks] = useState({
    'Instagram': true,
    'TikTok': true,
    'Call of Duty Mobile': true,
    'YouTube': false,
    'Duolingo': false
  });

  const toggleAppLock = (appName) => {
    setAppLocks(prev => ({ ...prev, [appName]: !prev[appName] }));
    setMessage(`${appName} curfew lock updated.`);
    setTimeout(() => setMessage(''), 2500);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 4-7-8 Breathing Loop
  useEffect(() => {
    if (!isWindDownActive) return;

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 8;
          } else {
            setBreathPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWindDownActive, breathPhase]);

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

      setMessage(`Simulated telemetry recorded: ${type.toUpperCase()}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to simulate telemetry');
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
    if (!insights || insights.totalSessions === 0) return { score: 98, badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', msg: 'Optimal' };
    const score = Math.max(0, Math.min(100, Math.round(100 - (insights.averageScreenTime * 0.75))));
    if (score >= 80) return { score, badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', msg: 'Excellent' };
    if (score >= 55) return { score, badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', msg: 'Moderate' };
    return { score, badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', msg: 'High Risk' };
  };

  const healthData = getHealthScore();
  const maxWeeklyMins = Math.max(...(insights?.weeklyTrend?.map(w => w.screenTime) || [60]), 60);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans">
      
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 text-sm tracking-tight">SleepGuard Console</span>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                  {user?.role === 'Parent' ? 'Parental Hub' : 'Student Portal'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWindDownActive(true)}
              className="saas-btn-secondary text-xs py-1.5 px-3"
            >
              <span>🌙</span> Wind-Down Mode
            </button>
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[11px] text-slate-400">{user?.email}</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 4-7-8 Breathing Wind-Down Modal */}
        {isWindDownActive && (
          <div className="fixed inset-0 z-50 bg-[#090d16]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full saas-card p-6 border-slate-700 text-center space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">4-7-8 Calming Breathing Pacer</span>
                <button 
                  onClick={() => setIsWindDownActive(false)}
                  className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="py-6 flex flex-col items-center justify-center">
                <div 
                  className="w-36 h-36 rounded-full border-2 border-indigo-500/60 bg-indigo-950/40 flex flex-col items-center justify-center transition-all duration-1000"
                  style={{
                    transform: breathPhase === 'Inhale' ? 'scale(1.15)' : breathPhase === 'Hold' ? 'scale(1.15)' : 'scale(0.9)',
                  }}
                >
                  <div className="text-lg font-bold text-slate-100">{breathPhase}</div>
                  <div className="text-3xl font-extrabold text-indigo-400 font-mono">{breathTimer}s</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                {breathPhase === 'Inhale' && 'Inhale quietly through your nose for 4 seconds.'}
                {breathPhase === 'Hold' && 'Hold your breath comfortably for 7 seconds to slow your heart rate.'}
                {breathPhase === 'Exhale' && 'Exhale completely through your mouth for 8 seconds.'}
              </p>

              <button 
                onClick={() => setIsWindDownActive(false)}
                className="saas-btn-secondary w-full text-xs"
              >
                Close Pacer
              </button>
            </div>
          </div>
        )}

        {/* Parent Monitoring Banner */}
        {user?.role === 'Parent' && (
          <div className="saas-card p-4 border-l-4 border-l-indigo-500 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                🛡️
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Parental Oversight</div>
                <div className="text-sm font-semibold text-slate-200">
                  Student: <span className="text-indigo-400 font-bold">{insights?.monitoredStudentName || 'Alex Jenkins'}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Curfew alerts dispatch automatically when non-educational apps run past bedtime.
            </div>
          </div>
        )}

        {/* Status Notification Toast */}
        {message && (
          <div className={`p-3 rounded-lg text-xs font-medium border ${message.includes('Failed') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {message}
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Sleep Score Card */}
          <div className="saas-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sleep Health Score</div>
                <div className="text-3xl font-bold text-slate-100 mt-2">{healthData.score} <span className="text-sm font-normal text-slate-500">/ 100</span></div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${healthData.badge}`}>
                {healthData.msg}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex justify-between">
              <span>Goal Adherence</span>
              <span className="font-semibold text-slate-200">{insights?.adherenceRate || 85}%</span>
            </div>
          </div>

          {/* Bedtime Goal Card */}
          <div className="saas-card p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Bedtime</div>
            <div className="text-3xl font-bold text-slate-100 mt-2">{bedtime}</div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex justify-between">
              <span>Morning Alarm</span>
              <span className="font-semibold text-slate-200">{wakeTime}</span>
            </div>
          </div>

          {/* Late-Night Screen Limit */}
          <div className="saas-card p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curfew Screen Limit</div>
            <div className="text-3xl font-bold text-slate-100 mt-2">{screenTimeLimit} <span className="text-sm font-normal text-slate-500">mins</span></div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex justify-between">
              <span>Whitelisted</span>
              <span className="font-semibold text-emerald-400">Study Apps Only</span>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="saas-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Curfew Alerts</div>
                <div className="text-3xl font-bold text-slate-100 mt-2">{notifications.filter(n => !n.isRead).length}</div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-slate-800 text-slate-300 border-slate-700">
                {notifications.length} Total
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex justify-between">
              <span>Status</span>
              <span className="font-semibold text-indigo-400">Monitoring Active</span>
            </div>
          </div>

        </div>

        {/* Schedule & Limit Editor Form */}
        <div className="saas-card p-5">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                {user?.role === 'Parent' ? "Configure Child's Bedtime & Screen Rules" : "My Sleep Schedule & Screen Limit"}
              </h3>
              <p className="text-xs text-slate-400">Adjust target curfew hours and maximum late-night screen time</p>
            </div>
          </div>
          <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Bedtime</label>
              <input 
                type="time" 
                className="saas-input w-full" 
                value={bedtime} 
                onChange={(e) => setBedtime(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Wake Up</label>
              <input 
                type="time" 
                className="saas-input w-full" 
                value={wakeTime} 
                onChange={(e) => setWakeTime(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Late-Night Limit (Mins)</label>
              <input 
                type="number" 
                min="0"
                max="180"
                className="saas-input w-full" 
                value={screenTimeLimit} 
                onChange={(e) => setScreenTimeLimit(e.target.value)} 
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="saas-btn-primary w-full py-2"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>

        {/* Analytics & App Locks Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 7-Day Usage Telemetry Chart & AI Insights */}
          <div className="lg:col-span-2 saas-card p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">7-Day Late-Night Usage Telemetry</h3>
                <p className="text-xs text-slate-400">Daily recreational minutes past configured bedtime</p>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Curfew Threshold: {screenTimeLimit}m
              </span>
            </div>

            {/* Bar Chart */}
            <div className="grid grid-cols-7 gap-3 items-end h-36 pt-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
              {(insights?.weeklyTrend || []).map((w, idx) => {
                const heightPercent = Math.max(10, Math.min(100, Math.round((w.screenTime / (maxWeeklyMins || 60)) * 100)));
                const isOverLimit = w.screenTime > screenTimeLimit;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700 pointer-events-none transition-opacity z-10">
                      {w.screenTime} min
                    </div>
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${isOverLimit ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-[11px] text-slate-400 font-medium">{w.day}</span>
                  </div>
                );
              })}
            </div>

            {/* AI Sleep Insights Box */}
            <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">✨ AI Sleep & Screen Hygiene Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights?.aiSuggestion || 'Collecting late-night telemetry to generate sleep hygiene insights...'}
              </p>
            </div>
          </div>

          {/* App Curfew Locks & Simulation Controls */}
          <div className="saas-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">App Curfew Policies</h3>
                  <p className="text-xs text-slate-400">Automated lock enforcement</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {Object.keys(appLocks).map((appName, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs font-medium text-slate-200">{appName}</span>
                    <button
                      onClick={() => toggleAppLock(appName)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors border ${appLocks[appName] ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                    >
                      {appLocks[appName] ? '🔒 Locked' : '🔓 Allowed'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Simulator */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Test Telemetry Trigger</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={simulating}
                  onClick={() => runSimulation('social')}
                  className="saas-btn-secondary text-[11px] py-1.5 px-2 truncate"
                  title="Simulate Social Media Feed"
                >
                  📱 Social (+50m)
                </button>
                <button
                  disabled={simulating}
                  onClick={() => runSimulation('gaming')}
                  className="saas-btn-secondary text-[11px] py-1.5 px-2 truncate"
                  title="Simulate Mobile Gaming"
                >
                  🎮 Gaming (+75m)
                </button>
                <button
                  disabled={simulating}
                  onClick={() => runSimulation('study')}
                  className="saas-btn-secondary text-[11px] py-1.5 px-2 truncate"
                  title="Simulate Homework App"
                >
                  📚 Study (+30m)
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Parent Notifications & History Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Notifications Feed */}
          <div className="saas-card p-6">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-200">Parent Alert Feed</h3>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                  {notifications.filter(n => !n.isRead).length} Unread
                </span>
              </div>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active curfew alerts.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div 
                    key={n._id} 
                    className={`p-3 rounded-lg flex justify-between items-start transition-colors border ${n.isRead ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-rose-500/5 border-rose-500/20 text-slate-200'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${n.isRead ? 'text-slate-400' : 'text-rose-400'}`}>{n.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n._id)} 
                        className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded hover:bg-rose-500/20 border border-rose-500/20 ml-2 shrink-0 transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Telemetry Log Table */}
          <div className="saas-card p-6 flex flex-col">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200">Late-Night Telemetry Sessions</h3>
              <span className="text-xs text-slate-400">{usageData.length} records</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[260px] pr-1">
              {usageData.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No recorded usage sessions. Run a simulation above to generate data.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {usageData.map((session, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800/80">
                        <span className="text-xs font-medium text-slate-300">
                          {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {session.totalScreenTime} mins
                        </span>
                      </div>
                      <div className="space-y-1">
                        {(session.appsUsed || []).map((app, appIdx) => (
                          <div key={appIdx} className="flex justify-between text-xs items-center">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              {app.appName}
                              <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${app.category === 'Educational' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                {app.category}
                              </span>
                            </span>
                            <span className="text-slate-400">{app.durationMinutes}m</span>
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

      </main>
    </div>
  );
};

export default Dashboard;
