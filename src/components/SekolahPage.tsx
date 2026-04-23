import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Sekolah {
  id_sekolah: string;
  nama_sekolah: string;
  npsn: string | null;
  jenjang: string;
  alamat: string | null;
}

const SekolahPage: React.FC = () => {
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSekolah = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sekolah');
      setSekolah(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch sekolah:', err);
      // Don't show error if 404 since it might mean no school exists yet
      if (err.response?.status !== 404) {
        setError('Gagal memuat data sekolah');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSekolah();
  }, []);

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Data Sekolah</h2>
          <p>Kelola profil dan koordinat instansi sekolah Anda.</p>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Memuat data...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : !sekolah ? (
          <div className="empty-state" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '50%', color: 'var(--text-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Belum Ada Data Sekolah</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Silakan lengkapi profil sekolah Anda untuk memulai sistem.</p>
            </div>
            <button
              className="login-button"
              onClick={() => navigate('/admin/create-sekolah')}
              style={{ width: 'auto', padding: '0.8rem 2rem' }}
            >
              Buat Profil Sekolah Sekarang
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>NPSN</th>
                <th>Nama Sekolah</th>
                <th>Jenjang</th>

                <th className="action-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{sekolah.npsn || '-'}</td>
                <td className="font-bold">{sekolah.nama_sekolah}</td>
                <td style={{ textTransform: 'uppercase' }}>{sekolah.jenjang}</td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate('/admin/edit-sekolah')}
                      title="Edit Data Sekolah"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SekolahPage;
