import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import HelpdeskAnalyticsPage from './HelpdeskAnalyticsPage';

// ── Helper: decode id_user from JWT sub claim ─────────────────
const getIdUser = (): string => {
  // 1) cek localStorage dulu (untuk sesi baru setelah fix Login.tsx)
  const stored = localStorage.getItem('id_user');
  if (stored) return stored;
  // 2) fallback: decode payload JWT tanpa verifikasi
  try {
    const token = localStorage.getItem('token') || '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload?.sub) {
      // cache supaya tidak decode terus
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
  id_admin: string | null;
  siswa: { nama_siswa: string };
  admin: { username: string } | null;
  responses: { id_response: string }[];
  rating: { score: number } | null;
}

interface TicketDetail extends Ticket {
  responses: Response[];
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

// ─── Helper components ────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  QR_SCAN: 'Gagal Scan QR',
  LOKASI: 'Lokasi',
  LUPA_ABSEN: 'Lupa Absen',
  LAINNYA: 'Lainnya',
};

const PRIORITY_CFG: Record<string, { label: string; cls: string }> = {
  high: { label: 'HIGH', cls: 'priority-high' },
  medium: { label: 'MED', cls: 'priority-medium' },
  low: { label: 'LOW', cls: 'priority-low' },
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'status-open' },
  in_progress: { label: 'In Progress', cls: 'status-in-progress' },
  resolved: { label: 'Resolved', cls: 'status-resolved' },
  closed: { label: 'Closed', cls: 'status-closed' },
};

const AUTO_SUGGESTIONS: Record<string, string[]> = {
  QR_SCAN: [
    'Pastikan kamera tidak blur dan cukup cahaya.',
    'Coba izinkan akses kamera dari pengaturan browser.',
    'Pastikan koneksi internet stabil saat scan.',
    'Hubungi guru untuk pencatatan absensi manual sementara.',
  ],
  LOKASI: [
    'Aktifkan GPS/Lokasi di Pengaturan > Lokasi.',
    'Pastikan Anda berada di dalam area sekolah.',
    'Izinkan akses lokasi di browser: Pengaturan > Privasi.',
    'Gunakan mode lokasi "Akurasi Tinggi" di perangkat Anda.',
  ],
  LUPA_ABSEN: [
    'Absensi manual hanya dapat dilakukan oleh guru atau admin.',
    'Silakan koordinasikan dengan guru pengajar yang terkait.',
    'Kami akan verifikasi dan menindaklanjuti permohonan Anda.',
    'Harap sertakan alasan yang jelas agar proses lebih cepat.',
  ],
  LAINNYA: [
    'Terima kasih telah menghubungi Helpdesk.',
    'Mohon berikan detail lebih lanjut agar kami dapat membantu.',
    'Kami sedang menyelidiki masalah Anda.',
  ],
};

const formatTime = (dt: string): string =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dt));

const timeSince = (dt: string): string => {
  const diff = Math.floor((Date.now() - new Date(dt).getTime()) / 60000);
  if (diff < 60) return `${diff} menit lalu`;
  if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
  return `${Math.floor(diff / 1440)} hari lalu`;
};

