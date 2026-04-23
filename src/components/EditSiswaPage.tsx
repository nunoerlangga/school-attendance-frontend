import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditSiswaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama_siswa: '',
    username: '',
    password: '',
    jenis_kelamin: '',
    id_kelas: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resKelas] = await Promise.all([
          api.get(`/siswa/${id}`),
          api.get('/kelas')
        ]);
        
        const siswa = resSiswa.data;
        setFormData({
          nama_siswa: siswa.nama_siswa,
          username: siswa.user.username,
          password: '',
          jenis_kelamin: siswa.jenis_kelamin,
          id_kelas: siswa.kelas && siswa.kelas.length > 0 ? siswa.kelas[0].id_kelas : ''
        });
        setKelasList(resKelas.data);
      } catch (err: any) {
        setError('Gagal memuat data siswa');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Create payload (remove empty password)
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;

      await api.patch(`/siswa/${id}`, payload);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui data siswa');
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
          <h2>Edit Data Siswa</h2>
          <p>Perbarui informasi siswa di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                name="nama_siswa" 
                value={formData.nama_siswa} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Password (Kosongkan jika tidak ingin ganti)</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                className="form-input"
                placeholder="********"
              />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              <select 
                name="jenis_kelamin" 
                value={formData.jenis_kelamin} 
                onChange={handleChange} 
                className="form-input"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="laki_laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kelas</label>
              <select 
                name="id_kelas" 
                value={formData.id_kelas} 
                onChange={handleChange} 
                className="form-input"
              >
                <option value="">Pilih Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSiswaPage;
