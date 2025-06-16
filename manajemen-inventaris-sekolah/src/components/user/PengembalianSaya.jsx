import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';
import useAuth from '../../hooks/useAuth';

const PengembalianSaya = () => {
  const { user } = useAuth();
  const [pengembalian, setPengembalian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kondisiFilter, setKondisiFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Detail modal state
  const [selectedPengembalian, setSelectedPengembalian] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPengembalian();
  }, [currentPage, perPage, kondisiFilter, startDate, endDate]);

  const fetchPengembalian = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        user_id: user.id,
        status: 'dikembalikan', // Only fetch returned items
      };
      
      if (kondisiFilter) params.kondisi_saat_kembali = kondisiFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api('/peminjaman', { params });
      setPengembalian(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (err) {
      setError('Gagal memuat data pengembalian. Silakan coba lagi.');
      console.error('Error fetching pengembalian:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setKondisiFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowDetail = (item) => {
    setSelectedPengembalian(item);
    setShowDetailModal(true);
  };

  // Format date to locale string
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get kondisi badge class
  const getKondisiBadgeClass = (kondisi) => {
    switch (kondisi) {
      case 'baik':
        return 'badge badge-success';
      case 'rusak_ringan':
        return 'badge badge-warning';
      case 'rusak_berat':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  // Get kondisi label
  const getKondisiLabel = (kondisi) => {
    switch (kondisi) {
      case 'baik':
        return 'Baik';
      case 'rusak_ringan':
        return 'Rusak Ringan';
      case 'rusak_berat':
        return 'Rusak Berat';
      default:
        return kondisi || '-';
    }
  };

  // Calculate duration of loan in days
  const calculateDurasiPinjam = (item) => {
    if (!item.tanggal_pinjam || !item.tanggal_dikembalikan) return '-';
    
    const pinjamDate = new Date(item.tanggal_pinjam);
    const kembaliDate = new Date(item.tanggal_dikembalikan);
    const diffTime = Math.abs(kembaliDate - pinjamDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} hari`;
  };

  // Check if item was returned late
  const isTerlambat = (item) => {
    if (!item.tanggal_kembali || !item.tanggal_dikembalikan) return false;
    
    const batasKembali = new Date(item.tanggal_kembali);
    const tanggalDikembalikan = new Date(item.tanggal_dikembalikan);
    
    return tanggalDikembalikan > batasKembali;
  };

  // Calculate days overdue
  const calculateDaysTerlambat = (item) => {
    if (!isTerlambat(item)) return 0;
    
    const batasKembali = new Date(item.tanggal_kembali);
    const tanggalDikembalikan = new Date(item.tanggal_dikembalikan);
    
    const diffTime = Math.abs(tanggalDikembalikan - batasKembali);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="w-full">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Riwayat Pengembalian</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Kondisi Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Kondisi Saat Kembali</span>
            </label>
            <select
              value={kondisiFilter}
              onChange={(e) => setKondisiFilter(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Semua Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak_ringan">Rusak Ringan</option>
              <option value="rusak_berat">Rusak Berat</option>
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
      
      {/* Pengembalian Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : pengembalian.length === 0 ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-lg">Belum ada riwayat pengembalian</p>
            <p className="mt-2 text-gray-500">
              Anda belum pernah mengembalikan barang yang dipinjam.
            </p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Barang</th>
                <th className="hidden md:table-cell">Tanggal Dikembalikan</th>
                <th className="hidden md:table-cell">Durasi Pinjam</th>
                <th>Kondisi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengembalian.map((item) => (
                <tr key={item.id} className={isTerlambat(item) ? 'bg-warning bg-opacity-10' : ''}>
                  <td>
                    <div className="font-bold">{item.barang?.nama || '-'}</div>
                    <div className="text-xs opacity-70">
                      Kode: {item.barang?.kode || '-'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    {formatDate(item.tanggal_dikembalikan)}
                    {isTerlambat(item) && (
                      <div className="badge badge-warning badge-sm ml-2" title="Hari terlambat">
                        Terlambat {calculateDaysTerlambat(item)} hari
                      </div>
                    )}
                  </td>
                  <td className="hidden md:table-cell">{calculateDurasiPinjam(item)}</td>
                  <td>
                    <span className={getKondisiBadgeClass(item.kondisi_saat_kembali)}>
                      {getKondisiLabel(item.kondisi_saat_kembali)}
                    </span>
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {!loading && pengembalian.length > 0 && (
          <div className="flex justify-between items-center p-4">
            <span className="text-sm">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pengembalian.length + ((currentPage - 1) * perPage))} dari total {pengembalian.length + ((currentPage - 1) * perPage)} data
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
      {showDetailModal && selectedPengembalian && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Detail Pengembalian</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-sm opacity-70">Barang</h4>
                <p>{selectedPengembalian.barang?.nama || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kode Barang</h4>
                <p>{selectedPengembalian.barang?.kode || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Tanggal Pinjam</h4>
                <p>{formatDate(selectedPengembalian.tanggal_pinjam)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Batas Kembali</h4>
                <p>{formatDate(selectedPengembalian.tanggal_kembali)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Tanggal Dikembalikan</h4>
                <p>{formatDate(selectedPengembalian.tanggal_dikembalikan)}</p>
                {isTerlambat(selectedPengembalian) && (
                  <div className="badge badge-warning badge-sm" title="Hari terlambat">
                    Terlambat {calculateDaysTerlambat(selectedPengembalian)} hari
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Durasi Peminjaman</h4>
                <p>{calculateDurasiPinjam(selectedPengembalian)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Jumlah</h4>
                <p>{selectedPengembalian.jumlah || '1'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kondisi saat dipinjam</h4>
                <p>{getKondisiLabel(selectedPengembalian.kondisi_saat_dipinjam)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kondisi saat dikembalikan</h4>
                <span className={getKondisiBadgeClass(selectedPengembalian.kondisi_saat_kembali)}>
                  {getKondisiLabel(selectedPengembalian.kondisi_saat_kembali)}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-sm opacity-70">Keperluan</h4>
              <p>{selectedPengembalian.keperluan || '-'}</p>
            </div>
            
            {selectedPengembalian.catatan && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm opacity-70">Catatan Peminjaman</h4>
                <p>{selectedPengembalian.catatan}</p>
              </div>
            )}
            
            {selectedPengembalian.catatan_pengembalian && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm opacity-70">Catatan Pengembalian</h4>
                <p>{selectedPengembalian.catatan_pengembalian}</p>
              </div>
            )}
            
            {/* Change in condition warning */}
            {selectedPengembalian.kondisi_saat_dipinjam !== selectedPengembalian.kondisi_saat_kembali && (
              <div className="alert alert-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  Terjadi perubahan kondisi barang dari saat dipinjam ({getKondisiLabel(selectedPengembalian.kondisi_saat_dipinjam)}) 
                  menjadi saat dikembalikan ({getKondisiLabel(selectedPengembalian.kondisi_saat_kembali)}).
                </span>
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
    </div>
  );
};

export default PengembalianSaya;