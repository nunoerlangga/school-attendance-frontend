import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface UserProfile {
  nama: string;
  username: string;
  role: string;
  asal_sekolah: string;
  jenis_kelamin?: string;
  kelas?: string;
  tingkat?: string;
  tahun_ajaran?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfile(response.data);
      } catch (err: any) {
        setError('Gagal memuat profil. Silakan coba lagi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('nama');
      navigate('/login');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatRole = (role: string) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'guru') return 'Guru';
    if (role === 'siswa') return 'Siswa';
    return role;
  };

  if (loading) return <div className="loading-state">Memuat...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className={`profile-container theme-${profile?.role}`}>
      <div className="profile-card">
        <header className="profile-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali
          </button>
          <h1>Profil Saya</h1>
        </header>

        <div className="profile-content">
          <div className="profile-hero">
            <div className="profile-avatar-large">
              {getInitials(profile?.nama || 'U')}
            </div>
            <div className="hero-info">
              <h2>{profile?.nama}</h2>
              <span className="badge">{formatRole(profile?.role || '')}</span>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Informasi Pribadi
              </h3>
              <div className="info-item">
                <span className="label">Username</span>
                <span className="value">{profile?.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Asal Sekolah</span>
                <span className="value">{profile?.asal_sekolah}</span>
              </div>
              {profile?.role !== 'admin' && (
                <div className="info-item">
                  <span className="label">Jenis Kelamin</span>
                  <span className="value">
                    {profile?.jenis_kelamin === 'laki_laki'
                      ? 'Laki-laki'
                      : profile?.jenis_kelamin === 'perempuan'
                        ? 'Perempuan'
                        : '-'}
                  </span>
                </div>
              )}
            </div>

            {profile?.role === 'siswa' && (
              <div className="info-section">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  Informasi Akademik
                </h3>
                <div className="info-item">
                  <span className="label">Kelas</span>
                  <span className="value">{profile.kelas}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tingkat</span>
                  <span className="value">{profile.tingkat}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tahun Ajaran</span>
                  <span className="value">{profile.tahun_ajaran}</span>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="profile-actions">
            <button className="logout-button" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Keluar dari Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
