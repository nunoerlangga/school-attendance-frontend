import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface TahunAjaran {
  id_tahun_ajaran: string;
  nama_tahun: string;
  cycle_minggu: number;
  is_aktif: boolean;
}

const TahunAjaranPage: React.FC = () => {
  const navigate = useNavigate();
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(true);

  const fetchTahunAjaran = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tahun-ajaran?is_aktif=${showActive}`);
      setTahunAjaranList(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch tahun ajaran:', err);
      setError('Gagal memuat data tahun ajaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, [showActive]);

  const handleSetActive = async (id: string, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengaktifkan Tahun Ajaran ${nama}?`)) return;
    try {
      setActionLoading(id);
      await api.post(`/tahun-ajaran/aktif/${id}`);
      await fetchTahunAjaran();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status tahun ajaran');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Data Tahun Ajaran</h2>
          <p>Kelola daftar tahun ajaran dan atur status aktif saat ini.</p>
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

          <button
            className="login-button"
            style={{ width: 'auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}
            onClick={() => navigate('/admin/create-tahun-ajaran')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Tahun Ajaran
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Memuat data...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : tahunAjaranList.length === 0 ? (
          <div className="empty-state">Belum ada data tahun ajaran.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Tahun Ajaran</th>
                <th>Cycle Minggu</th>
                <th>Status</th>
                <th className="action-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tahunAjaranList.map((ta) => (
                <tr key={ta.id_tahun_ajaran}>
                  <td className="font-bold">{ta.nama_tahun}</td>
                  <td>{ta.cycle_minggu} Minggu</td>
                  <td>
                    {ta.is_aktif ? (
                      <span className="status-badge active">Aktif Saat Ini</span>
                    ) : (
                      <span className="status-badge inactive" style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#64748b'
                      }}>Tidak Aktif</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {/* Edit icon */}
                      <button
                        className="btn-icon"
                        title="Edit Tahun Ajaran"
                        onClick={() => navigate(`/admin/edit-tahun-ajaran/${ta.id_tahun_ajaran}`)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>

                      {/* Set active button (only for inactive) */}
                      {!ta.is_aktif && (
                        <button
                          className="login-button"
                          style={{
                            width: 'auto',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: '#10b981',
                          }}
                          onClick={() => handleSetActive(ta.id_tahun_ajaran, ta.nama_tahun)}
                          disabled={actionLoading === ta.id_tahun_ajaran}
                        >
                          {actionLoading === ta.id_tahun_ajaran ? 'Memproses...' : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Set Aktif
                            </>
                          )}
                        </button>
                      )}
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

export default TahunAjaranPage;
