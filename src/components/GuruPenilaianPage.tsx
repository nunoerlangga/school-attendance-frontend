import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Student {
  id_siswa: string;
  nama: string;
  kelas: string;
  foto: string;
  status_penilaian: "belum" | "sudah";
  id_penilaian: string | null;
}

interface GuruPenilaianPageProps {
  students: Student[];
  hasCategories: boolean;
  jadwalAktif: any;
  loadingJadwalAktif: boolean;
  onOpenQrModal: (jadwal: any) => void;
  loading: boolean;
}

const GuruPenilaianPage: React.FC<GuruPenilaianPageProps> = ({
  students,
  hasCategories,
  jadwalAktif,
  loadingJadwalAktif,
  onOpenQrModal,
  loading
}) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div> Memuat data siswa...
      </div>
    );
  }

  const totalStudents = students.length;
  const ratedStudents = students.filter(
    (s) => s.status_penilaian === "sudah"
  ).length;
  const progressPercent =
    totalStudents > 0 ? (ratedStudents / totalStudents) * 100 : 0;

  return (
    <div className="evaluator-dashboard">
      <div
        className="welcome-banner"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        }}
      >
        <h1>Penilaian Siswa</h1>
        <p>Anda mengelola penilaian untuk siswa di kelas yang Anda ajar.</p>
      </div>

      {hasCategories && (
        <div className="progress-section">
          <div className="progress-header">
            <h3>Progress Penilaian Siswa</h3>
            <span className="progress-text">
              {ratedStudents} / {totalStudents} siswa dinilai
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="student-grid">
        {students.map((student) => (
          <div key={student.id_siswa} className="student-card">
            <div className="student-card-header">
              <div className="student-photo">
                <div className="student-avatar-placeholder">
                  {getInitials(student.nama)}
                </div>
              </div>
              <div className="student-info-main">
                <h4>{student.nama}</h4>
                <span className="student-class-badge">{student.kelas}</span>
              </div>
            </div>
            <div className="student-card-body">
              {hasCategories ? (
                <>
                  <div className="status-container">
                    <span className={`status-badge ${student.status_penilaian}`}>
                      {student.status_penilaian === "sudah"
                        ? "Sudah Dinilai"
                        : "Belum Dinilai"}
                    </span>
                  </div>
                  <button
                    className={`nilai-button ${student.status_penilaian === "sudah" ? "secondary" : "primary"}`}
                    onClick={() => {
                      if (student.status_penilaian === "sudah" && student.id_penilaian) {
                        navigate(`/guru/edit-penilaian/${student.id_penilaian}`, {
                          state: { student },
                        });
                      } else {
                        navigate(`/guru/create-penilaian/${student.id_siswa}`, {
                          state: { student },
                        });
                      }
                    }}
                  >
                    {student.status_penilaian === "sudah"
                      ? "Edit Penilaian"
                      : "Nilai Sekarang"}
                  </button>
                </>
              ) : (
                <div className="status-container" style={{ padding: '0.5rem 0' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Kategori penilaian belum diatur.</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="empty-state">
            <p>Belum ada siswa di kelas Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuruPenilaianPage;
