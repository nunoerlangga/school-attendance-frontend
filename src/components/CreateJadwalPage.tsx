import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Guru {
  id_guru: string;
  nama_guru: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
  tingkat: string;
}

interface Mapel {
  id_mapel: string;
  nama_mapel: string;
}

const CreateJadwalPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    id_guru: '',
    id_kelas: '',
    id_mapel: '',
    id_tahun: '',
    cycle_week: 1, // Defaulting cycle_week to 1
  });

  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [maxCycleWeek, setMaxCycleWeek] = useState<number>(1);
  const [liburMingguan, setLiburMingguan] = useState<string[]>([]);

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [guruRes, kelasRes, mapelRes, tahunRes, liburRes] = await Promise.all([
          api.get('/guru'),
          api.get('/kelas'),
          api.get('/mapel'),
          api.get('/tahun-ajaran/aktif'),
          api.get('/hari-libur/mingguan')
        ]);

        if (guruRes.data) setGuruList(guruRes.data);
        if (kelasRes.data) setKelasList(kelasRes.data);
        if (mapelRes.data) setMapelList(mapelRes.data);
        if (tahunRes.data) {
          setFormData(prev => ({ ...prev, id_tahun: tahunRes.data.id_tahun_ajaran }));
          setMaxCycleWeek(tahunRes.data.cycle_minggu || 1);
        }
        if (liburRes.data) {
          const activeLibur = liburRes.data
            .filter((l: any) => l.is_aktif)
            .map((l: any) => l.hari.toLowerCase());
          setLiburMingguan(activeLibur);
        }
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data referensi. Silakan muat ulang halaman.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.id_guru || !formData.id_kelas || !formData.id_mapel || !formData.hari || !formData.jam_mulai || !formData.jam_selesai || !formData.id_tahun) {
      setError('Semua field wajib diisi.');
      setSubmitting(false);
      return;
    }

    const payload = {
       ...formData,
       cycle_week: Number(formData.cycle_week),
       hari: formData.hari.toLowerCase(),
       jam_mulai: formData.jam_mulai, // Send HH:mm directly
       jam_selesai: formData.jam_selesai
    };

    try {
      await api.post('/jadwal', payload);
      alert('Jadwal berhasil ditambahkan!');
      navigate(-1);
    } catch (err: any) {
      console.error('Submit error:', err);
      // The backend JadwalService returns errors matching "Jadwal guru bentrok" / "Jadwal kelas bentrok"
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan jadwal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="loader"></div> Memuat Form...</div>;

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
          <h2>Tambah Jadwal Pelajaran</h2>
          <p>Masukkan informasi jadwal kelas yang baru.</p>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-grid">
            <div className="form-group">
              <label>Hari</label>
              <select
                className="form-input"
                name="hari"
                value={formData.hari}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Pilih Hari</option>
                {hariOptions.map(h => {
                   const isLibur = liburMingguan.includes(h.toLowerCase());
                   return (
                     <option key={h} value={h} disabled={isLibur}>
                       {h} {isLibur ? '(Libur)' : ''}
                     </option>
                   );
                })}
              </select>
              {liburMingguan.length > 0 && (
                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                  * Beberapa hari tidak tersedia karena merupakan hari libur mingguan.
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Siklus Minggu Ke-</label>
              <select
                className="form-input"
                name="cycle_week"
                value={formData.cycle_week}
                onChange={handleInputChange}
                required
              >
                {Array.from({ length: maxCycleWeek }, (_, i) => i + 1).map(week => (
                  <option key={week} value={week}>Minggu ke-{week}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mata Pelajaran</label>
              <select
                className="form-input"
                name="id_mapel"
                value={formData.id_mapel}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Pilih Mapel</option>
                {mapelList.map(mapel => (
                  <option key={mapel.id_mapel} value={mapel.id_mapel}>
                    {mapel.nama_mapel}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Guru Pengajar</label>
              <select
                className="form-input"
                name="id_guru"
                value={formData.id_guru}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Pilih Guru</option>
                {guruList.map(guru => (
                  <option key={guru.id_guru} value={guru.id_guru}>
                    {guru.nama_guru}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kelas</label>
              <select
                className="form-input"
                name="id_kelas"
                value={formData.id_kelas}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Pilih Kelas</option>
                {kelasList.map(kelas => (
                  <option key={kelas.id_kelas} value={kelas.id_kelas}>
                    {kelas.tingkat} {kelas.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Jam Mulai</label>
              <input
                type="time"
                className="form-input"
                name="jam_mulai"
                value={formData.jam_mulai}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Jam Selesai</label>
              <input
                type="time"
                className="form-input"
                name="jam_selesai"
                value={formData.jam_selesai}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJadwalPage;
