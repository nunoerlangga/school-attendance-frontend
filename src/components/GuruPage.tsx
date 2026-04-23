import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface GuruMapel {
  mapel: {
    nama_mapel: string;
  };
}

interface Guru {
  id_guru: string;
  nama_guru: string;
  jenis_kelamin: string;
  user: {
    username: string;
    is_aktif: boolean;
  };
  mapel: GuruMapel[];
}

const GuruPage: React.FC = () => {
  const navigate = useNavigate();
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showActive, setShowActive] = useState(true);

  const fetchGurus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guru?is_aktif=${showActive}`);
      setGurus(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGurus();
  }, [showActive]);

  const handleToggleActive = async (id: string, name: string, isAktif: boolean) => {
    const action = isAktif ? 'menonaktifkan' : 'mengaktifkan';
    if (window.confirm(`Apakah Anda yakin ingin ${action} guru ${name}?`)) {
      try {
        await api.delete(`/guru/${id}`); // Toggles backend status
        fetchGurus();
      } catch (error) {
        console.error(`Error ${action} teacher:`, error);
        alert(`Gagal ${action} guru`);
      }
    }
  };
  const filteredGurus = gurus.filter(guru =>
    guru.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guru.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Data Guru</h2>
          <p>Kelola data seluruh guru di sekolah.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Segmented Toggle */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setShowActive(true)}
              style={{
                background: showActive ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: showActive ? 600 : 500,
                color: showActive ? '#0f172a' : '#64748b',
                boxShadow: showActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Aktif
            </button>
            <button
              onClick={() => setShowActive(false)}
              style={{
                background: !showActive ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: !showActive ? 600 : 500,
                color: !showActive ? '#0f172a' : '#64748b',
                boxShadow: !showActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Nonaktif
            </button>
          </div>

          <div className="search-wrapper" style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama atau username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px', paddingLeft: '2.5rem', marginBottom: 0 }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <button
            className="login-button"
            style={{ width: 'auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}
            onClick={() => navigate('/admin/create-guru')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Guru
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="table-loading">Memuat data...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Nama Guru</th>
                <th>L/P</th>
                <th>Mata Pelajaran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGurus.length > 0 ? (
                filteredGurus.map((guru) => (
                  <tr key={guru.id_guru}>
                    <td className="font-mono">{guru.user.username}</td>
                    <td className="font-bold">{guru.nama_guru}</td>
                    <td>{guru.jenis_kelamin === 'laki_laki' ? 'L' : 'P'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {guru.mapel.length > 0 ? (
                          guru.mapel.map((gm, idx) => (
                            <span key={idx} className="tag">
                              {gm.mapel.nama_mapel}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${guru.user.is_aktif ? 'active' : 'inactive'}`}>
                        {guru.user.is_aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon edit"
                          onClick={() => navigate(`/admin/edit-guru/${guru.id_guru}`)}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleToggleActive(guru.id_guru, guru.nama_guru, guru.user.is_aktif)}
                          title={guru.user.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {guru.user.is_aktif ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">Tidak ada data guru.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GuruPage;
