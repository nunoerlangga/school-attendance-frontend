import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from './Card';
import { Table } from './Table';
import { Badge } from './Badge';

export const HistoryPointPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const idSiswa = localStorage.getItem('id_siswa');

  useEffect(() => {
    if (!idSiswa) {
      setLoading(false);
      return;
    }
    
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/siswa/${idSiswa}/riwayat-poin`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [idSiswa]);

  const columns = [
    { 
      header: 'Tanggal', 
      accessor: (row: any) => new Date(row.created_at).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    },
    { 
      header: 'Tipe', 
      accessor: (row: any) => {
        let type: 'success' | 'danger' | 'warning' | 'default' = 'default';
        if (row.transaction_type === 'EARN') type = 'success';
        if (row.transaction_type === 'SPEND') type = 'danger';
        if (row.transaction_type === 'ADJUST') type = 'warning';
        return <Badge type={type}>{row.transaction_type}</Badge>;
      } 
    },
    { 
      header: 'Jumlah', 
      accessor: (row: any) => {
        const isPos = row.amount > 0;
        return (
          <span style={{ fontWeight: 700, color: isPos ? '#16a34a' : (row.amount < 0 ? '#dc2626' : '#64748b') }}>
            {isPos ? `+${row.amount}` : row.amount}
          </span>
        );
      },
      align: 'right' as const
    },
    { header: 'Saldo', accessor: (row: any) => <span style={{ fontWeight: 600 }}>{row.current_balance}</span>, align: 'right' as const },
    { header: 'Deskripsi', accessor: 'description' },
  ];

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      <Card title="Riwayat Poin" subtitle="Detail historis penambahan dan pengurangan poin Anda">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</div>
        ) : (
          <Table columns={columns} data={data} keyField="id_point_ledger" />
        )}
      </Card>
    </div>
  );
};

export default HistoryPointPage;
