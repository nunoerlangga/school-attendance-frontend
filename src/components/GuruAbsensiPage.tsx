import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface GuruAbsensiPageProps {
  jadwalList: any[];
}

const GuruAbsensiPage: React.FC<GuruAbsensiPageProps> = ({ jadwalList }) => {
  const [selectedClassMapel, setSelectedClassMapel] = useState<{ id_kelas: string, id_mapel: string, label: string } | null>(null);
  const [rekapHarian, setRekapHarian] = useState<any[]>([]);
  const [loadingRekap, setLoadingRekap] = useState(false);
  
  // Date range
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30); // 30 days ago
  
  const [startDate, setStartDate] = useState(start.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const [detailData, setDetailData] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Extract unique class-mapel combinations
  const classMapels = React.useMemo(() => {
    const map = new Map<string, any>();
    jadwalList.forEach(j => {
      if (!j.kelas || !j.mapel) return;
      const key = `${j.id_kelas}-${j.id_mapel}`;
      if (!map.has(key)) {
        map.set(key, {
            id_kelas: j.id_kelas,
            id_mapel: j.id_mapel,
            label: `Kelas ${j.kelas.tingkat} ${j.kelas.nama_kelas} - ${j.mapel.nama_mapel}`
        });
      }
    });
    return Array.from(map.values());
  }, [jadwalList]);

  const fetchRekapHarian = async () => {
    if (!selectedClassMapel) return;
    try {
      setLoadingRekap(true);
      const res = await api.get(`/absensi/rekap/kelas/${selectedClassMapel.id_kelas}/harian`, {
        params: {
          mapelId: selectedClassMapel.id_mapel,
          startDate,
          endDate
        }
      });
      setRekapHarian(res.data);
    } catch (error) {
      console.error('Error fetching rekap harian:', error);
    } finally {
      setLoadingRekap(false);
    }
  };

  useEffect(() => {
    fetchRekapHarian();
  }, [selectedClassMapel, startDate, endDate]);

  const handleLihatDetail = async (tanggal: string) => {
    if (!selectedClassMapel) return;
    setSelectedDate(tanggal);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/absensi/rekap/kelas/${selectedClassMapel.id_kelas}/detail`, {
        params: {
          mapelId: selectedClassMapel.id_mapel,
          tanggal
        }
      });
      setDetailData(res.data);
    } catch (error) {
      console.error('Error fetching detail absensi:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    const h = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${h[dateObj.getDay()]}, ${d} ${bln[dateObj.getMonth()]} ${y}`;
  };

  if (!selectedClassMapel) {
    return (
      <div className="evaluator-dashboard">
        <div className="card-header">
          <div className="header-info">
            <h2>Absensi Kelas</h2>
            <p>Pilih kelas yang Anda ajar untuk melihat rekap absensi.</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {classMapels.length === 0 ? (
            <p>Jadwal mengajar belum tersedia.</p>
          ) : (
            classMapels.map((cm, idx) => (
              <div 
                key={idx} 
                className="stat-card" 
                style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0' }}
                onClick={() => setSelectedClassMapel(cm)}
              >
                <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="stat-data">
                  <span className="stat-value" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{cm.label}</span>
                  <span className="stat-label">Lihat Absensi</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (selectedClassMapel && selectedDate) {
    const classStr = selectedClassMapel.label.split(' - ')[0] || '';
    const mapelStr = selectedClassMapel.label.split(' - ')[1] || '';
    
    return (
      <div className="evaluator-dashboard">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setSelectedClassMapel(null); setSelectedDate(''); }}>Semua Kelas</span>
          <span>&gt;</span>
          <span style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 500 }} onClick={() => setSelectedDate('')}>{classStr.replace('Kelas ', '')}</span>
          <span>&gt;</span>
          <span style={{ color: '#64748b' }}>{mapelStr}</span>
          <span>&gt;</span>
          <span style={{ color: '#1e293b', fontWeight: 600 }}>{formatDate(selectedDate)}</span>
        </div>

        {/* Card 1: Detail Laporan */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', borderLeft: '6px solid #6366f1', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
           <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#f5f3ff', color: '#6366f1' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
           </div>
           <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Detail Laporan Absensi</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                 <span style={{ color: '#6366f1', fontWeight: 500 }}>{classStr.replace('Kelas ', '')}</span>
                 <span style={{ color: '#cbd5e1' }}>|</span>
                 <span style={{ color: '#8b5cf6', fontWeight: 500 }}>{mapelStr}</span>
                 <span style={{ color: '#cbd5e1' }}>|</span>
                 <span style={{ background: '#d1fae5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 500 }}>{formatDate(selectedDate)}</span>
              </div>
           </div>
        </div>

        {/* Card 2: Daftar Presensi */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>Daftar Presensi Individu</h3>
          </div>
          {loadingDetail ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat detail...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                 <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                       <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'left' }}>NO</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'left' }}>NAMA LENGKAP SISWA</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>STATUS KEHADIRAN</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>WAKTU PENCATATAN</th>
                       <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>METODE VALIDASI</th>
                    </tr>
                 </thead>
                 <tbody>
                   {detailData.map((siswa, idx) => (
                     <tr key={siswa.id_siswa} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>{idx+1}</td>
                        <td style={{ padding: '1rem', color: '#1e293b', fontSize: '0.875rem', fontWeight: 500 }}>{siswa.nama_siswa}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                           <span className={`status-badge ${siswa.status}`}>{siswa.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                             {new Date(siswa.jam_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')} WIB
                           </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                           <span style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#64748b', background: 'white' }}>
                             {siswa.metode === 'scan_qr' ? 'Scan Qr' : (siswa.metode === 'otomatis' || siswa.metode === 'auto') ? 'Auto' : 'Manual'}
                           </span>
                        </td>
                     </tr>
                   ))}
                   {detailData.length === 0 && (
                     <tr>
                       <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Tidak ada data presensi.</td>
                     </tr>
                   )}
                 </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="evaluator-dashboard">
      <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <button 
          className="btn-icon" 
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', borderRadius: '8px' }}
          onClick={() => setSelectedClassMapel(null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali
        </button>
        <div className="header-info">
          <h2>Rekap Absensi: {selectedClassMapel.label}</h2>
          <p>Daftar absensi siswa pada kelas ini berdasarkan tanggal.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Dari Tanggal</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ margin: 0 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Sampai Tanggal</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ margin: 0 }} />
          </div>
          <button 
            className="login-button" 
            style={{ marginTop: 'auto', padding: '0.65rem 1rem' }}
            onClick={fetchRekapHarian}
            disabled={loadingRekap}
          >
            {loadingRekap ? 'Memuat...' : 'Terapkan Filter'}
          </button>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: 'white', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Rekap Absensi per Tanggal</h3>
        </div>
        {loadingRekap ? (
          <div className="table-loading">Memuat data...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>TANGGAL</th>
                <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}><span style={{ color: '#10b981', marginRight: '4px' }}>●</span> HADIR</th>
                <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}><span style={{ color: '#f59e0b', marginRight: '4px' }}>●</span> IZIN</th>
                <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}><span style={{ color: '#3b82f6', marginRight: '4px' }}>●</span> SAKIT</th>
                <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}><span style={{ color: '#ef4444', marginRight: '4px' }}>●</span> ALFA</th>
                <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {rekapHarian.length > 0 ? (
                rekapHarian.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500, color: '#334155' }}>{formatDate(item.tanggal)}</td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{item.hadir}</td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{item.izin}</td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{item.sakit}</td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{item.alfa}</td>
                    <td>
                      <button 
                        style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}
                        onClick={() => handleLihatDetail(item.tanggal)}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '2rem' }}>Tidak ada rekap pada rentang tanggal tersebut.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GuruAbsensiPage;
