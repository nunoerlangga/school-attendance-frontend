import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EditTahunAjaranPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_tahun: '',
    cycle_minggu: 1,
    is_aktif: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tahun-ajaran`);
        // We find the specific one locally because the backend might not have a direct GET /tahun-ajaran/:id (simulated here)
        // Usually there is a direct endpoint. Let's assume there is one or fallback to searching.
        const target = res.data.find((ta: any) => ta.id_tahun_ajaran === id);
        if (target) {
          setFormData({
            nama_tahun: target.nama_tahun,
            cycle_minggu: target.cycle_minggu,
            is_aktif: target.is_aktif,
          });
        } else {
          setError('Data tahun ajaran tidak ditemukan');
        }
      } catch (err: any) {
        setError('Gagal memuat data tahun ajaran');
      } finally {
        setLoading(false);
      }
    };

    fetchTahunAjaran();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_tahun.trim()) {
      setError('Nama tahun ajaran tidak boleh kosong');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.patch(`/tahun-ajaran/${id}`, {
        nama_tahun: formData.nama_tahun.trim(),
        cycle_minggu: Number(formData.cycle_minggu),
      });
      alert('Tahun Ajaran berhasil diperbarui!');
      navigate('/admin', { state: { activeTab: 'tahun-ajaran' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui tahun ajaran');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Memuat data...</div>;

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
          <h2>Edit Tahun Ajaran</h2>
          <p>Perbarui informasi tahun ajaran di bawah ini.</p>
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
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTahunAjaranPage;
