import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Mapel {
  id_mapel: string;
  nama_mapel: string;
}

const CreateGuruPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [availableMapels, setAvailableMapels] = useState<Mapel[]>([]);
  const [selectedMapels, setSelectedMapels] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nama_guru: '',
    username: '',
    password: '',
    jenis_kelamin: ''
  });

  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const resMapel = await api.get('/mapel');
        setAvailableMapels(resMapel.data);
      } catch (err: any) {
        console.error('Failed to fetch subjects', err);
      }
    };

    fetchMapel();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMapelToggle = (id_mapel: string) => {
    setSelectedMapels((prev) => 
      prev.includes(id_mapel) 
        ? prev.filter(m => m !== id_mapel) 
        : [...prev, id_mapel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const createPayload = {
        nama_guru: formData.nama_guru,
        username: formData.username,
        password: formData.password,
        jenis_kelamin: formData.jenis_kelamin
      };

      const res = await api.post('/guru', createPayload);
      const newGuruId = res.data.id_guru;

      if (selectedMapels.length > 0 && newGuruId) {
         await api.patch(`/guru/${newGuruId}`, { id_mapel: selectedMapels });
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan data guru');
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
          <h2>Tambah Data Guru</h2>
          <p>Masukkan informasi guru baru di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                name="nama_guru" 
                value={formData.nama_guru} 
                onChange={handleChange} 
                required 
                className="form-input"
                placeholder="Masukkan nama lengkap guru"
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
                placeholder="Contoh: guru_mtk"
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
            
            <div className="form-group full-width">
              <label>Mata Pelajaran yang Diampu (Opsional)</label>
              <div className="checkbox-grid">
                {availableMapels.map((mapel) => (
                  <label key={mapel.id_mapel} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      value={mapel.id_mapel}
                      checked={selectedMapels.includes(mapel.id_mapel)}
                      onChange={() => handleMapelToggle(mapel.id_mapel)}
                    />
                    <span className="checkbox-text">{mapel.nama_mapel}</span>
                  </label>
                ))}
              </div>
              {availableMapels.length === 0 && (
                <p className="text-muted text-sm mt-2">Belum ada data mata pelajaran.</p>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tambah Guru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGuruPage;
