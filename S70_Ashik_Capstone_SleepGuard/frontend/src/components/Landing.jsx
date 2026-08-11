import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [screenTime, setScreenTime] = useState(30);

  // Calculate mock score
  const score = Math.max(0, Math.round(100 - (screenTime * 0.6)));
  let scoreColor = 'text-emerald-400';
  let scoreRing = 'stroke-emerald-400';
  if (score < 80 && score >= 50) {
    scoreColor = 'text-yellow-400';
    scoreRing = 'stroke-yellow-400';
  } else if (score < 50) {
    scoreColor = 'text-red-400';
    scoreRing = 'stroke-red-400';
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate offset based on center of screen
      const x = (e.clientX / window.innerWidth - 0.5) * 40; 
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden relative selection:bg-indigo-500/30">
      {/* Interactive Parallax Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-transform duration-700 ease-out"
           style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen floating-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen floating-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen floating-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SleepGuard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Sign In</Link>
          <Link to="/register" className="px-4 py-2 md:px-5 md:py-2.5 text-sm font-bold bg-white text-slate-900 rounded-lg hover:bg-slate-200 hover:scale-105 active:scale-95 transition shadow-xl shadow-white/10">Try it out</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] px-4 text-center max-w-5xl mx-auto">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md animate-pulse">
          <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase cursor-default">🌙 Build better bedtime habits</span>
        </div>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Wake up feeling like <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 hover:opacity-80 transition-opacity cursor-default">yourself again.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          We've all been there—scrolling late at night when we should be sleeping. SleepGuard helps you track what's keeping you awake so you can finally get the rest you actually need.
        </p>

        {/* Interactive Score Predictor Widget */}
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-12 shadow-2xl hover:border-indigo-500/30 transition-colors duration-500 text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">How scrolling affects sleep</h3>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Interactive</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-2">Late-Night Screen Time: <span className="text-white font-bold">{screenTime} mins</span></label>
              <input 
                type="range" 
                min="0" 
                max="120" 
                value={screenTime} 
                onChange={(e) => setScreenTime(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-2">Drag to see how late-night phone use impacts your sleep score.</p>
            </div>
            
            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-800" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className={scoreRing} strokeDasharray="175" strokeDashoffset={175 - (175 * score) / 100} style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
               </svg>
               <span className={`absolute font-bold text-lg ${scoreColor}`}>{score}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
          <Link to="/register" className="px-8 py-4 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 active:scale-95 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group">
            Create an account
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-bold bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white rounded-xl hover:scale-105 active:scale-95 transition-all backdrop-blur-sm flex items-center justify-center">
            How it works
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-4 max-w-7xl mx-auto mt-10 group">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 group-hover:text-indigo-300 transition-colors duration-500">Helping you sleep better</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to understand your habits and get to bed on time.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-3xl border-t border-l border-white/10 hover:-translate-y-4 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-default">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 hover:scale-110 hover:rotate-3 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Know where your time goes</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              We gently track late-night app usage so you can see exactly which apps are keeping you awake past your bedtime.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-t border-l border-white/10 hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-default relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-700"></div>
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 hover:scale-110 hover:-rotate-3 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Friendly, personalized tips</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Get simple advice based on your daily habits to help you fall asleep faster and wake up feeling refreshed.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-t border-l border-white/10 hover:-translate-y-4 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-default">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 hover:scale-110 hover:rotate-3 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Keep parents in the loop</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              For younger users, parents can get a quick nudge if phones are being used for gaming or social media way past bedtime.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-8 text-center text-slate-500 text-sm mt-10">
        <p>© 2026 SleepGuard. Because good days start at night.</p>
      </footer>
    </div>
  );
};

export default Landing;
