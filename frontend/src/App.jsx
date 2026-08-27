import React, { useState, useEffect } from 'react';

import ComplaintForm from './ComplaintForm';
import TrackStatus from './TrackStatus';

import PublicDashboard from './PublicDashboard';
import PwaPrompt from './PwaPrompt';

/* ─────────────────── tiny SVG icons ─────────────────── */
const Icon = {
  mic: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>,
  edit: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  home: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  file: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  grid: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  x: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  shield: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
  zap: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  globe: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};


/* ─────────────────── Stat Card ─────────────────── */
function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <span className="w-6 h-6">{icon}</span>
      </div>
      <div className="flex-1">
        {value === '...' ? (
          <div className="h-8 w-20 bg-slate-200 rounded-md animate-pulse mb-1"></div>
        ) : (
          <p className="text-2xl font-black text-slate-900">{value}</p>
        )}
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────── Feature Card ─────────────────── */
function FeatureCard({ icon, title, desc, tag, tagColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
          <span className="w-5 h-5">{icon}</span>
        </div>
        {tag && <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${tagColor}`}>{tag}</span>}
      </div>
      <h3 className="font-bold text-slate-800 text-base mb-1">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─────────────────── Bottom Nav ─────────────────── */
function BottomNav({ currentView, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Icon.home },
    { id: 'file', label: 'File', icon: Icon.edit },
    { id: 'track', label: 'Track', icon: Icon.search },
    { id: 'dashboard', label: 'Stats', icon: Icon.grid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 md:hidden z-50 px-2 pb-safe">
      <div className="flex items-center justify-around py-1">
        {tabs.map(tab => {
          const active = tab.id === currentView || (tab.id === 'file' && currentView === 'file');
          return (
            <button key={tab.id} onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                active ? 'text-primary-900' : 'text-slate-400'
              }`}>
              <span className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`}>{tab.icon}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? 'text-primary-900' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {active && <span className="w-1 h-1 rounded-full bg-primary-700 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─────────────────── HOME PAGE ─────────────────── */
function HomePage({ onFileComplaint, onTrack, onDashboard }) {
  const [stats, setStats] = useState({
    totalComplaints: '...',
    overallResolutionRate: '...',
    avgResolutionDays: '...',
    totalDepartments: '...',
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalComplaints: data.totalComplaints,
          overallResolutionRate: data.overallResolutionRate,
          avgResolutionDays: data.avgResolutionDays,
          totalDepartments: data.totalDepartments,
        });
      })
      .catch(err => console.error("Failed to load stats:", err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-12">

      {/* Hero */}
      <div className="relative bg-primary-950 rounded-3xl overflow-hidden mb-6 text-white p-8 md:p-12">
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary-700/40" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-brand-green/20" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-4 text-white/80">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            AI-Powered Grievance Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
            Speak Up.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-primary-300">
              Get Heard.
            </span>
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-md leading-relaxed mb-8">
            File civic or legal complaints using your voice in Hindi or English. AI structures it. We track it. You stay informed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => onFileComplaint()}
              className="flex items-center justify-center gap-2.5 bg-white text-primary-900 font-bold px-6 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
              <span className="w-5 h-5">{Icon.mic}</span>
              File a Complaint
            </button>
            <button onClick={onTrack}
              className="flex items-center justify-center gap-2.5 bg-white/10 border border-white/25 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-colors">
              <span className="w-5 h-5">{Icon.search}</span>
              Track Status
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Icon.file} value={stats.totalComplaints} label="Complaints Filed" color="bg-primary-50 text-primary-700" />
        <StatCard icon={Icon.check} value={stats.overallResolutionRate !== '...' ? `${stats.overallResolutionRate}%` : '...'} label="Resolution Rate" color="bg-brand-green/20 text-brand-green" />
        <StatCard icon={Icon.zap} value={stats.avgResolutionDays !== '...' ? `${stats.avgResolutionDays} days` : '...'} label="Avg Resolution" color="bg-brand-amber/20 text-brand-amber" />
        <StatCard icon={Icon.globe} value={stats.totalDepartments} label="Departments" color="bg-primary-100 text-primary-800" />
      </div>

      {/* Feature Cards */}
      <h2 className="text-lg font-black text-slate-900 mb-3">What you can do</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <FeatureCard
          icon={Icon.mic}
          title="Voice to Complaint"
          desc="Speak in Hindi or English. AI converts it to a structured form automatically."
          tag="AI"
          tagColor="bg-primary-100 text-primary-800"
        />
        <FeatureCard
          icon={Icon.shield}
          title="Civic & Legal Track"
          desc="From potholes to police complaints — file any grievance to the right authority."
          tag="Secure"
          tagColor="bg-green-100 text-green-800"
        />
        <FeatureCard
          icon={Icon.search}
          title="Real-time Tracking"
          desc="Get a reference number and track every stage of your complaint publicly."
          tag="Transparent"
          tagColor="bg-amber-100 text-amber-800"
        />
      </div>

      {/* About E-Samadhan */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">💡</span>
            About E-Samadhan
          </h2>
          
          <div className="space-y-5 text-slate-600 leading-relaxed font-medium">
            <p>
              Every year, thousands of citizens walk into a police station to report a theft — and walk out with a complaint that says "lost." Not stolen. Lost. Because it's easier to write, easier to close, and easier to forget.
            </p>
            <p>
              This happened to my family. Twice. Once in 2023, when my own phone was stolen and the report was quietly changed to "lost." Again in 2025, when the same thing happened to my grandfather in the middle of a market, in broad daylight. Both times, we walked away with no case, no tracking, and no accountability. Just silence.
            </p>
            <p className="text-lg font-bold text-slate-800">
              E-Samadhan exists because filing a complaint should not be harder than the crime itself.
            </p>
            <p>
              We built a platform where any citizen — regardless of education, literacy, or comfort with technology — can register a complaint simply by speaking. No confusing forms. No jargon. Just describe the problem in your own words, and AI structures it into a proper complaint for you to review and submit.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 my-6">
              <p className="font-bold text-slate-800 mb-3">Every complaint gets:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span>Instant routing to the right department or nearest police station</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span>A dedicated officer or team assigned with a resolution deadline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span>A unique tracking code, so you can check the status anytime — from home, without ever standing in a queue again</span>
                </li>
              </ul>
            </div>
            
            <p>
              We believe accountability shouldn't be a privilege reserved for those who know how to "follow up." It should be built into the system itself.
            </p>
            <p>
              This platform started as one person's frustration. We believe it can become every citizen's right to be heard — and followed through on.
            </p>
            <p className="text-primary-700 font-bold italic mt-8">
              "Small steps, not giant leaps, are what truly move the world forward."
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard CTA */}
      <div onClick={onDashboard}
        className="cursor-pointer bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-6 flex items-center justify-between text-white group hover:from-primary-700 hover:to-primary-600 transition-all">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Public Accountability</p>
          <p className="text-lg font-black">View Transparency Dashboard →</p>
          <p className="text-sm text-white/70 mt-0.5">Department-wise resolution rates & slowest performers</p>
        </div>
        <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ml-4">
          <span className="w-5 h-5">{Icon.grid}</span>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── ROOT APP ─────────────────── */
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [trackRef, setTrackRef] = useState('');

  const openTracker = (ref = '') => {
    setTrackRef(ref);
    setCurrentView('track');
  };

  window.handleTrackNewComplaint = openTracker;

  const handleBottomNav = (id) => {
    if (id === 'file')    return setCurrentView('file');
    if (id === 'track')   return openTracker();
    setCurrentView(id);
  };

  const isSubView = currentView !== 'home';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PwaPrompt />

      {/* ── HEADER ── */}
      <header className="glass sticky top-0 z-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary-900 rounded-xl flex items-center justify-center text-white">
              <span className="w-4 h-4">{Icon.shield}</span>
            </div>
            <span className="font-black text-primary-950 text-lg tracking-tight hidden sm:block">E-Samadhan</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'track', label: 'Track Status' },
              { id: 'dashboard', label: 'Dashboard' },
            ].map(link => (
              <button key={link.id}
                onClick={() => link.id === 'track' ? openTracker() : setCurrentView(link.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  currentView === link.id
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                {link.label}
              </button>
            ))}
            </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentView('file')}
              className="hidden sm:flex btn-primary items-center gap-2 py-2 px-4 text-sm">
              <span className="w-4 h-4">{Icon.edit}</span>
              File Complaint
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full">
        {currentView === 'home' && (
          <HomePage
            onFileComplaint={() => setCurrentView('file')}
            onTrack={() => openTracker()}
            onDashboard={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'file'         && <div className="max-w-2xl mx-auto px-4 py-6 pb-28"><ComplaintForm onBack={() => setCurrentView('home')} /></div>}
        {currentView === 'track'        && <div className="max-w-2xl mx-auto px-4 py-6 pb-28"><TrackStatus onBack={() => setCurrentView('home')} defaultRef={trackRef} /></div>}
        {currentView === 'my_complaints'&& <div className="max-w-2xl mx-auto px-4 py-6 pb-28"><MyComplaints onBack={() => setCurrentView('home')} onTrack={openTracker} /></div>}
        {currentView === 'admin'        && <div className="px-4 py-6 pb-28"><AdminPanel onBack={() => setCurrentView('home')} /></div>}
        {currentView === 'dashboard'    && <div className="px-4 py-6 pb-28"><PublicDashboard onBack={() => setCurrentView('home')} /></div>}
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <BottomNav currentView={currentView} onNavigate={handleBottomNav} />

      {/* ── FOOTER (desktop) ── */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-slate-400">
          <span className="font-semibold text-slate-600">🌿 E-Samadhan</span>
          <span>© {new Date().getFullYear()} — Built for Bharat's last mile</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
