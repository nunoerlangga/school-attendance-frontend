import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Analytics {
  total: number;
  byStatus: { open: number; in_progress: number; resolved: number; closed: number };
  byCategory: { QR_SCAN?: number; LOKASI?: number; LUPA_ABSEN?: number; LAINNYA?: number };
  sla: {
    avgResponseTimeMinutes: number;
    avgResolutionTimeHours: number;
    ticketsWithFirstResponse: number;
    ticketsResolved: number;
  };
  satisfaction: { avgScore: number; totalRatings: number };
}

const formatMinutes = (min: number): string => {
  if (min < 60) return `${min} menit`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
};

const StarDisplay: React.FC<{ score: number }> = ({ score }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ fontSize: '1.2rem', color: s <= Math.round(score) ? '#f59e0b' : '#e2e8f0' }}>★</span>
    ))}
  </div>
);

const HelpdeskAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/helpdesk/analytics')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="loader" style={{ borderTopColor: 'var(--primary-color)', display: 'inline-block', marginRight: '0.5rem' }} />
      Memuat analytics...
    </div>
  );

  if (!analytics) return <div style={{ padding: '2rem', color: 'var(--error)' }}>Gagal memuat data analytics.</div>;

  const categoryLabels: Record<string, string> = {
    QR_SCAN: 'Gagal Scan QR',
    LOKASI: 'Lokasi Tidak Terdeteksi',
    LUPA_ABSEN: 'Lupa Absen',
    LAINNYA: 'Lainnya',
  };

  const categoryColors: Record<string, string> = {
    QR_SCAN: '#6366f1',
    LOKASI: '#3b82f6',
    LUPA_ABSEN: '#f59e0b',
    LAINNYA: '#10b981',
  };

  const maxCategory = Math.max(...Object.values(analytics.byCategory).map(v => v ?? 0), 1);

  const statusColors: Record<string, string> = {
    open: '#ef4444',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    closed: '#64748b',
  };
  const statusLabels: Record<string, string> = {
    open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
  };

  return (
    <div className="helpdesk-analytics">
      {/* SLA Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div className="stat-data">
            <span className="stat-value">{analytics.total}</span>
            <span className="stat-label">Total Tiket</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="stat-data">
            <span className="stat-value">{analytics.sla.avgResponseTimeMinutes > 0 ? formatMinutes(analytics.sla.avgResponseTimeMinutes) : '—'}</span>
            <span className="stat-label">Avg. Response Time</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </div>
          <div className="stat-data">
            <span className="stat-value">
              {analytics.sla.ticketsResolved > 0
                ? (analytics.sla.avgResolutionTimeHours > 0 ? `${analytics.sla.avgResolutionTimeHours}j` : '< 0.1 jam')
                : '—'}
            </span>
            <span className="stat-label">Avg. Resolution Time</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div className="stat-data">
            <span className="stat-value">{analytics.satisfaction.avgScore > 0 ? analytics.satisfaction.avgScore : '—'}</span>
            <span className="stat-label">Avg. Rating ({analytics.satisfaction.totalRatings} ulasan)</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Category Bar Chart */}
        <div className="recent-activity">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>📊 Tiket Per Kategori</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(['QR_SCAN', 'LOKASI', 'LUPA_ABSEN', 'LAINNYA'] as const).map(cat => {
              const count = analytics.byCategory[cat] ?? 0;
              const pct = Math.round((count / maxCategory) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>{categoryLabels[cat]}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: categoryColors[cat] }}>{count}</span>
                  </div>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{ width: `${pct}%`, background: categoryColors[cat] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="recent-activity">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>🎯 Distribusi Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(Object.entries(analytics.byStatus) as [string, number][]).map(([status, count]) => {
              const total = analytics.total || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: statusColors[status], flexShrink: 0
                  }} />
                  <span style={{ flex: 1, fontSize: '0.875rem' }}>{statusLabels[status]}</span>
                  <div className="analytics-bar-track" style={{ flex: 2 }}>
                    <div className="analytics-bar-fill" style={{ width: `${pct}%`, background: statusColors[status] }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '50px', textAlign: 'right' }}>
                    {count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Satisfaction */}
          {analytics.satisfaction.totalRatings > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Kepuasan Rata-rata</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <StarDisplay score={analytics.satisfaction.avgScore} />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                  {analytics.satisfaction.avgScore}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  dari {analytics.satisfaction.totalRatings} ulasan
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SLA Summary Table */}
      <div className="recent-activity">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>⏱️ Ringkasan SLA</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metrik</th>
                <th>Nilai</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500 }}>Rata-rata Response Time</td>
                <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                  {analytics.sla.avgResponseTimeMinutes > 0 ? formatMinutes(analytics.sla.avgResponseTimeMinutes) : '—'}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>Waktu sejak tiket dibuat hingga admin pertama kali membalas</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Rata-rata Resolution Time</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>
                  {analytics.sla.ticketsResolved > 0
                    ? (analytics.sla.avgResolutionTimeHours > 0 ? `${analytics.sla.avgResolutionTimeHours} jam` : '< 0.1 jam (Di bawah 6 menit)')
                    : '—'}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>Waktu sejak tiket dibuat hingga berstatus resolved</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Tiket Sudah Direspons</td>
                <td style={{ fontWeight: 700, color: '#3b82f6' }}>{analytics.sla.ticketsWithFirstResponse}</td>
                <td style={{ color: 'var(--text-muted)' }}>Tiket dengan first response dari admin</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Tiket Diselesaikan</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>{analytics.sla.ticketsResolved}</td>
                <td style={{ color: 'var(--text-muted)' }}>Tiket dengan status resolved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HelpdeskAnalyticsPage;
