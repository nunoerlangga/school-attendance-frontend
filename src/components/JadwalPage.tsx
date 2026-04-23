import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Jadwal {
  id_jadwal: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  guru: { nama_guru: string };
  kelas: { nama_kelas: string; tingkat: string };
  mapel: { nama_mapel: string };
  is_aktif: boolean;
}

const JadwalPage: React.FC = () => {
  const navigate = useNavigate();
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jadwal', {
        params: showActiveOnly ? { is_aktif: 'true' } : {}
      });
      if (res.data) {
        setJadwalList(res.data);
      }
    } catch (error) {
      console.error('Error fetching jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, [showActiveOnly]);

  const handleDelete = async (id: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menonaktifkan/mengaktifkan status jadwal ini?`)) {
      try {
        await api.delete(`/jadwal/${id}`); // Toggles backend status
        fetchJadwal();
      } catch (error) {
        console.error(`Error toggling jadwal:`, error);
        alert(`Gagal mengubah status jadwal`);
      }
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Data Jadwal Pelajaran</h2>
          <p>Kelola data seluruh jadwal di sekolah.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button 
              onClick={() => setShowActiveOnly(true)} 
              style={{
                background: showActiveOnly ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: showActiveOnly ? 600 : 500,
                color: showActiveOnly ? '#0f172a' : '#64748b',
                boxShadow: showActiveOnly ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Aktif
            </button>
            <button 
              onClick={() => setShowActiveOnly(false)} 
              style={{
                background: !showActiveOnly ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: !showActiveOnly ? 600 : 500,
                color: !showActiveOnly ? '#0f172a' : '#64748b',
                boxShadow: !showActiveOnly ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Nonaktif
            </button>
          </div>

          <button
            className="login-button"
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => navigate('/admin/create-jadwal')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Jadwal
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Memuat data...</div>
        ) : jadwalList.length === 0 ? (
          <div className="empty-state">Belum ada data jadwal.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Hari</th>
                <th>Waktu</th>
                <th>Mata Pelajaran</th>
                <th>Kelas</th>
                <th>Guru</th>
                <th>Status</th>
                <th className="action-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jadwalList.map((jadwal, index) => (
                <tr key={jadwal.id_jadwal}>
                  <td>{index + 1}</td>
                  <td style={{ textTransform: 'capitalize' }}>{jadwal.hari}</td>
                  <td>{formatTime(jadwal.jam_mulai)} - {formatTime(jadwal.jam_selesai)}</td>
                  <td>{jadwal.mapel?.nama_mapel}</td>
                  <td>{jadwal.kelas?.tingkat} {jadwal.kelas?.nama_kelas}</td>
                  <td>{jadwal.guru?.nama_guru}</td>
                  <td>
                    <span className={`status-badge ${jadwal.is_aktif ? 'active' : 'inactive'}`}>
                      {jadwal.is_aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => navigate(`/admin/edit-jadwal/${jadwal.id_jadwal}`)}
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        className={`btn-icon ${jadwal.is_aktif ? 'delete' : 'edit'}`} 
                        onClick={() => handleDelete(jadwal.id_jadwal)}
                        title={jadwal.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {jadwal.is_aktif ? (
                            <>
                              <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </>
                          ) : (
                            <polyline points="20 6 9 17 4 12"></polyline>
                          )}
                        </svg>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JadwalPage;
