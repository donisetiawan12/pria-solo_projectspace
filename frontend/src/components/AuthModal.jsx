import { useState } from 'react';
import API from '../utils/api'; 
import Swal from 'sweetalert2'; // Import alert keren

export default function AuthModal({ onClose, authMode, setAuthMode, onLogin }) {
  // State untuk form login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // State untuk form register
  const [regName, setRegName] = useState("");
  const [regNim, setRegNim] = useState(""); 
  const [regEmail, setRegEmail] = useState("");
  const [regHeadline, setRegHeadline] = useState(""); 
  const [regPassword, setRegPassword] = useState("");

  // 1. FUNGSI LOGIN (Pake SweetAlert2)
  const handleManualLogin = async (e) => {
    e.preventDefault();
    
    // Tampilkan loading spinner biar user tau lagi proses
    Swal.fire({
      title: 'Memverifikasi Akun...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await API.post('/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user || { name: loginEmail }));
        
        // Alert Sukses Keren
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: 'Selamat datang kembali di ProjectSpace Hub',
          timer: 2000,
          showConfirmButton: false,
          background: '#161b22',
          color: '#ffffff',
          iconColor: '#39d353'
        }).then(() => {
          onLogin(); 
        });
      }
    } catch (error) {
      // Alert Gagal Keren
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.response?.data?.message || 'Cek kembali email dan password lu!',
        background: '#161b22',
        color: '#ffffff',
        confirmButtonColor: '#0a66c2'
      });
    }
  };

  // 2. FUNGSI REGISTER (SUDAH DISESUAIKAN DENGAN BACKEND & DB BRO!)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Membuat Akun Baru...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // SINKRONISASI PAYLOAD: Kirim identity (NIM) dan bio (Headline) ke backend
      await API.post('/auth/register', {
        name: regName,
        email: regEmail,
        identity: regNim,       // <--- Dikirim sebagai 'identity' sesuai controller
        bio: regHeadline,       // <--- Dikirim sebagai 'bio' sesuai controller
        password: regPassword
      });

      // Alert Regis Sukses Keren
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Akun lu udah aktif, silakan login bro!',
        background: '#161b22',
        color: '#ffffff',
        confirmButtonColor: '#2ea44f'
      }).then(() => {
        // Reset form register biar bersih
        setRegName("");
        setRegNim("");
        setRegEmail("");
        setRegHeadline("");
        setRegPassword("");
        setAuthMode("login"); // Pindah tab otomatis ke Sign In
      });

    } catch (error) {
      // Alert Regis Gagal Keren
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: error.response?.data?.message || 'Gagal mendaftarkan akun baru.',
        background: '#161b22',
        color: '#ffffff',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      {/* Box Utama dengan Glassmorphism & Border Glow */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md p-7 shadow-[0_0_50px_-12px_rgba(56,189,248,0.15)] text-[#c9d1d9] relative transform transition-all duration-300 scale-100">
        
        {/* Tombol Close */}
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors duration-200 bg-transparent border-0 cursor-pointer">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header Title */}
        <div className="text-center mb-6 mt-2">
          <h3 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent m-0">
            ProjectSpace Hub
          </h3>
          <p className="text-xs text-[#8b949e] mt-1 font-medium m-0">Platform Portofolio & Showroom Mahasiswa</p>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        <div className="flex gap-2 bg-[#0d1117] p-1 rounded-xl border border-solid border-[#30363d] mb-5 text-xs font-bold">
          <button 
            type="button" 
            onClick={() => setAuthMode("login")} 
            className={`flex-1 py-2 text-center rounded-lg transition-all duration-200 cursor-pointer ${authMode === "login" ? "bg-[#21262d] text-white shadow-md border border-solid border-[#444c56]" : "text-[#8b949e] hover:text-white bg-transparent border-0"}`}
          >
            <i className="fa-solid fa-right-to-bracket mr-1.5"></i> Sign In
          </button>
          <button 
            type="button" 
            onClick={() => setAuthMode("register")} 
            className={`flex-1 py-2 text-center rounded-lg transition-all duration-200 cursor-pointer ${authMode === "register" ? "bg-[#21262d] text-white shadow-md border border-solid border-[#444c56]" : "text-[#8b949e] hover:text-white bg-transparent border-0"}`}
          >
            <i className="fa-solid fa-user-plus mr-1.5"></i> Create Account
          </button>
        </div>

        {/* ================= FORM SIGN IN ================= */}
        {authMode === "login" ? (
          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div className="flex flex-col text-left">
              <label className="block text-[#8b949e] font-semibold mb-1.5">Email Akademik</label>
              <input 
                type="email" 
                required 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                placeholder="nim@mahasiswa.ac.id" 
                className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
              />
            </div>
            <div className="flex flex-col text-left">
              <label className="block text-[#8b949e] font-semibold mb-1.5">Password</label>
              <input 
                type="password" 
                required 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
              />
            </div>
            
            <button type="submit" className="w-full bg-[#2ea44f] hover:bg-[#39d353] text-white font-bold py-2.5 rounded-xl transition-all border-0 cursor-pointer shadow-[0_4px_12px_rgba(46,164,79,0.2)] hover:shadow-[0_4px_20px_rgba(57,211,83,0.4)]">
              Masuk ke Akun
            </button>
          </form>
        ) : (
          /* ================= FORM CREATE ACCOUNT ================= */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div className="flex flex-col text-left">
              <label className="block text-[#8b949e] font-semibold mb-1">Nama Lengkap Mahasiswa</label>
              <input 
                type="text" 
                required 
                value={regName} 
                onChange={(e) => setRegName(e.target.value)} 
                placeholder="Contoh: Doni Setiawan" 
                className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col text-left">
                <label className="block text-[#8b949e] font-semibold mb-1">NIM / Identitas</label>
                <input 
                  type="text" 
                  required 
                  value={regNim} 
                  onChange={(e) => setRegNim(e.target.value)} 
                  placeholder="01102240" 
                  className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
                />
              </div>
              <div className="flex flex-col text-left">
                <label className="block text-[#8b949e] font-semibold mb-1">Email Aktif</label>
                <input 
                  type="email" 
                  required 
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)} 
                  placeholder="doni@gmail.com" 
                  className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
                />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <label className="block text-[#8b949e] font-semibold mb-1">Headline Kompetensi (Bio Singkat)</label>
              <input 
                type="text" 
                required 
                value={regHeadline} 
                onChange={(e) => setRegHeadline(e.target.value)} 
                placeholder="Contoh: Fullstack Developer / UI/UX Enthusiast" 
                className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
              />
            </div>
            <div className="flex flex-col text-left">
              <label className="block text-[#8b949e] font-semibold mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)} 
                placeholder="Minimal 6 karakter" 
                className="w-full bg-[#0d1117] border border-solid border-[#30363d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all box-border" 
              />
            </div>
            
            <button type="submit" className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold py-2.5 rounded-xl transition-all mt-2 border-0 cursor-pointer shadow-[0_4px_12px_rgba(10,102,194,0.2)] hover:shadow-[0_4px_20px_rgba(0,65,130,0.4)]">
              Daftar Akun Baru
            </button>
          </form>
        )}
      </div>
    </div>
  );
}