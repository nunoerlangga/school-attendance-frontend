import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EditMataPelajaranPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama_mapel: '',
    kode_mapel: '',
  });

  useEffect(() => {
    const fetchMapel = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/mapel/${id}`);
        setForm({
          nama_mapel: res.data.nama_mapel,
          kode_mapel: res.data.kode_mapel,
        });
      } catch (err: any) {
        setError('Gagal memuat data mata pelajaran');
      } finally {
        setLoading(false);
      }
    };
    fetchMapel();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.patch(`/mapel/${id}`, form);
      alert('Mata Pelajaran berhasil diperbarui!');
      navigate('/admin', { state: { activeTab: 'mata-pelajaran' } });
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
          <h2>Edit Mata Pelajaran</h2>
          <p>Perbarui detail mata pelajaran di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Nama Mata Pelajaran</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={form.nama_mapel} 
                onChange={(e) => setForm({...form, nama_mapel: e.target.value})} 
                placeholder="Contoh: Matematika" 
              />
            </div>
            <div className="form-group full-width">
              <label>Kode Mapel</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={form.kode_mapel} 
                onChange={(e) => setForm({...form, kode_mapel: e.target.value.toUpperCase()})} 
                placeholder="Contoh: MTK-01" 
              />
               <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Kode harus unik.</small>
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

export default EditMataPelajaranPage;
