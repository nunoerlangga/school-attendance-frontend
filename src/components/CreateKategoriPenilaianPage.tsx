import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateKategoriPenilaianPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/kategori-penilaian', {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        tipe: 'Student', // default tipe
      });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan kategori penilaian.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2>Tambah Kategori Penilaian</h2>
          <p>Masukkan informasi kategori penilaian baru di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Kategori</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Masukkan nama kategori penilaian"
              />
            </div>

            <div className="form-group">
              <label>Deskripsi</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                className="form-input"
                placeholder="Masukkan deskripsi kategori (opsional)"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKategoriPenilaianPage;
