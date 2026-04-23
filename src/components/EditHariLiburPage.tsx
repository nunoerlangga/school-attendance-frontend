import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EditHariLiburPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama_libur: '',
    tanggal: '',
    keterangan: '',
    is_aktif: true
  });

  useEffect(() => {
    const fetchLibur = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hari-libur');
        const target = res.data.find((item: any) => item.id_libur === id);
        if (target) {
          setForm({
            nama_libur: target.nama_libur,
            tanggal: target.tanggal.split('T')[0],
            keterangan: target.keterangan || '',
            is_aktif: target.is_aktif
          });
        } else {
          setError('Data hari libur tidak ditemukan');
        }
      } catch (err: any) {
        setError('Gagal memuat data hari libur');
      } finally {
        setLoading(false);
      }
    };
    fetchLibur();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch(`/hari-libur/${id}`, {
        ...form
      });
      alert('Hari Libur berhasil diperbarui!');
      navigate('/admin', { state: { activeTab: 'hari-libur' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Memuat data...</div>;

  return (
    <div className="edit-page-container">
      <div className="btn-back-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali
        </button>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>Edit Hari Libur</h2>
          <p>Perbarui informasi hari libur di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label>Nama Libur</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={form.nama_libur} 
                onChange={(e) => setForm({...form, nama_libur: e.target.value})} 
                placeholder="Contoh: Libur Akhir Semester" 
              />
            </div>
            <div className="form-group">
              <label>Tanggal</label>
              <input 
                type="date" 
                className="form-input" 
                required 
                value={form.tanggal} 
                onChange={(e) => setForm({...form, tanggal: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Keterangan (Opsional)</label>
              <textarea 
                className="form-input" 
                value={form.keterangan} 
                onChange={(e) => setForm({...form, keterangan: e.target.value})} 
                placeholder="Keterangan tambahan..." 
                rows={3}
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHariLiburPage;
