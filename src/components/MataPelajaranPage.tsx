import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
  kode_mapel: string;
  is_aktif: boolean;
}

const MataPelajaranPage: React.FC = () => {
  const navigate = useNavigate();
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(true);

  const fetchMapel = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/mapel?is_aktif=${showActive}`);
      // Sort: Active first, then by code/name
      const sorted = res.data.sort((a: MataPelajaran, b: MataPelajaran) => {
        if (a.is_aktif === b.is_aktif) {
          return a.kode_mapel.localeCompare(b.kode_mapel);
        }
        return a.is_aktif ? -1 : 1;
      });
      setMapelList(sorted);
    } catch (err: any) {
      console.error('Error fetching mapel:', err);
      setError('Gagal memuat data mata pelajaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapel();
  }, [showActive]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logic
  const filteredList = mapelList.filter((item) => {
    const nama = item.nama_mapel || '';
    const kode = item.kode_mapel || '';
    const search = searchTerm.toLowerCase();
    return nama.toLowerCase().includes(search) || kode.toLowerCase().includes(search);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const act = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Yakin ingin ${act} mata pelajaran ini?`)) return;
    try {
      setActionLoading(`status-${id}`);
      await api.patch(`/mapel/${id}`, { is_aktif: !currentStatus });
      await fetchMapel();
    } catch (err: any) {
      alert(err.response?.data?.message || `Gagal ${act} mata pelajaran.`);
    } finally {
      setActionLoading(null);
    }
  };

  // const handleDelete = async (id: string) => {
  //   if (!window.confirm('Hapus mata pelajaran ini secara permanen?')) return;
  //   try {
  //     setActionLoading(`delete-${id}`);
  //     await api.delete(`/mapel/${id}`);
  //     await fetchMapel();
  //   } catch (err: any) {
  //     alert(err.response?.data?.message || 'Gagal menghapus mata pelajaran.');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Mata Pelajaran</h2>
          <p>Kelola daftar mata pelajaran yang diajarkan di sekolah.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Toggle */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setShowActive(true)}
              style={{
                background: showActive ? 'white' : 'transparent',
                border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem',
                fontWeight: showActive ? 600 : 500, color: showActive ? '#0f172a' : '#64748b', transition: 'all 0.2s', cursor: 'pointer'
              }}
            >
              Aktif
            </button>
            <button
              onClick={() => setShowActive(false)}
              style={{
                background: !showActive ? 'white' : 'transparent',
                border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem',
                fontWeight: !showActive ? 600 : 500, color: !showActive ? '#0f172a' : '#64748b', transition: 'all 0.2s', cursor: 'pointer'
              }}
            >
              Nonaktif
            </button>
          </div>

          <div className="search-wrapper" style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari mapel..."
              style={{ width: '250px', paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <button
            className="login-button"
            style={{ width: 'auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}
            onClick={() => navigate('/admin/create-mata-pelajaran')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Mapel
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
            {searchTerm ? `Tidak ditemukan mapel dengan kata kunci "${searchTerm}"` : 'Belum ada data mata pelajaran.'}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode Mapel</th>
                  <th>Nama Mata Pelajaran</th>
                  <th>Status</th>
                  <th className="action-col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((item, index) => (
                  <tr key={item.id_mapel}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{item.kode_mapel}</span></td>
                    <td className="font-bold">{item.nama_mapel}</td>
                    <td>
                      <span className={`status-badge ${!item.is_aktif ? 'inactive' : 'active'}`}>
                        {!item.is_aktif ? 'Nonaktif' : 'Aktif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon edit"
                          title="Edit"
                          onClick={() => navigate(`/admin/edit-mata-pelajaran/${item.id_mapel}`)}
                          disabled={actionLoading !== null}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          className={`btn-icon ${item.is_aktif ? 'delete' : 'active'}`}
                          title={item.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                          onClick={() => handleToggleStatus(item.id_mapel, item.is_aktif)}
                          disabled={actionLoading !== null}
                          style={!item.is_aktif ? { color: 'var(--success)' } : {}}
                        >
                          {actionLoading === `status-${item.id_mapel}` ? (
                            <span className="loader" style={{ width: '12px', height: '12px' }}></span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          )}
                        </button>
                        {/* <button
                          className="btn-icon delete"
                          title="Hapus Permanen"
                          onClick={() => handleDelete(item.id_mapel)}
                          disabled={actionLoading !== null}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} data
                </div>
                <div className="pagination-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Sebelumnya</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} className={currentPage === i + 1 ? 'login-button' : 'btn-secondary'} style={{ minWidth: '40px', marginTop: 0 }} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Selanjutnya</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MataPelajaranPage;
