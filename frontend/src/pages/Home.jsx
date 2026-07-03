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
  
  if (!text || text.length <= maxLength) {
    return <p className="text-xs text-slate-600 leading-relaxed font-medium m-0 whitespace-pre-line">{text}</p>;
  }

  return (
    <p className="text-xs text-slate-600 leading-relaxed font-medium m-0 whitespace-pre-line">
      {isReadMore ? `${text.slice(0, maxLength)}... ` : text}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); 
          setIsReadMore(!isReadMore);
        }}
        className="text-blue-600 hover:text-blue-800 font-bold bg-transparent border-0 p-0 cursor-pointer text-xs ml-1 inline-block"
      >
        {isReadMore ? '...lihat selengkapnya' : ' sembunyikan'}
      </button>
    </p>
  );
}

export default function Home({ isLoggedIn, onLogout, setIsAuthOpen, setAuthMode }) {
  const navigate = useNavigate(); 

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

  const [activeComments, setActiveComments] = useState([]);

  // 🔥 BARU: STATE UNTUK MODAL EDIT PROJECT
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formEditProject, setFormEditProject] = useState({
    title: '',
    description: '',
    github_link: '',
    demo_link: '',
    tags: 'Web App',
    is_free: '1',
    tech_stack: ''
  });
  const [selectedEditImage, setSelectedEditImage] = useState(null);

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
      if (savedUser && savedUser !== "undefined") {
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

  useEffect(() => {
  const fetchCommentsForModal = async () => {
    if (!activeProjectDetails || !activeProjectDetails.id) {
      setActiveComments([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/comments/${activeProjectDetails.id}`);
      if (response.ok) {
        const resData = await response.json();
        setActiveComments(resData.data || []); // Ambil array komentar dari backend
      }
    } catch (error) {
      console.error("Gagal ambil komen untuk modal:", error);
    }
  };

  fetchCommentsForModal();
}, [activeProjectDetails]);

  // 3. FUNGSI UTILITY & AKSES
  const bukaModalLogin = () => {
    setAuthMode("login");
    setIsAuthOpen(true);
  };

const openEditModal = (project) => {
  if (!project) return;
  
  setEditingProjectId(project.id);
  setFormEditProject({
    title: project.title || '',
    description: project.description || '',
    github_link: project.github_link || '',
    demo_link: project.demo_link || '',
    tags: project.tags || 'Web App',
    is_free: String(project.is_free ?? 1),
    // 👇 SEKARANG SUDAH BISA LANGSUNG AMBIL DARI KOLOM BARU
    tech_stack: project.tech_stack || '' 
  });
  
  setSelectedEditImage(null);
  setIsEditModalOpen(true);
};


const handleDeleteProject = async (id) => {
  // 🔥 TAMPILKAN POPUP KONFIRMASI YANG MODERN
  Swal.fire({
    title: 'Yakin mau hapus?',
    text: "Data project lu bakal ilang permanen dari database, lho!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus Saja!',
    cancelButtonText: 'Batal',
    customClass: {
      popup: 'rounded-2xl text-xs font-sans',
    }
  }).then(async (result) => {
    // Jika user klik tombol 'Ya, Hapus Saja!'
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token'); 
        const response = await fetch(`http://localhost:3000/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        const resData = await response.json();

        if (response.ok) {
          // 🔥 POPUP SUKSES KEREN
          Swal.fire({
            title: 'Terhapus!',
            text: 'Project lu berhasil dimusnahkan. 🔥',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-2xl text-xs' }
          }).then(() => {
            window.location.reload(); // Refresh halaman setelah popup sukses hilang
          });
        } else {
          Swal.fire({
            title: 'Gagal!',
            text: resData.message || "Gagal menghapus project",
            icon: 'error',
            customClass: { popup: 'rounded-2xl text-xs' }
          });
        }
      } catch (error) {
        console.error("Error pas hapus:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Terjadi kesalahan koneksi ke server.',
          icon: 'error',
          customClass: { popup: 'rounded-2xl text-xs' }
        });
      }
    }
  });
};

  // 🔥 BARU: FUNGSI SUBMIT UPDATE EDIT PROJECT
  const handleUpdateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!formEditProject.title.trim()) {
      return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Judul proyek wajib diisi bro!' });
    }

    try {
      Swal.showLoading();
      const formData = new FormData();
      formData.append('title', formEditProject.title);
      formData.append('description', formEditProject.description);
      formData.append('github_link', formEditProject.github_link);
      formData.append('demo_link', formEditProject.demo_link);
      formData.append('tags', formEditProject.tags);
      formData.append('is_free', formEditProject.is_free);
      formData.append('tech_stack', formEditProject.tech_stack);
      
      if (selectedEditImage) {
        formData.append('image', selectedEditImage);
      }

      await API.put(`/projects/${editingProjectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Proyek lu sukses diperbarui bro!',
        timer: 1500,
        showConfirmButton: false
      });
      
      setIsEditModalOpen(false);
      fetchFeedProjects(); 
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Update',
        text: error.response?.data?.message || 'Gagal mengubah data project.'
      });
    }
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setFormEditProject(prev => ({ ...prev, [name]: value }));
  };

  

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleEditFileChange = (e) => {
    setSelectedEditImage(e.target.files[0]);
  };

  const handleUploadProject = async (e) => {
    e.preventDefault();
    if (!formProject.title.trim()) {
      return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Judul proyek wajib diisi bro!' });
    }

    try {
      const formData = new FormData();
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== "undefined") {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.id) {
          formData.append('user_id', parsedUser.id); 
        }
      }
      
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
  
  // 1. Ambil data dari localStorage
  const localData = localStorage.getItem('user');
  const targetUser = localData ? JSON.parse(localData) : null;

  if (!targetUser || !targetUser.id) {
    alert("Sesi login tidak terbaca bro, silakan login ulang.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('id', targetUser.id); 
    formData.append('name', formProfile.name || '');
    formData.append('bio', formProfile.bio || '');     
    formData.append('nim', formProfile.nim || ''); 

    if (typeof selectedAvatar !== 'undefined' && selectedAvatar) {
      formData.append('avatar', selectedAvatar);
    }

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/users/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const resData = await response.json();

    if (response.ok && resData.user) {
      // Update data di local storage
      const updatedUserData = { ...targetUser, ...resData.user };
      delete updatedUserData.university; 
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Kirim signal update ke Sidebar
      window.dispatchEvent(new Event("profileUpdated"));
      setIsProfileModalOpen(false);

      // 🎯 SOLUSI ALERT: Kasih jeda / tunggu user klik OK baru reload
      if (typeof Swal !== 'undefined') {
        // Jika pakai SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Profil sukses diperbarui!',
          confirmButtonColor: '#0a66c2'
        }).then(() => {
          window.location.reload(); // Reload jalan SETELAH user klik OK
        });
      } else {
        // Jika pakai Alert Bawaan Browser
        alert("Profil dan NIM berhasil diperbarui!");
        window.location.reload(); // Reload jalan SETELAH user klik OK di alert
      }

    } else {
      alert(resData.message || "Gagal memperbarui profil.");
    }

  } catch (error) {
    console.error("Error submit profil:", error);
    alert("Terjadi kesalahan koneksi ke server.");
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
    if (!savedUser || savedUser === "undefined") return false;
    try {
      const parsedUser = JSON.parse(savedUser);
      return proj && parsedUser && proj.user_id == parsedUser.id; 
    } catch (e) {
      return false;
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesCategory = selectedCategory === "All" || 
      proj.tags?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    const matchesSearch = 
      proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tech_stack?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const fetchUserPalingAktif = async () => {
      try {
        const token = localStorage.getItem('token');
        const resProjects = await API.get('/projects', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const semuaProject = resProjects.data.data;
        if (!semuaProject || !Array.isArray(semuaProject)) return;

        const userProjectCount = {};

        semuaProject.forEach((proj) => {
          const uid = proj.user_id || proj.userId;
          if (uid) {
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
  }, [isLoggedIn]); 

const handleToggleLike = async (projectId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({ title: 'Mau kasih Like?', text: 'Login dulu yuk bro!', icon: 'info' });
      return;
    }

    const response = await fetch(`http://localhost:3000/likes/${projectId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // 🔥 TRICK SAKTI: Update langsung data di state tanpa reload halaman!
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === projectId) {
            const currentLiked = p.isLiked;
            return {
              ...p,
              isLiked: !currentLiked,
              // Kalau tadinya udah dilike berarti sekarang berkurang 1, kalau belum berarti nambah 1
              likesCount: currentLiked ? (p.likesCount || 1) - 1 : (p.likesCount || 0) + 1
            };
          }
          return p;
        })
      );
    }
  } catch (error) {
    console.error("Error pas toggle like:", error);
  }
};


const openCommentModal = async (projectObj) => {
  try {
    console.log("Project yang diklik:", projectObj);

    if (!projectObj || !projectObj.id) {
      console.error("ID Project tidak ditemukan!");
      return;
    }

    // 🔑 AMBIL DAN DECODE TOKEN SECARA MANUAL
    let currentUserId = null;
    const activeToken = localStorage.getItem('token');
    if (activeToken) {
      try {
        const base64Url = activeToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        currentUserId = decoded.id;
      } catch (e) {
        console.error("Gagal decode token di modal:", e);
      }
    }

    // 1. Ambil data komentar dari backend
    const response = await fetch(`http://localhost:3000/comments/${projectObj.id}`);
    
    if (!response.ok) {
      Swal.fire({ icon: 'error', title: 'Aduh Bro', text: 'Gagal memuat daftar komentar untuk project ini.' });
      return;
    }

    const resData = await response.json();
    const commentList = resData.data || [];

    // 🔄 STATE GLOBAL SEMENTARA
    window.currentParentId = null;

    // 2. Susun HTML daftar komentar
    let commentsHTML = `<div style="text-align: left; max-height: 300px; overflow-y: auto; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">`;
    
    if (commentList.length === 0) {
      commentsHTML += `<p style="color: #94a3b8; text-align: center; padding: 16px 0; font-size: 12px; font-weight: 400; margin: 0;">Belum ada komentar nih bro. Jadi yang pertama komen yuk!</p>`;
    } else {
      // 🧠 STRATEGI: Pisah antara Komentar Utama dan Balasan
      const mainComments = commentList.filter(c => c.parent_id === null);
      const replies = commentList.filter(c => c.parent_id !== null);

      mainComments.forEach(c => {
        const avatarUrl = c.user_avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        const teksKomen = c.comment || ''; 
        const isMyComment = currentUserId && Number(c.user_id) === Number(currentUserId);

        // Cari tahu ada berapa balasan khusus untuk komentar utama ini
        const itemReplies = replies.filter(r => Number(r.parent_id) === Number(c.id));
        const hasReplies = itemReplies.length > 0;

        commentsHTML += `
          <div id="comment-box-${c.id}" style="margin-bottom: 14px;">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <img src="${avatarUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; margin-top: 2px;" />
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 10px; flex: 1; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1; text-align: left;">
                  <p style="font-weight: 800; color: #1e293b; font-size: 12px; margin: 0; margin-bottom: 2px;">${c.user_name || 'Anonymous'}</p>
                  <p style="color: #475569; font-size: 12px; font-weight: 400; margin: 0; line-height: 1.5;">${teksKomen}</p>
                  
                  <div style="margin-top: 6px; display: flex; gap: 12px; align-items: center;">
                   

<span 
  onclick="window.setReplyToGlobal(${c.id}, '${c.user_name || 'Anonymous'}')" 
  style="color: #2563eb; font-size: 11px; font-weight: bold; cursor: pointer;"
>
  💬 Balas
</span>

                    ${hasReplies ? `
                      <span 
                        id="toggle-btn-${c.id}"
                        onclick="window.toggleRepliesGlobal(${c.id})" 
                        style="color: #64748b; font-size: 11px; font-weight: 600; cursor: pointer; background-color: #f1f5f9; padding: 2px 6px; border-radius: 6px;"
                      >
                        👁️ Lihat ${itemReplies.length} Balasan
                      </span>
                    ` : ''}
                  </div>
                </div>
                
                ${isMyComment ? `
                  <button 
                    onclick="window.deleteCommentGlobal(${c.id}, ${projectObj.id})" 
                    style="background: transparent; border: none; color: #ef4444; font-size: 11px; cursor: pointer; padding: 2px 4px; margin-left: 6px; font-weight: bold;"
                    title="Hapus Komentar"
                  >
                    🗑️
                  </button>
                ` : ''}
              </div>
            </div>

            <div id="replies-container-${c.id}" style="display: none; margin-left: 36px; margin-top: 8px; border-left: 2px solid #e2e8f0; padding-left: 8px;">
        `;

        // Masukin list balasannya ke dalam container tersembunyi tadi
       // 🔄 KODE LAMA LU YANG DI DALAM LOOP UTAMA (YANG BAGIAN REPLIES):
        itemReplies.forEach(r => {
          const rAvatarUrl = r.user_avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
          const isMyReply = currentUserId && Number(r.user_id) === Number(currentUserId);

          commentsHTML += `
            <div id="comment-box-${r.id}" style="display: flex; gap: 6px; align-items: flex-start; margin-bottom: 8px;">
              <img src="${rAvatarUrl}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; margin-top: 2px;" />
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 8px 10px; flex: 1; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1; text-align: left;">
                  <p style="font-weight: 800; color: #334155; font-size: 11px; margin: 0; margin-bottom: 2px;">${r.user_name || 'Anonymous'}</p>
                  <p style="color: #475569; font-size: 11px; font-weight: 400; margin: 0; line-height: 1.4;">${r.comment}</p>
                  
                  <span 
                    onclick="window.setReplyToGlobal(${c.id}, '${r.user_name || 'Anonymous'}')" 
                    style="color: #2563eb; font-size: 10px; font-weight: bold; cursor: pointer; display: inline-block; margin-top: 4px;"
                  >
                    💬 Balas
                  </span>
                </div>
                
                ${isMyReply ? `
                  <button 
                    onclick="window.deleteCommentGlobal(${r.id}, ${projectObj.id})" 
                    style="background: transparent; border: none; color: #ef4444; font-size: 10px; cursor: pointer; padding: 0 2px;"
                  >
                    🗑️
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        });

        commentsHTML += `
            </div>
          </div>
        `;
      });
    }
    commentsHTML += `</div>`;

    // 🛑 FUNGSI GLOBAL 1: TOGGLE SHOW/HIDE BALASAN (FUNGSI SAKTI YANG LU MINTA)
    window.toggleRepliesGlobal = (mainCommentId) => {
      const container = document.getElementById(`replies-container-${mainCommentId}`);
      const btn = document.getElementById(`toggle-btn-${mainCommentId}`);
      
      if (container && btn) {
        if (container.style.display === 'none') {
          container.style.display = 'block'; // Tampilkan balsean
          // Hitung jumlah balasan buat ditaruh di teks
          const count = container.children.length;
          btn.innerHTML = `🙈 Sembunyikan Balasan`;
        } else {
          container.style.display = 'none'; // Sembunyikan kembali
          const count = container.children.length;
          btn.innerHTML = `👁️ Lihat ${count} Balasan`;
        }
      }
    };

    // 🛑 FUNGSI GLOBAL 2: ATUR REPLY
    window.setReplyToGlobal = (parentId, username) => {
      window.currentParentId = parentId;
      const indicatorEl = document.getElementById('reply-indicator');
      if (indicatorEl) {
        indicatorEl.innerHTML = `Membalas <b>@${username}</b>... <span onclick="window.cancelReplyGlobal()" style="color: #ef4444; cursor: pointer; margin-left: 6px; font-weight: bold;">[Batal]</span>`;
        indicatorEl.style.display = 'block';
      }
    };

    // 🛑 FUNGSI GLOBAL 3: BATALKAN BALASAN
    window.cancelReplyGlobal = () => {
      window.currentParentId = null;
      const indicatorEl = document.getElementById('reply-indicator');
      if (indicatorEl) {
        indicatorEl.style.display = 'none';
        indicatorEl.innerHTML = '';
      }
    };

    // 🛑 FUNGSI GLOBAL 4: HAPUS KOMENTAR
    window.deleteCommentGlobal = async (commentId, projectId) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const confirmDelete = await Swal.fire({
        title: 'Hapus komentar lu?',
        text: 'Komentar ini bakal ilang permanen bro!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        customClass: { popup: 'rounded-2xl' }
      });

      if (!confirmDelete.isConfirmed) return;

      try {
        const response = await fetch(`http://localhost:3000/comments/${commentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const commentEl = document.getElementById(`comment-box-${commentId}`);
          if (commentEl) commentEl.remove();

          if (typeof setProjects === "function") {
            setProjects((prevProjects) =>
              prevProjects.map((p) =>
                p.id === projectId ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1) } : p
              )
            );
          }
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Komentar berhasil dihapus.', timer: 1200, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gak bisa hapus komentar ini bro.' });
        }
      } catch (err) {
        console.error("Gagal hapus komentar:", err);
      }
    };

    // 3. Tampilkan Pop-up SweetAlert2
    Swal.fire({
      title: `<span style="font-size: 14px; font-weight: 800; color: #334155;">Komentar: ${projectObj.title || 'Project'}</span>`,
      html: `
        ${commentsHTML}
        <div id="reply-indicator" style="display: none; text-align: left; font-size: 11px; color: #64748b; margin-bottom: 6px; padding: 4px 8px; background-color: #f1f5f9; border-radius: 6px;"></div>
        <textarea id="swal-comment-input" placeholder="Tulis komentar atau balasan lu di sini bro..." style="box-sizing: border-box; width: 100%; min-height: 70px; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; resize: none; outline: none;"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Kirim',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      customClass: { popup: 'rounded-2xl' },
      preConfirm: () => {
        const commentValue = document.getElementById('swal-comment-input').value;
        if (!commentValue || commentValue.trim() === '') {
          Swal.showValidationMessage('Komentar gak boleh kosong bro! 😄');
          return false;
        }
        return {
          comment: commentValue,
          parent_id: window.currentParentId
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({ icon: 'info', title: 'Login Dulu Bro', text: 'Lu harus login dulu ya sebelum bisa ngirim komen!', confirmButtonColor: '#2563eb' });
          return;
        }

        const sendResponse = await fetch(`http://localhost:3000/comments/${projectObj.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: result.value.comment,
            parent_id: result.value.parent_id
          })
        });

        if (sendResponse.ok) {
          Swal.fire({ icon: 'success', title: 'Komen Terkirim!', showConfirmButton: false, timer: 1200 });

          if (typeof setProjects === "function") {
            setProjects((prevProjects) =>
              prevProjects.map((p) =>
                p.id === projectObj.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
              )
            );
          }
        } else {
          const errData = await sendResponse.json();
          Swal.fire({ icon: 'error', title: 'Gagal Komen', text: errData.message });
        }
      }
    });

  } catch (error) {
    console.error("ERROR DI MODAL KOMEN:", error);
  }
};
const handleToggleBookmark = async (projectId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({ title: 'Mau simpan project?', text: 'Login dulu yuk bro!', icon: 'info' });
      return;
    }

    const response = await fetch(`http://localhost:3000/bookmarks/${projectId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // 🔥 TRICK SAKTI: Ganti warna & manipulasi angka counter secara realtime di layar!
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === projectId) {
            const statusTerbaru = !p.isBookmarked; // Cek status setelah diklik (true/false)
            
            return { 
              ...p, 
              isBookmarked: statusTerbaru,
              // Kalau statusnya jadi true (disimpan) -> Angka + 1. Kalau false (dihapus) -> Angka - 1
              bookmarksCount: statusTerbaru 
                ? (p.bookmarksCount || 0) + 1 
                : Math.max(0, (p.bookmarksCount || 0) - 1)
            };
          }
          return p;
        })
      );
    }
  } catch (error) {
    console.error("Error pas toggle bookmark:", error);
  }
};

