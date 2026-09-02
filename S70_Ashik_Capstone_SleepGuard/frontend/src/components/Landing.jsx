import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive Device Simulator State
  const [selectedApps, setSelectedApps] = useState(['Instagram', 'TikTok']);
  const appDatabase = {
    'Instagram': { category: 'Social Media', delay: 25, blueLight: 85, icon: '📸', risk: 'High' },
    'TikTok': { category: 'Social Media', delay: 35, blueLight: 95, icon: '🎵', risk: 'Critical' },
    'YouTube': { category: 'Entertainment', delay: 30, blueLight: 80, icon: '▶️', risk: 'High' },
    'Call of Duty': { category: 'Gaming', delay: 45, blueLight: 90, icon: '🎮', risk: 'Critical' },
    'Duolingo': { category: 'Educational', delay: 5, blueLight: 30, icon: '🦉', risk: 'Low' },
    'Notion': { category: 'Productivity', delay: 8, blueLight: 25, icon: '📝', risk: 'Low' },
    'Reddit': { category: 'Social Media', delay: 20, blueLight: 70, icon: '🤖', risk: 'Moderate' },
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
      const bedDate = new Date(wakeDate.getTime() - (cycleCount * 90 + 15) * 60000); // 90 min cycle + 15 min to fall asleep
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
      question: "When do you typically stop looking at your phone?",
      options: [
        { label: "1 hour before bed", points: 10 },
        { label: "Right as I get under the covers", points: 40 },
        { label: "1 to 2 hours after getting into bed", points: 80 }
      ]
    },
    {
      question: "What is your main midnight trigger?",
      options: [
        { label: "Infinite scrolling (Reels/TikTok)", type: "Doomscroller" },
        { label: "Competitive Gaming or Chatting", type: "Night Owl Gamer" },
        { label: "Late homework or study cramming", type: "Late Night Scholar" }
      ]
    },
    {
      question: "How do you feel when your alarm sounds?",
      options: [
        { label: "Refreshed & ready", score: "Great" },
        { label: "Hitting snooze 3+ times", score: "Groggy" },
        { label: "Exhausted with dry eyes", score: "Critical" }
      ]
    }
  ];

  // Interactive Audience Tabs
  const [activeTab, setActiveTab] = useState('students');

  // Ambient Sound Generator (Web Audio API - Zero External Files)
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
        // 432 Hz Binaural Rest Tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        activeNodesRef.current = [osc];
      } else {
        // Synthesized Gentle Rain/White noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02; // Pink-ish filter
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(soundType === 'ocean' ? 350 : 800, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();
        activeNodesRef.current = [whiteNoise];
      }

      setActiveSound(soundType);
      setIsPlayingAudio(true);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Parallax mouse effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      stopAudio();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Background Animated Atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] bg-indigo-600/15 rounded-full blur-[140px] floating-blob"></div>
        <div className="absolute top-[40%] right-[-15%] w-[50vw] h-[50vw] bg-purple-600/15 rounded-full blur-[140px] floating-blob" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-[-10%] left-[25%] w-[45vw] h-[45vw] bg-emerald-600/10 rounded-full blur-[140px] floating-blob" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-slate-950/60 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">SleepGuard</span>
              <span className="text-[10px] ml-2 text-indigo-400 font-mono font-bold uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">v2.4 Active</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a href="#simulator" className="text-xs font-semibold text-slate-400 hover:text-white transition hidden md:block">Interactive Lab</a>
            <a href="#calculator" className="text-xs font-semibold text-slate-400 hover:text-white transition hidden md:block">REM Cycles</a>
            <a href="#quiz" className="text-xs font-semibold text-slate-400 hover:text-white transition hidden md:block">Habit Quiz</a>
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition">
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold text-slate-300 hover:text-white transition px-3 py-2">Sign In</Link>
                <Link to="/register" className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-950 rounded-xl hover:opacity-90 transition shadow-lg shadow-white/10">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-400">Interactive Sleep & Usage Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">Reclaim Your Sleep From</span> <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 animate-pulse">
            Late-Night Screen Drag.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          SleepGuard monitors midnight phone activity, detects non-educational doomscrolling, alerts parents, and uses AI to rebuild deep REM sleep cycles for students.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
            <span>🛡️ Protect My Sleep</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <Link to="/login" className="px-7 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-2xl hover:scale-105 active:scale-95 transition text-sm">
            ⚡ 1-Click Demo Mode
          </Link>
        </div>

        {/* Ambient Bedtime Sound Studio Floating Bar */}
        <div className="max-w-xl mx-auto glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-indigo-500/20 shadow-2xl">
          <div className="flex items-center gap-2.5 text-left pl-2">
            <span className="text-xl">🌙</span>
            <div>
              <div className="text-xs font-bold text-slate-200">Wind-Down Sound Generator</div>
              <div className="text-[10px] text-slate-400">Live synthetic audio for bedtime relaxation</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => isPlayingAudio && activeSound === 'rain' ? stopAudio() : playSound('rain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isPlayingAudio && activeSound === 'rain' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              🌧️ Rain
            </button>
            <button
              onClick={() => isPlayingAudio && activeSound === 'ocean' ? stopAudio() : playSound('ocean')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isPlayingAudio && activeSound === 'ocean' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              🌊 Waves
            </button>
            <button
              onClick={() => isPlayingAudio && activeSound === 'tone' ? stopAudio() : playSound('tone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isPlayingAudio && activeSound === 'tone' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              ✨ 432Hz
            </button>
          </div>
        </div>
      </section>

      {/* 📱 Interactive Lab Section: Live App Disruption Simulator */}
      <section id="simulator" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 mb-2">Interactive Lab 01</div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
            Interactive Late-Night Screen Simulator
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3">
            Click on active apps to simulate late-night phone usage and inspect real-time blue light impact, REM delay, and parental trigger states.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Virtual Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[300px] h-[520px] bg-slate-900 rounded-[40px] p-4 border-4 border-slate-700 shadow-2xl relative flex flex-col justify-between overflow-hidden">
              {/* Phone Camera Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full flex items-center justify-end pr-2">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              </div>

              {/* Status Header */}
              <div className="pt-5 pb-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>00:45 AM</span>
                <span>🔋 42%</span>
              </div>

              {/* App Grid inside Phone */}
              <div className="space-y-3 flex-1 overflow-y-auto pt-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider text-center mb-3">
                  Tap to Toggle Night Activity
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.keys(appDatabase).map(app => {
                    const isSelected = selectedApps.includes(app);
                    const info = appDatabase[app];
                    return (
                      <button
                        key={app}
                        onClick={() => toggleApp(app)}
                        className={`p-2.5 rounded-2xl flex items-center gap-2 text-left transition-all duration-300 ${isSelected ? 'bg-indigo-600/30 border-2 border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800'}`}
                      >
                        <span className="text-xl">{info.icon}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{app}</div>
                          <div className={`text-[9px] font-semibold ${info.category === 'Educational' ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {info.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Virtual Home Bar */}
              <div className="pt-2 flex justify-center">
                <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Live Impact Analytics Output */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">Live Disruption Metrics</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${hasNonEdu ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {hasNonEdu ? '🚨 Parent Alert Triggered' : '✅ Compliant (Study Mode)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Sleep Onset Delay</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400">+{totalDelay} <span className="text-sm font-normal text-slate-400">mins</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Delay to natural melatonin peak</div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Blue Light Load</div>
                  <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${avgBlueLight > 60 ? 'from-amber-400 to-rose-400' : 'from-teal-300 to-emerald-400'}`}>{avgBlueLight}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Circadian rhythm suppression</div>
                </div>
              </div>

              {/* Disruption Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Sleep Health Penalty</span>
                  <span className={totalDelay > 40 ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
                    {Math.min(100, Math.round(totalDelay * 1.2))}% Disrupted
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totalDelay > 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`}
                    style={{ width: `${Math.min(100, Math.max(10, totalDelay * 1.2))}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <p className="leading-snug">
                  {hasNonEdu 
                    ? `SleepGuard's late-night daemon flags non-educational apps past bedtime and automatically delivers a notification to the parent's device.`
                    : `Educational apps like Duolingo & Notion do not trigger high-priority parent alerts, fostering student study independence.`}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ⏰ Interactive Section 02: REM Sleep Cycle Bedtime Calculator */}
      <section id="calculator" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400 mb-2">Interactive Lab 02</div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            90-Minute REM Cycle Bedtime Calculator
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3">
            Human sleep follows 90-minute ultradian cycles. Waking up in the middle of a deep sleep cycle causes morning grogginess. Choose your wake-up goal:
          </p>
        </div>

        <div className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-white/10 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Set Desired Wake Up Time</label>
              <span className="text-xs text-slate-500">When does your morning alarm ring?</span>
            </div>
            <input 
              type="time" 
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-lg font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {calculatedBedtimes.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border text-center transition-all ${item.recommended ? 'bg-indigo-600/20 border-indigo-500/50 shadow-xl shadow-indigo-500/10 scale-105' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
              >
                {item.recommended && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full inline-block mb-2">
                    Optimal Goal
                  </span>
                )}
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300">{item.time}</div>
                <div className="text-xs text-indigo-300 font-semibold mt-1">{item.hours} hours ({item.cycles} cycles)</div>
                <div className="text-[10px] text-slate-400 mt-2">Natural wakeup without alarm shock</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🧠 Interactive Section 03: What's Keeping You Awake? Quiz */}
      <section id="quiz" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">Interactive Lab 03</div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            What's Keeping You Awake?
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-3">
            Answer 3 quick questions to discover your sleep archetype and get an instant AI action plan.
          </p>
        </div>

        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-white/10">
          {quizStep < quizQuestions.length ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>Step {quizStep + 1} of {quizQuestions.length}</span>
                <span className="text-indigo-400">{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}%</span>
              </div>

              <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">{quizQuestions[quizStep].question}</h3>

              <div className="space-y-3">
                {quizQuestions[quizStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuizAnswers({ ...quizAnswers, [quizStep]: opt });
                      setQuizStep(quizStep + 1);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-slate-900/70 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500 text-sm font-semibold text-slate-200 hover:text-white transition flex justify-between items-center group"
                  >
                    <span>{opt.label}</span>
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-xl shadow-indigo-500/20">
                ✨
              </div>
              <h3 className="text-2xl font-black text-white">Your Sleep Archetype: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-400">{quizAnswers[1]?.type || 'Midnight Doomscroller'}</span></h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                Late-night mobile stimulation is delaying your core sleep stages. SleepGuard's AI automatically buffers usage limits to protect your natural morning alertness.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/25">
                  Start Personalized Defense →
                </Link>
                <button onClick={() => { setQuizStep(0); setQuizAnswers({}); }} className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700">
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🎯 Audience Perspectives (Tabs) */}
      <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-400">
            Built for Students, Trusted by Parents
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-3">Explore tailored workflows built for each user perspective.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
            >
              🎓 For Students
            </button>
            <button
              onClick={() => setActiveTab('parents')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'parents' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
            >
              🛡️ For Parents
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
            >
              🔒 2FA & Privacy
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'students' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">📈</div>
                <h4 className="text-base font-bold text-white">Sleep Score Tracking</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Know how late-night apps affect your waking energy before tests and lectures.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">🤖</div>
                <h4 className="text-base font-bold text-white">Contextual AI Advice</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Personalized recommendations comparing your bedtime schedule against app categories.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">📚</div>
                <h4 className="text-base font-bold text-white">Study Whitelist</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Educational apps like Quizlet & Duolingo are whitelisted from triggering parent alerts.</p>
              </div>
            </div>
          )}

          {activeTab === 'parents' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">⚠️</div>
                <h4 className="text-base font-bold text-white">Late-Night Alerts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Receive automated alerts when children engage in gaming or social media after midnight.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">⏰</div>
                <h4 className="text-base font-bold text-white">Curfew Scheduling</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Set custom bedtime and wake-up goals with allowable screen-time limits.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">📊</div>
                <h4 className="text-base font-bold text-white">Weekly Summary</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Visual 7-day reports displaying sleep adherence and top late-night time drains.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">🔐</div>
                <h4 className="text-base font-bold text-white">2-Factor OTP</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Zero unauthorized logins with encrypted 6-digit email OTP verification.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">🛡️</div>
                <h4 className="text-base font-bold text-white">RBAC Security</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Strict role isolation ensuring student and parent dashboards remain secure and segmented.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="text-2xl">🔒</div>
                <h4 className="text-base font-bold text-white">JWT Encryption</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Cryptographic authorization tokens protecting all sleep and telemetry routes.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-10 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© 2026 SleepGuard. Mobile Usage Monitoring for Student Sleep Cycles.</div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300">Register</Link>
            <Link to="/dashboard" className="hover:text-slate-300">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
