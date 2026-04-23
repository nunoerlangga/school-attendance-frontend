import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateMarketplaceItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    point_cost: 0,
    effect_type: 'FLEXIBILITY',
    is_aktif: true,
    stock_limit: '',
    durasi_menit: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...formData,
        point_cost: Number(formData.point_cost),
        stock_limit: formData.stock_limit ? Number(formData.stock_limit) : null
      };
      await api.post('/marketplace/admin/items', data);
      alert('Item berhasil dibuat!');
      navigate('/admin', { state: { activeTab: 'marketplace-admin' } });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat item');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2>Tambah Item Marketplace</h2>
          <p>Buat item reward baru untuk ditukarkan siswa dengan poin.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label>Nama Item</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Contoh: Voucher Kantin"
                value={formData.item_name} 
                onChange={(e) => setFormData({...formData, item_name: e.target.value})} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Harga Poin</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="0"
                  value={formData.point_cost} 
                  onChange={(e) => setFormData({...formData, point_cost: Number(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tipe Efek</label>
                <select 
                  className="form-input" 
                  value={formData.effect_type} 
                  onChange={(e) => setFormData({...formData, effect_type: e.target.value})}
                >
                  <option value="FLEXIBILITY">FLEXIBILITY (Skip Telat/Alfa)</option>
                  <option value="REWARD">REWARD (Bonus Lainnya)</option>
                  <option value="OTHER">LAINNYA</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Stok (Opsional)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="Tak terbatas jika kosong"
                value={formData.stock_limit} 
                onChange={(e) => setFormData({...formData, stock_limit: e.target.value})} 
              />
            </div>

            {formData.effect_type === 'FLEXIBILITY' && (
              <div className="form-group" style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                <label>Durasi Toleransi Terlambat (Menit)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Misal: 15"
                  value={formData.durasi_menit || ''} 
                  onChange={(e) => setFormData({...formData, durasi_menit: Number(e.target.value)})} 
                  required 
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                  Kupon ini akan secara berjenjang meng-cover keterlambatan up to menit ini.
                </small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Item Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMarketplaceItemPage;
