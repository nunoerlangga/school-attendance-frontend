import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ── Helper: decode id_user dari JWT sub claim ────────────────
const getIdUser = (): string => {
  const stored = localStorage.getItem('id_user');
  if (stored) return stored;
  try {
    const token = localStorage.getItem('token') || '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload?.sub) {
      localStorage.setItem('id_user', payload.sub);
      return payload.sub;
    }
  } catch (_) { /* ignore */ }
  return '';
};

// ─── Types ────────────────────────────────────────────────────
interface Ticket {
  id_ticket: string;
  subject: string;
  description: string;
  category: 'QR_SCAN' | 'LOKASI' | 'LUPA_ABSEN' | 'LAINNYA';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
  responses: Response[];
  rating: { score: number; feedback?: string } | null;
}

interface Response {
  id_response: string;
  message: string;
  created_at: string;
  is_auto_reply: boolean;
  responder: {
    id_user: string;
    username: string;
    role: 'admin' | 'guru' | 'siswa';
    siswa?: { nama_siswa: string } | null;
  };
}

// ─── Constants ────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  QR_SCAN: 'Gagal Scan QR',
  LOKASI: 'Lokasi Tidak Terdeteksi',
  LUPA_ABSEN: 'Lupa Absen',
  LAINNYA: 'Lainnya',
};
const CAT_ICONS: Record<string, string> = {
  QR_SCAN: '📷', LOKASI: '📍', LUPA_ABSEN: '⏰', LAINNYA: '❓',
};

const STATUS_CFG: Record<string, { label: string; cls: string; color: string }> = {
  open:        { label: 'Open',        cls: 'status-open',        color: '#ef4444' },
  in_progress: { label: 'In Progress', cls: 'status-in-progress', color: '#f59e0b' },
  resolved:    { label: 'Resolved',    cls: 'status-resolved',    color: '#10b981' },
  closed:      { label: 'Closed',      cls: 'status-closed',      color: '#64748b' },
};

const PRI_CFG: Record<string, { label: string; cls: string }> = {
  high:   { label: 'High',   cls: 'priority-high' },
  medium: { label: 'Medium', cls: 'priority-medium' },
  low:    { label: 'Low',    cls: 'priority-low' },
};

const TAB_FILTERS = [
  { key: '', label: 'Semua' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

const fmtDate = (dt: string) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dt));

const fmtDateTime = (dt: string) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dt));

const ticketShortId = (id: string) => id.slice(0, 8).toUpperCase();

// ─── Star Rating ─────────────────────────────────────────────
const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="rating-stars">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} className={`star-btn ${s <= value ? 'star-active' : ''}`} onClick={() => onChange(s)}>★</button>
    ))}
  </div>
);

