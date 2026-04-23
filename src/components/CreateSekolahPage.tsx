import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateSekolahPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_sekolah: '',
    npsn: '',
    jenjang: '',
    alamat: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/sekolah', {
        nama_sekolah: formData.nama_sekolah,
        npsn: formData.npsn || undefined,
        jenjang: formData.jenjang,
        alamat: formData.alamat || undefined,
      });
      alert('Informasi sekolah berhasil dibuat!');
      navigate('/admin', { state: { activeTab: 'sekolah' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat informasi sekolah. Pastikan data belum ada.');
    } finally {
      setSubmitting(false);
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
          <h2>Buat Profil Sekolah</h2>
          <p>Masukkan informasi dasar untuk identitas sekolah Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Nama Sekolah</label>
              <input
                type="text"
                name="nama_sekolah"
                value={formData.nama_sekolah}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Contoh: SMA Negeri 1 Jakarta"
              />
            </div>

            <div className="form-group">
              <label>NPSN <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(opsional)</span></label>
              <input
                type="text"
                name="npsn"
                value={formData.npsn}
                onChange={handleChange}
                className="form-input"
                placeholder="Maksimal 8 digit"
              />
            </div>

            <div className="form-group">
              <label>Jenjang</label>
              <select
                name="jenjang"
                value={formData.jenjang}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Pilih Jenjang</option>
                <option value="SD">SD/MI</option>
                <option value="SMP">SMP/MTs</option>
                <option value="SMA">SMA/MA</option>
                <option value="SMK">SMK/MAK</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Alamat Lengkap <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(opsional)</span></label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="form-input"
                placeholder="Jl. Raya No. 123..."
              />
            </div>
          </div>

          {/* Info box */}
          <div style={{
            marginTop: '1rem',
            padding: '0.875rem 1rem',
            background: 'rgba(99,102,241,0.07)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            fontSize: '0.875rem',
            color: '#4f46e5'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Pengaturan koordinat lokasi & radius absensi dikelola melalui menu <strong>Lokasi Sekolah</strong>.</span>
          </div>

          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}

          <div className="form-actions mt-4">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Batal</button>
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Profil Sekolah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSekolahPage;
