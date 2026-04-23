import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as ChartTooltip
} from 'recharts';

interface AssessmentDetail {
  id_kategori: string;
  nama_kategori: string;
  skor: number;
}

interface LaporanPenilaian {
  id_penilaian: string;
  tanggal_penilaian: string;
  periode: string;
  catatan_umum: string;
  evaluator: { id: string; nama: string };
  evaluatee: { id: string; nama: string };
  detail: AssessmentDetail[];
}

interface Siswa {
  id_siswa: string;
  nama_siswa: string;
}

const LaporanPenilaianPage: React.FC = () => {
  const [laporanList, setLaporanList] = useState<LaporanPenilaian[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === 'admin';

  const fetchSiswa = async () => {
    try {
      const res = await api.get('/siswa');
      setSiswaList(res.data);
    } catch (err) {
      console.error('Error fetching siswa list:', err);
    }
  };

  const fetchLaporan = async (idSiswa?: string) => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = '/penilaian';
      
      if (!isAdmin) {
        endpoint = '/penilaian/me';
      } else if (idSiswa) {
        endpoint = `/penilaian/findbysiswa/${idSiswa}`;
      } else {
        // Admin first load, show all or empty? Let's fetch all initially if no siswa selected
        endpoint = '/penilaian';
      }

      const res = await api.get(endpoint);
      // Backend findbysiswa returns raw prisma include, while findAll returns mapped.
      // Let's normalize if needed. Me returns mapped.
      
      const data = res.data;
      if (Array.isArray(data)) {
        // Simple normalization for different endpoint returns if they differ
        const normalized = data.map((item: any) => ({
          id_penilaian: item.id_penilaian,
          tanggal_penilaian: item.tanggal_penilaian,
          periode: item.periode || '',
          catatan_umum: item.catatan_umum || '',
          evaluator: item.evaluator?.nama ? item.evaluator : { id: item.evaluator?.id_guru, nama: item.evaluator?.nama_guru || 'Guru' },
          evaluatee: item.evaluatee?.nama ? item.evaluatee : { id: item.evaluatee?.id_siswa, nama: item.evaluatee?.nama_siswa || 'Siswa' },
          detail: item.detail ? item.detail.map((d: any) => ({
            id_kategori: d.id_kategori || d.kategori?.id_kategori,
            nama_kategori: d.nama_kategori || d.kategori?.nama,
            skor: d.skor
          })) : []
        }));
        setLaporanList(normalized);
      } else {
        setLaporanList([]);
      }
    } catch (err: any) {
      console.error('Error fetching laporan penilaian:', err);
      setError('Gagal memuat data laporan penilaian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSiswa();
    }
    fetchLaporan();
  }, [isAdmin]);

  const handleSiswaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedSiswaId(id);
    fetchLaporan(id);
  };

  // Radar Chart Data Calculation
  const prepareChartData = () => {
    if (laporanList.length === 0) return [];
    
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    
    laporanList.forEach(report => {
      report.detail.forEach(d => {
        if (!categoryTotals[d.nama_kategori]) {
          categoryTotals[d.nama_kategori] = { sum: 0, count: 0 };
        }
        categoryTotals[d.nama_kategori].sum += d.skor;
        categoryTotals[d.nama_kategori].count += 1;
      });
    });

    return Object.keys(categoryTotals).map(catName => ({
      kategori: catName,
      nilai: Math.round(categoryTotals[catName].sum / categoryTotals[catName].count)
    }));
  };

  const chartData = prepareChartData();

  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="data-page">
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <div className="header-info">
          <h2>Rapor / Laporan Penilaian</h2>
          <p>{isAdmin ? 'Lihat rekap penilaian seluruh siswa' : 'Lihat perkembangan sikap dan penilaian Anda'}</p>
        </div>
        {isAdmin && (
          <div className="header-actions">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select 
                className="form-input" 
                value={selectedSiswaId} 
                onChange={handleSiswaChange}
                style={{ width: '100%', maxWidth: '300px' }}
              >
                <option value="">-- Pilih Siswa --</option>
                {siswaList.map(s => (
                  <option key={s.id_siswa} value={s.id_siswa}>{s.nama_siswa}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="table-loading">Memuat laporan...</div>
      ) : error ? (
        <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>{error}</div>
      ) : laporanList.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p style={{ color: 'var(--text-muted)' }}>Belum ada data penilaian untuk ditampilkan.</p>
      </div>
      ) : (
        <div className="laporan-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Radar Chart Section */}
          <div className="chart-card" style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', width: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 700, textAlign: 'center' }}>Radar Chart Penilaian Sikap</h3>
            <div style={{ width: '100%', height: 400, margin: '0 auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="kategori" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Nilai"
                    dataKey="nilai"
                    stroke="var(--primary-color)"
                    fill="var(--primary-color)"
                    fillOpacity={0.6}
                  />
                  <ChartTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Timeline Table */}
          <div className="history-section">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 700 }}>Riwayat Penilaian (Timeline)</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bulan / Tanggal</th>
                    <th>Guru Evaluator</th>
                    <th>Catatan / Feedback</th>
                    <th>Rata-rata Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanList.map((item) => {
                    const avgScore = item.detail.length > 0 
                      ? Math.round(item.detail.reduce((sum, d) => sum + d.skor, 0) / item.detail.length)
                      : 0;
                    
                    return (
                      <tr key={item.id_penilaian}>
                        <td className="font-bold">
                          {new Date(item.tanggal_penilaian).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                          <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{formatTanggal(item.tanggal_penilaian)}</div>
                        </td>
                        <td>{item.evaluator.nama}</td>
                        <td style={{ minWidth: '200px', whiteSpace: 'normal', fontSize: '0.875rem' }}>
                          {item.catatan_umum || '-'}
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                             {item.detail.map(d => (
                               <span key={d.id_kategori} className="tag" style={{ fontSize: '0.65rem' }}>
                                 {d.nama_kategori}: {d.skor}
                               </span>
                             ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${avgScore >= 75 ? 'active' : 'inactive'}`} style={{ fontWeight: 800 }}>
                            {avgScore}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default LaporanPenilaianPage;
