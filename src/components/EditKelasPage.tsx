import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EditKelasPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: '',
    id_tahun_ajaran: ''
  });
  const [tahunList, setTahunList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kelasRes, tahunRes] = await Promise.all([
          api.get(`/kelas/${id}`),
          api.get('/tahun-ajaran')
        ]);
        
        setFormData({
          nama_kelas: kelasRes.data.nama_kelas,
          tingkat: kelasRes.data.tingkat,
          id_tahun_ajaran: kelasRes.data.id_tahun_ajaran
        });
        
        // Ensure even inactive tahun ajaran are shown if it's currently selected
        setTahunList(tahunRes.data);
      } catch (err: any) {
        console.error('Failed to fetch data', err);
        setError('Gagal memuat data kelas.');
      } finally {
        setDataLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

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
      await api.patch(`/kelas/${id}`, formData);
      navigate('/admin', { state: { activeTab: 'kelas' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah data kelas');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="login-container">
        <div className="table-loading" style={{ margin: 'auto' }}>Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <h2>Edit Kelas</h2>
          <p>Ubah informasi kelas</p>
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
              disabled={true} 
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunList.map(tahun => (
                <option key={tahun.id_tahun_ajaran} value={tahun.id_tahun_ajaran}>
                  {tahun.nama_tahun} {!tahun.is_aktif ? '(Nonaktif)' : '(Aktif)'}
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>Tahun ajaran tidak dapat diubah setelah kelas dibuat.</small>
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
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKelasPage;
