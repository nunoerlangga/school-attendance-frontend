import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from './Card';
import { Table } from './Table';

export const LeaderboardPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem('id_siswa'); // Akan null jika admin

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/siswa/leaderboard/semua');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const columns = [
    { header: 'Rank', accessor: 'rank', width: '80px', align: 'center' as const },
    { header: 'Nama Siswa', accessor: (row: any) => <span style={{ fontWeight: 600 }}>{row.nama_siswa}</span> },
    { header: 'Kelas', accessor: 'kelas' },
    { header: 'Poin', accessor: (row: any) => <span style={{ fontWeight: 700, color: '#4f46e5' }}>{row.total_poin}</span>, align: 'right' as const },
  ];

  const getRowStyle = (row: any) => {
    let bg = 'transparent';
    let border = 'none';

    if (row.id_siswa === currentUserId) {
      border = '2px solid #4f46e5';
      bg = '#e0e7ff';
    } else if (row.rank === 1) {
      bg = '#fef3c7'; // kuning tipis
    } else if (row.rank === 2) {
      bg = '#f1f5f9'; // abu-abu tipis
    } else if (row.rank === 3) {
      bg = '#ffedd5'; // coklat tipis
    }
    
    return { backgroundColor: bg, outline: border !== 'none' ? border : undefined, outlineOffset: border !== 'none' ? '-2px' : undefined };
  };

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      <Card title="Leaderboard Poin Siswa" subtitle="Peringkat siswa berdasarkan perolehan poin terbanyak">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</div>
        ) : (
          <Table columns={columns} data={data} keyField="id_siswa" rowStyle={getRowStyle} />
        )}
      </Card>
    </div>
  );
};

export default LeaderboardPage;
