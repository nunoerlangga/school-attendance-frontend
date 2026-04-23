import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import GuruDashboard from './components/GuruDashboard';
import ProfilePage from './components/ProfilePage';
import EditSiswaPage from './components/EditSiswaPage';
import EditGuruPage from './components/EditGuruPage';
import CreateSiswaPage from './components/CreateSiswaPage';
import CreateGuruPage from './components/CreateGuruPage';
import CreateSekolahPage from './components/CreateSekolahPage';
import EditSekolahPage from './components/EditSekolahPage';
import CreateKategoriPenilaianPage from './components/CreateKategoriPenilaianPage';
import EditKategoriPenilaianPage from './components/EditKategoriPenilaianPage';
import CreatePenilaianPage from './components/CreatePenilaianPage';
import EditPenilaianPage from './components/EditPenilaianPage';
import CreateJadwalPage from './components/CreateJadwalPage';
import EditJadwalPage from './components/EditJadwalPage';
import CreateKelasPage from './components/CreateKelasPage';
import EditKelasPage from './components/EditKelasPage';
import CreateTahunAjaranPage from './components/CreateTahunAjaranPage';
import EditTahunAjaranPage from './components/EditTahunAjaranPage';
import CreatePointRulePage from './components/CreatePointRulePage';
import EditPointRulePage from './components/EditPointRulePage';
import CreateHariLiburPage from './components/CreateHariLiburPage';
import EditHariLiburPage from './components/EditHariLiburPage';
import CreateMataPelajaranPage from './components/CreateMataPelajaranPage';
import EditMataPelajaranPage from './components/EditMataPelajaranPage';
import './style.css';
import SiswaDashboard from './components/SiswaDashboard';
import ScanAbsensiPage from './components/ScanAbsensiPage';
import CreateMarketplaceItemPage from './components/CreateMarketplaceItemPage';
import EditMarketplaceItemPage from './components/EditMarketplaceItemPage';
import LokasiSekolahPage from './components/LokasiSekolahPage';
import CreateLokasiSekolahPage from './components/CreateLokasiSekolahPage';
import EditLokasiSekolahPage from './components/EditLokasiSekolahPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create-siswa" element={<CreateSiswaPage />} />
        <Route path="/admin/create-guru" element={<CreateGuruPage />} />
        <Route path="/admin/edit-siswa/:id" element={<EditSiswaPage />} />
        <Route path="/admin/edit-guru/:id" element={<EditGuruPage />} />
        <Route path="/admin/create-sekolah" element={<CreateSekolahPage />} />
        <Route path="/admin/edit-sekolah" element={<EditSekolahPage />} />
        <Route path="/admin/create-kategori-penilaian" element={<CreateKategoriPenilaianPage />} />
        <Route path="/admin/edit-kategori-penilaian/:id" element={<EditKategoriPenilaianPage />} />
        <Route path="/admin/create-jadwal" element={<CreateJadwalPage />} />
        <Route path="/admin/edit-jadwal/:id" element={<EditJadwalPage />} />
        <Route path="/admin/create-kelas" element={<CreateKelasPage />} />
        <Route path="/admin/edit-kelas/:id" element={<EditKelasPage />} />
        <Route path="/admin/create-tahun-ajaran" element={<CreateTahunAjaranPage />} />
        <Route path="/admin/edit-tahun-ajaran/:id" element={<EditTahunAjaranPage />} />
        <Route path="/admin/create-point-rule" element={<CreatePointRulePage />} />
        <Route path="/admin/edit-point-rule/:id" element={<EditPointRulePage />} />
        <Route path="/admin/create-marketplace-item" element={<CreateMarketplaceItemPage />} />
        <Route path="/admin/edit-marketplace-item/:id" element={<EditMarketplaceItemPage />} />
        <Route path="/admin/lokasi-sekolah" element={<LokasiSekolahPage />} />
        <Route path="/admin/create-lokasi-sekolah" element={<CreateLokasiSekolahPage />} />
        <Route path="/admin/edit-lokasi-sekolah/:id" element={<EditLokasiSekolahPage />} />
        <Route path="/admin/create-hari-libur" element={<CreateHariLiburPage />} />
        <Route path="/admin/edit-hari-libur/:id" element={<EditHariLiburPage />} />
        <Route path="/admin/create-mata-pelajaran" element={<CreateMataPelajaranPage />} />
        <Route path="/admin/edit-mata-pelajaran/:id" element={<EditMataPelajaranPage />} />
        <Route path="/guru" element={<GuruDashboard />} />
        <Route path="/guru/create-penilaian/:id_siswa" element={<CreatePenilaianPage />} />
        <Route path="/guru/edit-penilaian/:id_penilaian" element={<EditPenilaianPage />} />
        <Route path="/siswa" element={<SiswaDashboard />} />
        <Route path="/scan" element={<ScanAbsensiPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>

  );
};

export default App;
