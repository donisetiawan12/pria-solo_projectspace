import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../utils/api'; 
import '../assets/css/style.css'; 
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import Navbar from '../components/Navbar';


// Komponen Helper buat "See More" / Potong Deskripsi ala LinkedIn
function ReadMore({ text, maxLength = 150 }) {
  const [isReadMore, setIsReadMore] = useState(true);
  
  // Kalau teksnya pendek, langsung tampilin semua tanpa tombol
  if (!text || text.length <= maxLength) {
    return <p className="text-xs text-slate-600 leading-relaxed font-medium m-0 whitespace-pre-line">{text}</p>;
  }

  return (
    <p className="text-xs text-slate-600 leading-relaxed font-medium m-0 whitespace-pre-line">
      {isReadMore ? `${text.slice(0, maxLength)}... ` : text}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Biar pas diklik ga mentrigger fungsi lain
          setIsReadMore(!isReadMore);
        }}
        className="text-blue-600 hover:text-blue-800 font-bold bg-transparent border-0 p-0 cursor-pointer text-xs ml-1 inline-block"
      >
        {isReadMore ? '...lihat selengkapnya' : ' sembunyikan'}
      </button>
    </p>
  );
}

// 🔥 PASTIKAN DI BAGIAN PALING ATAS FILE (DI LUAR FUNGSI) LU SUDAH IMPORT INI:
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // <-- Wajib ada ini bro!

