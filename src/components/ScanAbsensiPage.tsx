import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScanAbsensiPage: React.FC = () => {
  const navigate = useNavigate();
  const [tokenQr, setTokenQr] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const idSiswa = localStorage.getItem('id_siswa');

  // Use refs to avoid stale closures in Html5QrcodeScanner callback
  const selectedTokenRef = useRef(selectedToken);
  const submittingRef = useRef(false);

  useEffect(() => {
    selectedTokenRef.current = selectedToken;
  }, [selectedToken]);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!idSiswa) return;
      try {
        const res = await api.get(`/marketplace/my-tokens/${idSiswa}`);
        setTokens(res.data.filter((t: any) => t.status === 'AVAILABLE'));
      } catch (err) {
        console.error('Failed to fetch tokens', err);
      } finally {
        setLoadingTokens(false);
      }
    };
    fetchTokens();
  }, [idSiswa]);

  // Initialize QR Scanner
  useEffect(() => {
    // Only init if an element with id "reader" exists
    let scanner: Html5QrcodeScanner | null = null;
    
    setTimeout(() => {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          if (submittingRef.current) return;
          setTokenQr(decodedText);
          submitScan(decodedText, selectedTokenRef.current);
          if (scanner) {
            scanner.pause(true); // pause scanning while submitting
          }
        },
        (error) => {
          // frequent errors due to no QR code in frame. ignore.
        }
      );
    }, 100);

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, []);

  const submitScan = async (scannedToken: string, marketplaceToken: string | undefined) => {
    if (!scannedToken) return;
    setSubmitting(true);
    submittingRef.current = true;
    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await api.post('/absensi/scan', {
              id_siswa: idSiswa,
              token_qr: scannedToken,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              id_token: marketplaceToken || undefined
            });
            alert('Absensi Berhasil!');
            navigate('/siswa');
          } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal melakukan absensi');
            setSubmitting(false);
            submittingRef.current = false;
            // Unpause scanner on error so user can try again
            const qrReaderBtn = document.getElementById("html5-qrcode-button-camera-resume");
            if (qrReaderBtn) qrReaderBtn.click();
          }
        },
        (err) => {
          alert('Gagal mendapatkan lokasi. Pastikan GPS/Location browser aktif.');
          setSubmitting(false);
          submittingRef.current = false;
        }
      );
    } catch (err) {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenQr) {
      alert('Masukkan Token QR terlebih dahulu');
      return;
    }
    submitScan(tokenQr, selectedToken);
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1rem' }}>
      <div className="login-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Scan Absensi</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Arahkan kamera ke QR Code yang ditampilkan guru.</p>
        </div>

        {/* Camera Scanner View */}
        <div id="qr-reader" style={{ width: '100%', marginBottom: '1.5rem' }}></div>

        <form onSubmit={handleManualScan} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Gunakan Token Marketplace (Opsional)</label>
            <select 
              className="login-input"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              style={{ background: '#f1f5f9' }}
            >
              <option value="">Tidak Menggunakan Token</option>
              {tokens.map(t => (
                <option key={t.id_token} value={t.id_token}>
                  {t.item.item_name} (Tersedia)
                </option>
              ))}
            </select>
            {tokens.length === 0 && !loadingTokens && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Anda tidak memiliki token fleksibilitas.</p>
            )}
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Input Manual Token QR (Opsional)</label>
            <input 
              className="login-input"
              type="text" 
              placeholder="Contoh: QR-XXXX-XXXX"
              value={tokenQr}
              onChange={(e) => setTokenQr(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            style={{ width: '100%', marginTop: '0.5rem' }} 
            disabled={submitting}
          >
            {submitting ? 'Memproses...' : 'Kirim Absensi Manual'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/siswa')}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            Kembali ke Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScanAbsensiPage;
