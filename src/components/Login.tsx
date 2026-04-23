import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    sessionStorage.getItem('loginError') || null
  );

  // Clear session storage error after reading it
  useEffect(() => {
    if (sessionStorage.getItem('loginError')) {
      sessionStorage.removeItem('loginError');
    }
  }, []);

  // Hide any error message after 5 seconds of it appearing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Ensure token is valid and not the string "undefined"
    if (token && token !== 'undefined' && token !== 'null' && role) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'guru') navigate('/guru');
      else if (role === 'siswa') navigate('/siswa');
    }
  }, [navigate]);

  const getDeviceId = () => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('deviceId', id);
    }
    return id;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        device_id: getDeviceId(),
        device_type: 'web',
      });

      const { accessToken, role, nama, id_siswa, id_guru, id_user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('role', role);
      localStorage.setItem('nama', nama);
      if (id_user) localStorage.setItem('id_user', id_user);
      if (id_siswa) localStorage.setItem('id_siswa', id_siswa);
      if (id_guru) localStorage.setItem('id_guru', id_guru);
      
      // Role-based redirection
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'guru') {
        navigate('/guru');
      } else if (role === 'siswa') {
        navigate('/siswa');
      } else {
        alert('Role tidak dikenali atau belum didukung di versi web ini.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Username atau password salah.';
      sessionStorage.setItem('loginError', errorMessage);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="app-logo">AbsenZie</div>
        <h1>Selamat Datang</h1>
        <p>Silahkan login ke akun Anda</p>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading && <span className="loader"></span>}
          {loading ? 'Memproses...' : 'Login'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