export default function Home({ isLoggedIn, onLogout, setIsAuthOpen, setAuthMode }) {
  const navigate = useNavigate(); // 🔥 INI DIA KUNCI UTAMANYA BIAR BISA PINDAH HALAMAN!

  // 1. STATE MANAGEMENT
  const [user, setUser] = useState({ 
    name: 'Guest / Tamu', 
    bio: 'Silahkan login untuk berkontribusi',
    university: '',
    avatar: null 
  });
  
  const [projects, setProjects] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [activeMenuProjectId, setActiveMenuProjectId] = useState(null);

  const [rekomendasiUsers, setRekomendasiUsers] = useState([]);

  // STATE UNTUK MODAL UPLOAD PROJECT
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [formProject, setFormProject] = useState({
    title: '',
    description: '',
    github_link: '',
    demo_link: '',
    tags: 'Web App', 
    is_free: '1',     
    tech_stack: '', 
  });
  const [selectedImage, setSelectedImage] = useState(null);

  // STATE UNTUK POPUP DETAIL PROJECT
  const [activeProjectDetails, setActiveProjectDetails] = useState(null);

  // STATE UNTUK MODAL UPDATE PROFIL
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [formProfile, setFormProfile] = useState({
    name: '',
    university: '',
    bio: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // STATE UNTUK DROPDOWN PROFILE DI NAVBAR (ALA LINKEDIN)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // 2. FETCH DATA FEED & USER
  const fetchFeedProjects = async () => {
    try {
      setLoading(true);
      const response = await API.get('/projects'); 
      if (response.data && response.data.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data feed project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const userData = {
            name: parsed.name || 'User',
            university: parsed.university || 'Belum Mengisi Universitas', 
            bio: parsed.bio || 'Informatika Student | Full Stack Developer', 
            avatar: parsed.avatar || null 
          };
          setUser(userData);
          
          setFormProfile({
            name: parsed.name || '',
            university: parsed.university || '',
            bio: parsed.bio || ''
          });
        } catch (e) { 
          console.error(e); 
        }
      }
    } else {
      setUser({ name: 'Guest / Tamu', university: '', bio: 'Silahkan login untuk berkontribusi', avatar: null });
    }
    fetchFeedProjects();
  }, [isLoggedIn]);

  // 3. FUNGSI UTILITY & AKSES
  const bukaModalLogin = () => {
    setAuthMode("login");
    setIsAuthOpen(true);
  };

  const proteksiAksi = (e) => {
    if (!isLoggedIn) {
      if (e && e.preventDefault) e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'Akses Ditolak, Bro!',
        text: 'Lu harus Login dulu biar bisa nikmatin fitur ini.',
        background: '#161b22',
        color: '#ffffff',
        confirmButtonColor: '#0a66c2',
        confirmButtonText: 'Login Sekarang',
        showCancelButton: true,
        cancelButtonText: 'Nanti Aja',
        cancelButtonColor: '#30363d'
      }).then((result) => {
        if (result.isConfirmed) {
          bukaModalLogin();
        }
      });
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormProject(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUploadProject = async (e) => {
    e.preventDefault();
    if (!formProject.title.trim()) {
      return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Judul proyek wajib diisi bro!' });
    }

    try {
      const formData = new FormData();

      // 👇 🔥 BARU: AMBIL ID USER YANG SEDANG LOGIN & SISIPKAN KE FORM DATA
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.id) {
          // Sesuaikan key 'user_id' ini dengan nama kolom di database / request backend lu
          formData.append('user_id', parsedUser.id); 
        }
      }
      
      // Data bawaan proyek lu yang lama 👇
      formData.append('title', formProject.title);
      formData.append('description', formProject.description);
      formData.append('github_link', formProject.github_link);
      formData.append('demo_link', formProject.demo_link);
      formData.append('tags', formProject.tags);
      formData.append('is_free', formProject.is_free);
      formData.append('tech_stack', formProject.tech_stack); 
      
      if (selectedImage) {
        formData.append('image', selectedImage); 
      }

      Swal.showLoading();
      const response = await API.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: 'Mantap!',
          text: 'Project berhasil dipublish!',
          timer: 2000,
          showConfirmButton: false
        });
        setFormProject({ title: '', description: '', github_link: '', demo_link: '', tags: 'Web App', is_free: '1', tech_stack: '' });
        setSelectedImage(null);
        setIsProjectModalOpen(false);
        fetchFeedProjects();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.response?.data?.message || 'Ada masalah pas kirim data ke server.'
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formProfile.name.trim()) {
      return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Nama wajib diisi bro!' });
    }

    try {
      const formData = new FormData();
      
      // 👇 1. AMBIL ID DARI LOCALSTORAGE
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.id) {
          formData.append('id', parsedUser.id); // 🔥 Selipin ID ke Form Data
        }
      }

      formData.append('name', formProfile.name);
      formData.append('university', formProfile.university);
      formData.append('bio', formProfile.bio);
      if (selectedAvatar) {
        formData.append('avatar', selectedAvatar);
      }

      Swal.showLoading();
      const response = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: 'Profil Diupdate!',
          text: 'Data profil lu berhasil diperbarui bro.',
          timer: 1500,
          showConfirmButton: false
        });
        
        const updatedUser = response.data.user; 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setUser({
          name: updatedUser.name,
          university: updatedUser.university,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar
        });
        
        setIsProfileModalOpen(false);
        fetchFeedProjects(); 
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Update',
        text: error.response?.data?.message || 'Ada masalah pas kirim data ke server.'
      });
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return fullName[0].toUpperCase();
  };

  const isProjectOwner = (proj) => {
    if (!isLoggedIn) return false;
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return false;
    
    const parsedUser = JSON.parse(savedUser);
    // Kita bandingkan user_id dari backend dengan id dari localStorage
    return proj.user_id == parsedUser.id; 
  };

 // 🔥 UPGRADE KODE FILTER LU JADI SEPERTI INI:
  const filteredProjects = projects.filter((proj) => {
    // 1. Filter Kategori (All, Web App, IoT, Game)
    const matchesCategory = selectedCategory === "All" || 
      proj.tags?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    // 2. Filter Search Bar (Mencari berdasarkan Judul Project atau Tech Stack)
    const matchesSearch = 
      proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tech_stack?.toLowerCase().includes(searchQuery.toLowerCase());

    // Project bakal lolos kalau memenuhi dua kondisi di atas
    return matchesCategory && matchesSearch;
  });

