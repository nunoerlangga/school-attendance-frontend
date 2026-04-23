import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

const CreateSiswaPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  const [formData, setFormData] = useState({
    nama_siswa: '',
    username: '',
    password: '',
    jenis_kelamin: '',
    id_kelas: ''
  });

  useEffect(() => {
    // Fetch available classes for the dropdown
    const fetchKelas = async () => {
      try {
        const resKelas = await api.get('/kelas');
        setKelasList(resKelas.data);
      } catch (err: any) {
        console.error('Failed to fetch class list', err);
      }
    };
    fetchKelas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // The backend expects id_kelas to be assigned during creation or immediately after.
      // We will send id_kelas if selected, and the backend might handle it via create flow (if updated),
      // but standard create DTO only expects username, password, nama_siswa, jenis_kelamin.
      // To ensure id_kelas works, we will separate the API logic if needed, or send it all if backend handles it.
      // Based on current CreateSiswaDto it doesn't have id_kelas.
      // So we will create the siswa first, then patch the class if id_kelas is selected.
      
      const createPayload = {
        nama_siswa: formData.nama_siswa,
        username: formData.username,
        password: formData.password,
        jenis_kelamin: formData.jenis_kelamin
      };

      const res = await api.post('/siswa', createPayload);
      const newSiswaId = res.data.id_siswa;

      // Assign class if selected by calling patch
      if (formData.id_kelas && newSiswaId) {
         await api.patch(`/siswa/${newSiswaId}`, { id_kelas: formData.id_kelas });
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan data siswa');
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
          <h2>Tambah Data Siswa</h2>
          <p>Masukkan informasi siswa baru di bawah ini.</p>
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
                placeholder="Masukkan nama lengkap"
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
                placeholder="Contoh: siswa001"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required
                minLength={6}
                className="form-input"
                placeholder="Minimal 6 karakter"
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
              <label>Kelas (Opsional)</label>
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
              {submitting ? 'Menyimpan...' : 'Tambah Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSiswaPage;
