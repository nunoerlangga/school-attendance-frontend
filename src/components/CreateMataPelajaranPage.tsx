import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateMataPelajaranPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama_mapel: '',
    kode_mapel: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/mapel', form);
      alert('Mata Pelajaran berhasil ditambahkan!');
      navigate('/admin', { state: { activeTab: 'mata-pelajaran' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Tambah Mata Pelajaran</h2>
          <p>Masukkan detail mata pelajaran baru di bawah ini.</p>
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
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Mata Pelajaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMataPelajaranPage;
