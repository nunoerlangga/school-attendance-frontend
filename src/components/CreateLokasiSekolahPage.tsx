import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateLokasiSekolahPage: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  // === ROLE GUARD ===
  if (role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2 style={{ color: '#ef4444', margin: 0 }}>403 — Akses Ditolak</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Halaman ini hanya dapat diakses oleh Administrator.</p>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Kembali</button>
      </div>
    );
  }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_lokasi: '',
    latitude: '',
    longitude: '',
    radius_meter: '',
    is_default: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear error on change
    if (validationErrors[name]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.nama_lokasi.trim()) {
      errs.nama_lokasi = 'Nama lokasi wajib diisi.';
    }
    const lat = parseFloat(formData.latitude);
    if (formData.latitude === '' || isNaN(lat)) {
      errs.latitude = 'Latitude harus berupa angka.';
    } else if (lat < -90 || lat > 90) {
      errs.latitude = 'Latitude harus antara -90 dan 90.';
    }
    const lng = parseFloat(formData.longitude);
    if (formData.longitude === '' || isNaN(lng)) {
      errs.longitude = 'Longitude harus berupa angka.';
    } else if (lng < -180 || lng > 180) {
      errs.longitude = 'Longitude harus antara -180 dan 180.';
    }
    const rad = parseInt(formData.radius_meter, 10);
    if (formData.radius_meter === '' || isNaN(rad)) {
      errs.radius_meter = 'Radius harus berupa angka bulat.';
    } else if (rad <= 0) {
      errs.radius_meter = 'Radius harus lebih besar dari 0.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung geolokasi.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
      },
      (err) => {
        alert('Gagal mendapatkan lokasi: ' + err.message);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/lokasi-sekolah', {
        nama_lokasi: formData.nama_lokasi.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius_meter: parseInt(formData.radius_meter, 10),
        is_default: formData.is_default,
      });
      navigate('/admin', { state: { activeTab: 'lokasi-sekolah' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan lokasi sekolah.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputError = (field: string) =>
    validationErrors[field] ? (
      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
        {validationErrors[field]}
      </span>
    ) : null;

  return (
    <div className="edit-page-container">
      <div className="btn-back-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Kembali
        </button>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>Tambah Lokasi Sekolah</h2>
          <p>Daftarkan titik lokasi dan radius absensi untuk sekolah Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            {/* Nama Lokasi */}
            <div className="form-group full-width">
              <label>Nama Lokasi <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                name="nama_lokasi"
                value={formData.nama_lokasi}
                onChange={handleChange}
                className={`form-input${validationErrors.nama_lokasi ? ' input-error' : ''}`}
                placeholder="Contoh: Gedung Utama, Lapangan Olahraga"
              />
              {inputError('nama_lokasi')}
            </div>

            {/* Latitude */}
            <div className="form-group">
              <label>Latitude <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className={`form-input${validationErrors.latitude ? ' input-error' : ''}`}
                placeholder="-6.200000"
              />
              {inputError('latitude')}
            </div>

            {/* Longitude */}
            <div className="form-group">
              <label>Longitude <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className={`form-input${validationErrors.longitude ? ' input-error' : ''}`}
                placeholder="106.816666"
              />
              {inputError('longitude')}
            </div>

            {/* Tombol ambil lokasi */}
            <div className="form-group full-width">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleGetMyLocation}
                disabled={geoLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {geoLoading ? 'Mendeteksi...' : 'Ambil Lokasi Saya (GPS)'}
              </button>
            </div>

            {/* Radius */}
            <div className="form-group">
              <label>Radius Absensi (meter) <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="number"
                name="radius_meter"
                value={formData.radius_meter}
                onChange={handleChange}
                className={`form-input${validationErrors.radius_meter ? ' input-error' : ''}`}
                placeholder="100"
                min="1"
              />
              {inputError('radius_meter')}
            </div>

            {/* Is Default */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <label htmlFor="is_default" style={{ cursor: 'pointer', marginBottom: 0, fontWeight: 500 }}>
                Jadikan lokasi default absensi
              </label>
            </div>
          </div>

          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}

          <div className="form-actions mt-4">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Batal</button>
            <button type="submit" className="login-button" disabled={submitting || geoLoading}>
              {submitting ? 'Menyimpan...' : 'Simpan Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLokasiSekolahPage;