// ─── Resolution Timeline ─────────────────────────────────────
const ResolutionTimeline: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const steps = [
    {
      label: 'Tiket Dikirim',
      desc: fmtDateTime(ticket.created_at),
      done: true,
      active: ticket.status === 'open',
    },
    {
      label: 'Direspons Admin',
      desc: ticket.first_response_at ? fmtDateTime(ticket.first_response_at) : 'Menunggu respons...',
      done: !!ticket.first_response_at,
      active: ticket.status === 'in_progress',
    },
    {
      label: 'Sedang Ditangani',
      desc: ticket.status === 'in_progress' ? 'Sedang diproses oleh admin' : (ticket.first_response_at ? 'Selesai diproses' : 'Menunggu'),
      done: ['in_progress','resolved','closed'].includes(ticket.status),
      active: ticket.status === 'in_progress',
    },
    {
      label: 'Diselesaikan',
      desc: ticket.resolved_at ? fmtDateTime(ticket.resolved_at) : 'Belum diselesaikan',
      done: !!ticket.resolved_at,
      active: ticket.status === 'resolved',
    },
  ];

  return (
    <div className="hsk-timeline">
      {steps.map((step, i) => (
        <div key={i} className={`hsk-timeline-step ${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`}>
          <div className="hsk-timeline-dot">
            {step.done ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <div className="hsk-dot-inner" />
            )}
          </div>
          {i < steps.length - 1 && <div className="hsk-timeline-line" />}
          <div className="hsk-timeline-content">
            <div className="hsk-timeline-label">{step.label}</div>
            <div className="hsk-timeline-desc">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const HelpdeskSiswaPage: React.FC = () => {
  const idSiswa = localStorage.getItem('id_siswa') || '';
  const idUser = getIdUser();
  const namaSiswa = localStorage.getItem('nama') || 'Siswa';

  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create form
  const [form, setForm] = useState({
    subject: '', description: '',
    category: 'QR_SCAN' as Ticket['category'],
    priority: 'medium' as Ticket['priority'],
  });
  const [submitting, setSubmitting] = useState(false);
  const [similarTickets, setSimilarTickets] = useState<any[]>([]);
  const [checkingDup, setCheckingDup] = useState(false);

  // Reply
  const [replyMsg, setReplyMsg] = useState('');
  const [replying, setReplying] = useState(false);

  // Rating
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!idSiswa) return;
    setLoading(true);
    try {
      const res = await api.get('/helpdesk/tickets/my', { params: { id_siswa: idSiswa } });
      setTickets(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [idSiswa]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (!form.subject || form.subject.length < 5) { 
      setSimilarTickets([]); 
      return; 
    }
    const t = setTimeout(async () => {
      setCheckingDup(true);
      try {
        const res = await api.get('/helpdesk/tickets/check-similar', {
          params: { subject: form.subject, category: form.category, id_siswa: idSiswa },
        });
        setSimilarTickets(res.data);
      } catch (_) {}
      finally { setCheckingDup(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [form.subject, form.category, idSiswa]);

  const handleSubmitTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    if (similarTickets.length > 0) return;
    setSubmitting(true);
    try {
      await api.post('/helpdesk/tickets', {
        id_siswa: idSiswa, subject: form.subject,
        description: form.description, category: form.category, priority: form.priority,
      });
      setForm({ subject: '', description: '', category: 'QR_SCAN', priority: 'medium' });
      setSimilarTickets([]);
      await fetchTickets();
      setView('list');
    } catch (e: any) { alert(e.response?.data?.message || 'Gagal mengirim tiket'); }
    finally { setSubmitting(false); }
  };

  const openDetail = async (t: Ticket) => {
    setDetailLoading(true);
    setSelectedTicket(t);
    setView('detail');
    try {
      const res = await api.get(`/helpdesk/tickets/${t.id_ticket}`);
      setSelectedTicket(res.data);
    } catch (_) {}
    finally { setDetailLoading(false); }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMsg.trim()) return;
    setReplying(true);
    try {
      await api.post(`/helpdesk/tickets/${selectedTicket.id_ticket}/reply`, {
        responder_id: idUser, message: replyMsg, is_auto_reply: false,
      });
      setReplyMsg('');
      const res = await api.get(`/helpdesk/tickets/${selectedTicket.id_ticket}`);
      setSelectedTicket(res.data);
    } catch (_) {}
    finally { setReplying(false); }
  };

  const handleRating = async () => {
    if (!selectedTicket || ratingScore === 0) return;
    setSubmittingRating(true);
    try {
      await api.post(`/helpdesk/tickets/${selectedTicket.id_ticket}/rating`, {
        score: ratingScore, feedback: ratingFeedback || undefined,
      });
      const res = await api.get(`/helpdesk/tickets/${selectedTicket.id_ticket}`);
      setSelectedTicket(res.data);
      await fetchTickets();
      setRatingScore(0); setRatingFeedback('');
    } catch (e: any) { alert(e.response?.data?.message || 'Gagal mengirim rating'); }
    finally { setSubmittingRating(false); }
  };

  // Computed stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
  };

  const filteredTickets = activeTab ? tickets.filter(t => t.status === activeTab) : tickets;

  // ══════════════════════════════════════════════════
  // VIEW: LIST
  // ══════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="hsk-siswa-root">
        {/* ── Header ── */}
        <div className="hsk-page-header">
          <div>
            <h2 className="hsk-page-title">🎧 Help Center</h2>
            <p className="hsk-page-sub">Buat dan pantau status tiket bantuan Anda</p>
          </div>
          <button
            className="hsk-btn-primary"
            onClick={() => setView('create')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Buat Tiket Baru
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="hsk-stats-row">
          {[
            { label: 'Total Tiket', value: stats.total, icon: '🎟️', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Menunggu', value: stats.open, icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Diproses', value: stats.inProgress, icon: '🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Selesai', value: stats.resolved, icon: '🟢', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          ].map(s => (
            <div key={s.label} className="hsk-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="hsk-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="hsk-stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
                <div className="hsk-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="hsk-tab-bar">
          {TAB_FILTERS.map(tab => (
            <button
              key={tab.key}
              className={`hsk-tab ${activeTab === tab.key ? 'hsk-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key && (
                <span className="hsk-tab-count">
                  {tickets.filter(t => t.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Ticket Table ── */}
        <div className="hsk-table-card">
          {loading ? (
            <div className="hsk-center-msg">
              <div className="loader" style={{ borderTopColor: 'var(--primary-color)', display: 'inline-block', marginRight: '0.5rem' }} />
              Memuat tiket...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="hsk-empty-state">
              <div style={{ fontSize: '3rem' }}>📭</div>
              <h3>Belum ada tiket</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {activeTab ? `Tidak ada tiket dengan status "${STATUS_CFG[activeTab]?.label}"` : 'Buat tiket pertama Anda jika mengalami kendala absensi'}
              </p>
              {!activeTab && (
                <button className="hsk-btn-primary" onClick={() => setView('create')}>Buat Tiket Sekarang</button>
              )}
            </div>
          ) : (
            <table className="hsk-table">
              <thead>
                <tr>
                  <th>ID Tiket</th>
                  <th>Subjek</th>
                  <th>Kategori</th>
                  <th>Prioritas</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Balasan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => (
                  <tr key={t.id_ticket} className="hsk-table-row" onClick={() => openDetail(t)}>
                    <td>
                      <code className="hsk-ticket-id">#{ticketShortId(t.id_ticket)}</code>
                    </td>
                    <td>
                      <div className="hsk-subject-cell">{t.subject}</div>
                    </td>
                    <td>
                      <span className="hsk-cat-tag">
                        {CAT_ICONS[t.category]} {CAT_LABELS[t.category]}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${PRI_CFG[t.priority].cls}`}>
                        {PRI_CFG[t.priority].label}
                      </span>
                    </td>
                    <td>
                      <span className={`ticket-status-badge ${STATUS_CFG[t.status].cls}`}>
                        {STATUS_CFG[t.status].label}
                      </span>
                    </td>
                    <td className="hsk-date-cell">{fmtDate(t.created_at)}</td>
                    <td className="hsk-reply-count">{t.responses.length}</td>
                    <td>
                      <button
                        className="hsk-btn-open"
                        onClick={e => { e.stopPropagation(); openDetail(t); }}
                      >
                        Buka →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // VIEW: CREATE
  // ══════════════════════════════════════════════════
  if (view === 'create') {
    return (
      <div className="hsk-siswa-root">
        {/* Header */}
        <div className="hsk-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="hsk-btn-back" onClick={() => { setView('list'); setSimilarTickets([]); }}>
              ← Kembali
            </button>
            <div>
              <h2 className="hsk-page-title">📝 Buat Aduan Baru</h2>
              <p className="hsk-page-sub">Sampaikan keluhan atau masalah Anda dengan detail untuk bantuan yang lebih cepat</p>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="hsk-create-layout">
          {/* LEFT: Form */}
          <div className="hsk-form-card">
            {/* Category */}
            <div className="hsk-form-section">
              <label className="hsk-label">Kategori Masalah</label>
              <div className="hsk-cat-grid">
                {(['QR_SCAN', 'LOKASI', 'LUPA_ABSEN', 'LAINNYA'] as const).map(cat => (
                  <button
                    key={cat}
                    className={`hsk-cat-option ${form.category === cat ? 'hsk-cat-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{CAT_ICONS[cat]}</span>
                    <span>{CAT_LABELS[cat]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="hsk-form-section">
              <label className="hsk-label">
                Judul Masalah *
                {checkingDup && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
                    Memeriksa duplikasi...
                  </span>
                )}
              </label>
              <input
                className="form-input"
                placeholder={`Contoh: ${form.category === 'QR_SCAN' ? 'QR tidak terbaca di kelas X IPA 1' : form.category === 'LOKASI' ? 'GPS tidak terdeteksi saat absen' : 'Tidak sempat absen pagi ini'}`}
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                maxLength={255}
              />
            </div>

            {/* Description */}
            <div className="hsk-form-section">
              <label className="hsk-label">Deskripsi Lengkap *</label>
              <textarea
                className="form-input"
                rows={6}
                style={{ resize: 'vertical' }}
                placeholder="Jelaskan secara detail: kapan terjadi, pesan error yang muncul, langkah yang sudah dicoba..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Priority */}
            <div className="hsk-form-section">
              <label className="hsk-label">Prioritas</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    className={`hsk-pri-option ${form.priority === p ? 'hsk-pri-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                  >
                    <span className={`priority-badge ${PRI_CFG[p].cls}`}>{PRI_CFG[p].label}</span>
                    <span className="hsk-pri-sub">
                      {p === 'high' ? 'Mendesak' : p === 'medium' ? 'Normal' : 'Tidak Mendesak'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              {similarTickets.length > 0 && (
                <div style={{ padding: '1rem', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🛑</span>
                    <span style={{ fontWeight: 700, color: '#9f1239' }}>Tiket Serupa Sedang Aktif</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#be123c', margin: 0 }}>
                    Anda tidak dapat mengirim tiket baru karena ada tiket dengan topik serupa yang sedang diproses. 
                    Silakan gunakan tiket yang sudah ada untuk berkomunikasi dengan admin.
                  </p>
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.6)', borderRadius: '0.5rem', borderLeft: '3px solid #e11d48' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9f1239', fontWeight: 600, textTransform: 'uppercase' }}>Tiket Aktif:</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{similarTickets[0].subject}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: #{ticketShortId(similarTickets[0].id_ticket)} • Status: {STATUS_CFG[similarTickets[0].status].label}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  className="hsk-btn-cancel"
                  onClick={() => { setView('list'); setSimilarTickets([]); }}
                >
                  Batal
                </button>
                <button
                  className="hsk-btn-primary"
                  disabled={submitting || !form.subject.trim() || !form.description.trim() || similarTickets.length > 0}
                  onClick={handleSubmitTicket}
                  style={similarTickets.length > 0 ? { background: '#9ca3af', cursor: 'not-allowed' } : {}}
                >
                  {submitting ? 'Mengirim...' : '📤 Kirim Tiket'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Similar tickets / Tips panel */}
          <div className="hsk-side-panel">
            {similarTickets.length > 0 ? (
              <div className="hsk-similar-panel">
                <div className="hsk-similar-header">
                  <span>⚠️ Tiket Serupa Ditemukan</span>
                  <span className="hsk-similar-count">{similarTickets.length}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
                  Anda memiliki tiket aktif dengan kategori serupa. Periksa dulu sebelum membuat tiket baru.
                </p>
                {similarTickets.map(t => (
                  <div key={t.id_ticket} className="hsk-similar-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <code className="hsk-ticket-id" style={{ fontSize: '0.7rem' }}>#{ticketShortId(t.id_ticket)}</code>
                      <span className={`ticket-status-badge ${STATUS_CFG[t.status].cls}`} style={{ fontSize: '0.65rem' }}>
                        {STATUS_CFG[t.status].label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {fmtDate(t.created_at)}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: '0.75rem', color: '#92400e', background: '#fef3c7', padding: '0.6rem', borderRadius: '0.5rem', marginTop: '0.75rem' }}>
                  Anda tetap bisa melanjutkan membuat tiket baru jika masalahnya berbeda.
                </p>
              </div>
            ) : (
              <div className="hsk-tips-panel">
                <div className="hsk-tips-header">💡 Tips Pengajuan Tiket</div>
                <ul className="hsk-tips-list">
                  <li>📝 Cantumkan <strong>nama kelas</strong> dan <strong>mata pelajaran</strong> terkait</li>
                  <li>🕐 Sebutkan <strong>waktu kejadian</strong> secara spesifik</li>
                  <li>📱 Lampirkan <strong>pesan error</strong> yang muncul jika ada</li>
                  <li>🔄 Jelaskan langkah yang <strong>sudah Anda coba</strong></li>
                </ul>
                <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(99,102,241,0.06)', borderRadius: '0.6rem', borderLeft: '3px solid var(--primary-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>⏱ Waktu Respons</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin biasanya merespons dalam waktu <strong>1–2 jam</strong> di hari kerja.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // VIEW: DETAIL
  // ══════════════════════════════════════════════════
  if (view === 'detail' && selectedTicket) {
    const canRate = ['resolved', 'closed'].includes(selectedTicket.status) && !selectedTicket.rating;
    const isClosed = ['resolved', 'closed'].includes(selectedTicket.status);

    return (
      <div className="hsk-siswa-root">
        {/* Header */}
        <div className="hsk-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <button
              className="hsk-btn-back"
              onClick={() => { setView('list'); setSelectedTicket(null); setReplyMsg(''); setRatingScore(0); fetchTickets(); }}
            >
              ← Kembali
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <code className="hsk-ticket-id">#{ticketShortId(selectedTicket.id_ticket)}</code>
                <span className={`ticket-status-badge ${STATUS_CFG[selectedTicket.status].cls}`}>
                  {STATUS_CFG[selectedTicket.status].label}
                </span>
                <span className={`priority-badge ${PRI_CFG[selectedTicket.priority].cls}`}>
                  {PRI_CFG[selectedTicket.priority].label} Priority
                </span>
                <span className="hsk-cat-tag">
                  {CAT_ICONS[selectedTicket.category]} {CAT_LABELS[selectedTicket.category]}
                </span>
              </div>
              <h2 className="hsk-detail-title">{selectedTicket.subject}</h2>
            </div>
          </div>
        </div>

        {detailLoading ? (
          <div className="hsk-center-msg">Memuat detail tiket...</div>
        ) : (
          <div className="hsk-detail-layout">
            {/* LEFT: Info + Timeline */}
            <div className="hsk-detail-left">
              {/* Original description box */}
              <div className="hsk-desc-card">
                <div className="hsk-desc-label">📋 Deskripsi Masalah</div>
                <p className="hsk-desc-text">{selectedTicket.description}</p>
                <div className="hsk-desc-meta">
                  Dikirim: {fmtDateTime(selectedTicket.created_at)}
                </div>
              </div>

              {/* Resolution Timeline */}
              <div className="hsk-card">
                <div className="hsk-card-title">📍 Resolution Timeline</div>
                <ResolutionTimeline ticket={selectedTicket} />
              </div>

              {/* Existing Rating */}
              {selectedTicket.rating && (
                <div className="hsk-card hsk-rating-done">
                  <div className="hsk-card-title">⭐ Rating Anda</div>
                  <div style={{ display: 'flex', gap: '3px', margin: '0.5rem 0' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: '1.6rem', color: s <= selectedTicket.rating!.score ? '#f59e0b' : '#e2e8f0' }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontWeight: 700, color: '#92400e' }}>{selectedTicket.rating.score}/5</div>
                  {selectedTicket.rating.feedback && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{selectedTicket.rating.feedback}"
                    </p>
                  )}
                </div>
              )}

              {/* Rating form */}
              {canRate && (
                <div className="hsk-card hsk-rate-form">
                  <div className="hsk-card-title">⭐ Beri Rating</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem' }}>
                    Tiket Anda telah diselesaikan. Bagaimana layanan kami?
                  </p>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <StarRating value={ratingScore} onChange={setRatingScore} />
                    {ratingScore > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.3rem', fontWeight: 600 }}>
                        {['', 'Sangat Tidak Puas 😞', 'Tidak Puas 😕', 'Cukup 😐', 'Puas 😊', 'Sangat Puas 🌟'][ratingScore]}
                      </div>
                    )}
                  </div>
                  <textarea
                    className="form-input"
                    rows={3}
                    style={{ resize: 'vertical', marginBottom: '0.75rem' }}
                    placeholder="Komentar Anda (opsional)..."
                    value={ratingFeedback}
                    onChange={e => setRatingFeedback(e.target.value)}
                  />
                  <button
                    className="hsk-btn-primary"
                    disabled={submittingRating || ratingScore === 0}
                    onClick={handleRating}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {submittingRating ? 'Mengirim...' : '⭐ Kirim Rating'}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Support Thread */}
            <div className="hsk-detail-right">
              <div className="hsk-thread-card">
                <div className="hsk-thread-header">
                  <span className="hsk-card-title" style={{ margin: 0 }}>💬 Support Thread</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedTicket.responses.length} pesan
                  </span>
                </div>

                {/* Chat messages */}
                <div className="hsk-chat-list">
                  {selectedTicket.responses.length === 0 ? (
                    <div className="hsk-chat-empty">
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                      <p>Belum ada pesan. Admin akan segera merespons.</p>
                    </div>
                  ) : (
                    selectedTicket.responses.map(r => {
                      const isMine = r.responder.role === 'siswa';
                      const sender = isMine ? namaSiswa : `Admin (${r.responder.username})`;
                      return (
                        <div key={r.id_response} className={`hsk-msg-wrap ${isMine ? 'hsk-msg-right' : 'hsk-msg-left'}`}>
                          <div className={`hsk-msg-avatar ${isMine ? 'hsk-avatar-siswa' : 'hsk-avatar-admin'}`}>
                            {sender.charAt(0).toUpperCase()}
                          </div>
                          <div className="hsk-msg-body">
                            <div className="hsk-msg-meta">
                              <span className="hsk-msg-sender">{sender}</span>
                              {r.is_auto_reply && <span className="auto-reply-tag">✨ Saran</span>}
                              <span className="hsk-msg-time">{fmtDateTime(r.created_at)}</span>
                            </div>
                            <div className={`hsk-msg-bubble ${isMine ? 'hsk-bubble-mine' : 'hsk-bubble-other'}`}>
                              {r.message}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply form */}
                {!isClosed ? (
                  <div className="hsk-reply-area">
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ resize: 'none', borderRadius: '0.75rem' }}
                      placeholder="Tambahkan keterangan atau informasi tambahan untuk admin..."
                      value={replyMsg}
                      onChange={e => setReplyMsg(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply();
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ctrl+Enter untuk kirim</span>
                      <button
                        className="hsk-btn-primary"
                        disabled={replying || !replyMsg.trim()}
                        onClick={handleReply}
                      >
                        {replying ? 'Mengirim...' : '📤 Kirim'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="hsk-closed-notice">
                    🔒 Tiket ini sudah {STATUS_CFG[selectedTicket.status].label.toLowerCase()}. Tidak dapat menambah pesan baru.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default HelpdeskSiswaPage;
