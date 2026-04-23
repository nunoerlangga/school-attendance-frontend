import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LaporanPenilaianPage from './LaporanPenilaianPage';
import LeaderboardPage from './LeaderboardPage';
import HistoryPointPage from './HistoryPointPage';
import HelpdeskSiswaPage from './HelpdeskSiswaPage';

interface StatistikAbsensi {
  hadir: number;
  izin: number;
  sakit: number;
  alfa: number;
  total: number;
  persentase_hadir: number;
}

const SiswaDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(true);
  const [semuaJadwal, setSemuaJadwal] = useState<any[]>([]);
  const [loadingSemuaJadwal, setLoadingSemuaJadwal] = useState(false);
  const [statistik, setStatistik] = useState<StatistikAbsensi | null>(null);
  const [loadingStatistik, setLoadingStatistik] = useState(true);
  const [totalPoin, setTotalPoin] = useState(0);
  const [loadingPoin, setLoadingPoin] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [myTokens, setMyTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const userNama = localStorage.getItem('nama') || 'Siswa AbsenZie';
  const userRole = localStorage.getItem('role') || 'siswa';
  const idSiswa = localStorage.getItem('id_siswa') || '';

  React.useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const response = await api.get('/jadwal/siswa/hari-ini');
        setJadwal(response.data);
      } catch (error) {
        console.error('Failed to fetch jadwal:', error);
      } finally {
        setLoadingJadwal(false);
      }
    };

    const fetchStatistik = async () => {
      if (!idSiswa) { setLoadingStatistik(false); return; }
      try {
        const res = await api.get(`/absensi/statistik/siswa/${idSiswa}`);
        setStatistik(res.data);
      } catch (error) {
        console.error('Failed to fetch statistik:', error);
      } finally {
        setLoadingStatistik(false);
      }
    };

    const fetchPoin = async () => {
      if (!idSiswa) { setLoadingPoin(false); return; }
      try {
        const res = await api.get(`/siswa/${idSiswa}`);
        setTotalPoin(res.data?.total_poin || 0);
      } catch (error) {
        console.error('Failed to fetch poin:', error);
      } finally {
        setLoadingPoin(false);
      }
    };

    fetchJadwal();
    fetchStatistik();
    fetchPoin();
  }, [idSiswa]);

  React.useEffect(() => {
    if (activeTab === 'jadwal' && !semuaJadwal.length) {
      const fetchSemuaJadwal = async () => {
        try {
          setLoadingSemuaJadwal(true);
          const response = await api.get('/jadwal/siswa/semua');
          setSemuaJadwal(response.data);
        } catch (error) {
          console.error('Failed to fetch semua jadwal:', error);
        } finally {
          setLoadingSemuaJadwal(false);
        }
      };
      fetchSemuaJadwal();
    }

    if (activeTab === 'marketplace') {
      const fetchItems = async () => {
        try {
          setLoadingItems(true);
          const response = await api.get('/marketplace/items');
          setItems(response.data);
        } catch (error) {
          console.error('Failed to fetch marketplace items:', error);
        } finally {
          setLoadingItems(false);
        }
      };
      fetchItems();
    }

    if (activeTab === 'tokens') {
      const fetchTokens = async () => {
        try {
          setLoadingTokens(true);
          const response = await api.get(`/marketplace/my-tokens/${idSiswa}`);
          setMyTokens(response.data);
        } catch (error) {
          console.error('Failed to fetch tokens:', error);
        } finally {
          setLoadingTokens(false);
        }
      };
      fetchTokens();
    }
  }, [activeTab, idSiswa]);

  const formatRole = (role: string) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'guru') return 'Guru';
    if (role === 'siswa') return 'Siswa';
    return role;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };



  const menuItems = [
    {
      id: 'dashboard', label: 'Dashboard', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      )
    },
    {
      id: 'leaderboard', label: 'Leaderboard', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      )
    },
    {
      id: 'history', label: 'Riwayat Poin', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      )
    },

    {
      id: 'riwayat', label: 'Riwayat Saya', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="9"></circle></svg>
      )
    },
    {
      id: 'jadwal', label: 'Jadwal Kelas', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      )
    },
    {
      id: 'laporan', label: 'Laporan Penilaian', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      )
    },
    {
      id: 'marketplace', label: 'Marketplace', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
      )
    },
    {
      id: 'tokens', label: 'Item Saya', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
      )
    },
    {
      id: 'helpdesk', label: 'Helpdesk', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      )
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
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
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{getInitials(userNama)}</div>
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
              <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1>Semangat Belajar! 👋</h1>
                    <p>Sudahkah Anda melakukan absensi hari ini? Tetap disiplin demi masa depan.</p>
                  </div>
                  <div className="points-badge" style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.2rem' }}>Total Poin Anda</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{loadingPoin ? '...' : totalPoin}</div>
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                {/* Card Scan QR */}
                <div
                  className="stat-card action-card"
                  onClick={() => navigate('/scan')}
                  style={{ cursor: 'pointer', border: '2px solid var(--primary-color)', background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)' }}
                >
                  <div className="stat-icon" style={{ background: 'var(--primary-color)', color: 'white', width: '52px', height: '52px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 800 }}>Scan QR</span>
                    <span className="stat-label">Absen Sekarang</span>
                  </div>
                </div>

                {/* Card Kehadiran % */}
                <div className="stat-card" style={{ border: '2px solid #22c55e', background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 100%)' }}>
                  <div className="stat-icon" style={{ background: '#22c55e', color: 'white', width: '52px', height: '52px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(34,197,94,0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value" style={{ color: '#16a34a', fontWeight: 800 }}>
                      {loadingStatistik ? '—' : `${statistik?.persentase_hadir ?? 0}%`}
                    </span>
                    <span className="stat-label">Kehadiran</span>
                  </div>
                </div>

                {/* Card Sakit */}
                <div className="stat-card" style={{ border: '2px solid #f59e0b', background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)' }}>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', width: '52px', height: '52px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value" style={{ color: '#b45309', fontWeight: 800 }}>
                      {loadingStatistik ? '—' : statistik?.sakit ?? 0}
                    </span>
                    <span className="stat-label">Sakit</span>
                  </div>
                </div>

                {/* Card Izin */}
                <div className="stat-card" style={{ border: '2px solid #3b82f6', background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)' }}>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', width: '52px', height: '52px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value" style={{ color: '#1d4ed8', fontWeight: 800 }}>
                      {loadingStatistik ? '—' : statistik?.izin ?? 0}
                    </span>
                    <span className="stat-label">Izin</span>
                  </div>
                </div>

                {/* Card Alfa */}
                <div className="stat-card" style={{ border: '2px solid #ef4444', background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%)' }}>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', width: '52px', height: '52px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="stat-data">
                    <span className="stat-value" style={{ color: '#b91c1c', fontWeight: 800 }}>
                      {loadingStatistik ? '—' : statistik?.alfa ?? 0}
                    </span>
                    <span className="stat-label">Alfa</span>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Jadwal Hari Ini</h3>
                  <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', textTransform: 'none', padding: '0.4rem 0.8rem' }}>
                    {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
                  </div>
                </div>

                <div className="schedule-list">
                  {loadingJadwal ? (
                    <div className="activity-list">Memuat jadwal...</div>
                  ) : jadwal.length > 0 ? (
                    jadwal.map((item, index) => (
                      <div key={item.id_jadwal} className="activity-item" style={{ borderBottom: index === jadwal.length - 1 ? 'none' : '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="stat-icon blue" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>{item.mapel.nama_mapel}</h4>
                              <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Oleh: {item.guru.nama_guru}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '0.9375rem' }}>
                              {new Date(item.jam_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.jam_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>WIB</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="activity-list">Tidak ada jadwal pelajaran hari ini.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'laporan' && <LaporanPenilaianPage />}
          {activeTab === 'leaderboard' && <LeaderboardPage />}
          {activeTab === 'history' && <HistoryPointPage />}
          {activeTab === 'helpdesk' && <HelpdeskSiswaPage />}

          {activeTab === 'jadwal' && (
            <div className="recent-activity" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2>Jadwal Pelajaran</h2>
                <p style={{ color: 'var(--text-muted)' }}>Daftar seluruh jadwal pelajaran Anda minggu ini.</p>
              </div>

              <div className="table-container">
                {loadingSemuaJadwal ? (
                  <div className="activity-list" style={{ border: 'none' }}>Memuat jadwal...</div>
                ) : semuaJadwal.length === 0 ? (
                  <div className="activity-list">Belum ada jadwal pelajaran untuk Anda.</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hari</th>
                        <th>Jam</th>
                        <th>Mata Pelajaran</th>
                        <th>Guru</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semuaJadwal.map((j) => (
                        <tr key={j.id_jadwal}>
                          <td style={{ textTransform: 'capitalize', fontWeight: '500' }}>{j.hari}</td>
                          <td>
                            {new Date(j.jam_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(j.jam_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{j.mapel?.nama_mapel}</td>
                          <td>{j.guru?.nama_guru}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="recent-activity">
              <h3>Modul {menuItems.find(m => m.id === activeTab)?.label}</h3>
              <div className="activity-list">
                <div className="placeholder-text">Fitur ini akan segera tersedia di versi web.</div>
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="marketplace-section" style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Poin Marketplace</h2>
                <p style={{ color: 'var(--text-muted)' }}>Tukarkan poin prestasi Anda dengan item fleksibilitas.</p>
              </div>

              {loadingItems ? (
                <div className="activity-list">Memuat item...</div>
              ) : (
                <div className="items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {items.map((item) => (
                    <div key={item.id_item} className="item-card" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="item-icon" style={{ background: item.effect_type === 'FLEXIBILITY' ? '#ecfdf5' : '#eff6ff', color: item.effect_type === 'FLEXIBILITY' ? 'var(--primary-color)' : '#3b82f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path></svg>
                        </div>
                        <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.9rem' }}>{item.point_cost} Pts</span>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.item_name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Efek: {item.effect_type.replace('_', ' ')}</p>
                      </div>
                      <button
                        className="login-button"
                        style={{ width: '100%', marginTop: '0.5rem', background: totalPoin >= item.point_cost ? 'var(--primary-color)' : '#cbd5e1', cursor: totalPoin >= item.point_cost ? 'pointer' : 'not-allowed' }}
                        disabled={totalPoin < item.point_cost}
                        onClick={async () => {
                          if (!window.confirm(`Tukar ${item.point_cost} poin untuk ${item.item_name}?`)) return;
                          try {
                            await api.post(`/marketplace/buy/${idSiswa}`, { id_item: item.id_item });
                            alert('Pembelian berhasil! Cek di Item Saya.');
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Gagal membeli item');
                          }
                        }}
                      >
                        {totalPoin >= item.point_cost ? 'Tukar Poin' : 'Poin Kurang'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="inventory-section" style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Item Saya</h2>
                <p style={{ color: 'var(--text-muted)' }}>Daftar token fleksibilitas yang Anda miliki.</p>
              </div>

              {loadingTokens ? (
                <div className="activity-list">Memuat item...</div>
              ) : (
                <div className="tokens-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {myTokens.length === 0 ? (
                    <div className="activity-list">Anda belum memiliki item. Kunjungi Marketplace untuk menukar poin!</div>
                  ) : (
                    myTokens.map((token) => (
                      <div key={token.id_token} className="token-card" style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', opacity: token.status === 'AVAILABLE' ? 1 : 0.6 }}>
                        <div style={{ background: token.status === 'AVAILABLE' ? '#10b981' : '#64748b', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: 0, fontSize: '1rem' }}>{token.item.item_name}</h5>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Beli: {new Date(token.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                        <span className={`status-badge ${token.status === 'AVAILABLE' ? 'active' : 'inactive'}`} style={{ fontSize: '0.75rem' }}>
                          {token.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SiswaDashboard;
