import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateHariLiburPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama_libur: '',
    tanggal: '',
    keterangan: '',
    is_aktif: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/hari-libur', {
        ...form,
        is_aktif: true
      });
      alert('Hari Libur berhasil ditambahkan!');
      navigate('/admin', { state: { activeTab: 'hari-libur' } });
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
          <h2>Tambah Hari Libur Custom</h2>
          <p>Masukkan informasi hari libur kustom baru di bawah ini.</p>
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
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Hari Libur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHariLiburPage;
