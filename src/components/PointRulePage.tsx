import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface PointRule {
  id_point_rule: string;
  rule_name: string;
  rule_type: 'TELAT_MENIT' | 'WAKTU_DATANG' | 'STATUS_ABSENSI';
  target_role: string;
  condition_operator: string;
  condition_value: number | null;
  condition_min: number | null;
  condition_max: number | null;
  condition_time: string | null;
  condition_status: string | null;
  point_modifier: number;
  priority: number;
  is_aktif: boolean;
}

const PointRulePage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<PointRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/point-rules?is_aktif=${showActive}`);
      setRules(res.data);
    } catch (err: any) {
      setError('Gagal memuat aturan poin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [showActive]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus aturan ini?')) return;
    try {
      await api.delete(`/point-rules/${id}`);
      setRules(rules.filter(r => r.id_point_rule !== id));
    } catch (err) {
      alert('Gagal menghapus aturan.');
    }
  };

  const formatCondition = (rule: PointRule) => {
    if (rule.rule_type === 'STATUS_ABSENSI') {
      return `Status = ${rule.condition_status?.toUpperCase() || '-'}`;
    }

    const ops: Record<string, string> = {
      EQ: '=', GT: '>', LT: '<', GTE: '>=', LTE: '<='
    };
    const op = ops[rule.condition_operator] || rule.condition_operator;

    if (rule.rule_type === 'TELAT_MENIT') {
      if (rule.condition_operator === 'BETWEEN' && rule.condition_min !== null && rule.condition_max !== null) {
        return `Telat ${rule.condition_min} sampai ${rule.condition_max} Menit`;
      } else if (rule.condition_value !== null) {
        return `Telat ${op} ${rule.condition_value} Menit`;
      }
    }

    if (rule.rule_type === 'WAKTU_DATANG' && rule.condition_time) {
      // Backend sends local ISO (1970-01-01T08:00:00)
      const date = new Date(rule.condition_time);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      return `Jam ${op} ${timeStr}`;
    }

    return '-';
  };

  const formatRuleType = (type: string) => {
    switch (type) {
      case 'TELAT_MENIT': return 'Telat (Menit)';
      case 'WAKTU_DATANG': return 'Waktu Datang';
      case 'STATUS_ABSENSI': return 'Status Absensi';
      default: return type;
    }
  };

  return (
    <div className="data-page">
      <div className="card-header">
        <div className="header-info">
          <h2>Manajemen Point Rule (Rule Engine)</h2>
          <p>Atur reward dan penalty otomatis berdasarkan kondisi absensi siswa.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Status Segmented Toggle */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setShowActive(true)}
              style={{
                background: showActive ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: showActive ? 600 : 500,
                color: showActive ? '#0f172a' : '#64748b',
                boxShadow: showActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Aktif
            </button>
            <button
              onClick={() => setShowActive(false)}
              style={{
                background: !showActive ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: !showActive ? 600 : 500,
                color: !showActive ? '#0f172a' : '#64748b',
                boxShadow: !showActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Nonaktif
            </button>
          </div>

          <button className="login-button" onClick={() => navigate('/admin/create-point-rule')} style={{ width: 'auto', marginTop: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Rule
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Memuat aturan...</div>
        ) : error ? (
          <div className="error-message" style={{ margin: '2rem' }}>{error}</div>
        ) : rules.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada aturan poin yang dikonfigurasi.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Prioritas</th>
                <th>Nama Rule</th>
                <th>Tipe</th>
                <th>Kondisi</th>
                <th>Poin</th>
                <th>Status</th>
                <th className="action-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {[...rules].sort((a, b) => b.priority - a.priority).map((rule) => (
                <tr key={rule.id_point_rule}>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {rule.priority}
                    </span>
                  </td>
                  <td className="font-bold">{rule.rule_name}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {formatRuleType(rule.rule_type)}
                    </span>
                  </td>
                  <td>{formatCondition(rule)}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: rule.point_modifier > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {rule.point_modifier > 0 ? `+${rule.point_modifier}` : rule.point_modifier}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                      <span className={`status-badge ${rule.is_aktif ? 'active' : 'inactive'}`} style={{ fontSize: '0.7rem' }}>
                        {rule.is_aktif ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon edit" title="Edit" onClick={() => navigate(`/admin/edit-point-rule/${rule.id_point_rule}`)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="btn-icon delete" title="Hapus" onClick={() => handleDelete(rule.id_point_rule)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PointRulePage;
