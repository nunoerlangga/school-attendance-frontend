import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GenerateQrModal from "./GenerateQrModal";
import JadwalGuruPage from "./JadwalGuruPage";
import GuruPenilaianPage from "./GuruPenilaianPage";
import GuruAbsensiPage from "./GuruAbsensiPage";

interface Student {
  id_siswa: string;
  nama: string;
  kelas: string;
  foto: string;
  status_penilaian: "belum" | "sudah";
  id_penilaian: string | null;
}

const GuruDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);
  const [jadwalAktif, setJadwalAktif] = useState<any>(null);
  const [loadingJadwalAktif, setLoadingJadwalAktif] = useState(true);
  const [hasCategories, setHasCategories] = useState(true);

  const userNama = localStorage.getItem("nama") || "Guru";
  const userRole = localStorage.getItem("role") || "guru";
  const idGuru = localStorage.getItem("id_guru") || "";

  const formatRole = (role: string) => {
    if (role === "admin") return "Administrator";
    if (role === "guru") return "Guru";
    if (role === "siswa") return "Siswa";
    return role;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };



  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/guru/siswa-kelas");
      if (res.data) {
        setStudents(res.data);
      }

      const resCat = await api.get('/kategori-penilaian');
      if (resCat.data && resCat.data.length > 0) {
        setHasCategories(true);
      } else {
        setHasCategories(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchStudents();
      fetchJadwalAktif();
      fetchJadwalList();
    } else if (activeTab === "jadwal" || activeTab === "absensi") {
      fetchJadwalList();
    }
  }, [activeTab]);

  const fetchJadwalAktif = async () => {
    if (!idGuru) {
      setLoadingJadwalAktif(false);
      return;
    }
    try {
      setLoadingJadwalAktif(true);
      const res = await api.get(`/jadwal/guru/aktif/${idGuru}`);
      if (res.data && res.data.aktif) {
        setJadwalAktif(res.data.data);
      } else {
        setJadwalAktif(null);
      }
    } catch (error) {
      console.error("Error fetching jadwal aktif:", error);
      setJadwalAktif(null);
    } finally {
      setLoadingJadwalAktif(false);
    }
  };

  const fetchJadwalList = async () => {
    try {
      setLoadingJadwal(true);
      const res = await api.get("/jadwal");
      if (res.data && idGuru) {
        // Filter by current guru secara client-side
        const filtered = res.data.filter((j: any) => j.id_guru === idGuru);
        setJadwalList(filtered);
      }
    } catch (error) {
      console.error("Error fetching jadwal:", error);
    } finally {
      setLoadingJadwal(false);
    }
  };

  const handleOpenQrModal = (jadwal: any) => {
    setSelectedJadwal(jadwal);
    setIsQrModalOpen(true);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      id: "penilaian",
      label: "Penilaian Siswa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      ),
    },
    {
      id: "absensi",
      label: "Absensi Siswa",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <polyline points="16 11 18 13 22 9"></polyline>
        </svg>
      ),
    },
    {
      id: "jadwal",
      label: "Jadwal Saya",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
  ];





  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  const currentHari = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][new Date().getDay()];
  const jadwalHariIni = jadwalList.filter(j => j.hari.toLowerCase() === currentHari);

  const formatJadwalTime = (timeData: string) => {
    if (!timeData) return '';
    if (timeData.includes('T')) {
      return new Date(timeData).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    }
    return timeData.substring(0, 5).replace(':', '.');
  };

  const isJadwalActive = (jamMulaiData: string, jamSelesaiData: string) => {
    if (!jamMulaiData || !jamSelesaiData) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let startMins = 0;
    let endMins = 0;

    if (jamMulaiData.includes('T')) {
      const dStart = new Date(jamMulaiData);
      startMins = dStart.getHours() * 60 + dStart.getMinutes();
    } else {
      const [h, m] = jamMulaiData.substring(0, 5).split(':');
      startMins = parseInt(h, 10) * 60 + parseInt(m, 10);
    }

    if (jamSelesaiData.includes('T')) {
      const dEnd = new Date(jamSelesaiData);
      endMins = dEnd.getHours() * 60 + dEnd.getMinutes();
    } else {
      const [h, m] = jamSelesaiData.substring(0, 5).split(':');
      endMins = parseInt(h, 10) * 60 + parseInt(m, 10);
    }

    // Give 10 minutes early tolerance for Generate QR
    return currentMinutes >= (startMins - 10) && currentMinutes <= endMins;
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? "menu-open" : ""}`}>
      {/* Sidebar Overlay for Mobile */}
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="app-logo small">AbsenZie</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => handleTabClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h2>{menuItems.find((m) => m.id === activeTab)?.label}</h2>
          </div>
          <div
            className="user-profile"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="avatar">{getInitials(userNama)}</div>
            <div className="user-info">
              <span className="user-name">{userNama}</span>
              <span className="user-role">{formatRole(userRole)}</span>
            </div>
            {isProfileOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profil Saya
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="dashboard-body">
          {activeTab === "dashboard" ? (
            <div className="evaluator-dashboard">
              <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                <h1>Selamat Datang di Dasboard Guru</h1>
                <p>Gunakan menu sidebar untuk mengakses fitur penjadwalan kelas, absen siswa, dan penilaian kinerja. Semoga hari Anda menyenangkan!</p>
              </div>
              {/* Stats / Shortcuts */}
              <div className="stats-grid">
                <div className="stat-card" onClick={() => handleTabClick('jadwal')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value">{jadwalList.length}</span>
                    <span className="stat-label">Jadwal Mengajar</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => handleTabClick('jadwal')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value">{new Set(jadwalList.map((j: any) => j.id_kelas)).size}</span>
                    <span className="stat-label">Kelas Yang Diajar</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => handleTabClick('penilaian')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value">{students.length}</span>
                    <span className="stat-label">Siswa Yang Diajar</span>
                  </div>
                </div>
              </div>

              {/* Jadwal Hari Ini Cards */}
              <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' }}>Jadwal Mengajar Hari Ini</h3>

                {jadwalHariIni.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {jadwalHariIni.map((jadwal, idx) => {
                      const isActive = isJadwalActive(jadwal.jam_mulai, jadwal.jam_selesai);
                      return (
                        <div key={jadwal.id_jadwal || idx} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                              {jadwal.kelas.nama_kelas.replace('Kelas ', '')}
                            </span>
                            <span style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500, textTransform: 'lowercase' }}>
                              {jadwal.hari}
                            </span>
                          </div>
                          <div style={{ padding: '1.25rem' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{jadwal.mapel.nama_mapel}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {formatJadwalTime(jadwal.jam_mulai)} - {formatJadwalTime(jadwal.jam_selesai)} WIB
                            </div>
                            <button
                              disabled={!isActive}
                              title={!isActive ? "Belum atau sudah melewati waktu absensi" : ""}
                              style={{ width: '100%', background: isActive ? '#6366f1' : '#cbd5e1', color: isActive ? 'white' : '#94a3b8', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: isActive ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                              onMouseOver={(e) => { if (isActive) e.currentTarget.style.background = '#4f46e5'; }}
                              onMouseOut={(e) => { if (isActive) e.currentTarget.style.background = '#6366f1'; }}
                              onClick={() => handleOpenQrModal(jadwal)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                              {isActive ? 'Generate QR Absensi' : 'Tidak Tersedia'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                    Tidak ada jadwal mengajar hari ini.
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "penilaian" ? (
            <GuruPenilaianPage
              students={students}
              hasCategories={hasCategories}
              jadwalAktif={jadwalAktif}
              loadingJadwalAktif={loadingJadwalAktif}
              onOpenQrModal={handleOpenQrModal}
              loading={loading}
            />
          ) : activeTab === "jadwal" ? (
            <JadwalGuruPage
              loadingJadwal={loadingJadwal}
              jadwalList={jadwalList}
              onOpenQrModal={handleOpenQrModal}
            />
          ) : activeTab === "absensi" ? (
            <GuruAbsensiPage jadwalList={jadwalList} />
          ) : (
            <div className="placeholder-content">
              <h3>
                Fitur {menuItems.find((m) => m.id === activeTab)?.label} sedang
                dikembangkan.
              </h3>
            </div>
          )}
        </section>
      </main>

      <GenerateQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        jadwal={selectedJadwal}
      />
    </div>
  );
};

export default GuruDashboard;
