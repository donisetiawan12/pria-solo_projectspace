import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../utils/api'; 

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL secara dinamis (misal: 5, 6, 7)
  const [user, setUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);

  // STATE UNTUK MODAL UPDATE PROFIL
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [formProfile, setFormProfile] = useState({
    name: '',
    university: '',
    bio: '',
    about: '',
    nim: '',      
    email: ''     
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);

  // AMBIL INFORMASI LOGGED-IN USER SECARA GLOBAL
  const savedUser = localStorage.getItem('user');
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;

  // Menentukan apakah ini profil milik sendiri atau milik orang lain
  const isOwnProfile = !id || (parsedUser && String(parsedUser.id) === String(id));

  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        setLoading(true);
        let targetUser = null;
        let targetId = id;

        // 1. JIKA MILIK ORANG LAIN: Ambil dari API pakai fetch agar Axios global aman
        if (!isOwnProfile && id) {
          const res = await fetch(`http://localhost:3000/users/${id}`);
          if (!res.ok) throw new Error("Gagal mengambil data profil");
          targetUser = await res.json();
          targetId = id;
        } 
        // 2. JIKA MILIK SENDIRI: Ambil dari localStorage
        else {
          targetUser = parsedUser;
          targetId = parsedUser?.id;
        }

        if (targetUser) {
          setUser(targetUser);
          setFormProfile({
            name: targetUser?.name || '',
            university: targetUser?.university || '',
            bio: targetUser?.bio || '',
            about: targetUser?.about || '',
            nim: targetUser?.nim || '',
            email: targetUser?.email || ''
          });

          // 3. AMBIL DATA PROJECT SECARA DINAMIS BERDASARKAN USER ID
          try {
            const projectsRes = await API.get('/projects'); 
            const allProjects = projectsRes.data?.data || projectsRes.data || [];
            if (Array.isArray(allProjects)) {
              // Menyaring proyek: Hanya memunculkan proyek yang di-author oleh ID user ini
              const filtered = allProjects.filter(p => {
                if (!p.author) return false;
                // Cek kecocokan berdasarkan ID (baik p.user_id, p.author.id, atau p.author_id)
                const authorId = p.author.id || p.author_id || p.user_id;
                return String(authorId) === String(targetId);
              });
              setMyProjects(filtered);
            }
          } catch (projErr) {
            console.error("Gagal memuat project:", projErr);
          }

          // 4. AMBIL DATA JUMLAH FOLLOWERS
          if (targetId) {
            try {
              const token = localStorage.getItem('token');
              const followersRes = await API.get(`/users/${targetId}/followers-count`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              if (followersRes.data && followersRes.data.success) {
                setFollowerCount(followersRes.data.followersCount || followersRes.data.count || 0);
              }
            } catch (fErr) {
              console.error("Gagal memuat followers:", fErr);
            }
          }
        } else {
          setUser({ name: 'Guest', bio: 'Silahkan login terlebih dahulu.' });
        }
      } catch (error) {
        console.error("Gagal mengambil data profil secara keseluruhan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileData();
  }, [id]); // Memicu reload otomatis setiap kali ID di URL berubah (misal dari /user/5 ke /user/6)

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!parsedUser || !parsedUser.id) return;

    try {
      Swal.showLoading();
      const formData = new FormData();
      formData.append('id', parsedUser.id); 
      formData.append('name', formProfile.name);
      formData.append('university', formProfile.university);
      formData.append('bio', formProfile.bio);
      formData.append('about', formProfile.about);
      
      if (selectedAvatar) formData.append('avatar', selectedAvatar);
      if (selectedBanner) formData.append('banner', selectedBanner);

      const response = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.user) {
        const updatedUserData = { ...parsedUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        window.dispatchEvent(new Event("profileUpdated"));
      }

      setIsProfileModalOpen(false);
      setSelectedBanner(null);
      setSelectedAvatar(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil sukses diperbarui!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Gagal update profil:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Update',
        text: error.response?.data?.message || 'Terjadi kesalahan sistem server.'
      });
    }
  };

  const handleDeleteProject = (projectId) => {
    Swal.fire({
      title: 'Yakin mau hapus?',
      text: "Project yang dihapus gak bakal bisa balik lagi loh bro!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Aja! 🗑️',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          const token = localStorage.getItem('token'); 
          const response = await API.delete(`/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.status === 200 || response.data.success) {
            Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false });
            setMyProjects(prev => prev.filter(proj => proj.id !== projectId));
          }
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Gagal Hapus', text: error.response?.data?.message });
        }
      }
    });
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center font-sans">
        <p className="text-sm font-bold text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] pb-10 font-sans text-slate-900 text-left">
      {/* NAVBAR MINI */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-[#0a66c2] text-white p-1.5 rounded-md font-bold text-xs">in</div>
          <span className="text-base font-black tracking-tight text-[#0a66c2]">Project<span className="text-slate-800">Space</span></span>
        </div>
        <button onClick={() => navigate('/')} className="bg-transparent hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-full px-4 py-1 text-xs font-bold cursor-pointer transition-colors">
          Back to Feed
        </button>
      </nav>

      {/* MAIN LAYOUT CONTAINER */}
      <div className="max-w-5xl mx-auto mt-6 px-4 flex flex-col gap-6">
        {/* CARD 1: HERO PROFILE BANNER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          {user?.banner ? (
            <div className="h-44 w-full">
              <img 
                src={user.banner.startsWith('http') ? user.banner : `http://localhost:3000/uploads/${user.banner}`} 
                alt="Profile Banner" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-44 bg-[#005fb8]"></div>
          )}
          
          <div className="px-8 relative flex flex-col md:flex-row md:justify-between md:items-start pt-4">
            <div className="flex flex-col md:flex-row items-start gap-5 -mt-20">
              {user?.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000/uploads/${user.avatar}`} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-[#18181b] text-white flex items-center justify-center font-black text-3xl shadow-md">
                  {getInitials(user?.name)}
                </div>
              )}
              
              <div className="mt-16 md:mt-20 text-left">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 m-0">{user?.name}</h1>
                  {formProfile.nim && (
                    <span className="bg-[#e0e7ff] text-[#4f46e5] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      NIM {formProfile.nim}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-bold mt-1 max-w-xl leading-relaxed">
                  {user?.bio || 'Informatika | Student @ Kampus 🚀'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1 m-0">
                  {formProfile.email}
                </p>
              </div>
            </div>

            {/* Stats Kanan */}
            <div className="flex flex-col items-end gap-3 mt-4 md:mt-2 self-end md:self-start">
              <div className="flex gap-2">
                <div className="bg-white border border-slate-200 p-2 px-4 rounded-xl text-center shadow-sm min-w-[85px]">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Portfolio</span>
                  <span className="text-sm font-black text-slate-900">{myProjects.length} Repos</span>
                </div>
                <div className="bg-white border border-slate-200 p-2 px-4 rounded-xl text-center shadow-sm min-w-[85px]">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tight">Connections</span>
                  <span className="text-sm font-black text-[#005fb8]">{followerCount} Peers</span>
                </div>
              </div>
              
              {isOwnProfile && parsedUser && (
                <button 
                  onClick={() => setIsProfileModalOpen(true)} 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 font-bold text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-all w-full text-center"
                >
                  ✏️ Ubah Profil
                </button>
              )}
            </div>
          </div>

          <div className="px-8 pb-6 mt-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium m-0 bg-[#f8fafc] p-4 rounded-xl border border-slate-100 whitespace-pre-line">
              {user?.about || 'Belum ada deskripsi "Tentang Saya" yang ditambahkan oleh user.'}
            </p>
          </div>
        </div>

        {/* CARD 2: REPOSITORY & PROYEK LIST */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider m-0">Repository & Proyek</h3>
              <p className="text-[10px] text-slate-400 font-medium m-0 mt-0.5">Daftar karya pemrograman yang berhasil dirilis</p>
            </div>
            <span className="bg-slate-100 text-slate-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {myProjects.length} Project
            </span>
          </div>

          {myProjects.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500 font-bold m-0">User ini belum membagikan project.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myProjects.map((proj) => (
                <div key={proj.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 relative group">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-100 text-[#0a66c2] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        {proj.tags || 'Web App'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {proj.created_at ? new Date(proj.created_at).toLocaleDateString('id-ID') : 'Baru saja'}
                        </span>
                        {isOwnProfile && (
                          <button onClick={() => handleDeleteProject(proj.id)} className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer p-1 text-xs opacity-80 hover:opacity-100 transition-opacity" title="Hapus Proyek">🗑️</button>
                        )}
                      </div>
                    </div>
                    
                    <h4 className="text-xs font-black text-slate-900 m-0 line-clamp-1">{proj.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-medium leading-relaxed">{proj.description || 'Tidak ada deskripsi.'}</p>
                    
                    {proj.tech_stack && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {proj.tech_stack.split(',').map((t, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-slate-200/60 pt-3 mt-3">
                    {proj.github_link && (
                      <a href={proj.github_link} target="_blank" rel="noreferrer" className="flex-1 text-center bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg border border-slate-200 no-underline transition-colors">GitHub</a>
                    )}
                    {proj.demo_link && (
                      <a href={proj.demo_link} target="_blank" rel="noreferrer" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 rounded-lg no-underline transition-colors">Live Demo</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL POPUP EDIT PROFILE */}
      {isProfileModalOpen && isOwnProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider m-0">Edit Informasi Profil</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent text-lg font-bold cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label>Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" value={formProfile.name} onChange={(e) => setFormProfile(prev => ({ ...prev, name: e.target.value }))} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-blue-500" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Asal Universitas / Kampus</label>
                <input type="text" value={formProfile.university} onChange={(e) => setFormProfile(prev => ({ ...prev, university: e.target.value }))} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Nomor Induk Mahasiswa (NIM)</label>
                <input type="text" value={formProfile.nim} onChange={(e) => setFormProfile(prev => ({ ...prev, nim: e.target.value }))} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Bio Ringkas / Headline</label>
                <input type="text" value={formProfile.bio} onChange={(e) => setFormProfile(prev => ({ ...prev, bio: e.target.value }))} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Tentang Saya</label>
                <textarea rows="3" value={formProfile.about} onChange={(e) => setFormProfile(prev => ({ ...prev, about: e.target.value }))} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Ganti Foto Profil (Avatar)</label>
                <input type="file" accept="image/*" onChange={(e) => setSelectedAvatar(e.target.files[0])} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Ganti Background Profil (Banner)</label>
                <input type="file" accept="image/*" onChange={(e) => setSelectedBanner(e.target.files[0])} className="w-full border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none" />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold cursor-pointer border-0">Batal</button>
                <button type="submit" className="bg-[#0a66c2] hover:bg-[#004182] text-white px-5 py-2 rounded-lg font-bold cursor-pointer border-0 shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}