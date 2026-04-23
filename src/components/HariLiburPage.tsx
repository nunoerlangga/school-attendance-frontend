import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface HariLibur {
  id_libur: string;
  nama_libur: string;
  tanggal: string;
  keterangan: string;
  is_aktif: boolean;
}

interface HariMingguan {
  hari: string;
  is_aktif: boolean;
}

const HariLiburPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'nasional' | 'mingguan'>('nasional');
  const [liburList, setLiburList] = useState<HariLibur[]>([]);
  const [mingguanList, setMingguanList] = useState<HariMingguan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const fetchLibur = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hari-libur');
      setLiburList(res.data);
    } catch (err: any) {
      setError('Gagal memuat data hari libur.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMingguan = async () => {
    try {
      const res = await api.get('/hari-libur/mingguan');
      setMingguanList(res.data);
    } catch (err: any) {
      setError('Gagal memuat data libur mingguan.');
    }
  };

  useEffect(() => {
    fetchLibur();
    fetchMingguan();
  }, []);

  const handleSync = async () => {
    if (!window.confirm('Sinkronisasi akan mengambil data libur nasional tahun ini. Lanjutkan?')) return;
    try {
      setSyncLoading(true);
      const res = await api.get('/hari-libur/sync');
      alert(res.data.message);
      fetchLibur();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal sinkronisasi.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleToggleMingguan = async (hari: string, currentStatus: boolean) => {
    try {
      await api.put('/hari-libur/mingguan', { hari, is_aktif: !currentStatus });
      fetchMingguan();
    } catch (err: any) {
      alert('Gagal memperbarui status libur mingguan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus hari libur ini?')) return;
    try {
      await api.delete(`/hari-libur/${id}`);
      fetchLibur();
    } catch (err: any) {
      alert('Gagal menghapus data.');
    }
  };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Manajemen Hari Libur</h2>
          <p>Atur hari libur nasional, custom, dan mingguan untuk sistem absensi.</p>
        </div>
        <div className="header-actions">
          <div className="tabs-container" style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setActiveSubTab('nasional')}
              style={{
                background: activeSubTab === 'nasional' ? 'white' : 'transparent',
                border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600,
                color: activeSubTab === 'nasional' ? '#0f172a' : '#64748b', transition: 'all 0.2s', cursor: 'pointer'
              }}
            >
              Nasional & Custom
            </button>
            <button
              onClick={() => setActiveSubTab('mingguan')}
              style={{
                background: activeSubTab === 'mingguan' ? 'white' : 'transparent',
                border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600,
                color: activeSubTab === 'mingguan' ? '#0f172a' : '#64748b', transition: 'all 0.2s', cursor: 'pointer'
              }}
            >
              Libur Mingguan
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {activeSubTab === 'nasional' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Daftar Hari Libur</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={handleSync} disabled={syncLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {syncLoading ? 'Syncing...' : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6M3 22v-6h6M2 12c0-4.42 3.58-8 8-8s8 3.58 8 8M22 12c0 4.42-3.58 8-8 8s-8-3.58-8-8" /></svg> Sync Nasional</>
                  )}
                </button>
                <button className="login-button" onClick={() => navigate('/admin/create-hari-libur')} style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1rem' }}>
                  + Tambah Custom
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>Memuat data...</div>
            ) : liburList.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data hari libur.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Libur</th>
                    <th>Tanggal</th>
                    <th>Keterangan</th>
                    <th className="action-col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {liburList.map((item, index) => (
                    <tr key={item.id_libur}>
                      <td>{index + 1}</td>
                      <td className="font-bold">{item.nama_libur}</td>
                      <td>{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td>
                        <span className={`status-badge ${item.keterangan === 'Libur Nasional' ? 'active' : 'info'}`} style={item.keterangan !== 'Libur Nasional' ? { background: '#e0f2fe', color: '#0369a1' } : {}}>
                          {item.keterangan || 'Manual'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => navigate(`/admin/edit-hari-libur/${item.id_libur}`)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDelete(item.id_libur)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Pengaturan Hari Libur Mingguan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {mingguanList.map((item) => (
                <div key={item.hari} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '1rem' }}>{item.hari}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: item.is_aktif ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
                      {item.is_aktif ? 'LIBUR' : 'MASUK'}
                    </span>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                      <input
                        type="checkbox"
                        checked={item.is_aktif}
                        onChange={() => handleToggleMingguan(item.hari, item.is_aktif)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: item.is_aktif ? '#ef4444' : '#cbd5e1', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', height: '18px', width: '18px', left: '4px', bottom: '4px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                          transform: item.is_aktif ? 'translateX(24px)' : 'none'
                        }}></span>
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '2rem', padding: '1rem', background: '#fef3f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
              <strong>Catatan:</strong> Hari yang ditandai <strong>LIBUR</strong> akan otomatis memblokir pembuatan QR absensi dan proses scan siswa. Pada rekap Excel, hari tersebut akan ditandai dengan huruf <strong>L</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HariLiburPage;
