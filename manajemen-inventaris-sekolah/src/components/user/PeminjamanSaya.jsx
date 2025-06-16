import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';
import useAuth from '../../hooks/useAuth';

const PeminjamanSaya = () => {
  const { user } = useAuth();
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Detail modal state
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPeminjaman();
  }, [currentPage, perPage, statusFilter, startDate, endDate]);

  const fetchPeminjaman = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        user_id: user.id
      };
      
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api('/peminjaman', { params });
      setPeminjaman(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (err) {
      setError('Gagal memuat data peminjaman. Silakan coba lagi.');
      console.error('Error fetching peminjaman:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowDetail = (item) => {
    setSelectedPeminjaman(item);
    setShowDetailModal(true);
  };

  const handleShowCancel = (item) => {
    setSelectedPeminjaman(item);
    setShowCancelModal(true);
  };

  const handleCancelPeminjaman = async () => {
    if (!selectedPeminjaman) return;
    
    setIsProcessing(true);
    try {
      await api(`/peminjaman/${selectedPeminjaman.id}/cancel`, {
        method: 'PUT'
      });
      
      setSuccess('Permintaan peminjaman berhasil dibatalkan');
      setShowCancelModal(false);
      fetchPeminjaman();
    } catch (err) {
      setError(err.message || 'Gagal membatalkan peminjaman');
      console.error('Error canceling peminjaman:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date to locale string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Status badge class
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
      case 'dibatalkan':
        return 'badge badge-neutral';
      default:
        return 'badge';
    }
  };

  // Status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'menunggu':
        return 'Menunggu';
      case 'dipinjam':
        return 'Dipinjam';
      case 'dikembalikan':
        return 'Dikembalikan';
      case 'ditolak':
        return 'Ditolak';
      case 'terlambat':
        return 'Terlambat';
      case 'dibatalkan':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Check if a peminjaman is terlambat (overdue)
  const isTerlambat = (item) => {
    if (item.status !== 'dipinjam') return false;
    
    const today = new Date();
    const batasKembali = new Date(item.tanggal_kembali);
    return today > batasKembali;
  };

  // Calculate days overdue
  const calculateDaysTerlambat = (item) => {
    const today = new Date();
    const batasKembali = new Date(item.tanggal_kembali);
    const diffTime = Math.abs(today - batasKembali);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Clear alerts after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="w-full">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}
      
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Peminjaman Saya</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Status Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="dikembalikan">Dikembalikan</option>
              <option value="ditolak">Ditolak</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
          
          {/* Date Range */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Dari Tanggal</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sampai Tanggal</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Tampilkan:</span>
            <select
              className="select select-bordered select-sm"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 25, 50].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={handleResetFilters}
          >
            Reset Filter
          </button>
        </div>
      </div>
      
      {/* Peminjaman Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : peminjaman.length === 0 ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-lg">Belum ada riwayat peminjaman</p>
            <p className="mt-2 text-gray-500">
              Anda belum pernah meminjam barang. Lihat katalog barang untuk melakukan peminjaman.
            </p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Barang</th>
                <th className="hidden md:table-cell">Tanggal Pinjam</th>
                <th className="hidden md:table-cell">Batas Kembali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {peminjaman.map((item) => (
                <tr key={item.id} className={isTerlambat(item) ? 'bg-error bg-opacity-10' : ''}>
                  <td>
                    <div className="font-bold">{item.barang?.nama || '-'}</div>
                    <div className="text-xs opacity-70">
                      Kode: {item.barang?.kode || '-'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell">{formatDate(item.tanggal_pinjam)}</td>
                  <td className="hidden md:table-cell">
                    {formatDate(item.tanggal_kembali)}
                    {isTerlambat(item) && (
                      <div className="badge badge-error badge-sm ml-2" title="Hari terlambat">
                        +{calculateDaysTerlambat(item)} hari
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(isTerlambat(item) ? 'terlambat' : item.status)}>
                      {isTerlambat(item) ? 'Terlambat' : getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleShowDetail(item)}
                        className="btn btn-xs btn-circle btn-ghost"
                        title="Detail"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {item.status === 'menunggu' && (
                        <button
                          onClick={() => handleShowCancel(item)}
                          className="btn btn-xs btn-circle btn-ghost text-error"
                          title="Batalkan"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {!loading && peminjaman.length > 0 && (
          <div className="flex justify-between items-center p-4">
            <span className="text-sm">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, peminjaman.length + ((currentPage - 1) * perPage))} dari total {peminjaman.length + ((currentPage - 1) * perPage)} data
            </span>
            
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              {[...Array(totalPages).keys()].map(number => {
                const pageNumber = number + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`join-item btn btn-sm ${currentPage === pageNumber ? 'btn-active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  (pageNumber === currentPage - 2 && currentPage > 3) ||
                  (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return <button key={pageNumber} className="join-item btn btn-sm btn-disabled">...</button>;
                }
                return null;
              })}
              
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && selectedPeminjaman && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Detail Peminjaman</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-sm opacity-70">Barang</h4>
                <p>{selectedPeminjaman.barang?.nama || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Status</h4>
                <span className={getStatusBadgeClass(isTerlambat(selectedPeminjaman) ? 'terlambat' : selectedPeminjaman.status)}>
                  {isTerlambat(selectedPeminjaman) ? 'Terlambat' : getStatusLabel(selectedPeminjaman.status)}
                </span>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kode Barang</h4>
                <p>{selectedPeminjaman.barang?.kode || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Jumlah</h4>
                <p>{selectedPeminjaman.jumlah || '1'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Tanggal Pinjam</h4>
                <p>{formatDate(selectedPeminjaman.tanggal_pinjam)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Batas Kembali</h4>
                <p>{formatDate(selectedPeminjaman.tanggal_kembali)}</p>
                {isTerlambat(selectedPeminjaman) && (
                  <div className="badge badge-error badge-sm" title="Hari terlambat">
                    Terlambat {calculateDaysTerlambat(selectedPeminjaman)} hari
                  </div>
                )}
              </div>
              
              {selectedPeminjaman.tanggal_dikembalikan && (
                <div>
                  <h4 className="font-semibold text-sm opacity-70">Tanggal Dikembalikan</h4>
                  <p>{formatDate(selectedPeminjaman.tanggal_dikembalikan)}</p>
                </div>
              )}
              
              {selectedPeminjaman.kondisi_saat_dipinjam && (
                <div>
                  <h4 className="font-semibold text-sm opacity-70">Kondisi saat dipinjam</h4>
                  <p>
                    {selectedPeminjaman.kondisi_saat_dipinjam === 'baik' ? 'Baik' : 
                     selectedPeminjaman.kondisi_saat_dipinjam === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-sm opacity-70">Keperluan</h4>
              <p>{selectedPeminjaman.keperluan || '-'}</p>
            </div>
            
            {selectedPeminjaman.catatan && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm opacity-70">Catatan</h4>
                <p>{selectedPeminjaman.catatan}</p>
              </div>
            )}
            
            {selectedPeminjaman.alasan_penolakan && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm opacity-70">Alasan Penolakan</h4>
                <p className="text-error">{selectedPeminjaman.alasan_penolakan}</p>
              </div>
            )}
            
            {selectedPeminjaman.catatan_pengembalian && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm opacity-70">Catatan Pengembalian</h4>
                <p>{selectedPeminjaman.catatan_pengembalian}</p>
              </div>
            )}
            
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
              
              {selectedPeminjaman.status === 'menunggu' && (
                <button
                  className="btn btn-error"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleShowCancel(selectedPeminjaman);
                  }}
                >
                  Batalkan Peminjaman
                </button>
              )}
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}></div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {showCancelModal && selectedPeminjaman && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Pembatalan</h3>
            <p>
              Apakah Anda yakin ingin membatalkan permintaan peminjaman{' '}
              <span className="font-bold">{selectedPeminjaman.barang?.nama || 'barang'}</span>?
            </p>
            
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
                disabled={isProcessing}
              >
                Tidak
              </button>
              <button
                className={`btn btn-error ${isProcessing ? 'loading' : ''}`}
                onClick={handleCancelPeminjaman}
                disabled={isProcessing}
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs"></span> : null}
                Ya, Batalkan
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isProcessing && setShowCancelModal(false)}></div>
        </div>
        )}
    </div>
  );
};

export default PeminjamanSaya;