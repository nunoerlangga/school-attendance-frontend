import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Mapel {
  id_mapel: string;
  nama_mapel: string;
}

const EditGuruPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      try {
        const [resGuru, resMapel] = await Promise.all([
          api.get(`/guru/${id}`),
          api.get('/mapel')
        ]);
        
        const guru = resGuru.data;
        setFormData({
          nama_guru: guru.nama_guru,
          username: guru.user.username,
          password: '',
          jenis_kelamin: guru.jenis_kelamin
        });
        
        // Extract existing mapel IDs
        const existingMapelIds = guru.mapel.map((m: any) => m.id_mapel);
        setSelectedMapels(existingMapelIds);
        
        setAvailableMapels(resMapel.data);
      } catch (err: any) {
        setError('Gagal memuat data guru');
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
      const payload: any = { 
        ...formData,
        id_mapel: selectedMapels
      };
      if (!payload.password) delete payload.password;

      await api.patch(`/guru/${id}`, payload);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui data guru');
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
          <h2>Edit Data Guru</h2>
          <p>Perbarui informasi guru di bawah ini.</p>
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
            
            <div className="form-group full-width">
              <label>Mata Pelajaran yang Diampu</label>
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
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuruPage;
