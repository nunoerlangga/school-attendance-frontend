import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditSekolahPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_sekolah: '',
    npsn: '',
    jenjang: '',
    alamat: '',
  });

  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        const response = await api.get('/sekolah');
        const sekolah = response.data;
        setFormData({
          nama_sekolah: sekolah.nama_sekolah || '',
          npsn: sekolah.npsn || '',
          jenjang: sekolah.jenjang || '',
          alamat: sekolah.alamat || '',
        });
      } catch (err: any) {
        setError('Gagal memuat data sekolah');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSekolah();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.patch('/sekolah', {
        nama_sekolah: formData.nama_sekolah,
        npsn: formData.npsn || undefined,
        jenjang: formData.jenjang,
        alamat: formData.alamat || undefined,
      });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui informasi sekolah');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat...</div>;

  return (
    <div className="edit-page-container">
      <div className="btn-back-wrapper">
        <button className="back-button" onClick={() => navigate('/admin')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali
        </button>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>Edit Informasi Sekolah</h2>
          <p>Perbarui identitas dan informasi dasar sekolah Anda.</p>
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
                placeholder="opsional"
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
              />
            </div>
          </div>

          {/* Info box: koordinat dikelola di menu Lokasi Sekolah */}
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
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin')}>Batal</button>
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSekolahPage;
