import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EditPointRulePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    rule_name: '',
    rule_type: 'TELAT_MENIT',
    target_role: 'siswa',
    condition_operator: 'GT',
    condition_value: '',
    condition_min: '',
    condition_max: '',
    condition_time: '',
    condition_status: 'alfa',
    point_modifier: '',
    priority: '0',
    is_aktif: true,
  });

  const isBetween = form.condition_operator === 'BETWEEN';
  const isStatus = form.rule_type === 'STATUS_ABSENSI';

  useEffect(() => {
    const fetchRule = async () => {
      try {
        setLoading(true);
        const res = await api.get('/point-rules');
        const target = res.data.find((r: any) => r.id_point_rule === id);
        if (target) {
          const condTime = target.condition_time
            ? (() => {
                const date = new Date(target.condition_time);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              })()
            : '';

          setForm({
            rule_name: target.rule_name,
            rule_type: target.rule_type || 'TELAT_MENIT',
            target_role: target.target_role,
            condition_operator: target.condition_operator,
            condition_value: target.condition_value?.toString() ?? '',
            condition_min: target.condition_min?.toString() ?? '',
            condition_max: target.condition_max?.toString() ?? '',
            condition_time: condTime,
            condition_status: target.condition_status || 'alfa',
            point_modifier: target.point_modifier.toString(),
            priority: target.priority.toString(),
            is_aktif: target.is_aktif,
          });
        } else {
          setError('Aturan tidak ditemukan');
        }
      } catch {
        setError('Gagal memuat data aturan poin');
      } finally {
        setLoading(false);
      }
    };
    fetchRule();
  }, [id]);

  const validate = (): string | null => {
    if (!form.rule_name.trim()) return 'Nama rule wajib diisi.';
    if (!form.point_modifier) return 'Point modifier wajib diisi.';
    if (form.rule_type === 'TELAT_MENIT') {
      if (isBetween) {
        if (!form.condition_min) return 'Range Min wajib diisi untuk operator BETWEEN.';
        if (!form.condition_max) return 'Range Max wajib diisi untuk operator BETWEEN.';
        if (parseInt(form.condition_min) > parseInt(form.condition_max)) {
          return 'Range Min tidak boleh lebih besar dari Range Max.';
        }
      } else {
        if (!form.condition_value) return 'Nilai kondisi wajib diisi.';
      }
    }
    if (form.rule_type === 'STATUS_ABSENSI' && !form.condition_status) {
      return 'Status absensi wajib pilih.';
    }
    if (form.rule_type === 'WAKTU_DATANG' && !form.condition_time) {
      return 'Waktu kondisi wajib diisi.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      setSubmitting(true);
      setError(null);

      const data: any = {
        rule_name: form.rule_name,
        rule_type: form.rule_type,
        target_role: form.target_role,
        condition_operator: form.condition_operator,
        point_modifier: parseInt(form.point_modifier),
        priority: parseInt(form.priority),
        is_aktif: form.is_aktif,
        // Explicitly null out all condition fields — service will set correct ones
        condition_value: null,
        condition_min: null,
        condition_max: null,
        condition_time: null,
        condition_status: null,
      };

      if (form.rule_type === 'TELAT_MENIT') {
        if (isBetween) {
          data.condition_min = parseInt(form.condition_min);
          data.condition_max = parseInt(form.condition_max);
        } else {
          data.condition_value = parseInt(form.condition_value);
        }
      } else if (form.rule_type === 'WAKTU_DATANG') {
        data.condition_time = form.condition_time;
      } else if (form.rule_type === 'STATUS_ABSENSI') {
        data.condition_status = form.condition_status;
        delete data.condition_operator; // Backend handles null/optional
      }

      await api.patch(`/point-rules/${id}`, data);
      navigate('/admin', { state: { activeTab: 'point-rule' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan aturan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Memuat data...</div>;

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
          <h2>Edit Rule Poin</h2>
          <p>Perbarui kriteria reward atau penalty otomatis.</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label>Nama Rule</label>
              <input
                type="text"
                className="form-input"
                required
                value={form.rule_name}
                onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
                placeholder="Contoh: Terlambat Parah"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipe Rule</label>
                <select
                  className="form-input"
                  value={form.rule_type}
                  onChange={(e) => setForm({ ...form, rule_type: e.target.value, condition_operator: 'GT' })}
                >
                  <option value="TELAT_MENIT">Telat (Menit)</option>
                  <option value="WAKTU_DATANG">Waktu Kedatangan</option>
                  <option value="STATUS_ABSENSI">Status Absensi</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Kondisi Box */}
            <div className="condition-box" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
              <label style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}>
                Kondisi Pemicu
              </label>

              {!isStatus && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Operator</label>
                  <select
                    className="form-input"
                    value={form.condition_operator}
                    onChange={(e) => setForm({ ...form, condition_operator: e.target.value, condition_value: '', condition_min: '', condition_max: '' })}
                    disabled={form.rule_type === 'WAKTU_DATANG'}
                  >
                    <option value="EQ">= (Sama dengan)</option>
                    <option value="GT">&gt; (Lebih dari)</option>
                    <option value="LT">&lt; (Kurang dari)</option>
                    <option value="GTE">&gt;= (Lebih dari atau sama)</option>
                    <option value="LTE">&lt;= (Kurang dari atau sama)</option>
                    {form.rule_type === 'TELAT_MENIT' && (
                      <option value="BETWEEN">↔ BETWEEN (Rentang)</option>
                    )}
                  </select>
                </div>
              )}

              {form.rule_type === 'TELAT_MENIT' && !isBetween && (
                <div className="form-group">
                  <label>Nilai Kondisi (menit)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.condition_value}
                    onChange={(e) => setForm({ ...form, condition_value: e.target.value })}
                    placeholder="Contoh: 10"
                    min="0"
                  />
                </div>
              )}

              {form.rule_type === 'TELAT_MENIT' && isBetween && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Range Min (menit)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.condition_min}
                      onChange={(e) => setForm({ ...form, condition_min: e.target.value })}
                      placeholder="Contoh: 0"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Range Max (menit)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.condition_max}
                      onChange={(e) => setForm({ ...form, condition_max: e.target.value })}
                      placeholder="Contoh: 10"
                      min="0"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Rule akan cocok jika menit keterlambatan berada di antara Min dan Max (inklusif).
                    </p>
                  </div>
                </div>
              )}

              {form.rule_type === 'WAKTU_DATANG' && (
                <div className="form-group">
                  <label>Waktu Kondisi</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.condition_time}
                    onChange={(e) => setForm({ ...form, condition_time: e.target.value })}
                  />
                </div>
              )}

              {form.rule_type === 'STATUS_ABSENSI' && (
                <div className="form-group">
                  <label>Status Absensi</label>
                  <select
                    className="form-input"
                    value={form.condition_status}
                    onChange={(e) => setForm({ ...form, condition_status: e.target.value })}
                  >
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alfa">Alfa</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Point Modifier</label>
              <input
                type="number"
                className="form-input"
                required
                value={form.point_modifier}
                onChange={(e) => setForm({ ...form, point_modifier: e.target.value })}
                placeholder="Contoh: -5"
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

export default EditPointRulePage;
