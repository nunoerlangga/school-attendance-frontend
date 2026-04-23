import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateTahunAjaranPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_tahun: '',
    cycle_minggu: 1,
    is_aktif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_tahun.trim()) {
      setError('Nama tahun ajaran tidak boleh kosong');
      return;
    }
    if (formData.cycle_minggu < 1) {
      setError('Cycle minggu minimal 1');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/tahun-ajaran', {
        nama_tahun: formData.nama_tahun.trim(),
        cycle_minggu: Number(formData.cycle_minggu),
        is_aktif: formData.is_aktif,
      });
      alert('Tahun Ajaran berhasil ditambahkan!');
      navigate('/admin', { state: { activeTab: 'tahun-ajaran' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan tahun ajaran');
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
          <h2>Tambah Tahun Ajaran</h2>
          <p>Masukkan informasi tahun ajaran baru di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label>Nama Tahun Ajaran</label>
              <input
                type="text"
                className="form-input"
                name="nama_tahun"
                value={formData.nama_tahun}
                onChange={(e) => setFormData(prev => ({...prev, nama_tahun: e.target.value}))}
                placeholder="Contoh: 2024/2025 Ganjil"
                required
              />
            </div>

            <div className="form-group">
              <label>Cycle Minggu</label>
              <input
                type="number"
                className="form-input"
                name="cycle_minggu"
                value={formData.cycle_minggu}
                min={1}
                onChange={(e) => setFormData(prev => ({...prev, cycle_minggu: Number(e.target.value)}))}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="is_aktif"
                checked={formData.is_aktif}
                onChange={(e) => setFormData(prev => ({...prev, is_aktif: e.target.checked}))}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <label htmlFor="is_aktif" style={{ cursor: 'pointer', margin: 0, fontWeight: 500 }}>
                Jadikan sebagai Tahun Ajaran Aktif
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Tahun Ajaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTahunAjaranPage;