// ========================================================
// 🟢 FIX UTAMA: Pindahin data login ke form modal pas dibuka
// ========================================================
useEffect(() => {
  if (isProfileModalOpen) {
    // Ambil data user yang sedang login dari localStorage
    const localData = localStorage.getItem('user');
    
    if (localData) {
      const targetUser = JSON.parse(localData);
      
      console.log("Modal dibuka! Mengisi data awal:", targetUser); // Cek di console log lu bro
      
      // Masukkan data user login ke dalam form modal
      setFormProfile({
        name: targetUser.name || '',
        nim: targetUser.nim || '', // 🎯 KUNCI UTAMA: NIM lu bakal langsung nangkring di kotak input
        bio: targetUser.bio || ''
      });
    }
  }
}, [isProfileModalOpen]); // 👈 Efek ini bakal jalan SETIAP KALI modal dibuka
  
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
  setActiveProjectDetails={setActiveProjectDetails} // 🔥 Lempar state setter modal lu ke sini!
/>

        {/* 2. FEED MIDDLE */}
        <main className="flex flex-col gap-4">
        
          {/* ================= FILTER KATEGORI POLOS ALA LINKEDIN ================= */}
          <div className="flex justify-between items-center bg-transparent py-2 px-1">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Semua Portofolio</span>
            <div className="flex gap-2 flex-wrap"> 
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

