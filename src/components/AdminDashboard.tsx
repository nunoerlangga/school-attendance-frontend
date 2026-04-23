
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SiswaPage from './SiswaPage';
import GuruPage from './GuruPage';
import SekolahPage from './SekolahPage';
import TahunAjaranPage from './TahunAjaranPage';
import KategoriPenilaianPage from './KategoriPenilaianPage';
import LaporanPenilaianPage from './LaporanPenilaianPage';
import JadwalPage from './JadwalPage';
import RekapAbsensiPage from './RekapAbsensiPage';
import KelasPage from './KelasPage';
import HariLiburPage from './HariLiburPage';
import PointRulePage from './PointRulePage';
import MataPelajaranPage from './MataPelajaranPage';
import ManageMarketplacePage from './ManageMarketplacePage';
import LokasiSekolahPage from './LokasiSekolahPage';
import LeaderboardPage from './LeaderboardPage';
import HelpdeskPage from './HelpdeskPage';
import { useLocation } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userNama, setUserNama] = useState('');
  const [userRole, setUserRole] = useState('');

  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalGuru: 0,
    totalKelas: 0,
    tahunAktif: '-'
  });
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clean up the state so it doesn't persist on reload
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const nama = localStorage.getItem('nama');

    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }

    setUserNama(nama || 'Admin');
    setUserRole(role);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [resSiswa, resGuru, resKelas, resTahun, resSekolah] = await Promise.all([
          api.get('/siswa'),
          api.get('/guru'),
          api.get('/kelas'),
          api.get('/tahun-ajaran'),
          api.get('/sekolah')
        ]);

        const activeTahun = resTahun.data.find((t: any) => t.is_aktif);

        setStats({
          totalSiswa: resSiswa.data.length, // Already filtered in backend
          totalGuru: resGuru.data.length,   // Already filtered in backend
          totalKelas: resKelas.data.filter((k: any) => k.is_aktif).length,
          tahunAktif: activeTahun ? activeTahun.nama_tahun : '-'
        });

        // Store school data
        if (resSekolah.data) {
          setSchoolData(resSekolah.data);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);



  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatRole = (role: string) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'guru') return 'Guru';
    if (role === 'siswa') return 'Siswa';
    return role;
  };

  const menuItems = [
    {
      id: 'dashboard', label: 'Dashboard Utama', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      )
    },
    {
      id: 'siswa', label: 'Data Siswa', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      )
    },
    {
      id: 'guru', label: 'Data Guru', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      )
    },
    {
      id: 'tahun-ajaran', label: 'Tahun Ajaran', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      )
    },
    {
      id: 'sekolah', label: 'Data Sekolah', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
      )
    },
    {
      id: 'lokasi-sekolah', label: 'Lokasi Sekolah', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
      )
    },
    {
      id: 'kelas', label: 'Data Kelas', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      )
    },
    {
      id: 'absen', label: 'Rekap Absensi', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      )
    },
    {
      id: 'mata-pelajaran', label: 'Mata Pelajaran', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      )
    },
    {
      id: 'jadwal', label: 'Jadwal Pelajaran', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      )
    },
    {
      id: 'hari-libur', label: 'Manajemen Hari Libur', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
      )
    },
    {
      id: 'kategori-penilaian', label: 'Kategori Penilaian', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
      )
    },
    {
      id: 'laporan-penilaian', label: 'Laporan Penilaian', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      )
    },
    {
      id: 'leaderboard', label: 'Leaderboard Siswa', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      )
    },

    {
      id: 'point-rule', label: 'Aturan Poin', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-5"></path></svg>
      )
    },
    {
      id: 'marketplace-admin', label: 'Marketplace Reward', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
      )
    },
    {
      id: 'helpdesk', label: 'Helpdesk Terpadu', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      )
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close sidebar on mobile when a tab is selected
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'menu-open' : ''}`}>
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
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
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
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h2>{menuItems.find(m => m.id === activeTab)?.label}</h2>
          </div>
          <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="avatar">{getInitials(userNama)}</div>
            <div className="user-info">
              <span className="user-name">{userNama}</span>
              <span className="user-role">{formatRole(userRole)}</span>
            </div>
            {isProfileOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('/profile')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Profil Saya
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="dashboard-body">
          {activeTab === 'dashboard' && (
            <>
              <div className="welcome-banner">
                <h1>Selamat Datang di AbsenZie! 👋</h1>
                <p>Kelola absensi sekolah Anda dengan mudah dan efisien.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value">{loading ? '...' : stats.totalSiswa.toLocaleString()}</span>
                    <span className="stat-label">Siswa Aktif</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value">{loading ? '...' : stats.totalGuru.toLocaleString()}</span>
                    <span className="stat-label">Guru Aktif</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon red">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value">{loading ? '...' : stats.totalKelas.toLocaleString()}</span>
                    <span className="stat-label">Kelas Aktif</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value" style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>{loading ? '...' : stats.tahunAktif}</span>
                    <span className="stat-label">Tahun Ajaran Aktif</span>
                  </div>
                </div>
              </div>

              {schoolData && (
                <div className="school-info-card">
                  <div className="card-header">
                    <div className="header-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </div>
                    <h3>Informasi Sekolah</h3>
                  </div>
                  <div className="school-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Nama Sekolah</span>
                      <span className="detail-value">{schoolData.nama_sekolah}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">NPSN</span>
                      <span className="detail-value">{schoolData.npsn || '-'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Jenjang</span>
                      <span className="detail-value" style={{ textTransform: 'uppercase' }}>{schoolData.jenjang}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="detail-label">Alamat</span>
                      <span className="detail-value">{schoolData.alamat || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'sekolah' && <SekolahPage />}
          {activeTab === 'lokasi-sekolah' && <LokasiSekolahPage />}
          {activeTab === 'kelas' && <KelasPage />}
          {activeTab === 'tahun-ajaran' && <TahunAjaranPage />}
          {activeTab === 'siswa' && <SiswaPage />}
          {activeTab === 'guru' && <GuruPage />}
          {activeTab === 'jadwal' && <JadwalPage />}
          {activeTab === 'kategori-penilaian' && <KategoriPenilaianPage />}
          {activeTab === 'laporan-penilaian' && <LaporanPenilaianPage />}
          {activeTab === 'absen' && <RekapAbsensiPage />}
          {activeTab === 'mata-pelajaran' && <MataPelajaranPage />}
          {activeTab === 'hari-libur' && <HariLiburPage />}
          {activeTab === 'point-rule' && <PointRulePage />}
          {activeTab === 'marketplace-admin' && <ManageMarketplacePage />}
          {activeTab === 'leaderboard' && <LeaderboardPage />}
          {activeTab === 'helpdesk' && <HelpdeskPage />}

          {activeTab === 'dashboard' && (
            <div className="recent-activity">
              <h3>Aktivitas Terakhir</h3>
              <div className="activity-list">
                <div className="placeholder-text">Belum ada aktivitas terbaru hari ini.</div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
