import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

interface LocationState {
  student: {
    id_siswa: string;
    nama: string;
    kelas: string;
    foto: string;
  };
}

interface KategoriPenilaian {
  id_kategori: string;
  nama: string;
}

const CreatePenilaianPage: React.FC = () => {
  const { id_siswa } = useParams<{ id_siswa: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const student = state?.student;

  const [categories, setCategories] = useState<KategoriPenilaian[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [guruId, setGuruId] = useState('');



  useEffect(() => {
    if (!student && !id_siswa) {
      navigate('/guru');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const resCat = await api.get('/kategori-penilaian');
        if (resCat.data && resCat.data.length > 0) {
          setCategories(resCat.data);
          // Initialize ratings state
          const initialRatings: Record<string, number> = {};
          resCat.data.forEach((cat: any) => initialRatings[cat.id_kategori] = 0);
          setRatings(initialRatings);
        } else {
          setCategories([]);
        }

        // 2. Fetch guru info to get genuine id_guru
        // First try to fetch all gurus and match with logged in username
        const username = localStorage.getItem('nama'); // This is actually nama
        const gurusRes = await api.get('/guru');
        const userId = localStorage.getItem('id_user');

        let foundGuruId = '';
        if (gurusRes.data) {
          // If we can't find by userId, we will have to extract it some other way
          // But actually, we only need to pass the id_user from JWT and the backend could figure it out,
          // However, CreatePenilaianDto wants id_guru explicitly.
          const matchedGuru = gurusRes.data.find((g: any) => g.user?.id_user === userId || g.nama_guru === username);
          if (matchedGuru) {
            foundGuruId = matchedGuru.id_guru;
            setGuruId(foundGuruId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch evaluation categories:', error);
      }
    };

    fetchInitialData();
  }, [navigate, id_siswa, student]);

  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleSubmit = async (isSaveAndContinue: boolean) => {
    try {
      setLoading(true);

      const detail = Object.entries(ratings).map(([id_kategori, skor]) => ({
        id_kategori,
        skor
      }));

      // Validate all rated
      if (detail.some(d => d.skor === 0)) {
        alert("Mohon lengkapi semua penilaian (1-5 bintang).");
        setLoading(false);
        return;
      }

      if (!guruId) {
        alert("ID Guru tidak ditemukan, silahkan login ulang.");
        return;
      }

      await api.post('/penilaian', {
        id_guru: guruId,
        id_siswa: id_siswa,
        periode: 'Minggu ini',
        catatan_umum: catatan,
        detail
      });

      alert('Penilaian berhasil disimpan!');

      if (isSaveAndContinue) {
        // Find next student to navigate to or just go back to dashboard
        navigate('/guru');
      } else {
        navigate('/guru');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Gagal menyimpan penilaian');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar - simplified for form page */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="app-logo small">AbsenZie</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/guru')}>
            &larr; Kembali ke Dashboard
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h2>Penilaian Karakter Siswa</h2>
          </div>
        </header>

        <section className="dashboard-body">
          <div className="form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="form-header student-profile-header">
              <div className="student-photo large">
                {student?.foto ? (
                  <img src={student.foto} alt={student?.nama} style={{ borderRadius: '50%', width: '80px', height: '80px', objectFit: 'cover' }} />
                ) : (
                  <div className="student-avatar-placeholder large">{getInitials(student?.nama || 'S')}</div>
                )}
              </div>
              <div className="student-info-main">
                <h2 style={{ marginBottom: '0.25rem' }}>{student?.nama || 'Nama Siswa'}</h2>
                <span className="student-class-badge">{student?.kelas || 'Kelas'}</span>
              </div>
            </div>

            <div className="edit-form">
              <div className="assessment-indicators">
                <h3>Indikator Penilaian</h3>
                <p className="placeholder-text" style={{ marginBottom: '1.5rem' }}>Berikan nilai 1 (Sangat Kurang) hingga 5 (Sangat Baik)</p>

                {categories.map(cat => (
                  <div key={cat.id_kategori} className="indicator-row">
                    <div className="indicator-name">{cat.nama}</div>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${ratings[cat.id_kategori] >= star ? 'filled' : ''}`}
                          onClick={() => handleRatingChange(cat.id_kategori, star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Catatan / Feedback (Opsional)</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Tambahkan catatan khusus untuk siswa ini..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                ></textarea>
              </div>

              <div className="form-actions" style={{ gap: '1rem', marginTop: '2rem' }}>

                <button
                  className="login-button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreatePenilaianPage;
