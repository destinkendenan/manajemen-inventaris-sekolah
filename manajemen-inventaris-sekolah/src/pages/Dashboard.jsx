import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getAllBarang } from '../services/barangService';
import { getAllPeminjaman, getPeminjamanByUser } from '../services/peminjamanService';

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalBarang: 0,
    barangTersedia: 0,
    barangDipinjam: 0,
    totalPeminjaman: 0,
    peminjamanAktif: 0,
    peminjamanMenunggu: 0,
    recentBarang: [],
    recentPeminjaman: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch basic stats
      const barangResponse = await getAllBarang({ limit: 5 });
      
      let peminjamanResponse;
      if (user.role === 'admin') {
        peminjamanResponse = await getAllPeminjaman({ limit: 5 });
      } else {
        peminjamanResponse = await getPeminjamanByUser(user.id, { limit: 5 });
      }
      
      setDashboardData({
        totalBarang: barangResponse.totalItems || 0,
        barangTersedia: barangResponse.stats?.tersedia || 0,
        barangDipinjam: barangResponse.stats?.dipinjam || 0,
        totalPeminjaman: peminjamanResponse.totalItems || 0,
        peminjamanAktif: peminjamanResponse.stats?.dipinjam || 0,
        peminjamanMenunggu: peminjamanResponse.stats?.menunggu || 0,
        recentBarang: barangResponse.data || [],
        recentPeminjaman: peminjamanResponse.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card - Total Barang */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Total Inventaris</h2>
            <p className="text-4xl font-bold">{dashboardData.totalBarang}</p>
            <div className="mt-4">
              <div className="badge badge-success mr-2">Tersedia: {dashboardData.barangTersedia}</div>
              <div className="badge badge-info">Dipinjam: {dashboardData.barangDipinjam}</div>
            </div>
            <div className="card-actions justify-end mt-2">
              <Link to="/barang" className="btn btn-sm btn-primary">
                Lihat Detail
              </Link>
            </div>
          </div>
        </div>

        {/* Card - Peminjaman */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Peminjaman</h2>
            <p className="text-4xl font-bold">{dashboardData.totalPeminjaman}</p>
            <div className="mt-4">
              <div className="badge badge-info mr-2">Aktif: {dashboardData.peminjamanAktif}</div>
              <div className="badge badge-warning">Menunggu: {dashboardData.peminjamanMenunggu}</div>
            </div>
            <div className="card-actions justify-end mt-2">
              <Link to="/peminjaman" className="btn btn-sm btn-primary">
                Lihat Detail
              </Link>
            </div>
          </div>
        </div>

        {/* Card - Aktivitas Terbaru */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Aktivitas Terbaru</h2>
            <div className="mt-2">
              <p>Peminjaman baru: <span className="font-bold">{dashboardData.peminjamanMenunggu}</span></p>
              <p>Barang baru: <span className="font-bold">{dashboardData.recentBarang.length}</span></p>
            </div>
            <div className="card-actions justify-end mt-2">
              {user.role === 'admin' && (
                <Link to="/laporan" className="btn btn-sm btn-primary">
                  Laporan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barang Terbaru */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Barang Terbaru</h2>
            {dashboardData.recentBarang.length === 0 ? (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
                    {dashboardData.recentBarang.map((item) => (
                      <tr key={item.id}>
                        <td>{item.kode}</td>
                        <td>{item.nama}</td>
                        <td>{item.kategori?.nama || '-'}</td>
                        <td>{item.jumlah}</td>
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

        {/* Peminjaman Terbaru */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Peminjaman Terbaru</h2>
            {dashboardData.recentPeminjaman.length === 0 ? (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Belum ada data peminjaman</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Barang</th>
                      {user.role === 'admin' && <th>Peminjam</th>}
                      <th>Tanggal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentPeminjaman.map((item) => (
                      <tr key={item.id}>
                        <td>{item.barang?.nama || '-'}</td>
                        {user.role === 'admin' && <td>{item.user?.name || '-'}</td>}
                        <td>{new Date(item.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
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