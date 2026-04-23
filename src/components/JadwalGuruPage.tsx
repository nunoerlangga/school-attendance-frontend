import React from 'react';

interface JadwalGuruPageProps {
  loadingJadwal: boolean;
  jadwalList: any[];
  onOpenQrModal: (jadwal: any) => void;
}

const JadwalGuruPage: React.FC<JadwalGuruPageProps> = ({
  loadingJadwal,
  jadwalList,
  onOpenQrModal,
}) => {
  if (loadingJadwal) {
    return (
      <div className="loading-container">
        <div className="loader"></div> Memuat data jadwal...
      </div>
    );
  }



  const formatJadwalTime = (timeData: string) => {
    if (!timeData) return '';
    if (timeData.includes('T')) {
      return new Date(timeData).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    }
    return timeData.substring(0, 5).replace(':', '.');
  };

  return (
    <div className="evaluator-dashboard">
      <div
        className="welcome-banner"
        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" }}
      >
        <h1>Jadwal Mengajar</h1>
        <p>Kelola kelas Anda dan hasilkan QR Code Absensi.</p>
      </div>

      <div className="student-grid">
        {jadwalList.map((j) => (
          <div key={j.id_jadwal} className="student-card">
            <div className="student-card-header" style={{ padding: '1.25rem' }}>
              <span className="student-class-badge" style={{ fontSize: '0.875rem' }}>
                {j.kelas.nama_kelas}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  marginLeft: 'auto',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                {j.hari}
              </span>
            </div>
            <div className="student-card-body">
              <div>
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    color: 'var(--text-main)',
                    fontSize: '1.125rem',
                  }}
                >
                  {j.mapel.nama_mapel}
                </h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {formatJadwalTime(j.jam_mulai)} - {formatJadwalTime(j.jam_selesai)} WIB
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {jadwalList.length === 0 && (
          <div className="empty-state">
            <p>Anda belum memiliki jadwal mengajar terdaftar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalGuruPage;