{/* ================= MODAL UPDATE PROFIL BARU (FIXED ANTI-STUCK) ================= */}
{isProfileModalOpen && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-slate-100">
      
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider m-0">Edit Profil</h3>
        </div>
        <button 
          type="button" 
          onClick={() => setIsProfileModalOpen(false)} 
          className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold"
        >
          &times;
        </button>
      </div>

      <form 
        onSubmit={(e) => {
          console.log("Form disubmit! Data yang dikirim:", formProfile); // 🔍 Untuk debug di console log inspect element
          handleUpdateProfile(e);
        }} 
        className="p-6 flex flex-col gap-4 text-left"
      >
        {/* NAMA LENGKAP */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Nama Lengkap *</label>
          <input 
            type="text" 
            value={formProfile?.name || ''} // 🟢 Ditambah tanda tanya (?) biar gak crash kalau objek formProfile null
            onChange={(e) => setFormProfile({...formProfile, name: e.target.value})}
            className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
            required // Wajib diisi
          />
        </div>

        {/* NOMOR INDUK MAHASISWA (NIM) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Nomor Induk Mahasiswa (NIM)</label>
          <input 
            type="text" 
            value={formProfile?.nim || ''} 
            onChange={(e) => setFormProfile({...formProfile, nim: e.target.value})} 
            placeholder="Contoh: 201011400123" 
            className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
          />
        </div>

        {/* BIO / HEADLINE PROFIL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Bio / Headline Profil</label>
          <textarea 
            value={formProfile?.bio || ''}
            onChange={(e) => setFormProfile({...formProfile, bio: e.target.value})}
            placeholder="Contoh: Web Developer Enthusiast | UI/UX Designer" 
            className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium h-16 resize-none"
          />
        </div>

        {/* FOTO PROFIL (AVATAR) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Foto Profil (Avatar)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedAvatar(e.target.files[0]);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <p className="text-[11px] font-bold text-slate-500 m-0">
              {selectedAvatar ? `Selected: ${selectedAvatar.name}` : 'Klik untuk ganti foto profil'}
            </p>
          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-2.5">
          <button 
            type="button" 
            onClick={() => setIsProfileModalOpen(false)} 
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl border-0 cursor-pointer transition-all"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="px-5 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-black rounded-xl border-0 cursor-pointer shadow-md transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
)}


          {/* RENDERING FEED PROJECT */}
          {loading ? (
            <div className="card-white p-10 text-center text-xs font-bold text-slate-500">Loading karya mahasiswa...</div>
          ) : filteredProjects.length === 0 ? ( 
            <div className="card-white p-10 text-center text-xs font-bold text-slate-500">Belum ada portofolio di kategori ini. 🚀</div>
          ) : (
            filteredProjects.map((proj) => ( 
              <div key={proj.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-left flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
                
                {/* 1. HEADER USER PROFILE */}
                <div className="flex justify-between items-center relative"> 
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

                    {/* 🔥 DROPDOWN MENAMPILKAN EDIT KARENA MEMANG OWNER NYA */}
                    {isProjectOwner(proj) && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setActiveMenuProjectId(activeMenuProjectId === proj.id ? null : proj.id);
                          }}
                          className="text-slate-400 hover:text-slate-700 font-bold bg-transparent border-0 px-2 py-1 cursor-pointer text-base rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          •••
                        </button>

                        {/* 📋 DROPDOWN MENU EDIT */}
                        {activeMenuProjectId === proj.id && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 animate-fade-in text-left">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setActiveMenuProjectId(null);
      openEditModal(proj);
    }}
    className="w-full text-left bg-transparent border-0 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2 whitespace-nowrap"
  >
    ✏️ Edit Project
  </button>

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      setActiveMenuProjectId(null); // Tutup dropdown menu
      
      // 🔴 LANGSUNG PANGGIL: Konfirmasinya sudah diurus di dalam fungsi handleDeleteProject pake Swal
      handleDeleteProject(proj.id); 
    }}
    className="w-full text-left bg-transparent border-0 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 whitespace-nowrap transition-colors duration-150"
  >
    🗑️ Hapus Project
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

                {/* 4. REPO BOX */}
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
  
  {/* 1. TOMBOL LIKE (Udah disesuaiin pake proj) */}
  <button 
    type="button" 
    onClick={(e) => {
      e.stopPropagation();
      handleToggleLike(proj.id); // 👈 Pake proj
    }}
    className={`flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg bg-transparent border-0 cursor-pointer transition-colors ${
      proj.isLiked ? 'text-blue-600 font-extrabold' : 'text-slate-600'
    }`}
  >
    <span className="text-sm">{proj.isLiked ? '👍' : '👍🏻'}</span> 
    <span>{proj.likesCount || 0} Likes</span>
  </button>

  {/* 2. TOMBOL COMMENT (Udah disesuaiin pake proj) */}
  <button 
    type="button" 
    onClick={(e) => {
      e.stopPropagation();
      openCommentModal(proj); // 👈 Pake proj
    }}
    className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg bg-transparent border-0 cursor-pointer text-slate-600 transition-colors"
  >
    <span className="text-sm">💬</span> 
    <span>{proj.commentsCount || 0} Comments</span>
  </button>

  {/* 3. TOMBOL BOOKMARK (Udah disesuaiin pake proj + munculin total angka) */}
<button 
  type="button" 
  onClick={(e) => {
    e.stopPropagation();
    handleToggleBookmark(proj.id); // 👈 Pake proj
  }}
  className={`flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg bg-transparent border-0 cursor-pointer transition-colors ${
    proj.isBookmarked ? 'text-blue-600 font-bold' : 'text-slate-600'
  }`}
>
  <span className="text-sm">{proj.isBookmarked ? '🔖' : '📑'}</span> 
  <span>{proj.isBookmarked ? 'Saved' : 'Bookmark'}</span>
  
  {/* 🔥 ANGKA COUNTER BOOKMARK REALTIME */}
  <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-4 text-center group-hover:bg-slate-200">
    {proj.bookmarksCount || 0}
  </span>
</button>

</div>

              </div>
            ))
          )}
        </main>

        <SidebarRight 
          rekomendasiUsers={rekomendasiUsers} 
          bukaModalLogin={bukaModalLogin} 
        />    
      </div>

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
                  placeholder="Jelaskan secara ringkas fitur utama, masalah yang lu selesaikan..." 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium h-20 resize-none"
                />
              </div>

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
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <p className="text-xs text-slate-500 m-0 font-medium">
                    {selectedImage ? `Selected: ${selectedImage.name}` : "Klik / Seret file gambar screenshot web di sini"}
                  </p>
                </div>
              </div>

              <button type="submit" className="bg-[#0a66c2] hover:bg-[#004182] text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer text-xs mt-2 transition-colors">
                Publish Portofolio Karya 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🔥 BARU: MODAL EDIT/UPDATE PROJECT EXISTING ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-slate-100">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square text-[#0a66c2] text-lg"></i>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider m-0">Perbarui Project Portofolio</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProjectSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Judul Project *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formEditProject.title}
                  onChange={handleEditInputChange}
                  placeholder="Ubah judul proyek..." 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Deskripsi Singkat Project</label>
                <textarea 
                  name="description"
                  value={formEditProject.description}
                  onChange={handleEditInputChange}
                  placeholder="Ubah deskripsi..." 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium h-20 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Tech Stack</label>
                <input 
                  type="text" 
                  name="tech_stack"
                  value={formEditProject.tech_stack}
                  onChange={handleEditInputChange}
                  placeholder="Ubah komponen tech stack..." 
                  className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">GitHub Repository Link</label>
                  <input 
                    type="url" 
                    name="github_link"
                    value={formEditProject.github_link}
                    onChange={handleEditInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Live Demo Link (Opsional)</label>
                  <input 
                    type="url" 
                    name="demo_link"
                    value={formEditProject.demo_link}
                    onChange={handleEditInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Kategori Project</label>
                  <select 
                    name="tags" 
                    value={formEditProject.tags}
                    onChange={handleEditInputChange}
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
                    value={formEditProject.is_free}
                    onChange={handleEditInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0a66c2] font-bold bg-white"
                  >
                    <option value="1">Public / Gratis Dikloning 🟢</option>
                    <option value="0">Premium / Izin Owner 🟡</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Ganti Gambar Preview (Opsional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <p className="text-xs text-slate-500 m-0 font-medium">
                    {selectedEditImage ? `Selected: ${selectedEditImage.name}` : "Pilih file gambar baru jika ingin mengganti screenshot"}
                  </p>
                </div>
              </div>

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer text-xs mt-2 transition-colors">
                Simpan Perubahan Karya 💾
              </button>
            </form>
          </div>
        </div>
      )}


      {/* ================= MODAL DETAIL POPUP VIEW PROJECT ================= */}
      {activeProjectDetails && (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 transition-all animate-fade-in text-slate-100">
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[92vh] md:max-h-[85vh] animate-slide-up">
      
      {/* SISI KIRI: SCREENSHOT APP */}
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

      {/* SISI KANAN: DETAIL INFO & DISKUSI */}
      <div className="w-full md:w-2/5 flex flex-col h-full bg-[#161b22]">
        
        {/* HEADER MODAL: DATA PROFIL AUTHOR (SUDAH DI-FIX) */}
        <div className="p-5 border-b border-[#30363d] flex justify-between items-center shrink-0">
          <div className="flex gap-3 items-center">
            
            {/* 1. FOTO PROFIL / INISIAL */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-800 overflow-hidden shrink-0">
              {activeProjectDetails.author?.avatar ? (
                <img src={activeProjectDetails.author.avatar.startsWith('http') ? activeProjectDetails.author.avatar : `http://localhost:3000/uploads/${activeProjectDetails.author.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : activeProjectDetails.user_id === user?.id && user?.avatar ? (
                <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000/uploads/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(activeProjectDetails.author?.name || (activeProjectDetails.user_id === user?.id ? user?.name : 'U'))
              )}
            </div>
            
            {/* 2. NAMA & NIM AUTHOR */}
            <div className="text-left">
              <h4 className="text-xs font-bold text-white m-0">
                {activeProjectDetails.author?.name || 
                 (activeProjectDetails.user_id === user?.id ? user?.name : 'Anonymous')}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium m-0 mt-0.5">
                {activeProjectDetails.author?.nim || 
                 (activeProjectDetails.user_id === user?.id ? user?.university || user?.nim : 'Mahasiswa')}
              </p>
            </div>

          </div>

          {/* TOMBOL CLOSE MODAL */}
          <button onClick={() => setActiveProjectDetails(null)} className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xl font-bold p-1 leading-none">
            &times;
          </button>
        </div>

        {/* BODY MODAL: DESKRIPSI, TECH STACK, KOMENTAR */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto text-left flex-grow">
          
          {/* JUDUL & DESKRIPSI */}
          <div>
            <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider mb-2 inline-block">
              {activeProjectDetails.tags || 'PROJECT'}
            </span>
            <h3 className="text-sm font-extrabold text-white leading-snug m-0">{activeProjectDetails.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium m-0 mt-2 whitespace-pre-line bg-[#0d1117] p-3 rounded-xl border border-[#30363d]">
              {activeProjectDetails.description || 'Tidak ada deskripsi tambahan.'}
            </p>
          </div>

          {/* TECH STACK REFERENCE */}
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

          {/* DISKUSI / KOMENTAR DINAMIS */}
          <div className="border-t border-[#30363d] pt-3 flex-grow flex flex-col min-h-[150px]">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0 mb-2">
              Diskusi Proyek ({activeComments.length})
            </h5>
            
            <div className="flex flex-col gap-2 flex-grow overflow-y-auto max-h-[200px] pr-1">
              {activeComments.length === 0 ? (
                <div className="flex flex-col gap-2 flex-grow justify-center items-center text-center text-slate-500 text-[11px] py-4 bg-[#0d1117] rounded-xl border border-[#30363d] border-dashed">
                  <span>💬 Belum ada komentar. <br/>Jadilah yang pertama mengapresiasi!</span>
                </div>
              ) : (
                activeComments.map((c, index) => (
                  <div key={index} className="flex gap-2.5 items-start bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d] text-left">
                    <img 
                      src={c.user_avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                      className="w-7 h-7 rounded-full object-cover border border-[#30363d] shrink-0" 
                      alt="Avatar"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-extrabold text-slate-200 block truncate">
                        {c.user_name || 'Anonymous'}
                      </span>
                      <p className="text-[11px] text-slate-300 m-0 mt-0.5 leading-relaxed font-medium whitespace-pre-line">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* FOOTER MODAL: LINK SOURCE & DEMO */}
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

