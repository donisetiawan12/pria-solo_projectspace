import React from 'react';

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

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  return (
    <nav className="home-navbar sticky top-0 z-40">
      <div className="nav-left">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate && navigate('/')}>
          <div className="bg-[#0a66c2] text-white p-1.5 rounded-md flex items-center justify-center font-bold text-xs tracking-tighter">in</div>
          <span className="text-lg font-black tracking-tight text-[#0a66c2]">
            Project<span className="text-slate-800">Space</span>
          </span>
        </div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Cari portofolio, tech stack..." 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="nav-right">
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
          <div className="relative border-l border-slate-200 pl-4">
            
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
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
                
                <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-3 transition-all text-left animate-fade-in animate-slide-up">
                  
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