import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface KategoriPenilaian {
  id_kategori: string;
  nama: string;
  deskripsi: string;
  is_aktif: boolean;
}

const KategoriPenilaianPage: React.FC = () => {
  const navigate = useNavigate();
  const [kategoriList, setKategoriList] = useState<KategoriPenilaian[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(true);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/kategori-penilaian?is_aktif=${showActive}`);
      setKategoriList(res.data);
    } catch (err: any) {
      console.error('Error fetching kategori penilaian:', err);
      setError('Gagal memuat data kategori penilaian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, [showActive]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter logic
  const filteredList = kategoriList.filter((item) => {
    const nama = item.nama || '';
    const deskripsi = item.deskripsi || '';
    const search = searchTerm.toLowerCase();
    return nama.toLowerCase().includes(search) || deskripsi.toLowerCase().includes(search);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSoftDelete = async (id: string, isAktif: boolean) => {
    const action = isAktif ? 'menonaktifkan' : 'mengaktifkan';
    const confirmDelete = window.confirm(`Apakah kamu yakin ingin ${action} indikator ini?`);
    if (!confirmDelete) return;
    try {
      setActionLoading(`soft-${id}`);
      await api.patch(`/kategori-penilaian/soft-delete/${id}`); // Backend toggles it
      await fetchKategori();
    } catch (err: any) {
      alert(err.response?.data?.message || `Gagal ${action} kategori penilaian.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Kategori / Indikator Penilaian</h2>
          <p>Kelola daftar kategori penilaian siswa.</p>
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
               placeholder="Cari indikator..." 
               style={{ width: '250px', paddingLeft: '2.5rem' }}
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setCurrentPage(1); // Reset to first page on search
               }}
             />
             <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <button
            className="login-button"
            style={{ width: 'auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}
            onClick={() => navigate('/admin/create-kategori-penilaian')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Indikator Baru
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
            {searchTerm ? `Tidak ditemukan indikator dengan kata kunci "${searchTerm}"` : 'Belum ada data kategori penilaian.'}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Indikator</th>
                  <th>Deskripsi Indikator</th>
                  <th>Status</th>
                  <th className="action-col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((item, index) => (
                  <tr key={item.id_kategori}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="font-bold">{item.nama}</td>
                    <td>{item.deskripsi || '-'}</td>
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
                          onClick={() => navigate(`/admin/edit-kategori-penilaian/${item.id_kategori}`)}
                          disabled={actionLoading !== null}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>

                        <button
                          className={`btn-icon ${item.is_aktif ? 'delete' : 'active'}`}
                          title={item.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                          onClick={() => handleSoftDelete(item.id_kategori, item.is_aktif)}
                          disabled={actionLoading !== null}
                          style={!item.is_aktif ? { color: 'var(--success)' } : {}}
                        >
                          {actionLoading === `soft-${item.id_kategori}` ? (
                            <span className="loader" style={{ width: '12px', height: '12px', borderTopColor: item.is_aktif ? 'var(--error)' : 'var(--success)' }}></span>
                          ) : item.is_aktif ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} data
                </div>
                <div className="pagination-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-secondary" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Sebelumnya
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={currentPage === i + 1 ? 'login-button' : 'btn-secondary'}
                      style={{ minWidth: '40px', padding: '0.5rem', marginTop: 0 }}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    className="btn-secondary" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KategoriPenilaianPage;