useEffect(() => {
    const fetchUserPalingAktif = async () => {
      try {
        // 🔑 1. AMBIL TOKEN TERBARU DARI LOCALSTORAGE
        const token = localStorage.getItem('token');
        
        // 🔑 2. KIRIM TOKEN SECARA MANUAL DI HEADER AXIOS
        const resProjects = await API.get('/projects', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const semuaProject = resProjects.data.data;
        if (!semuaProject || !Array.isArray(semuaProject)) return;

        const userProjectCount = {};

        semuaProject.forEach((proj) => {
          const uid = proj.user_id || proj.userId;
          
          if (uid) {
            // 🚫 JIKA INI PROJECT MILIK USER YANG LAGI LOGIN (isMe: true), LANGSUNG SKIP!
            if (proj.isMe) return;

            const namaUser = proj.author?.name || proj.user?.name || proj.username || proj.name || "Mahasiswa Aktif";
            const avatarUser = proj.author?.avatar || proj.user?.avatar || proj.avatar || null;
            const bioUser = proj.author?.bio || proj.user?.bio || proj.bio || "Developer";
            const univUser = proj.author?.university || proj.user?.university || proj.university || proj.nim || "ProjectSpace Member";

            if (!userProjectCount[uid]) {
              userProjectCount[uid] = {
                id: uid,
                name: namaUser,
                avatar: avatarUser,
                bio: bioUser,
                university: univUser,
                projectCount: 0,
                isFollowing: proj.isFollowing === 1 
              };
            }
            userProjectCount[uid].projectCount += 1;
          }
        });

        const sortedUsers = Object.values(userProjectCount)
          .sort((a, b) => b.projectCount - a.projectCount)
          .slice(0, 5);

        setRekomendasiUsers(sortedUsers);
      } catch (error) {
        console.error("Gagal memproses user paling aktif:", error);
      }
    };

    fetchUserPalingAktif();
  }, []); // 💡 Biarkan depedency array kosong atau masukkan state login lu jika ada

  return (
    <div className="home-container">
      
      <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          proteksiAksi={proteksiAksi}
          setIsProjectModalOpen={setIsProjectModalOpen}
          isLoggedIn={isLoggedIn}
          user={user}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          navigate={navigate}
          onLogout={onLogout}
          bukaModalLogin={bukaModalLogin}
        />

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="home-main-grid">
        
        <SidebarLeft 
          user={user} 
          isLoggedIn={isLoggedIn} 
          setIsProfileModalOpen={setIsProfileModalOpen} 
        />
       {/* 2. FEED MIDDLE */}
        <main className="flex flex-col gap-4">
        
         {/* ================= 🔥 BARU: MENU FILTER KATEGORI POLOS ALA LINKEDIN ================= */}
          <div className="flex justify-between items-center bg-transparent py-2 px-1">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Semua Portofolio</span>
            <div className="flex gap-2 flex-wrap"> {/* 👈 Di sini tambahin flex-wrap */}
              {/* 👇 Di bawah ini array-nya udah lengkap sesuai input form lu */}
              {["All", "Web App", "Mobile App", "IoT", "Game", "AI / ML"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* ============================================================================== */}
          {/* ============================================================================== */}

          {/* RENDERING FEED PROJECT */}
          {loading ? (
            <div className="card-white p-10 text-center text-xs font-bold text-slate-500">Loading karya mahasiswa...</div>
          ) : filteredProjects.length === 0 ? ( // 🔥 Diganti ke filteredProjects
            <div className="card-white p-10 text-center text-xs font-bold text-slate-500">Belum ada portofolio di kategori ini. 🚀</div>
          ) : (
            filteredProjects.map((proj) => ( // 🔥 Diganti ke filteredProjects.map
              <div key={proj.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-left flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
                
                {/* 1. HEADER USER PROFILE */}
                {/* 1. HEADER USER PROFILE */}
                <div className="flex justify-between items-center relative"> {/* Tambah class relative */}
                  <div className="flex gap-3 items-center">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-slate-100 overflow-hidden">
                      {proj.author?.avatar ? (
                        <img src={proj.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(proj.author?.name || 'U')
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0 hover:text-blue-600 cursor-pointer transition-colors">{proj.author?.name || 'Anonymous'}</h4>
                      <p className="text-[11px] text-slate-500 font-medium m-0 flex items-center gap-1">
                        <span>{proj.author?.nim || 'Mahasiswa'}</span>
                        <span className="text-slate-300">•</span>
                        <span>Baru saja</span>
                      </p>
                    </div>
                  </div>

                  {/* 🛠️ SISI KANAN: TEMPAT TAG KATEGORI DAN MENU TITIK 3 */}
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                      {proj.tags}
                    </span>

                    {/* 🔥 TOMBOL TITIK 3 HANYA MUNCUL JIKA INI PROJECT LU (OWNER) */}
                    {isProjectOwner(proj) && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Biar ga ke-trigger klik detail card
                            setActiveMenuProjectId(activeMenuProjectId === proj.id ? null : proj.id);
                          }}
                          className="text-slate-400 hover:text-slate-700 font-bold bg-transparent border-0 px-2 py-1 cursor-pointer text-base rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          •••
                        </button>

                        {/* 📋 DROPDOWN MENU EDIT */}
                        {activeMenuProjectId === proj.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 animate-fade-in text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuProjectId(null);
                                // ⚡ Sementara alert dulu, nanti fungsi open modal edit taruh di sini
                                Swal.fire('Info', 'Fungsi edit buat project ini otw dikerjakan bro!', 'info');
                              }}
                              className="w-full text-left bg-transparent border-0 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                            >
                              ✏️ Edit Project
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. TEXT DESCRIPTION */}
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug m-0">{proj.title}</h3>
                  <ReadMore text={proj.description} maxLength={100} />
                </div>

                {/* 3. SCREENSHOT GAMBAR */}
                {proj.image && (
                  <div 
                    onClick={() => setActiveProjectDetails(proj)}
                    className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mt-1 shadow-sm group cursor-pointer"
                  >
                    <img 
                      src={proj.image.startsWith('http') ? proj.image : `http://localhost:3000/uploads/${proj.image}`} 
                      alt={proj.title} 
                      className="w-full h-[450px] object-cover object-center group-hover:scale-[1.008] transition-transform duration-300" 
                    />
                  </div>
                )}

                {/* 4. REPO BOX (GitHub Dark Theme Style) */}
                <div className="bg-[#0d1117] rounded-xl border border-[#30363d] p-5 flex flex-col gap-3 mt-1 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 z-10">
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold hover:underline cursor-pointer truncate max-w-[250px]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 11-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path></svg>
                      <span className="truncate">{proj.github_link ? proj.github_link.replace('https://github.com/', '') : 'repository-private'}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${parseInt(proj.is_free) === 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                      {parseInt(proj.is_free) === 1 ? 'Public' : 'Premium'}
                    </span>
                  </div>

                  <div className="z-10">
                    <h4 className="text-white font-bold text-sm tracking-tight m-0 truncate hover:text-blue-400 cursor-pointer transition-colors">{proj.title}</h4>
                    <p className="text-[11px] text-slate-400 m-0 mt-1 line-clamp-1 font-normal">Klik tombol di bawah ini untuk menjelajahi source-code dan dokumentasi proyek.</p>
                  </div>
                  
                  <div className="flex gap-2 mt-2 z-10">
                    {proj.github_link && (
                      <a href={proj.github_link} target="_blank" rel="noreferrer" className="bg-[#21262d] hover:bg-[#30363d] text-white text-[11px] font-bold px-4 py-2 rounded-lg border border-[#30363d] no-underline inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                        Explore Code
                      </a>
                    )}
                    {proj.demo_link && (
                      <a href={proj.demo_link} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg no-underline inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Live Preview
                      </a>
                    )}
                  </div>
                </div>

                {/* 5. INTERACTION BUTTONS */}
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-slate-500 font-bold text-xs mt-1">
                  <button type="button" className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg bg-transparent border-0 cursor-pointer text-slate-600 transition-colors">
                    <span className="text-sm">⭐</span> Give Star
                  </button>
                  <button type="button" className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg bg-transparent border-0 cursor-pointer text-slate-600 transition-colors">
                    <span className="text-sm">💬</span> Comment
                  </button>
                  <button type="button" className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg bg-transparent border-0 cursor-pointer text-slate-600 transition-colors">
                    <span className="text-sm">🔖</span> Bookmark
                  </button>
                </div>

              </div>
            ))
          )}
        </main>

<SidebarRight 
  rekomendasiUsers={rekomendasiUsers} 
  bukaModalLogin={bukaModalLogin} // 🔥 OPER FUNGSI LOGIN NAVBAR LU KE SINI!
/>     </div>

      {/* ================= MODAL INPUT PROJECT BARU ================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-slate-100">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-folder-plus text-[#0a66c2] text-lg"></i>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider m-0">Bagikan Project Karya</h3>
              </div>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadProject} className="p-6 flex flex-col gap-4 overflow-y-auto text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Judul Project *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formProject.title}
                  onChange={handleInputChange}
                  placeholder="Contoh: E-Kantin Kampus Integrasi E-Wallet" 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Deskripsi Singkat Project</label>
                <textarea 
                  name="description"
                  value={formProject.description}
                  onChange={handleInputChange}
                  placeholder="Jelaskan secara ringkas fitur utama, masalah yang lu selesaikan, dan kegunaan sistem ini..." 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium h-20 resize-none"
                />
              </div>

              {/* 🔥 BARU: Input Field Tech Stack */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Tech Stack (Pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  name="tech_stack"
                  value={formProject.tech_stack}
                  onChange={handleInputChange}
                  placeholder="Contoh: React.js, Node.js, MySQL, Tailwind CSS" 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">GitHub Repository Link</label>
                  <input 
                    type="url" 
                    name="github_link"
                    value={formProject.github_link}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repo" 
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Live Demo Link (Opsional)</label>
                  <input 
                    type="url" 
                    name="demo_link"
                    value={formProject.demo_link}
                    onChange={handleInputChange}
                    placeholder="https://projectlu.vercel.app" 
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Kategori Project</label>
                  <select 
                    name="tags" 
                    value={formProject.tags}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-bold bg-white"
                  >
                    <option value="Web App">Web App (Aplikasi Web)</option>
                    <option value="Mobile App">Mobile App (Android/iOS)</option>
                    <option value="IoT">IoT (Internet of Things)</option>
                    <option value="Game">Game Development</option>
                    <option value="AI / ML">AI / Machine Learning</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Tipe Akses Code</label>
                  <select 
                    name="is_free" 
                    value={formProject.is_free}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-bold bg-white"
                  >
                    <option value="1">Public / Gratis Dikloning 🟢</option>
                    <option value="0">Premium / Izin Owner 🟡</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Screenshot Proyek (Gambar)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <i className="fa-solid fa-cloud-arrow-up text-slate-400 text-xl mb-1 block"></i>
                  <p className="text-[11px] font-bold text-slate-500 m-0">
                    {selectedImage ? `Selected: ${selectedImage.name}` : 'Klik atau seret file gambar screenshot di sini'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl border-0 cursor-pointer transition-all">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-black rounded-xl border-0 cursor-pointer shadow-md transition-all">
                  Publish Proyek 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL UPDATE PROFIL BARU ================= */}
{isProfileModalOpen && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-slate-100">
      
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider m-0">Edit Profil</h3>
        </div>
        <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold">
          &times;
        </button>
      </div>

      <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Nama Lengkap *</label>
          <input 
            type="text" 
            value={formProfile.name}
            onChange={(e) => setFormProfile({...formProfile, name: e.target.value})}
            className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Asal Kampus / Universitas (NIM)</label>
          <input 
            type="text" 
            value={formProfile.university}
            onChange={(e) => setFormProfile({...formProfile, university: e.target.value})}
            placeholder="Contoh: Universitas Pamulang"
            className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Bio / Headline Profil</label>
          <textarea 
            value={formProfile.bio}
            onChange={(e) => setFormProfile({...formProfile, bio: e.target.value})}
            placeholder="Contoh: Web Developer Enthusiast | S1 Teknik Informatika" 
            className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium h-16 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Foto Profil (Avatar)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setSelectedAvatar(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <p className="text-[11px] font-bold text-slate-500 m-0">
              {selectedAvatar ? `Selected: ${selectedAvatar.name}` : 'Klik untuk ganti foto profil'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2.5">
          <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl border-0 cursor-pointer transition-all">
            Batal
          </button>
          <button type="submit" className="px-5 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-black rounded-xl border-0 cursor-pointer shadow-md transition-all">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* ================= MODAL DETAIL POPUP VIEW PROJECT ================= */}
      {activeProjectDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 transition-all animate-fade-in text-slate-100">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[92vh] md:max-h-[85vh] animate-slide-up">
            
            <div className="w-full md:w-3/5 bg-[#0d1117] p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#30363d] relative min-h-[250px] md:min-h-0">
              <img 
                src={activeProjectDetails.image.startsWith('http') ? activeProjectDetails.image : `http://localhost:3000/uploads/${activeProjectDetails.image}`} 
                alt={activeProjectDetails.title}
                className="max-w-full max-h-[35vh] md:max-h-[65vh] object-contain rounded-lg shadow-lg"
              />
              <p className="text-[10px] text-slate-500 mt-3 font-semibold tracking-wide uppercase">
                {activeProjectDetails.title} - App Screenshot
              </p>
            </div>

            <div className="w-full md:w-2/5 flex flex-col h-full bg-[#161b22]">
              <div className="p-5 border-b border-[#30363d] flex justify-between items-start shrink-0">
                <div className="flex gap-3 items-center">
                  
                  {/* 👇 1. FIX FOTO PROFIL / INISIAL AUTHOR */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-800 overflow-hidden">
                    {activeProjectDetails.author?.avatar ? (
                      <img src={activeProjectDetails.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(activeProjectDetails.author?.name || 'U')
                    )}
                  </div>
                  
                  <div className="text-left">
                    {/* 👇 2. FIX NAMA AUTHOR */}
                    <h4 className="text-xs font-bold text-white m-0">
                      {activeProjectDetails.author?.name || 'Anonymous'}
                    </h4>
                    {/* 👇 3. FIX NIM / UNIVERSITAS AUTHOR */}
                    <p className="text-[10px] text-slate-400 font-medium m-0 mt-0.5">
                      {activeProjectDetails.author?.nim || 'Mahasiswa'}
                    </p>
                  </div>

                </div>
                <button onClick={() => setActiveProjectDetails(null)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold p-1 leading-none">
                  &times;
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4 overflow-y-auto text-left flex-grow">
                <div>
                  <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider mb-2 inline-block">
                    {activeProjectDetails.tags}
                  </span>
                  <h3 className="text-sm font-extrabold text-white leading-snug m-0">{activeProjectDetails.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium m-0 mt-2 whitespace-pre-line bg-[#0d1117] p-3 rounded-xl border border-[#30363d]">
                    {activeProjectDetails.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>

                {/* 🔥 DINAMIS DARI DB: Tech Stack Reference */}
                <div className="border-t border-[#30363d] pt-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0 mb-2">Tech Stack Reference</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProjectDetails.tech_stack ? (
                      activeProjectDetails.tech_stack.split(',').map((tech, index) => (
                        <span key={index} className="bg-[#21262d] text-slate-300 text-[10px] px-2.5 py-1 rounded-full border border-[#30363d] font-medium">
                          {tech.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="bg-[#21262d] text-slate-500 text-[10px] px-2.5 py-1 rounded-full border border-[#30363d] font-medium italic">
                        No tech stack added
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#30363d] pt-3 flex-grow flex flex-col min-h-[150px]">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0 mb-2">Diskusi Proyek (0)</h5>
                  <div className="flex flex-col gap-2 flex-grow justify-center items-center text-center text-slate-500 text-[11px] py-4 bg-[#0d1117] rounded-xl border border-[#30363d] border-dashed">
                    <span>💬 Belum ada komentar. <br/>Jadilah yang pertama mengapresiasi!</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex gap-2 shrink-0">
                {activeProjectDetails.github_link && (
                  <a href={activeProjectDetails.github_link} target="_blank" rel="noreferrer" className="flex-1 bg-[#21262d] hover:bg-[#30363d] text-white text-[11px] font-bold py-2 rounded-xl border border-[#30363d] no-underline inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    Source Code
                  </a>
                )}
                {activeProjectDetails.demo_link && (
                  <a href={activeProjectDetails.demo_link} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 rounded-xl no-underline inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    Live Demo
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      )}


      

    </div>
  );
}