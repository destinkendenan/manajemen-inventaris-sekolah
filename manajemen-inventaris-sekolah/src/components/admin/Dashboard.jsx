import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBarang: 0,
    barangTersedia: 0,
    barangDipinjam: 0,
    totalKategori: 0,
    totalPeminjaman: 0,
    peminjamanAktif: 0,
    peminjamanMenunggu: 0,
    totalUser: 0
  });
  const [recentBarang, setRecentBarang] = useState([]);
  const [recentPeminjaman, setRecentPeminjaman] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api('/dashboard');
      
      if (response) {
        setStats({
          totalBarang: response.stats?.total_barang || 0,
          barangTersedia: response.stats?.barang_tersedia || 0,
          barangDipinjam: response.stats?.barang_dipinjam || 0,
          totalKategori: response.stats?.total_kategori || 0,
          totalPeminjaman: response.stats?.total_peminjaman || 0,
          peminjamanAktif: response.stats?.peminjaman_aktif || 0,
          peminjamanMenunggu: response.stats?.peminjaman_menunggu || 0,
          totalUser: response.stats?.total_user || 0
        });
        
        setRecentBarang(response.recent_barang || []);
        setRecentPeminjaman(response.recent_peminjaman || []);
      }
    } catch (err) {
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'menunggu':
        return 'badge badge-warning';
      case 'dipinjam':
        return 'badge badge-info';
      case 'dikembalikan':
        return 'badge badge-success';
      case 'ditolak':
        return 'badge badge-error';
      case 'terlambat':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <h2 className="text-2xl font-bold mb-6">Dashboard Admin</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Barang Card */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="stat-title">Total Barang</div>
            <div className="stat-value text-primary">{stats.totalBarang}</div>
            <div className="stat-desc">
              {stats.barangTersedia} tersedia, {stats.barangDipinjam} dipinjam
            </div>
          </div>
        </div>
        
        {/* Peminjaman Card */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-title">Peminjaman</div>
            <div className="stat-value text-secondary">{stats.totalPeminjaman}</div>
            <div className="stat-desc">
              {stats.peminjamanAktif} aktif, {stats.peminjamanMenunggu} menunggu
            </div>
          </div>
        </div>
        
        {/* Kategori Card */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="stat-title">Kategori</div>
            <div className="stat-value text-accent">{stats.totalKategori}</div>
            <div className="stat-desc">
              <Link to="/kategori" className="link link-hover">Kelola kategori</Link>
            </div>
          </div>
        </div>
        
        {/* User Card */}
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-title">Pengguna</div>
            <div className="stat-value text-info">{stats.totalUser}</div>
            <div className="stat-desc">
              <Link to="/users" className="link link-hover">Kelola pengguna</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/barang/tambah" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Barang
        </Link>
        
        <Link to="/kategori/tambah" className="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Kategori
        </Link>
        
        <Link to="/peminjaman" className="btn btn-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Kelola Peminjaman
        </Link>
        
        <Link to="/laporan" className="btn btn-info">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Laporan
        </Link>
      </div>
      
      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Barang Terbaru</h3>
            {recentBarang.length === 0 ? (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Belum ada data barang</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama</th>
                      <th>Kategori</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBarang.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="font-mono">{item.kode}</span>
                        </td>
                        <td>{item.nama}</td>
                        <td>{item.kategori?.nama || '-'}</td>
                        <td>
                          <div className="badge">{item.jumlah}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <Link to="/barang" className="btn btn-sm btn-ghost">
                Lihat Semua
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Peminjaman Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Peminjaman Terbaru</h3>
            {recentPeminjaman.length === 0 ? (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Belum ada data peminjaman</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Peminjam</th>
                      <th>Barang</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPeminjaman.map((item) => (
                      <tr key={item.id}>
                        <td>{item.user?.name || '-'}</td>
                        <td>{item.barang?.nama || '-'}</td>
                        <td>{formatDate(item.tanggal_pinjam)}</td>
                        <td>
                          <span className={getStatusBadgeClass(item.status)}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="card-actions justify-end mt-4">
              <Link to="/peminjaman" className="btn btn-sm btn-ghost">
                Lihat Semua
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;