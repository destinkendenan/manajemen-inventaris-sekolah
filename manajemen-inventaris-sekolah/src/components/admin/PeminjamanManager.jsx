import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';

const PeminjamanManager = () => {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter and search states
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Modal states
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('baik');
  
  // Form processing state
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPeminjaman();
  }, [currentPage, perPage, statusFilter]);

  useEffect(() => {
    if (search || startDate || endDate) {
      const delayDebounce = setTimeout(() => {
        fetchPeminjaman();
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [search, startDate, endDate]);

  const fetchPeminjaman = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage
      };
      
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleShowDetail = (item) => {
    setSelectedPeminjaman(item);
    setShowDetailModal(true);
  };

  const handleShowApprove = (item) => {
    setSelectedPeminjaman(item);
    setShowApproveModal(true);
  };

  const handleShowReject = (item) => {
    setSelectedPeminjaman(item);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleShowReturn = (item) => {
    setSelectedPeminjaman(item);
    setReturnNotes('');
    setReturnCondition('baik');
    setShowReturnModal(true);
  };

  const handleApprovePeminjaman = async () => {
    if (!selectedPeminjaman) return;
    
    setIsProcessing(true);
    try {
      await api(`/peminjaman/${selectedPeminjaman.id}/approve`, {
        method: 'PUT'
      });
      
      setSuccess('Peminjaman berhasil disetujui');
      setShowApproveModal(false);
      fetchPeminjaman();
    } catch (err) {
      setError(err.message || 'Gagal menyetujui peminjaman');
      console.error('Error approving peminjaman:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPeminjaman = async () => {
    if (!selectedPeminjaman) return;
    
    setIsProcessing(true);
    try {
      await api(`/peminjaman/${selectedPeminjaman.id}/reject`, {
        method: 'PUT',
        data: { alasan_penolakan: rejectionReason }
      });
      
      setSuccess('Peminjaman berhasil ditolak');
      setShowRejectModal(false);
      fetchPeminjaman();
    } catch (err) {
      setError(err.message || 'Gagal menolak peminjaman');
      console.error('Error rejecting peminjaman:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!selectedPeminjaman) return;
    
    setIsProcessing(true);
    try {
      await api(`/peminjaman/${selectedPeminjaman.id}/return`, {
        method: 'PUT',
        data: { 
          catatan_pengembalian: returnNotes,
          kondisi_saat_kembali: returnCondition
        }
      });
      
      setSuccess('Pengembalian berhasil diproses');
      setShowReturnModal(false);
      fetchPeminjaman();
    } catch (err) {
      setError(err.message || 'Gagal memproses pengembalian');
      console.error('Error processing return:', err);
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
      default:
        return 'badge';
    }
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
        <h2 className="text-xl font-bold mb-4">Kelola Peminjaman</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <option value="terlambat">Terlambat</option>
            </select>
          </div>
          
          {/* Search */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pencarian</span>
            </label>
            <input
              type="text"
              placeholder="Cari peminjam atau barang..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
              {[5, 10, 25, 50, 100].map(value => (
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
      
      {/* Table Section */}
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
            <p className="mt-4 text-lg">Tidak ada data peminjaman yang ditemukan</p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Peminjam</th>
                <th>Barang</th>
                <th>Tanggal Pinjam</th>
                <th>Batas Kembali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {peminjaman.map((item) => (
                <tr key={item.id}>
                  <td>{item.user?.name || '-'}</td>
                  <td>{item.barang?.nama || '-'}</td>
                  <td>{formatDate(item.tanggal_pinjam)}</td>
                  <td>{formatDate(item.tanggal_kembali)}</td>
                  <td>
                    <span className={getStatusBadgeClass(item.status)}>
                      {item.status === 'menunggu' ? 'Menunggu' :
                       item.status === 'dipinjam' ? 'Dipinjam' :
                       item.status === 'dikembalikan' ? 'Dikembalikan' :
                       item.status === 'ditolak' ? 'Ditolak' : 'Terlambat'}
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
                        <>
                          <button
                            onClick={() => handleShowApprove(item)}
                            className="btn btn-xs btn-circle btn-ghost text-success"
                            title="Setujui"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleShowReject(item)}
                            className="btn btn-xs btn-circle btn-ghost text-error"
                            title="Tolak"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {item.status === 'dipinjam' && (
                        <button
                          onClick={() => handleShowReturn(item)}
                          className="btn btn-xs btn-circle btn-ghost text-info"
                          title="Proses Pengembalian"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
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
                <h4 className="font-semibold text-sm opacity-70">Peminjam</h4>
                <p>{selectedPeminjaman.user?.name || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Status</h4>
                <span className={getStatusBadgeClass(selectedPeminjaman.status)}>
                  {selectedPeminjaman.status}
                </span>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Barang</h4>
                <p>{selectedPeminjaman.barang?.nama || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kode Barang</h4>
                <p>{selectedPeminjaman.barang?.kode || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Tanggal Pinjam</h4>
                <p>{formatDate(selectedPeminjaman.tanggal_pinjam)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Batas Kembali</h4>
                <p>{formatDate(selectedPeminjaman.tanggal_kembali)}</p>
              </div>
              
              {selectedPeminjaman.tanggal_dikembalikan && (
                <div>
                  <h4 className="font-semibold text-sm opacity-70">Tanggal Dikembalikan</h4>
                  <p>{formatDate(selectedPeminjaman.tanggal_dikembalikan)}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Jumlah</h4>
                <p>{selectedPeminjaman.jumlah || '1'}</p>
              </div>
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
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}></div>
        </div>
      )}
      
      {/* Approve Modal */}
      {showApproveModal && selectedPeminjaman && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Persetujuan</h3>
            <p>
              Apakah Anda yakin ingin menyetujui permintaan peminjaman{' '}
              <span className="font-bold">{selectedPeminjaman.barang?.nama || 'barang'}</span>{' '}
              oleh <span className="font-bold">{selectedPeminjaman.user?.name || 'pengguna'}</span>?
            </p>
            
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowApproveModal(false)}
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                className={`btn btn-primary ${isProcessing ? 'loading' : ''}`}
                onClick={handleApprovePeminjaman}
                disabled={isProcessing}
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs"></span> : null}
                Setujui
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isProcessing && setShowApproveModal(false)}></div>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && selectedPeminjaman && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Penolakan</h3>
            <p className="mb-4">
              Anda akan menolak permintaan peminjaman{' '}
              <span className="font-bold">{selectedPeminjaman.barang?.nama || 'barang'}</span>{' '}
              oleh <span className="font-bold">{selectedPeminjaman.user?.name || 'pengguna'}</span>.
            </p>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Alasan Penolakan</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Berikan alasan penolakan..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="3"
              ></textarea>
            </div>
            
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                className={`btn btn-error ${isProcessing ? 'loading' : ''}`}
                onClick={handleRejectPeminjaman}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs"></span> : null}
                Tolak Peminjaman
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isProcessing && setShowRejectModal(false)}></div>
        </div>
      )}
      
      {/* Return Modal */}
      {showReturnModal && selectedPeminjaman && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Proses Pengembalian</h3>
            <p className="mb-4">
              Anda akan memproses pengembalian{' '}
              <span className="font-bold">{selectedPeminjaman.barang?.nama || 'barang'}</span>{' '}
              dari <span className="font-bold">{selectedPeminjaman.user?.name || 'pengguna'}</span>.
            </p>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Kondisi Barang Saat Dikembalikan</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Catatan Pengembalian (opsional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Tambahkan catatan pengembalian..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows="3"
              ></textarea>
            </div>
            
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowReturnModal(false)}
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                className={`btn btn-primary ${isProcessing ? 'loading' : ''}`}
                onClick={handleProcessReturn}
                disabled={isProcessing}
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs"></span> : null}
                Proses Pengembalian
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isProcessing && setShowReturnModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default PeminjamanManager;