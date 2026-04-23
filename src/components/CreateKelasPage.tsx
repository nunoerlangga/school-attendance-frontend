import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateKelasPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: '',
    id_tahun_ajaran: ''
  });
  const [tahunList, setTahunList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const res = await api.get('/tahun-ajaran');
        setTahunList(res.data.filter((t: any) => t.is_aktif));
        if (res.data.length > 0) {
           const activeTahun = res.data.find((t: any) => t.is_aktif);
           if (activeTahun) {
              setFormData(prev => ({ ...prev, id_tahun_ajaran: activeTahun.id_tahun_ajaran }));
           } else {
              setFormData(prev => ({ ...prev, id_tahun_ajaran: res.data[0].id_tahun_ajaran }));
           }
        }
      } catch (err) {
        console.error('Failed to fetch tahun ajaran', err);
      }
    };
    fetchTahun();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.nama_kelas || !formData.tingkat || !formData.id_tahun_ajaran) {
      setError('Semua field wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await api.post('/kelas', formData);
      navigate('/admin', { state: { activeTab: 'kelas' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan kelas baru');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <h2>Tambah Kelas Baru</h2>
          <p>Masukkan informasi kelas baru</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="nama_kelas">Nama Kelas <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="text"
              id="nama_kelas"
              name="nama_kelas"
              className="form-input"
              value={formData.nama_kelas}
              onChange={handleChange}
              placeholder="Contoh: X IPA 1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tingkat">Tingkat <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="text"
              id="tingkat"
              name="tingkat"
              className="form-input"
              value={formData.tingkat}
              onChange={handleChange}
              placeholder="Contoh: 10, 11, 12 atau VII, VIII, IX"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="id_tahun_ajaran">Tahun Ajaran <span style={{ color: 'var(--error)' }}>*</span></label>
            <select
              id="id_tahun_ajaran"
              name="id_tahun_ajaran"
              className="form-input"
              value={formData.id_tahun_ajaran}
              onChange={handleChange}
              required
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunList.map(tahun => (
                <option key={tahun.id_tahun_ajaran} value={tahun.id_tahun_ajaran}>
                  {tahun.nama_tahun} {tahun.is_aktif ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/admin', { state: { activeTab: 'kelas' } })}
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
              style={{ flex: 1, marginTop: 0 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan Kelas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKelasPage;
