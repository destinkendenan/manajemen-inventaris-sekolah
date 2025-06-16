import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';

const PengembalianManager = () => {
  const [peminjamanAktif, setPeminjamanAktif] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter and search states
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTerlambat, setIsTerlambat] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Modal states
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('baik');
  
  // Form processing state
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPeminjamanAktif();
  }, [currentPage, perPage, isTerlambat]);

  useEffect(() => {
    if (search || startDate || endDate) {
      const delayDebounce = setTimeout(() => {
        fetchPeminjamanAktif();
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [search, startDate, endDate]);

  const fetchPeminjamanAktif = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        status: 'dipinjam',
      };
      
      if (search) params.search = search;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (isTerlambat) params.terlambat = true;
      
      const response = await api('/peminjaman', { params });
      setPeminjamanAktif(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (err) {
      setError('Gagal memuat data peminjaman aktif. Silakan coba lagi.');
      console.error('Error fetching active peminjaman:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setIsTerlambat(false);
    setCurrentPage(1);
  };

  const handleShowDetail = (item) => {
    setSelectedPeminjaman(item);
    setShowDetailModal(true);
  };

  const handleShowReturn = (item) => {
    setSelectedPeminjaman(item);
    setReturnNotes('');
    setReturnCondition('baik');
    setShowReturnModal(true);
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
      fetchPeminjamanAktif();
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

  // Check if a peminjaman is terlambat (overdue)
  const isTerlambatFunc = (item) => {
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
        <h2 className="text-xl font-bold mb-4">Kelola Pengembalian</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tampilkan</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer label justify-start gap-2">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-error checkbox-sm" 
                  checked={isTerlambat}
                  onChange={(e) => setIsTerlambat(e.target.checked)}
                />
                <span className="label-text">Hanya Terlambat</span>
              </label>
            </div>
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
        ) : peminjamanAktif.length === 0 ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-lg">Tidak ada peminjaman aktif yang ditemukan</p>
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
              {peminjamanAktif.map((item) => (
                <tr key={item.id} className={isTerlambatFunc(item) ? 'bg-error bg-opacity-10' : ''}>
                  <td>{item.user?.name || '-'}</td>
                  <td>{item.barang?.nama || '-'}</td>
                  <td>{formatDate(item.tanggal_pinjam)}</td>
                  <td>
                    {formatDate(item.tanggal_kembali)}
                    {isTerlambatFunc(item) && (
                      <div className="badge badge-error badge-sm ml-2" title="Hari terlambat">
                        +{calculateDaysTerlambat(item)} hari
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${isTerlambatFunc(item) ? 'badge-error' : 'badge-info'}`}>
                      {isTerlambatFunc(item) ? 'Terlambat' : 'Dipinjam'}
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
                      
                      <button
                        onClick={() => handleShowReturn(item)}
                        className="btn btn-xs btn-primary btn-circle"
                        title="Proses Pengembalian"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {!loading && peminjamanAktif.length > 0 && (
          <div className="flex justify-between items-center p-4">
            <span className="text-sm">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, peminjamanAktif.length + ((currentPage - 1) * perPage))} dari total {peminjamanAktif.length + ((currentPage - 1) * perPage)} data
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
                <span className={`badge ${isTerlambatFunc(selectedPeminjaman) ? 'badge-error' : 'badge-info'}`}>
                  {isTerlambatFunc(selectedPeminjaman) ? 'Terlambat' : 'Dipinjam'}
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
                {isTerlambatFunc(selectedPeminjaman) && (
                  <div className="badge badge-error badge-sm" title="Hari terlambat">
                    Terlambat {calculateDaysTerlambat(selectedPeminjaman)} hari
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Jumlah</h4>
                <p>{selectedPeminjaman.jumlah || '1'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kondisi saat dipinjam</h4>
                <p>{selectedPeminjaman.kondisi_saat_dipinjam === 'baik' ? 'Baik' : 
                   selectedPeminjaman.kondisi_saat_dipinjam === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}</p>
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
            
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailModal(false);
                  handleShowReturn(selectedPeminjaman);
                }}
              >
                Proses Pengembalian
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}></div>
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
            
            {isTerlambatFunc(selectedPeminjaman) && (
              <div className="alert alert-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  Peminjaman ini terlambat {calculateDaysTerlambat(selectedPeminjaman)} hari dari batas waktu pengembalian!
                </span>
              </div>
            )}
            
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

export default PengembalianManager;