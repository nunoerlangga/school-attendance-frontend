import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LokasiSekolah {
  id_lokasi: string;
  nama_lokasi: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  is_default: boolean;
}

const LokasiSekolahPage: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  // === ROLE GUARD ===
  if (role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2 style={{ color: '#ef4444', margin: 0 }}>403 — Akses Ditolak</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Halaman ini hanya dapat diakses oleh Administrator.</p>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Kembali</button>
      </div>
    );
  }

  const [lokasiList, setLokasiList] = useState<LokasiSekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLokasi = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/lokasi-sekolah');
      setLokasiList(res.data);
    } catch (err: any) {
      setError('Gagal memuat data lokasi sekolah.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLokasi();
  }, []);

  const handleSetDefault = async (id: string, nama: string) => {
    if (!window.confirm(`Jadikan "${nama}" sebagai lokasi default absensi?`)) return;
    try {
      setActionLoading(`default-${id}`);
      await api.patch(`/lokasi-sekolah/${id}/set-default`);
      await fetchLokasi();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengatur lokasi default.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!window.confirm(`Hapus lokasi "${nama}" secara permanen?`)) return;
    try {
      setActionLoading(`delete-${id}`);
      await api.delete(`/lokasi-sekolah/${id}`);
      await fetchLokasi();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus lokasi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredList = lokasiList.filter(item =>
    item.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Lokasi Sekolah</h2>
          <p>Kelola titik lokasi dan radius absensi siswa.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-wrapper" style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama lokasi..."
              style={{ width: '250px', paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>

          <button
            className="login-button"
            style={{ width: 'auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}
            onClick={() => navigate('/admin/create-lokasi-sekolah')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Lokasi
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="table-loading">Memuat data...</div>
        ) : error ? (
          <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>{error}</div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {searchTerm
              ? `Tidak ditemukan lokasi dengan kata kunci "${searchTerm}"`
              : 'Belum ada data lokasi sekolah. Tambahkan lokasi pertama Anda.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lokasi</th>
                <th>Koordinat</th>
                <th>Radius (m)</th>
                <th>Status</th>
                <th className="action-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id_lokasi}>
                  <td>{index + 1}</td>
                  <td className="font-bold">{item.nama_lokasi}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {Number(item.latitude).toFixed(6)}, {Number(item.longitude).toFixed(6)}
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                      {item.radius_meter} m
                    </span>
                  </td>
                  <td>
                    {item.is_default ? (
                      <span className="status-badge active">Default</span>
                    ) : (
                      <span className="status-badge inactive">—</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {/* Set Default */}
                      {!item.is_default && (
                        <button
                          className="btn-icon"
                          title="Jadikan Default"
                          onClick={() => handleSetDefault(item.id_lokasi, item.nama_lokasi)}
                          disabled={actionLoading !== null}
                          style={{ color: '#0ea5e9' }}
                        >
                          {actionLoading === `default-${item.id_lokasi}` ? (
                            <span className="loader" style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          )}
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        className="btn-icon edit"
                        title="Edit"
                        onClick={() => navigate(`/admin/edit-lokasi-sekolah/${item.id_lokasi}`)}
                        disabled={actionLoading !== null}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>

                      {/* Delete */}
                      <button
                        className="btn-icon delete"
                        title="Hapus"
                        onClick={() => handleDelete(item.id_lokasi, item.nama_lokasi)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === `delete-${item.id_lokasi}` ? (
                          <span className="loader" style={{ width: '12px', height: '12px' }} />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        )}
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

export default LokasiSekolahPage;
