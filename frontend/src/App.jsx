import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // 🔥 TAMBAHKAN IMPORT INI
import AuthModal from './components/AuthModal'; 
import Home from './pages/Home'; 
import Profile from './pages/Profile'; 

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewDashboard, setViewDashboard] = useState(false);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Auto-login checking pas pertama kali web di-load/refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setViewDashboard(true);
    }
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthOpen(false);
    setIsLoggedIn(true);
    setViewDashboard(true); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setViewDashboard(false); 
  };

  return (
    <Router>
      <Routes>
        {/* ================= ROUTE 1: HALAMAN UTAMA (LANDING ATAU FEED) ================= */}
        <Route 
          path="/" 
          element={
            // Menggunakan logika saklar lu yang lama untuk menentukan isi halaman '/'
            viewDashboard || isLoggedIn ? (
              <Home 
                isLoggedIn={isLoggedIn} 
                onLogout={handleLogout} 
                setIsAuthOpen={setIsAuthOpen} 
                setAuthMode={setAuthMode}     
              />
            ) : (
              /* TAMPILAN AWAL (LANDING PAGE) */
              <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] relative overflow-hidden font-sans selection:bg-blue-500/30">
                {/* BACKGROUND EFFECTS */}
                <div className="absolute inset-0 bg-[radial-gradient(#1f242c_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>
                <div className="absolute -right-40 -top-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 to-sky-500/0 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute -right-20 bottom-0 w-[500px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

                {/* NAVBAR */}
                <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-[#21262d] relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#0a66c2] text-white p-1.5 rounded-lg flex items-center justify-center font-bold text-sm tracking-tighter shadow-md shadow-blue-500/10">in</div>
                    <span className="text-xl font-extrabold text-white tracking-tight">Project<span className="text-[#58a6ff]">Space</span></span>
                  </div>
                  <button onClick={() => openAuth("login")} className="bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-md active:scale-95">
                    Masuk / Sign In
                  </button>
                </nav>

                {/* HERO SECTION */}
                <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
                  <div className="inline-flex items-center bg-[#111827] border border-[#1d4ed8]/40 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-mono text-blue-400 font-bold mb-8 shadow-sm">
                    Platform Karya & Jejaring Mahasiswa
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-3xl">
                    Ketika Kode Git Menemukan <br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400">Jaringan Profesional</span> Anda.
                  </h1>
                  <p className="text-sm md:text-base text-[#8b949e] max-w-2xl leading-relaxed mb-10 font-medium">
                    ProjectSpace adalah wadah hibrida tempat mahasiswa memamerkan kode, skema basis data MySQL, ulasan tugas, hingga integrasi hardware IoT.
                  </p>
                  
                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                    <button onClick={() => setViewDashboard(true)} className="w-full sm:w-auto bg-[#2ea44f] hover:bg-[#39d353] text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md active:scale-98">
                      Jelajahi Feed Karya
                    </button>
                    <button onClick={() => openAuth("register")} className="w-full sm:w-auto bg-transparent border border-[#30363d] hover:border-[#8b949e] hover:bg-[#21262d] text-white font-bold text-sm px-8 py-3 rounded-xl transition-all active:scale-98">
                      Daftarkan Akun Anda
                    </button>
                  </div>
                </main>
              </div>
            )
          } 
        />

        {/* ================= ROUTE 2: HALAMAN PROFILE BARU ================= */}
        <Route 
          path="/profile" 
          element={isLoggedIn ? <Profile /> : <Navigate to="/" replace />} 
        />
      </Routes>

      {/* ================= PORTAL GLOBAL AUTH MODAL ================= */}
      {/* Dilepaskan di luar router agar bisa diakses baik dari landing maupun feed */}
      {isAuthOpen && (
        <AuthModal 
          authMode={authMode} 
          setAuthMode={setAuthMode} 
          onClose={() => setIsAuthOpen(false)} 
          onLogin={handleLoginSuccess} 
        />
      )}
    </Router>
  );
}