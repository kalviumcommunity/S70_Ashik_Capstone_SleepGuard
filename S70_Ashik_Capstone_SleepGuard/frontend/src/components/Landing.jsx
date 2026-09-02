import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  // Interactive Device Simulator State
  const [selectedApps, setSelectedApps] = useState(['Instagram', 'TikTok']);
  const appDatabase = {
    'Instagram': { category: 'Social Media', delay: 25, blueLight: 85, icon: '📱', risk: 'High' },
    'TikTok': { category: 'Social Media', delay: 35, blueLight: 95, icon: '🎬', risk: 'Critical' },
    'YouTube': { category: 'Entertainment', delay: 30, blueLight: 80, icon: '▶️', risk: 'High' },
    'Call of Duty': { category: 'Gaming', delay: 45, blueLight: 90, icon: '🎮', risk: 'Critical' },
    'Duolingo': { category: 'Educational', delay: 5, blueLight: 30, icon: '🦉', risk: 'Low' },
    'Notion': { category: 'Productivity', delay: 8, blueLight: 25, icon: '📝', risk: 'Low' },
    'Reddit': { category: 'Social Media', delay: 20, blueLight: 70, icon: '💬', risk: 'Moderate' },
  };

  const toggleApp = (appName) => {
    if (selectedApps.includes(appName)) {
      setSelectedApps(selectedApps.filter(a => a !== appName));
    } else {
      setSelectedApps([...selectedApps, appName]);
    }
  };

  const totalDelay = selectedApps.reduce((sum, app) => sum + (appDatabase[app]?.delay || 0), 0);
  const avgBlueLight = selectedApps.length === 0 ? 0 : Math.round(selectedApps.reduce((sum, app) => sum + (appDatabase[app]?.blueLight || 0), 0) / selectedApps.length);
  const hasNonEdu = selectedApps.some(app => appDatabase[app]?.category !== 'Educational');

  // Interactive Sleep Cycle Calculator State
  const [wakeTime, setWakeTime] = useState('07:00');
  const calculateBedtimes = (wake) => {
    const [hours, mins] = wake.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, mins, 0, 0);

    const cycles = [6, 5, 4]; // 9h (6 cycles), 7.5h (5 cycles), 6h (4 cycles)
    return cycles.map(cycleCount => {
      const bedDate = new Date(wakeDate.getTime() - (cycleCount * 90 + 15) * 60000); // 90 min cycle + 15 min buffer
      return {
        cycles: cycleCount,
        hours: (cycleCount * 1.5).toFixed(1),
        time: bedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommended: cycleCount === 5
      };
    });
  };
  const calculatedBedtimes = calculateBedtimes(wakeTime);

  // Interactive Habit Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const quizQuestions = [
    {
      question: "When do you typically stop looking at your mobile device?",
      options: [
        { label: "1 hour before scheduled bedtime", points: 10 },
        { label: "Right as I get into bed", points: 40 },
        { label: "1 to 2 hours after getting into bed", points: 80 }
      ]
    },
    {
      question: "What is your primary late-night digital activity?",
      options: [
        { label: "Infinite scrolling (Shorts, Reels, TikTok)", type: "Late-Night Scroller" },
        { label: "Competitive mobile gaming & voice chat", type: "Night-Owl Gamer" },
        { label: "Last-minute study sessions & homework", type: "Late-Night Scholar" }
      ]
    },
    {
      question: "How do you feel when your morning alarm sounds?",
      options: [
        { label: "Refreshed and alert", score: "Optimal" },
        { label: "Groggy, needing 2+ snoozes", score: "Moderate Fatigue" },
        { label: "Severely exhausted with eye strain", score: "High Sleep Debt" }
      ]
    }
  ];

  // Interactive Audience Tabs
  const [activeTab, setActiveTab] = useState('students');

  // Ambient Sound Generator (Web Audio API)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSound, setActiveSound] = useState('rain');
  const audioContextRef = useRef(null);
  const activeNodesRef = useRef([]);

  const stopAudio = () => {
    activeNodesRef.current.forEach(node => {
      try { node.stop(); node.disconnect(); } catch (_e) {}
    });
    activeNodesRef.current = [];
    setIsPlayingAudio(false);
  };

  const playSound = (soundType) => {
    stopAudio();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (soundType === 'tone') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        activeNodesRef.current = [osc];
      } else {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 2.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(soundType === 'ocean' ? 350 : 800, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();
        activeNodesRef.current = [whiteNoise];
      }

      setActiveSound(soundType);
      setIsPlayingAudio(true);
    } catch (e) {
      console.error("Audio initialization error", e);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-600/30">
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 text-base tracking-tight">SleepGuard</span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">SaaS v2.4</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
              <a href="#simulator" className="hover:text-slate-200 transition-colors">Screen Simulator</a>
              <a href="#calculator" className="hover:text-slate-200 transition-colors">REM Calculator</a>
              <a href="#quiz" className="hover:text-slate-200 transition-colors">Habit Diagnostic</a>
              <a href="#features" className="hover:text-slate-200 transition-colors">Platform Features</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="saas-btn-primary">
                Open Console
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="saas-btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/90 text-xs font-medium text-slate-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Intelligent Sleep Hygiene & Parental Telemetry Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15] mb-6">
          Reclaim restorative sleep from <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
            late-night digital drag.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          SleepGuard monitors midnight device usage, distinguishes study apps from recreational doomscrolling, alerts parents on curfew violations, and optimizes 90-minute REM sleep cycles.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Link to="/register" className="saas-btn-primary px-6 py-2.5 text-sm">
            Start Free Protection
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <Link to="/login" className="saas-btn-secondary px-6 py-2.5 text-sm">
            Explore 1-Click Demo
          </Link>
        </div>

        {/* Ambient Bedtime Synthesizer Bar */}
        <div className="saas-card max-w-xl mx-auto p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left pl-2">
            <span className="text-base">🌙</span>
            <div>
              <div className="text-xs font-semibold text-slate-200">Bedtime Wind-Down Audio</div>
              <div className="text-[11px] text-slate-400">In-browser binaural and filtered relaxation tones</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => isPlayingAudio && activeSound === 'rain' ? stopAudio() : playSound('rain')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isPlayingAudio && activeSound === 'rain' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              🌧️ Rain
            </button>
            <button
              onClick={() => isPlayingAudio && activeSound === 'ocean' ? stopAudio() : playSound('ocean')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isPlayingAudio && activeSound === 'ocean' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              🌊 Waves
            </button>
            <button
              onClick={() => isPlayingAudio && activeSound === 'tone' ? stopAudio() : playSound('tone')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isPlayingAudio && activeSound === 'tone' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              ✨ 432Hz
            </button>
          </div>
        </div>
      </section>

      {/* Key Metric Highlights */}
      <section className="py-8 border-y border-slate-800 bg-[#0c1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-100">85%</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Average Goal Adherence</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">&lt; 15 min</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Sleep Onset Latency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">Real-Time</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Parental Curfew Telemetry</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">2FA OTP</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Enterprise Account Security</div>
          </div>
        </div>
      </section>

      {/* 📱 Interactive Lab 01: Late-Night Screen Impact Simulator */}
      <section id="simulator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Interactive Telemetry Tool</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            Late-Night Screen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300">Disruption Simulator</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Select mobile applications to simulate late-night screen time and inspect real-time melatonin delay, blue light burden, and automated parent alerting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* App Selector Panel */}
          <div className="lg:col-span-6 saas-card p-6">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Active Mobile Apps</h3>
                <p className="text-xs text-slate-400">Toggle apps to simulate midnight usage</p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                00:45 AM Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.keys(appDatabase).map(app => {
                const isSelected = selectedApps.includes(app);
                const info = appDatabase[app];
                return (
                  <button
                    key={app}
                    onClick={() => toggleApp(app)}
                    className={`p-3 rounded-lg flex items-center justify-between text-left transition-all border text-xs ${isSelected ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-100 shadow-sm' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{info.icon}</span>
                      <div className="truncate">
                        <div className="font-semibold truncate">{app}</div>
                        <div className={`text-[10px] ${info.category === 'Educational' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {info.category}
                        </div>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-slate-700'}`}></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Analytics Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="saas-card p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200">Live Disruption Telemetry</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${hasNonEdu ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                  {hasNonEdu ? '⚠️ Parent Notification Active' : '✅ Compliant (Study Mode)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="saas-card-subtle p-4">
                  <div className="text-xs text-slate-400 font-medium">Estimated Sleep Delay</div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400 mt-1">+{totalDelay} <span className="text-xs text-slate-400 font-normal">mins</span></div>
                  <div className="text-[11px] text-slate-500 mt-1">Melatonin suppression onset</div>
                </div>

                <div className="saas-card-subtle p-4">
                  <div className="text-xs text-slate-400 font-medium">Blue Light Load</div>
                  <div className={`text-2xl font-bold mt-1 ${avgBlueLight > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>{avgBlueLight}%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Circadian phase delay</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-300">Sleep Quality Impact</span>
                  <span className={totalDelay > 40 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {Math.min(100, Math.round(totalDelay * 1.2))}% Impaired
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${totalDelay > 40 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, Math.max(8, totalDelay * 1.2))}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold">ℹ️</span>
                <p className="leading-relaxed">
                  {hasNonEdu 
                    ? `SleepGuard's late-night monitoring daemon flags recreational apps past the configured bedtime limit and sends instant parent alerts.`
                    : `Study apps like Duolingo & Notion are whitelisted to protect student study autonomy without generating false-positive bedtime alarms.`}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ⏰ Interactive Lab 02: 90-Minute REM Cycle Optimizer */}
      <section id="calculator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sleep Science Utility</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            90-Minute REM <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300">Sleep Cycle Calculator</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Human sleep operates in 90-minute ultradian cycles. Waking up midway through deep non-REM stages causes sleep inertia. Select your wake-up goal:
          </p>
        </div>

        <div className="max-w-3xl mx-auto saas-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-0.5">Target Wake-Up Time</label>
              <span className="text-xs text-slate-500">When does your morning alarm sound?</span>
            </div>
            <input 
              type="time" 
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="saas-input text-base font-bold text-indigo-300 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {calculatedBedtimes.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border text-center transition-all ${item.recommended ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}
              >
                {item.recommended && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded inline-block mb-2">
                    Recommended
                  </span>
                )}
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300">{item.time}</div>
                <div className="text-xs text-indigo-400 font-medium mt-1">{item.hours} hrs ({item.cycles} complete cycles)</div>
                <div className="text-[11px] text-slate-500 mt-1.5">Includes 15-min sleep onset buffer</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🧠 Interactive Lab 03: 30-Second Sleep Habit Diagnostic */}
      <section id="quiz" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Interactive Assessment</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            Sleep Quality & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Screen Diagnostic</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Complete a 30-second assessment to diagnose late-night digital bottlenecks and receive personalized sleep hygiene recommendations.
          </p>
        </div>

        <div className="max-w-2xl mx-auto saas-card p-6 sm:p-8">
          {quizStep < quizQuestions.length ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pb-3 border-b border-slate-800">
                <span>Step {quizStep + 1} of {quizQuestions.length}</span>
                <span className="text-indigo-400">{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}% Complete</span>
              </div>

              <h3 className="text-base font-semibold text-slate-100">{quizQuestions[quizStep].question}</h3>

              <div className="space-y-2.5">
                {quizQuestions[quizStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuizAnswers({ ...quizAnswers, [quizStep]: opt });
                      setQuizStep(quizStep + 1);
                    }}
                    className="w-full text-left p-3.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition flex justify-between items-center group"
                  >
                    <span>{opt.label}</span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-5">
              <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-lg mx-auto flex items-center justify-center text-xl border border-indigo-500/30">
                📊
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Diagnosis: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">{quizAnswers[1]?.type || 'Late-Night Digital Scroller'}</span></h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto mt-2">
                  Evening stimulation is suppressing your melatonin cycle and pushing REM sleep into early morning hours. SleepGuard can enforce automated curfews and bedtime wind-down reminders.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Link to="/register" className="saas-btn-primary text-xs">
                  Set Up Sleep Defense
                </Link>
                <button onClick={() => { setQuizStep(0); setQuizAnswers({}); }} className="saas-btn-secondary text-xs">
                  Retake Diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🎯 Audience Perspectives (Tabs) */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Tailored Experience</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">Built for Students, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">Trusted by Parents</span></h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🎓 For Students & Teens
            </button>
            <button
              onClick={() => setActiveTab('parents')}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${activeTab === 'parents' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🛡️ For Parents & Guardians
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'students' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="saas-card p-5">
                <div className="text-indigo-400 font-bold text-lg mb-2">01</div>
                <h4 className="text-sm font-semibold text-slate-200">Study Autonomy</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Whitelists homework and educational apps during late hours without sending parental alerts.</p>
              </div>
              <div className="saas-card p-5">
                <div className="text-indigo-400 font-bold text-lg mb-2">02</div>
                <h4 className="text-sm font-semibold text-slate-200">Wind-Down Pacing</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Built-in 4-7-8 breathing pacers and synthesized delta tones to decompress before sleep.</p>
              </div>
              <div className="saas-card p-5">
                <div className="text-indigo-400 font-bold text-lg mb-2">03</div>
                <h4 className="text-sm font-semibold text-slate-200">REM Wakeup Schedule</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Smart bedtime suggestions to wake up at the conclusion of natural 90-minute sleep cycles.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="saas-card p-5">
                <div className="text-indigo-400 font-bold text-lg mb-2">01</div>
                <h4 className="text-sm font-semibold text-slate-200">Midnight Alerts</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Instant notifications when games or social media feeds run past designated bedtime curfews.</p>
              </div>
              <div className="saas-card p-5">
                <div className="text-indigo-400 font-bold text-lg mb-2">02</div>
                <h4 className="text-sm font-semibold text-slate-200">7-Day Trends</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Executive weekly health scores and screen-time adherence graphs for informed parenting.</p>
              </div>
              <div className="saas-card p-5">
                <div className="text-indigo-400 font-bold text-lg mb-2">03</div>
                <h4 className="text-sm font-semibold text-slate-200">Remote Curfew Controls</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Easily adjust bedtime limits, wake times, and app locks directly from the parent portal.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Clean SaaS Footer */}
      <footer className="border-t border-slate-800 bg-[#060a12] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SleepGuard</span>
            <span>• Capstone Sleep Hygiene & Screen Time Security</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300">Register</Link>
            <span>2FA OTP Protected</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
