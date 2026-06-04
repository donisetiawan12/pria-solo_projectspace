import { useState } from 'react';
import Navbar from './components/Navbar';
import SidebarLeft from './components/SidebarLeft';
import FeedMiddle from './components/FeedMiddle';
import SidebarRight from './components/SidebarRight';
import LogConsole from './components/LogConsole';
import AuthModal from './components/AuthModal';
import ProjectModal from './components/ProjectModal';

export default function App() {
  // --- 1. STATE GLOBAL ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default: belum login
  const [activeTab, setActiveTab] = useState("feed");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [selectedProject, setSelectedProject] = useState(null);
  const [logs, setLogs] = useState([{ type: "info", text: "Selamat datang di ProjectSpace!" }]);

  // --- 2. DATA DUMMY ---
  const [user] = useState({ name: "Doni Setiawan", avatar: "DS", headline: "Full Stack Developer" });
  const [projects] = useState([{ id: 1, title: "E-Kantin", description: "Sistem digital.", creator_name: "Doni Setiawan" }]);

  // --- 3. FUNGSI ---
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setLogs(prev => [...prev, { type: "success", text: "Login berhasil!" }]);
  };

  // --- 4. RENDER: LANDING PAGE (BELUM LOGIN) ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#0a66c2] text-white flex flex-col items-center justify-center p-6">
        <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl">
          <div className="font-black text-xl">ProjectSpace</div>
          <button onClick={() => { setAuthMode("login"); setShowAuthModal(true); }} className="bg-[#0a66c2] border border-white/20 px-4 py-2 rounded text-xs font-bold hover:bg-[#004182]">
            Masuk / Sign In
          </button>
        </nav>

        <div className="text-center max-w-2xl">
          <div className="text-[10px] uppercase tracking-widest bg-blue-900/50 inline-block px-3 py-1 rounded-full mb-4">Platform Karya & Jejaring Mahasiswa</div>
          <h1 className="text-5xl font-bold leading-tight">Ketika Kode Git Menemukan <span className="text-[#58a6ff]">Jaringan Profesional Anda.</span></h1>
          <p className="mt-6 text-slate-300 text-sm">ProjectSpace adalah wadah hibrida tempat mahasiswa memamerkan kode, skema basis data, dan kolaborasi.</p>
          <div className="mt-8 flex gap-4 justify-center">
            <button onClick={() => setIsLoggedIn(true)} className="bg-[#2ea44f] hover:bg-[#39d353] px-6 py-3 rounded-lg font-bold text-sm">Jelajahi Feed Karya</button>
            <button onClick={() => { setAuthMode("register"); setShowAuthModal(true); }} className="bg-transparent border border-white/30 hover:bg-white/10 px-6 py-3 rounded-lg font-bold text-sm">Daftarkan Akun Anda</button>
          </div>
        </div>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} authMode={authMode} setAuthMode={setAuthMode} onLogin={handleLoginSuccess} />}
      </div>
    );
  }

  // --- 5. RENDER: DASHBOARD (SUDAH LOGIN) ---
  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col">
      <Navbar setActiveTab={setActiveTab} setShowAuthModal={setShowAuthModal} />
      
      <main className="flex-grow max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 p-4">
        <SidebarLeft user={user} setActiveTab={setActiveTab} />
        <FeedMiddle projects={projects} setActiveTab={setActiveTab} setSelectedProject={setSelectedProject} />
        <SidebarRight />
      </main>

      <LogConsole logs={logs} />
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}