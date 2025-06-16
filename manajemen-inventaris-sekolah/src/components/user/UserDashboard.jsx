import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import ErrorAlert from '../common/ErrorAlert';

const UserDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_dipinjam: 0,
    sedang_dipinjam: 0,
    menunggu_persetujuan: 0,
    telah_dikembalikan: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentActivity();
      fetchOverdueItems();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await api('/users/stats');
      setStats(response.data || {
        total_dipinjam: 0,
        sedang_dipinjam: 0,
        menunggu_persetujuan: 0,
        telah_dikembalikan: 0
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Gagal memuat statistik pengguna');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api('/peminjaman', {
        params: {
          user_id: user.id,
          per_page: 5,
          sort: 'created_at,desc'
        }
      });
      setRecentActivity(response.data || []);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueItems = async () => {
    try {
      const response = await api('/peminjaman', {
        params: {
          user_id: user.id,
          status: 'dipinjam',
          terlambat: true
        }
      });
      setOverdueItems(response.data || []);
    } catch (err) {
      console.error('Error fetching overdue items:', err);
    }
  };

  // Format date to locale string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get status badge class
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
      case 'dibatalkan':
        return 'badge badge-neutral';
      default:
        return 'badge';
    }
  };

  // Check if a peminjaman is terlambat (overdue)
  const isTerlambat = (item) => {
    if (item.status !== 'dipinjam') return false;
    
    const today = new Date();
    const batasKembali = new Date(item.tanggal_kembali);
    return today > batasKembali;
  };

  return (
    <div className="w-full">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      {/* Welcome Section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">Selamat Datang, {user?.name}!</h1>
        <p className="text-base-content/70 mt-2">
          Selamat datang di sistem manajemen inventaris sekolah. Di sini Anda dapat melihat, meminjam, dan mengelola peminjaman barang inventaris sekolah.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-base-100 p-6 rounded-lg shadow-md flex flex-col">
              <span className="text-xs font-semibold opacity-70">Total Dipinjam</span>
              <div className="flex items-center mt-2">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <span className="text-3xl font-bold">{stats.total_dipinjam}</span>
              </div>
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-md flex flex-col">
              <span className="text-xs font-semibold opacity-70">Sedang Dipinjam</span>
              <div className="flex items-center mt-2">
                <div className="bg-info/10 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold">{stats.sedang_dipinjam}</span>
              </div>
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-md flex flex-col">
              <span className="text-xs font-semibold opacity-70">Menunggu Persetujuan</span>
              <div className="flex items-center mt-2">
                <div className="bg-warning/10 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-3xl font-bold">{stats.menunggu_persetujuan}</span>
              </div>
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-md flex flex-col">
              <span className="text-xs font-semibold opacity-70">Telah Dikembalikan</span>
              <div className="flex items-center mt-2">
                <div className="bg-success/10 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold">{stats.telah_dikembalikan}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link to="/barang" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="card-title text-base">Lihat Daftar Barang</h2>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  Jelajahi dan pinjam barang inventaris sekolah
                </p>
              </div>
            </Link>
            
            <Link to="/peminjaman" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-info/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h2 className="card-title text-base">Peminjaman Saya</h2>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  Lihat status dan riwayat peminjaman Anda
                </p>
              </div>
            </Link>
            
            <Link to="/pengembalian" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-success/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <h2 className="card-title text-base">Pengembalian Saya</h2>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  Lihat riwayat pengembalian barang
                </p>
              </div>
            </Link>
            
            <Link to="/profile" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-neutral/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="card-title text-base">Profil Saya</h2>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  Lihat dan ubah informasi profil Anda
                </p>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overdue Items */}
            {overdueItems.length > 0 && (
              <div className="lg:col-span-3 card bg-error bg-opacity-10 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-error flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Peringatan: Anda memiliki {overdueItems.length} barang yang terlambat dikembalikan!
                  </h2>
                  <p className="mb-4">
                    Segera kembalikan barang berikut ke petugas inventaris untuk menghindari sanksi:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {overdueItems.map(item => (
                      <li key={item.id}>
                        <span className="font-medium">{item.barang?.nama || 'Barang'}</span> - batas kembali: {formatDate(item.tanggal_kembali)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Recent Activity */}
            <div className={`${overdueItems.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} card bg-base-100 shadow-md`}>
              <div className="card-body">
                <h2 className="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aktivitas Terbaru
                </h2>
                
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-base-content/60">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>Belum ada aktivitas peminjaman</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Barang</th>
                          <th className="hidden md:table-cell">Tanggal</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivity.map(item => (
                          <tr key={item.id}>
                            <td>
                              <Link to="/peminjaman" className="font-medium hover:underline">
                                {item.barang?.nama || 'Barang'}
                              </Link>
                            </td>
                            <td className="hidden md:table-cell">
                              {item.status === 'dikembalikan' 
                                ? formatDate(item.tanggal_dikembalikan) 
                                : formatDate(item.tanggal_pinjam)}
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(isTerlambat(item) ? 'terlambat' : item.status)}>
                                {isTerlambat(item) ? 'Terlambat' : getStatusBadgeClass(item.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="card-actions justify-end mt-4">
                  <Link to="/peminjaman" className="btn btn-sm btn-primary">
                    Lihat Semua
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Information Card */}
            {overdueItems.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informasi
                  </h2>
                  
                  <div className="bg-info bg-opacity-10 p-4 rounded-lg mt-2">
                    <h3 className="font-bold text-info mb-2">Panduan Peminjaman</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Pastikan barang dikembalikan tepat waktu</li>
                      <li>Jaga kondisi barang yang dipinjam</li>
                      <li>Laporkan kerusakan segera kepada petugas</li>
                      <li>Pengajuan peminjaman baru dapat diproses maksimal 1x24 jam</li>
                    </ul>
                  </div>
                  
                  <div className="bg-warning bg-opacity-10 p-4 rounded-lg mt-4">
                    <h3 className="font-bold text-warning mb-2">Kontak Petugas</h3>
                    <p className="text-sm">
                      Jika ada kendala dalam peminjaman atau pengembalian, hubungi petugas inventaris di ruang tata usaha atau melalui nomor ext. 123.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;