// ─── SLA indicator ────────────────────────────────────────────
const SlaIndicator: React.FC<{ ticket: TicketDetail }> = ({ ticket }) => {
  const ageMin = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / 60000);
  const responseMin = ticket.first_response_at
    ? Math.floor((new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / 60000)
    : null;

  return (
    <div className="sla-panel">
      <div className="sla-row">
        <span className="sla-label">⏱ Usia Tiket</span>
        <span className="sla-value">{ageMin < 60 ? `${ageMin}m` : `${(ageMin / 60).toFixed(1)}j`}</span>
      </div>
      <div className="sla-row">
        <span className="sla-label">⚡ First Response</span>
        <span className={`sla-value ${responseMin !== null ? 'sla-ok' : 'sla-pending'}`}>
          {responseMin !== null ? (responseMin < 60 ? `${responseMin}m` : `${(responseMin / 60).toFixed(1)}j`) : 'Belum'}
        </span>
      </div>
      {ticket.resolved_at && (
        <div className="sla-row">
          <span className="sla-label">✅ Resolved</span>
          <span className="sla-value sla-ok">
            {Math.floor((new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / 3600000).toFixed(1)}j
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Chat Thread ──────────────────────────────────────────────
const ChatThread: React.FC<{ responses: Response[] }> = ({ responses }) => {
  if (responses.length === 0)
    return <div className="chat-empty">Belum ada balasan. Mulai percakapan sekarang.</div>;

  return (
    <div className="chat-thread">
      {responses.map(r => {
        const isAdmin = r.responder.role === 'admin';
        const senderName = isAdmin ? `Admin (${r.responder.username})` : (r.responder.siswa?.nama_siswa ?? r.responder.username);
        return (
          <div key={r.id_response} className={`chat-bubble-wrap ${isAdmin ? 'chat-right' : 'chat-left'}`}>
            <div className={`chat-bubble ${isAdmin ? 'bubble-admin' : 'bubble-siswa'}`}>
              <div className="bubble-header">
                <span className="bubble-sender">{senderName}</span>
                {r.is_auto_reply && <span className="auto-reply-tag">✨ Saran</span>}
              </div>
              <p className="bubble-text">{r.message}</p>
              <span className="bubble-time">{formatTime(r.created_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const HelpdeskPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'analytics'>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyMsg, setReplyMsg] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);

  const adminId = getIdUser();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      if (filterPriority) params.priority = filterPriority;
      const res = await api.get('/helpdesk/tickets', { params });
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterPriority]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/helpdesk/tickets/${id}`);
      setSelectedTicket(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReply = async (msg: string, isAuto = false) => {
    if (!selectedTicket || !msg.trim()) return;
    setReplying(true);
    try {
      await api.post(`/helpdesk/tickets/${selectedTicket.id_ticket}/reply`, {
        responder_id: adminId,
        message: msg,
        is_auto_reply: isAuto,
      });
      setReplyMsg('');
      const res = await api.get(`/helpdesk/tickets/${selectedTicket.id_ticket}`);
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/helpdesk/tickets/${selectedTicket.id_ticket}/status`, {
        status,
        id_admin: adminId,
      });
      setSelectedTicket(prev => prev ? { ...prev, status: res.data.status, resolved_at: res.data.resolved_at } : prev);
      fetchTickets();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!selectedTicket) return;
    try {
      await api.patch(`/helpdesk/tickets/${selectedTicket.id_ticket}/status`, { priority });
      setSelectedTicket(prev => prev ? { ...prev, priority: priority as any } : prev);
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get('/helpdesk/tickets/export-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rekap_Tiket_Helpdesk_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor data Excel.');
    } finally {
      setExporting(false);
    }
  };

  const suggestions = selectedTicket ? AUTO_SUGGESTIONS[selectedTicket.category] ?? [] : [];

  return (
    <div className="helpdesk-admin-wrapper">
      {/* ── Header ── */}
      <div className="helpdesk-header-bar">
        <div>
          <h2 className="helpdesk-title">🎧 Helpdesk Terpadu</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Kelola antrean tiket bantuan siswa</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn-tab ${view === 'list' ? 'btn-tab-active' : ''}`}
            onClick={() => setView('list')}
          >
            📋 Daftar Tiket
          </button>
          <button
            className={`btn-tab ${view === 'analytics' ? 'btn-tab-active' : ''}`}
            onClick={() => setView('analytics')}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* ── Analytics View ── */}
      {view === 'analytics' && <HelpdeskAnalyticsPage />}

      {/* ── List View ── */}
      {view === 'list' && (
        <>
          {/* Filters */}
          <div className="helpdesk-filters">
            <select className="form-input helpdesk-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select className="form-input helpdesk-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">Semua Kategori</option>
              <option value="QR_SCAN">Gagal Scan QR</option>
              <option value="LOKASI">Lokasi</option>
              <option value="LUPA_ABSEN">Lupa Absen</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            <select className="form-input helpdesk-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">Semua Prioritas</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="login-button" style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1rem' }} onClick={fetchTickets}>
              🔄 Refresh
            </button>
            <button 
              className="login-button" 
              style={{ width: 'auto', marginTop: 0, padding: '0.6rem 1rem', background: '#10b981' }} 
              onClick={handleExportExcel}
              disabled={exporting}
            >
              {exporting ? '⏳...' : '📗 Rekap Excel'}
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat tiket...</div>
          ) : tickets.length === 0 ? (
            <div className="helpdesk-empty">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3>Tidak ada tiket ditemukan</h3>
              <p style={{ color: 'var(--text-muted)' }}>Semua berjalan lancar!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Prioritas</th>
                    <th>Siswa</th>
                    <th>Subject</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th>Balasan</th>
                    <th>Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id_ticket} className="helpdesk-table-row">
                      <td>
                        <span className={`priority-badge ${PRIORITY_CFG[t.priority].cls}`}>
                          {PRIORITY_CFG[t.priority].label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{t.siswa.nama_siswa}</td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.subject}
                        </div>
                      </td>
                      <td>
                        <span className="ticket-category-tag">{CATEGORY_LABELS[t.category]}</span>
                      </td>
                      <td>
                        <span className={`ticket-status-badge ${STATUS_CFG[t.status].cls}`}>
                          {STATUS_CFG[t.status].label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)',
                          borderRadius: '12px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 700
                        }}>
                          {t.responses.length}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{timeSince(t.created_at)}</td>
                      <td>
                        <button
                          className="btn-icon edit"
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', width: 'auto' }}
                          onClick={() => openDetail(t.id_ticket)}
                        >
                          Buka
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Detail Modal ── */}
      {(selectedTicket || detailLoading) && (
        <div className="modal-overlay" onClick={() => { setSelectedTicket(null); setReplyMsg(''); }}>
          <div className="helpdesk-modal" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>Memuat detail tiket...</div>
            ) : selectedTicket && (
              <>
                {/* Modal Header */}
                <div className="helpdesk-modal-header">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className={`priority-badge ${PRIORITY_CFG[selectedTicket.priority].cls}`}>
                        {PRIORITY_CFG[selectedTicket.priority].label}
                      </span>
                      <span className={`ticket-status-badge ${STATUS_CFG[selectedTicket.status].cls}`}>
                        {STATUS_CFG[selectedTicket.status].label}
                      </span>
                      <span className="ticket-category-tag">{CATEGORY_LABELS[selectedTicket.category]}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedTicket.subject}</h3>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {selectedTicket.siswa.nama_siswa} • {formatTime(selectedTicket.created_at)}
                    </p>
                  </div>
                  <button
                    className="btn-icon delete"
                    style={{ width: '32px', height: '32px', flexShrink: 0 }}
                    onClick={() => { setSelectedTicket(null); setReplyMsg(''); }}
                  >✕</button>
                </div>

                {/* Modal Body */}
                <div className="helpdesk-modal-body">
                  {/* Left: Chat */}
                  <div className="helpdesk-chat-column">
                    {/* Original description */}
                    <div className="ticket-description-box">
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Deskripsi Masalah
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.6 }}>{selectedTicket.description}</p>
                    </div>

                    <ChatThread
                      responses={selectedTicket.responses}
                    />

                    {/* Reply form (if not closed) */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="helpdesk-reply-form">
                        {/* Auto-suggestion pills */}
                        <div className="suggest-pills-label">✨ Saran Jawaban Cepat</div>
                        <div className="suggest-pills-wrap">
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              className="auto-suggest-pill"
                              onClick={() => handleReply(s, true)}
                              disabled={replying}
                            >
                              {s.length > 60 ? s.substring(0, 60) + '…' : s}
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="Tulis balasan Anda..."
                          value={replyMsg}
                          onChange={e => setReplyMsg(e.target.value)}
                          style={{ resize: 'vertical', marginTop: '0.75rem' }}
                        />
                        <button
                          className="login-button"
                          style={{ width: 'auto', marginTop: '0.5rem', padding: '0.6rem 1.5rem', alignSelf: 'flex-end' }}
                          disabled={replying || !replyMsg.trim()}
                          onClick={() => handleReply(replyMsg)}
                        >
                          {replying ? 'Mengirim...' : '📤 Kirim Balasan'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Controls */}
                  <div className="helpdesk-ctrl-column">
                    {/* SLA */}
                    <SlaIndicator ticket={selectedTicket} />

                    {/* Status update */}
                    <div className="ctrl-card">
                      <div className="ctrl-label">🔄 Update Status</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(['open', 'in_progress', 'resolved', 'closed'] as const).map(s => (
                          <button
                            key={s}
                            className={`status-btn ${selectedTicket.status === s ? 'status-btn-active' : ''}`}
                            onClick={() => handleStatusChange(s)}
                            disabled={updatingStatus || selectedTicket.status === s}
                          >
                            <span className={`ticket-status-badge ${STATUS_CFG[s].cls}`} style={{ fontSize: '0.7rem' }}>
                              {STATUS_CFG[s].label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority update */}
                    <div className="ctrl-card">
                      <div className="ctrl-label">🎯 Prioritas</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['high', 'medium', 'low'] as const).map(p => (
                          <button
                            key={p}
                            className={`priority-btn ${selectedTicket.priority === p ? 'priority-btn-active' : ''}`}
                            onClick={() => handlePriorityChange(p)}
                            style={{ borderColor: selectedTicket.priority === p ? 'var(--primary-color)' : 'var(--border)' }}
                          >
                            <span className={`priority-badge ${PRIORITY_CFG[p].cls}`} style={{ fontSize: '0.65rem' }}>
                              {PRIORITY_CFG[p].label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating (if exists) */}
                    {selectedTicket.rating && (
                      <div className="ctrl-card">
                        <div className="ctrl-label">⭐ Rating Siswa</div>
                        <div style={{ display: 'flex', gap: '2px', marginTop: '0.25rem' }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ fontSize: '1.5rem', color: s <= selectedTicket.rating!.score ? '#f59e0b' : '#e2e8f0' }}>★</span>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Skor: {selectedTicket.rating.score}/5
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskPage;
