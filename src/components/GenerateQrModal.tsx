import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

interface GenerateQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  jadwal: any | null;
}

interface QrData {
  id_qr: string;
  token_qr: string;
  tanggal: string;
  expired_at: string;
}

const GenerateQrModal: React.FC<GenerateQrModalProps> = ({ isOpen, onClose, jadwal }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for QR
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  const [unattended, setUnattended] = useState<any[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchUnattended = async (id_qr: string) => {
    try {
      const res = await api.get(`/absensi/unattended/${id_qr}`);
      setUnattended(res.data);
    } catch (err) {
      console.error('Fetch unattended err', err);
    }
  };

  // Polling unattended list
  useEffect(() => {
    let interval: any;
    if (qrData && !isExpired && isOpen) {
      fetchUnattended(qrData.id_qr); // Initial fetch
      interval = setInterval(() => {
        fetchUnattended(qrData.id_qr);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [qrData, isExpired, isOpen]);

  const handleManualAbsen = async (id_siswa: string, status: string) => {
    if (!qrData) return;
    try {
      setMarkingId(id_siswa);
      await api.post('/absensi/manual', {
        id_qr: qrData.id_qr,
        id_siswa,
        status
      });
      // Refresh list immediately
      fetchUnattended(qrData.id_qr);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melakukan absensi manual');
    } finally {
      setMarkingId(null);
    }
  };

  // Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (qrData && !isExpired && timeLeft > 0) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const expired = new Date(qrData.expired_at).getTime();
        const diff = Math.floor((expired - now) / 1000);

        if (diff <= 0) {
          setIsExpired(true);
          setTimeLeft(0);
          clearInterval(timer);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    } else if (timeLeft <= 0 && qrData) {
      setIsExpired(true);
    }
    return () => clearInterval(timer);
  }, [qrData, isExpired, timeLeft]);

  // Check persistent QR on open
  useEffect(() => {
    if (!isOpen || !jadwal) return;

    const fetchPersistentQr = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/qr-absensi/active?id_jadwal=${jadwal.id_jadwal}`);

        if (res.data) {
          const qr = res.data;
          setQrData(qr);

          const now = new Date().getTime();
          const expired = new Date(qr.expired_at).getTime();
          const diff = Math.floor((expired - now) / 1000);

          if (diff > 0) {
            setTimeLeft(diff);
            setIsExpired(false);
          } else {
            setIsExpired(true);
          }
        } else {
          setQrData(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersistentQr();

  }, [isOpen, jadwal]);

  const handleGenerate = async () => {
    if (!jadwal) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/qr-absensi', {
        id_jadwal: jadwal.id_jadwal
      });

      setQrData(res.data);

      const now = new Date().getTime();
      const expired = new Date(res.data.expired_at).getTime();
      const diff = Math.floor((expired - now) / 1000);

      if (diff > 0) {
        setTimeLeft(diff);
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    } catch (err: any) {
      console.error('Generate err', err);
      setError(err.response?.data?.message || 'Gagal membuat QR Absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQrData(null);
    setIsExpired(false);
    setTimeLeft(0);
    setError('');
    setUnattended([]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const closeAndReset = () => {
    handleReset();
    onClose();
  };

  if (!isOpen || !jadwal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '550px', width: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3>QR Absensi - {jadwal.kelas.nama_kelas}</h3>
          <button className="modal-close" onClick={closeAndReset}>&times;</button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.5rem' }}>
          {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

          {!qrData ? (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mata Pelajaran</label>
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', color: '#475569' }}>
                  {jadwal.mapel.nama_mapel} ({jadwal.hari},{' '}
                  {new Date(jadwal.jam_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(jadwal.jam_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.07)', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span style={{ fontSize: '0.875rem', color: '#4f46e5' }}>Lokasi diambil otomatis dari pengaturan sekolah</span>
              </div>

              <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={closeAndReset} disabled={loading}>Batal</button>
                <button className="login-button" style={{ width: 'auto', marginTop: 0, padding: '0.5rem 1.5rem' }} onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Memproses...' : 'Generate QR Sekarang'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', width: '100%' }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--text-main)' }}>{jadwal.mapel.nama_mapel}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Kelas {jadwal.kelas.nama_kelas} • {new Date(jadwal.jam_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>

              <div style={{
                padding: '1.25rem',
                background: isExpired ? '#fef2f2' : 'white',
                borderRadius: '1rem',
                border: `2px solid ${isExpired ? '#fecaca' : '#e2e8f0'}`,
                position: 'relative'
              }}>
                <QRCodeSVG value={qrData.token_qr} size={180} level="H" fgColor={isExpired ? '#94a3b8' : '#0f172a'} style={{ opacity: isExpired ? 0.3 : 1 }} />
                {isExpired && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: '#ef4444', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '2rem',
                    fontWeight: 'bold', fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}>QR Expired</div>
                )}
              </div>

              {!isExpired && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ margin: '0 0 0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Berlaku hingga</p>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</div>
                </div>
              )}

              {/* UNATTENDED STUDENTS LIST */}
              <div style={{ width: '100%', marginTop: '0.5rem', textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                    Siswa Belum Absen ({unattended.length})
                  </h4>
                  {unattended.length > 0 && <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>*Daftar otomatis terupdate</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {unattended.length > 0 ? (
                    unattended.map((s) => (
                      <div key={s.id_siswa} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{s.nama_siswa}</span>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {[
                            { label: 'H', status: 'hadir', color: '#10b981', title: 'Hadir' },
                            { label: 'I', status: 'izin', color: '#f59e0b', title: 'Izin' },
                            { label: 'S', status: 'sakit', color: '#3b82f6', title: 'Sakit' },
                            { label: 'A', status: 'alfa', color: '#ef4444', title: 'Alfa' }
                          ].map((btn) => (
                            <button
                              key={btn.label}
                              title={btn.title}
                              disabled={markingId === s.id_siswa}
                              onClick={() => handleManualAbsen(s.id_siswa, btn.status)}
                              style={{
                                width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                                background: markingId === s.id_siswa ? '#e2e8f0' : btn.color,
                                color: 'white', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'transform 0.1s, opacity 0.2s', opacity: markingId === s.id_siswa ? 0.5 : 1
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              {markingId === s.id_siswa ? '...' : btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px dashed #bbf7d0', color: '#166534' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem', opacity: 0.5 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <p style={{ margin: 0, fontWeight: 600 }}>Semua siswa sudah absen!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateQrModal;
