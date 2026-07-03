import React, { useState, useEffect } from 'react';

export default function SidebarLeft({ user: propsUser, isLoggedIn, setIsProfileModalOpen, setActiveProjectDetails }) {  
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 SAKTI 1: Saat pertama kali muncul, lgsg intip localStorage biar dapet data paling segar
  const [currentUser, setCurrentUser] = useState(() => {
    const localData = localStorage.getItem('user');
    return localData ? JSON.parse(localData) : propsUser;
  });

  // 🔥 SAKTI 2: Setiap kali komponen induk me-render ulang / oper props baru, proteksi data sidebar
  useEffect(() => {
    const localData = localStorage.getItem('user');
    if (localData) {
      setCurrentUser(JSON.parse(localData));
    } else if (propsUser) {
      setCurrentUser(propsUser);
    }
  }, [propsUser]);

  // 🔥 SAKTI 3: Event listener real-time jika sewaktu-waktu profil diubah tanpa pindah halaman
  useEffect(() => {
    const handleProfileRefresh = () => {
      const localData = localStorage.getItem('user');
      if (localData) {
        try {
          setCurrentUser(JSON.parse(localData));
        } catch (e) {
          console.error("Gagal refresh data user di sidebar:", e);
        }
      }
    };

    window.addEventListener("profileUpdated", handleProfileRefresh);
    window.addEventListener("storage", handleProfileRefresh); 
    
    return () => {
      window.removeEventListener("profileUpdated", handleProfileRefresh);
      window.removeEventListener("storage", handleProfileRefresh);
    };
  }, []);

  // 🔄 FUNGSI AMBIL DATA BOOKMARK DARI BACKEND + SUNTIK DATA AUTHOR
  const fetchMyBookmarks = async (showLoading = false) => {
    if (!isLoggedIn) return;
    if (showLoading) setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/bookmarks/my-bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const resData = await response.json();
        const rawBookmarks = resData.data || [];

        // 💡 Format data mentah dari DB biar punya objek 'author'
        const formattedBookmarks = rawBookmarks.map(proj => {
          if (!proj.author) {
            return {
              ...proj,
              author: {
                name: currentUser?.name || 'User',
                avatar: currentUser?.avatar || null,
                nim: currentUser?.nim || 'Mahasiswa' // 🟢 FIX: university diganti ke nim
              }
            };
          }
          return proj;
        });

        setSavedProjects(formattedBookmarks);
      }
    } catch (error) {
      console.error("Gagal load bookmark di sidebar:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 🔥 SYSTEM AUTO-FETCH SIDEBAR
  useEffect(() => {
    if (isLoggedIn) {
      // Panggil pertama kali dengan efek loading aktif
      fetchMyBookmarks(true);

      // Set interval untuk terus ngecek database tiap 2 detik
      const interval = setInterval(() => {
        fetchMyBookmarks(false);
      }, 2000);

      // Bersihkan interval biar gak makan ram pas pindah page / logout
      return () => clearInterval(interval);
    } else {
      setSavedProjects([]);
    }
  }, [isLoggedIn, currentUser]);

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  return (
    <div className="flex flex-col gap-4 sticky top-4 h-fit">
      
      {/* CARD PROFIL USER */}
      <div 
        onClick={() => isLoggedIn && setIsProfileModalOpen(true)} 
        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center cursor-pointer hover:shadow-md hover:scale-[1.005] transition-all duration-200 overflow-hidden group"
      >
        {/* BANNER BACKGROUND */}
        {currentUser?.banner ? (
          <div className="h-14 w-full group-hover:opacity-95 transition-opacity">
            <img 
              src={currentUser.banner.startsWith('http') ? currentUser.banner : `http://localhost:3000/uploads/${currentUser.banner}`} 
              alt="Mini Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-14 bg-gradient-to-r from-blue-700 to-blue-500 group-hover:opacity-95 transition-opacity"></div>
        )}
        
        <div className="px-4 pb-5 relative">
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:3000/uploads/${currentUser.avatar}`} 
              alt="Profil Utama" 
              className="w-16 h-16 rounded-full border-4 border-white mx-auto -mt-8 shadow-md object-cover" 
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-white text-white flex items-center justify-center font-black text-xl mx-auto -mt-8 shadow-md">
              {getInitials(currentUser?.name)}
            </div>
          )}

          {/* 🟢 CARI BAGIAN JUDUL H4 INI DI SIDEBARLEFT LU, TRUS GANTI JADI KAYAK GINI: */}
<h4 className="text-sm font-black text-slate-900 mt-2 m-0 group-hover:text-blue-600 transition-colors flex flex-col items-center">
  {/* Nama User */}
  <span>{currentUser?.name}</span>
  
  {/* 🎯 NIM ditaruh tepat di bawah nama */}
  {isLoggedIn && currentUser?.nim && (
    <span className="text-[10px] text-[#4f46e5] bg-[#e0e7ff] px-2 py-0.5 rounded font-black tracking-wide uppercase mt-1">
      NIM {currentUser.nim}
    </span>
  )}
</h4>

          <p className="text-[11px] text-slate-500 mt-1.5 leading-normal px-2 font-medium m-0">
            {currentUser?.bio || 'Belum ada bidang keahlian 🚀'}
          </p>

          {isLoggedIn && (
            <span className="text-[9px] text-blue-500 font-bold block mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              ⚙️ Klik untuk ubah profil
            </span>
          )}
        </div>
      </div>

      {/* CARD WIDGET BOOKMARK */}
      {isLoggedIn && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 className="text-xs font-black text-slate-800 m-0 flex items-center gap-1.5">
              🔖 Project Tersimpan
            </h5>
            <span className="bg-blue-50 text-blue-600 font-black text-[10px] px-2 py-0.5 rounded-full animate-fade-in">
              {savedProjects.length}
            </span>
          </div>

          {/* LIST MINI PROJECT */}
          <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1">
            {loading ? (
              <p className="text-[10px] text-slate-400 text-center m-0 py-2">Memuat data...</p>
            ) : savedProjects.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center m-0 py-4 font-normal">
                Belum ada project yang disimpan.
              </p>
            ) : (
              savedProjects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100/70 transition-all cursor-pointer group/item"
                  onClick={() => {
                    console.log("ISI DATA BOOKMARK DARI SIDEBAR:", proj);
                    setActiveProjectDetails(proj);
                  }}
                >
                  {proj.image ? (
                    <img src={proj.image} className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-100" alt={proj.title} />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">💻</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 m-0 truncate group-hover/item:text-blue-600 transition-colors">{proj.title}</p>
                    <p className="text-[9px] text-slate-400 m-0 truncate">{proj.description?.replace(/[#*]/g, '') || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}