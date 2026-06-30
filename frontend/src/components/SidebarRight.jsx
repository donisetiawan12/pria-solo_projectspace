import React, { useState, useEffect } from 'react';
import API from '../utils/api'; 

// 🔥 1. TERIMA PROP FUNGSI LOGIN NAVBAR DI SINI
export default function SidebarRight({ rekomendasiUsers = [], bukaModalLogin }) {
  const [followingStates, setFollowingStates] = useState({});


  // Sync ulang state tombol setiap kali data rekomendasiUsers berubah (termasuk pasca login/logout)
useEffect(() => {
  if (rekomendasiUsers && rekomendasiUsers.length > 0) {
    const initialStates = {};
    rekomendasiUsers.forEach((user) => {
      // Set true jika isFollowing dari DB bernilai true
      initialStates[user.id] = !!user.isFollowing; 
    });
    setFollowingStates(initialStates);
  }
}, [rekomendasiUsers]);

  const handleFollowToggle = async (targetUser) => {
    const targetId = targetUser.id; 
    const isCurrentlyFollowing = !!followingStates[targetId];

    // 🔒 2. PROTEKSI LOGIN: KALO BELUM LOGIN, LANGSUNG PANGGIL FUNGSI NAVBAR!
    const token = localStorage.getItem('token'); 
    if (!token) {
      if (bukaModalLogin) {
        bukaModalLogin(); // 🚀 Dorr! Otomatis manggil modal login utama lu yang bener
      } else {
        console.error("Fungsi bukaModalLogin belum dioper dari Home.jsx");
      }
      return; 
    }

    // Update UI secara Instan (Optimistic Update)
    setFollowingStates((prev) => ({
      ...prev,
      [targetId]: !isCurrentlyFollowing,
    }));

    try {
      const response = await API.post(`/follows/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      
      const statusAkhir = response.data.message === 'Follow';
      localStorage.setItem(`following_${targetId}`, statusAkhir);

      setFollowingStates((prev) => ({
        ...prev,
        [targetId]: statusAkhir,
      }));

    } catch (error) {
      console.error("Gagal melakukan toggle follow di DB:", error);
      setFollowingStates((prev) => ({
        ...prev,
        [targetId]: isCurrentlyFollowing,
      }));
    }
  };

  // ... sisa kode getInitials dan return JSX ke bawah tetap sama ...
  // (HAPUS <AuthModal /> yang di paling bawah tadi, biar gak dobel)

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  return (
    <aside className="aside-right text-left sticky top-4 h-fit">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="pt-4 px-4 pb-1">
          <h5 className="text-sm font-bold text-slate-900 m-0 tracking-wide">
            Add to your feed
          </h5>
        </div>
        
        <div className="flex flex-col px-4 pb-3">
          {rekomendasiUsers && rekomendasiUsers.length > 0 ? (
            rekomendasiUsers.map((u, index) => {
              const isFollowing = !!followingStates[u.id];

              return (
                <div key={u.id || index} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 last:pb-1">
                  
                  {u.avatar ? (
                    <img 
                      src={u.avatar.startsWith('http') ? u.avatar : `http://localhost:3000/uploads/${u.avatar}`} 
                      alt={u.name} 
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100 mt-0.5" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {getInitials(u.name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-bold text-slate-900 text-sm truncate hover:underline cursor-pointer leading-tight">
                        {u.name}
                      </span>
                      
                      <button 
                        type="button" 
                        onClick={() => handleFollowToggle(u)}
                        className={`px-3 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-150 shrink-0 inline-flex items-center gap-0.5 ${
                          isFollowing 
                            ? "text-slate-500 bg-slate-100 border border-slate-400 hover:bg-slate-200" 
                            : "text-slate-600 bg-white border border-slate-600 hover:bg-slate-50 hover:border-slate-800 hover:text-slate-800 hover:ring-1 hover:ring-slate-800"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <span className="text-xs font-bold leading-none">✓</span> Following
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium leading-none">+</span> Follow
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-normal">
                      <span className="truncate max-w-[100px]">
                        {u.bio || 'Mahasiswa'}
                      </span>
                      <span className="text-slate-300 font-light">|</span>
                      <span className="font-semibold text-slate-600 shrink-0">
                        {u.projectCount} Projects
                      </span>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 font-medium m-0 text-center py-4">
              Belum ada rekomendasi mahasiswa teraktif.
            </p>
          )}
        </div>

        {rekomendasiUsers && rekomendasiUsers.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-colors">
            <button 
              type="button"
              className="w-full text-left bg-transparent border-0 px-4 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1.5"
            >
              View all recommendations 
              <span className="text-sm font-bold leading-none">➔</span>
            </button>
          </div>
        )}

      </div>
    </aside>
  );
}