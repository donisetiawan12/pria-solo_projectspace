import React from 'react';

export default function SidebarLeft({ user, isLoggedIn, setIsProfileModalOpen }) {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  return (
    // 💡 Di sini kita bersihkan class grid-nya bro, sisakan flex & sticky aja
    <div className="flex flex-col gap-4 sticky top-4 h-fit">
      <div 
        onClick={() => isLoggedIn && setIsProfileModalOpen(true)} 
        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center cursor-pointer hover:shadow-md hover:scale-[1.005] transition-all duration-200 overflow-hidden group"
      >
        <div className="h-14 bg-gradient-to-r from-blue-700 to-blue-500 group-hover:opacity-95 transition-opacity"></div>
        
        <div className="px-4 pb-5 relative">
          {user.avatar ? (
            <img 
              src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000/uploads/${user.avatar}`} 
              alt="Profil Utama" 
              className="w-16 h-16 rounded-full border-4 border-white mx-auto -mt-8 shadow-md object-cover" 
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-white text-white flex items-center justify-center font-black text-xl mx-auto -mt-8 shadow-md">
              {getInitials(user.name)}
            </div>
          )}

          <h4 className="text-sm font-black text-slate-900 mt-2 m-0 group-hover:text-blue-600 transition-colors">
            {user.name} 
            {isLoggedIn && <span className="text-[10px] text-slate-400 font-normal block mt-0.5">{user.university}</span>}
          </h4>

          <p className="text-[11px] text-slate-500 mt-1 leading-normal px-2 font-medium m-0">
            {user.bio} {isLoggedIn && '🚀'}
          </p>

          {isLoggedIn && (
            <span className="text-[9px] text-blue-500 font-bold block mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              ⚙️ Klik untuk ubah profil
            </span>
          )}
        </div>
      </div>
    </div>
  );
}