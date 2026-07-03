import React, { useState, useEffect } from 'react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  proteksiAksi, 
  setIsProjectModalOpen, 
  isLoggedIn, 
  user, 
  isProfileDropdownOpen, 
  setIsProfileDropdownOpen, 
  navigate, 
  onLogout, 
  bukaModalLogin 
}) {

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 🔄 FETCH DATA NOTIFIKASI DARI DATABASE
  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/notifications/my-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const resData = await response.json();
        setNotifications(resData.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data notifikasi:", error);
    }
  };

  // 🔥 SYSTEM AUTO-FETCH (POLLING REAL-TIME 5 DETIK SEKALI)
  useEffect(() => {
    // Ambil data pertama kali saat user login
    fetchNotifications();

    if (isLoggedIn) {
      // Set interval biar frontend ngetok pintu backend tiap 5 detik (5000 ms)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);

      // Bersihkan interval kalau user logout atau pindah halaman biar ram gak bengkak
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Hitung jumlah notifikasi unread dari DB (is_read === 0 atau !is_read)
  const unreadCount = notifications.filter(n => n.is_read === 0 || !n.is_read).length;

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'bookmark': return '🔖';
      case 'follow': return '👤';
      default: return '🔔';
    }
  };

  // Menerjemahkan tipe dari DB menjadi kalimat teks yang rapi
  const getNotifText = (notif) => {
    switch (notif.type) {
      case 'like': return `menyukai project Anda "${notif.project_title || ''}"`;
      case 'comment': return `mengomentari repo Anda: "${notif.project_title || ''}"`;
      case 'bookmark': return `menambahkan project Anda "${notif.project_title || ''}" ke bookmark.`;
      case 'follow': return `mulai mengikuti Anda.`;
      default: return `berinteraksi dengan Anda.`;
    }
  };

  // 🔄 FUNGSI KETIKA LONCENG DIKLIK: Buka dropdown & update status dibaca ke DB
  const handleOpenNotif = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
    
    // Jika dropdown dibuka dan ada notifikasi yang belum dibaca, tembak API mark-as-read
    if (!isNotifOpen && unreadCount > 0) {
      // Optimistic update di frontend dulu biar instan angkanya ilang
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));

      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:3000/notifications/mark-as-read', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Gagal update status read ke database:", error);
      }
    }
  };

  // Fungsi helper untuk memformat waktu
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <nav className="home-navbar sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="nav-left flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate && navigate('/')}>
          <div className="bg-[#0a66c2] text-white p-1.5 rounded-md flex items-center justify-center font-bold text-xs tracking-tighter">PS</div>
          <span className="text-lg font-black tracking-tight text-[#0a66c2]">
            Project<span className="text-slate-800"> Space</span>
          </span>
        </div>
        <div className="search-container flex-1 max-w-xs hidden sm:block">
          <input 
            type="text" 
            placeholder="Cari portofolio, tech stack..." 
            className="search-input w-full bg-slate-100 border-0 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="nav-right flex items-center gap-4 shrink-0 text-slate-600 font-bold text-xs">
        
        {/* ================= 🔔 FITUR NOTIFIKASI AUTO-FETCH ================= */}
        {isLoggedIn && user && (
          <div className="relative">
            <button 
              type="button"
              onClick={handleOpenNotif}
              className="bg-transparent border-0 text-lg cursor-pointer p-1 relative hover:opacity-80 transition-opacity focus:outline-none flex items-center justify-center"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN BOX NOTIFIKASI */}
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotifOpen(false)}></div>
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-left animate-fade-in animate-slide-up">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="font-black text-slate-800 text-xs">Notifikasi Masuk</span>
                    <button onClick={fetchNotifications} className="text-[10px] text-blue-500 bg-transparent border-0 cursor-pointer font-bold hover:underline">Refresh</button>
                  </div>

                  <div className="max-h-72 overflow-y-auto flex flex-col">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        📭 Belum ada notifikasi baru di database lu.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 flex gap-2.5 items-start border-b border-slate-50 transition-colors hover:bg-blue-50/40 cursor-pointer ${(notif.is_read === 0 || !notif.is_read) ? 'bg-blue-50/20' : ''}`}
                        >
                          {notif.sender_avatar ? (
                            <img 
                              src={notif.sender_avatar.startsWith('http') ? notif.sender_avatar : `http://localhost:3000/uploads/${notif.sender_avatar}`} 
                              alt="Sender" 
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-100"
                            />
                          ) : (
                            <span className="text-sm mt-0.5 shrink-0">{getNotifIcon(notif.type)}</span>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-700 m-0 font-medium leading-normal">
                              <strong className="text-slate-900 font-extrabold">{notif.sender_name || 'Seseorang'}</strong> {getNotifText(notif)}
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1 font-semibold">{formatTime(notif.created_at)}</span>
                          </div>
                          {(notif.is_read === 0 || !notif.is_read) && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* ============================================================ */}

        <button 
          type="button"
          onClick={() => navigate && navigate('/')}
          className="hover:text-black border-b-2 border-slate-800 py-1 px-1 bg-transparent border-t-0 border-x-0 cursor-pointer font-bold"
        >
          Beranda
        </button>
        <button 
          type="button"
          onClick={() => proteksiAksi() && setIsProjectModalOpen(true)} 
          className="hover:text-black py-1 px-1 bg-transparent border-0 cursor-pointer font-bold"
        >
          Bagikan Repo
        </button>
        
        {isLoggedIn && user ? (
          <div className="relative border-l border-slate-200 pl-4 flex items-center">
            <div 
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                if (isNotifOpen) setIsNotifOpen(false);
              }} 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity select-none"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000/uploads/${user.avatar}`} 
                  alt="Profil" 
                  className="w-8 h-8 rounded-full object-cover shadow-inner" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-inner">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="text-left hidden sm:flex items-center gap-0.5">
                <span className="font-black text-slate-900 text-xs leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500">▼</span>
              </div>
            </div>

            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileDropdownOpen(false)}></div>
                <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-3 text-left animate-fade-in animate-slide-up">
                  <div className="px-4 pb-3 flex gap-3 items-center border-b border-slate-100">
                    {user.avatar ? (
                      <img 
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000/uploads/${user.avatar}`} 
                        alt="Profil" 
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-black text-slate-900 truncate m-0">{user.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate m-0 mt-0.5 font-medium">{user.bio}</p>
                    </div>
                  </div>

                  <div className="p-3 border-b border-slate-100">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/profile'); 
                      }}
                      className="w-full bg-transparent hover:bg-blue-50 text-[#0a66c2] border border-[#0a66c2] rounded-full py-1 text-xs font-bold cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>

                  <div className="flex flex-col py-1 text-slate-600 font-bold text-[11px]">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="px-4 py-2 mt-1 hover:bg-red-50 text-red-500 text-left bg-transparent border-0 cursor-pointer font-bold transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="border-l border-slate-200 pl-4">
            <button type="button" onClick={bukaModalLogin} className="btn-primary">Login / Masuk</button>
          </div>
        )}
      </div>
    </nav>
  );
}