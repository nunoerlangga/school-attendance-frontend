import React, { useState, useEffect } from 'react';
import api from '../services/api';

// --- Interfaces ---
interface KelasItem {
  id_kelas: string;
  nama_kelas: string;
  tingkat: string;
  tahun_ajaran: string;
  jumlah_siswa: number;
}

interface MapelItem {
  id_mapel: string;
  nama_mapel: string;
  kode_mapel: string;
  nama_guru: string;
  jumlah_pertemuan: number;
}

interface RekapHarianItem {
  tanggal: string;
  hadir: number;
  izin: number;
  sakit: number;
  alfa: number;
}

interface DetailSiswaItem {
  id_siswa: string;
  nama_siswa: string;
  status: string;
  jam_scan: string;
  metode: string;
}

const BackButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <button
      onClick={onClick}
      style={{ background: '#fff', border: '1px solid var(--border)', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', color: 'var(--text-main)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
      onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
      onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      {label}
    </button>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 1rem', opacity: 0.5, display: 'block' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
    <p>{message}</p>
  </div>
);

const RekapAbsensiPage: React.FC = () => {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Data States
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [mapelList, setMapelList] = useState<MapelItem[]>([]);
  const [rekapHarian, setRekapHarian] = useState<RekapHarianItem[]>([]);
  const [detailSiswa, setDetailSiswa] = useState<DetailSiswaItem[]>([]);

  // Selection States
  const [selectedClass, setSelectedClass] = useState<KelasItem | null>(null);
  const [selectedMapel, setSelectedMapel] = useState<MapelItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // ── LEVEL 1: Daftar Kelas ──────────────────────────────────────
  const fetchKelas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/absensi/rekap/kelas');
      setKelasList(res.data);
    } catch (error) {
      console.error('Failed fetch kelas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (level === 1) fetchKelas();
  }, [level]);

  // ── LEVEL 2: Daftar Mapel per Kelas ───────────────────────────
  const fetchMapelKelas = async (classId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/absensi/rekap/kelas/${classId}/mapel`);
      setMapelList(res.data);
    } catch (error) {
      console.error('Failed fetch mapel', error);
    } finally {
      setLoading(false);
    }
  };

  // ── LEVEL 3: Rekap Harian per Kelas+Mapel ─────────────────────
  const fetchRekapHarian = async (classId: string, mapelId: string, start: string, end: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/absensi/rekap/kelas/${classId}/harian`, {
        params: { mapelId, startDate: start, endDate: end }
      });
      setRekapHarian(res.data);
    } catch (error) {
      console.error('Failed fetch rekap harian', error);
    } finally {
      setLoading(false);
    }
  };

  // ── LEVEL 4: Detail per Siswa per Tanggal ─────────────────────
  const fetchDetailTanggal = async (classId: string, mapelId: string, tgl: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/absensi/rekap/kelas/${classId}/detail`, {
        params: { mapelId, tanggal: tgl }
      });
      setDetailSiswa(res.data);
    } catch (error) {
      console.error('Failed fetch detail', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSelectKelas = (kelas: KelasItem) => {
    setSelectedClass(kelas);
    setMapelList([]);
    setLevel(2);
    fetchMapelKelas(kelas.id_kelas);
  };

  const handleSelectMapel = (mapel: MapelItem) => {
    setSelectedMapel(mapel);
    setRekapHarian([]);
    setLevel(3);
    if (selectedClass) fetchRekapHarian(selectedClass.id_kelas, mapel.id_mapel, startDate, endDate);
  };

  const handleApplyFilter = () => {
    if (selectedClass && selectedMapel) {
      fetchRekapHarian(selectedClass.id_kelas, selectedMapel.id_mapel, startDate, endDate);
    }
  };

  const handleViewDetail = (item: RekapHarianItem) => {
    setSelectedDate(item.tanggal);
    setDetailSiswa([]);
    setLevel(4);
    if (selectedClass && selectedMapel) {
      fetchDetailTanggal(selectedClass.id_kelas, selectedMapel.id_mapel, item.tanggal);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedClass || !selectedMapel) return;
    try {
      setExportLoading(true);
      const res = await api.get('/absensi/export', {
        params: {
          classId: selectedClass.id_kelas,
          mapelId: selectedMapel.id_mapel,
          startDate,
          endDate,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rekap_${selectedClass.tingkat}_${selectedClass.nama_kelas}_${selectedMapel.nama_mapel}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed export excel', error);
      alert('Gagal mengekspor file Excel.');
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>Hadir</span>;
      case 'izin': return <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>Izin</span>;
      case 'sakit': return <span className="badge" style={{ background: '#dbeafe', color: '#2563eb' }}>Sakit</span>;
      case 'alfa': return <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Alfa</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const BreadcrumbNav = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <span
        style={{ cursor: level > 1 ? 'pointer' : 'default', color: level > 1 ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: level > 1 ? 600 : 400 }}
        onClick={() => { if (level > 1) setLevel(1); }}
      >
        Semua Kelas
      </span>
      {level >= 2 && selectedClass && (
        <>
          <span>›</span>
          <span
            style={{ cursor: level > 2 ? 'pointer' : 'default', color: level > 2 ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: level > 2 ? 600 : 700 }}
            onClick={() => { if (level > 2) setLevel(2); }}
          >
            {selectedClass.tingkat} {selectedClass.nama_kelas}
          </span>
        </>
      )}
      {level >= 3 && selectedMapel && (
        <>
          <span>›</span>
          <span
            style={{ cursor: level > 3 ? 'pointer' : 'default', color: level > 3 ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: level > 3 ? 600 : 700 }}
            onClick={() => { if (level > 3) setLevel(3); }}
          >
            {selectedMapel.nama_mapel}
          </span>
        </>
      )}
      {level === 4 && selectedDate && (
        <>
          <span>›</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
            {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </>
      )}
    </div>
  );

  return (
    <div className="data-page" style={{ padding: '0 0.5rem' }}>

      {/* LEVEL 1: Daftar Kelas */}
      {level === 1 && (
        <div className="recent-activity">
          <div className="card-header" style={{ padding: '0 0 1.5rem', borderBottom: 'none' }}>
            <div className="header-info">
              <h2>Rekap Absensi Siswa</h2>
              <p>Pilih kelas untuk melihat mata pelajaran dan rekapitulasi kehadiran.</p>
            </div>
          </div>
          <div className="table-container">
            {loading ? (
              <div className="loading-container"><div className="loader"></div> Memuat data kelas...</div>
            ) : kelasList.length === 0 ? (
              <EmptyState message="Belum ada data kelas yang terdaftar." />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Kelas</th>
                    <th>Tingkat</th>
                    <th>Tahun Ajaran</th>
                    <th>Jumlah Siswa</th>
                    <th className="action-col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasList.map((kelas, idx) => (
                    <tr key={kelas.id_kelas}>
                      <td>{idx + 1}</td>
                      <td className="font-bold">{kelas.nama_kelas}</td>
                      <td>{kelas.tingkat}</td>
                      <td>{kelas.tahun_ajaran}</td>
                      <td>{kelas.jumlah_siswa} Siswa</td>
                      <td>
                        <button
                          className="login-button"
                          style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.875rem', marginTop: 0, borderRadius: '0.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
                          onClick={() => handleSelectKelas(kelas)}
                        >
                          <span>Lihat Mapel</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 2: Daftar Mata Pelajaran */}
      {level === 2 && selectedClass && (
        <div style={{ paddingBottom: '2rem' }}>
          <BackButton onClick={() => setLevel(1)} label="Kembali ke Daftar Kelas" />
          <BreadcrumbNav />

          <div className="recent-activity" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)', background: 'linear-gradient(to right, #fff, #f8fafc)' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="stat-icon" style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'var(--primary-light)', color: 'var(--primary-color)', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.4rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  Mata Pelajaran — <span style={{ color: 'var(--primary-color)' }}>{selectedClass.tingkat} {selectedClass.nama_kelas}</span>
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569', textTransform: 'none', padding: '0.35rem 0.75rem' }}>
                    Tahun Ajaran {selectedClass.tahun_ajaran}
                  </span>
                  <span className="badge" style={{ background: '#eff6ff', color: '#3b82f6', textTransform: 'none', padding: '0.35rem 0.75rem' }}>
                    {selectedClass.jumlah_siswa} Siswa Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Daftar Mata Pelajaran</h3>
            <div className="table-container">
              {loading ? (
                <div className="loading-container"><div className="loader"></div> Memuat mata pelajaran...</div>
              ) : mapelList.length === 0 ? (
                <EmptyState message="Belum ada jadwal / mata pelajaran untuk kelas ini." />
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Mata Pelajaran</th>
                      <th>Kode</th>
                      <th>Guru Pengajar</th>
                      <th>Jumlah Pertemuan</th>
                      <th className="action-col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mapelList.map((mapel, idx) => (
                      <tr key={mapel.id_mapel}>
                        <td>{idx + 1}</td>
                        <td className="font-bold">{mapel.nama_mapel}</td>
                        <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{mapel.kode_mapel}</span></td>
                        <td>{mapel.nama_guru}</td>
                        <td>
                          <span className="badge" style={{ background: mapel.jumlah_pertemuan > 0 ? '#dcfce7' : '#fee2e2', color: mapel.jumlah_pertemuan > 0 ? '#16a34a' : '#dc2626', textTransform: 'none' }}>
                            {mapel.jumlah_pertemuan} Pertemuan
                          </span>
                        </td>
                        <td>
                          <button
                            className="login-button"
                            style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.875rem', marginTop: 0, borderRadius: '0.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
                            onClick={() => handleSelectMapel(mapel)}
                          >
                            <span>Lihat Rekap</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 3: Rekap per Tanggal */}
      {level === 3 && selectedClass && selectedMapel && (
        <div style={{ paddingBottom: '2rem' }}>
          <BackButton onClick={() => setLevel(2)} label="Kembali ke Daftar Mata Pelajaran" />
          <BreadcrumbNav />

          <div className="recent-activity" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>
                  Rekap Kehadiran: <span style={{ color: 'var(--primary-color)' }}>{selectedMapel.nama_mapel}</span>
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569', textTransform: 'none', padding: '0.4rem 0.8rem' }}>
                    {selectedClass.tingkat} {selectedClass.nama_kelas}
                  </span>
                  <span className="badge" style={{ background: '#eff6ff', color: '#3b82f6', textTransform: 'none', padding: '0.4rem 0.8rem' }}>
                    Guru: {selectedMapel.nama_guru}
                  </span>
                </div>
              </div>
              <button
                className="login-button"
                style={{ width: 'auto', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                onClick={handleExportExcel}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <div className="loader" style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                )}
                {exportLoading ? 'Sedang Mengekspor...' : 'Export Excel'}
              </button>
            </div>

            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

            <div className="filter-section" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Dari Tanggal</label>
                <input type="date" className="form-input" style={{ width: '100%' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Sampai Tanggal</label>
                <input type="date" className="form-input" style={{ width: '100%' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <button
                className="login-button"
                style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.5rem', minWidth: '150px' }}
                onClick={handleApplyFilter}
              >
                Terapkan Filter
              </button>
            </div>
          </div>

          <div className="recent-activity">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Rekap Absensi per Tanggal</h3>
            <div className="table-container">
              {loading ? (
                <div className="loading-container"><div className="loader"></div> Memuat data rekap harian...</div>
              ) : rekapHarian.length === 0 ? (
                <EmptyState message="Belum ada data absensi di rentang tanggal tersebut." />
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '200px' }}>Tanggal</th>
                      <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>Hadir</span></th>
                      <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d97706' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>Izin</span></th>
                      <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>Sakit</span></th>
                      <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>Alfa</span></th>
                      <th className="action-col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapHarian.map((item) => (
                      <tr key={item.tanggal}>
                        <td className="font-bold">{new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td style={{ fontWeight: 600 }}>{item.hadir}</td>
                        <td style={{ fontWeight: 600 }}>{item.izin}</td>
                        <td style={{ fontWeight: 600 }}>{item.sakit}</td>
                        <td style={{ fontWeight: 600 }}>{item.alfa}</td>
                        <td>
                          <button
                            className="login-button"
                            style={{ padding: '0.4rem 0.8rem', width: 'auto', fontSize: '0.875rem', marginTop: 0, background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', boxShadow: 'none' }}
                            onClick={() => handleViewDetail(item)}
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 4: Detail Siswa per Tanggal */}
      {level === 4 && selectedClass && selectedMapel && (
        <div style={{ paddingBottom: '2rem' }}>
          <BackButton onClick={() => setLevel(3)} label="Kembali ke Rekap Tanggal" />
          <BreadcrumbNav />

          <div className="recent-activity" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(to right, #fff, #f8fafc)', borderLeft: '4px solid var(--primary-color)' }}>
            <div className="stat-icon" style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'var(--primary-light)', color: 'var(--primary-color)', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Detail Laporan Absensi</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{selectedClass.tingkat} {selectedClass.nama_kelas}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ fontWeight: 600, color: '#7c3aed' }}>{selectedMapel.nama_mapel}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.9rem', padding: '0.4rem 0.8rem', textTransform: 'none', margin: 0 }}>
                  {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Daftar Presensi Individu</h3>
            <div className="table-container">
              {loading ? (
                <div className="loading-container"><div className="loader"></div> Memuat detail per individu...</div>
              ) : detailSiswa.length === 0 ? (
                <EmptyState message="Belum ada data scan absensi pada tanggal dan mata pelajaran tersebut." />
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Lengkap Siswa</th>
                      <th>Status Kehadiran</th>
                      <th>Waktu Pencatatan</th>
                      <th>Metode Validasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailSiswa.map((siswa, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="font-bold">{siswa.nama_siswa}</td>
                        <td>{getStatusBadge(siswa.status)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span style={{ color: '#475569' }}>{new Date(siswa.jam_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', textTransform: 'capitalize' }}>
                            {siswa.metode.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapAbsensiPage;
