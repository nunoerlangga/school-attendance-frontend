import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface FlexibilityItem {
  id_item: string;
  item_name: string;
  point_cost: number;
  effect_type: string;
  is_aktif: boolean;
  stock_limit: number | null;
}

const ManageMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<FlexibilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/marketplace/admin/items', {
        params: showActiveOnly ? { is_aktif: 'true' } : {}
      });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [showActiveOnly]);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await api.patch(`/marketplace/admin/items/${id}`, { is_aktif: !current });
      fetchItems();
    } catch (err) {
      alert('Gagal mengubah status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan/mengaktifkan status item ini?')) return;
    try {
      await api.delete(`/marketplace/admin/items/${id}`);
      fetchItems();
    } catch (err) {
      alert('Gagal mengubah status item');
    }
  };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Manajemen Marketplace</h2>
          <p>Kelola item reward yang bisa ditukarkan siswa dengan poin.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button 
              onClick={() => setShowActiveOnly(true)} 
              style={{
                background: showActiveOnly ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: showActiveOnly ? 600 : 500,
                color: showActiveOnly ? '#0f172a' : '#64748b',
                boxShadow: showActiveOnly ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Aktif
            </button>
            <button 
              onClick={() => setShowActiveOnly(false)} 
              style={{
                background: !showActiveOnly ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: !showActiveOnly ? 600 : 500,
                color: !showActiveOnly ? '#0f172a' : '#64748b',
                boxShadow: !showActiveOnly ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Nonaktif
            </button>
          </div>
          <button className="login-button" onClick={() => navigate('/admin/create-marketplace-item')} style={{ width: 'auto', marginTop: 0 }}>
            + Tambah Item
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="activity-list">Memuat item...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Item</th>
                <th>Harga Poin</th>
                <th>Tipe Efek</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id_item}>
                  <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                  <td style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{item.point_cost} Pts</td>
                  <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{item.effect_type}</span></td>
                  <td>

                    <span className={`status-badge ${item.is_aktif ? 'active' : 'inactive'}`} style={{ fontSize: '0.7rem' }}>
                      {item.is_aktif ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td>

                    <div className="action-buttons">
                      <button
                        className="btn-icon edit" title="Edit"
                        onClick={() => navigate(`/admin/edit-marketplace-item/${item.id_item}`)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>

                      </button>
                      <button
                        className={`btn-icon ${item.is_aktif ? 'delete' : 'edit'}`} 
                        title={item.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                        onClick={() => handleDelete(item.id_item)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {item.is_aktif ? (
                            <>
                              <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </>
                          ) : (
                            <polyline points="20 6 9 17 4 12"></polyline>
                          )}
                        </svg>
                      </button>
                    </div>

                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada item marketplace.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageMarketplacePage;
