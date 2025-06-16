import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const DaftarBarang = () => {
  const { user } = useAuth();
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and search states
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [kondisiFilter, setKondisiFilter] = useState('');
  const [tersediaFilter, setTersediaFilter] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Detail modal state
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Peminjaman modal state
  const [showPeminjamanModal, setShowPeminjamanModal] = useState(false);
  const [peminjamanData, setPeminjamanData] = useState({
    tanggal_pinjam: '',
    tanggal_kembali: '',
    jumlah: 1,
    keperluan: '',
    catatan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [peminjamanError, setPeminjamanError] = useState(null);
  const [peminjamanSuccess, setPeminjamanSuccess] = useState(null);

  useEffect(() => {
    fetchKategori();
    fetchBarang();
  }, [currentPage, perPage, tersediaFilter, kategoriFilter, kondisiFilter]);

  useEffect(() => {
    if (search) {
      const delayDebounce = setTimeout(() => {
        fetchBarang();
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [search]);

  const fetchKategori = async () => {
    try {
      const response = await api('/kategori', { params: { per_page: 100 } });
      setKategori(response.data || []);
    } catch (err) {
      console.error('Error fetching kategori:', err);
    }
  };

  const fetchBarang = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage
      };
      
      if (search) params.search = search;
      if (kategoriFilter) params.kategori_id = kategoriFilter;
      if (kondisiFilter) params.kondisi = kondisiFilter;
      if (tersediaFilter) params.tersedia = true;
      
      const response = await api('/barang', { params });
      setBarang(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (err) {
      setError('Gagal memuat data barang. Silakan coba lagi.');
      console.error('Error fetching barang:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearch('');
    setKategoriFilter('');
    setKondisiFilter('');
    setTersediaFilter(true);
    setCurrentPage(1);
  };

  const handleShowDetail = (item) => {
    setSelectedBarang(item);
    setShowDetailModal(true);
  };

  const handleShowPeminjaman = (item) => {
    // Set default dates
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formattedToday = today.toISOString().split('T')[0];
    const formattedNextWeek = nextWeek.toISOString().split('T')[0];

    setSelectedBarang(item);
    setPeminjamanData({
      tanggal_pinjam: formattedToday,
      tanggal_kembali: formattedNextWeek,
      jumlah: 1,
      keperluan: '',
      catatan: ''
    });
    setShowPeminjamanModal(true);
    setPeminjamanError(null);
  };

  const handlePeminjamanInputChange = (e) => {
    const { name, value } = e.target;
    setPeminjamanData({
      ...peminjamanData,
      [name]: value
    });
  };

  const handleSubmitPeminjaman = async (e) => {
    e.preventDefault();
    
    if (!peminjamanData.keperluan.trim()) {
      setPeminjamanError('Keperluan peminjaman tidak boleh kosong');
      return;
    }
    
    setIsSubmitting(true);
    setPeminjamanError(null);
    
    try {
      await api('/peminjaman', {
        method: 'POST',
        data: {
          ...peminjamanData,
          barang_id: selectedBarang.id
        }
      });
      
      setPeminjamanSuccess('Permintaan peminjaman berhasil dikirim. Silakan tunggu persetujuan dari admin.');
      setTimeout(() => {
        setShowPeminjamanModal(false);
        setPeminjamanSuccess(null);
        fetchBarang(); // Refresh the data
      }, 2000);
    } catch (err) {
      setPeminjamanError(err.message || 'Gagal membuat permintaan peminjaman');
      console.error('Error submitting peminjaman:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getKondisiLabel = (kondisi) => {
    switch (kondisi) {
      case 'baik':
        return 'Baik';
      case 'rusak_ringan':
        return 'Rusak Ringan';
      case 'rusak_berat':
        return 'Rusak Berat';
      default:
        return kondisi;
    }
  };

  return (
    <div className="w-full">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Daftar Barang</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pencarian</span>
            </label>
            <input
              type="text"
              placeholder="Cari nama atau kode barang..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Kategori Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Kategori</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategori.map(kat => (
                <option key={kat.id} value={kat.id}>{kat.nama}</option>
              ))}
            </select>
          </div>
          
          {/* Kondisi Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Kondisi</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={kondisiFilter}
              onChange={(e) => setKondisiFilter(e.target.value)}
            >
              <option value="">Semua Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak_ringan">Rusak Ringan</option>
              <option value="rusak_berat">Rusak Berat</option>
            </select>
          </div>
          
          {/* Tersedia Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Ketersediaan</span>
            </label>
            <div className="flex items-center h-12">
              <label className="cursor-pointer label justify-start gap-2">
                <input 
                  type="checkbox" 
                  className="checkbox" 
                  checked={tersediaFilter}
                  onChange={(e) => setTersediaFilter(e.target.checked)}
                />
                <span className="label-text">Hanya tampilkan yang tersedia</span>
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
              {[10, 20, 50, 100].map(value => (
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
      
      {/* Barang List */}
      <div className="bg-base-100 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : barang.length === 0 ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-lg">Tidak ada barang yang ditemukan</p>
          </div>
        ) : (
          <div>
            {/* Grid view for larger screens */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {barang.map((item) => (
                <div key={item.id} className="card bg-base-100 shadow-md border hover:shadow-lg transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title text-base">{item.nama}</h3>
                      <span className={getKondisiBadgeClass(item.kondisi)}>
                        {getKondisiLabel(item.kondisi)}
                      </span>
                    </div>
                    
                    <p className="text-sm opacity-70 mt-1">Kode: {item.kode}</p>
                    
                    <div className="mt-2 text-sm">
                      <p>Kategori: {item.kategori?.nama || '-'}</p>
                      <p>Tersedia: {item.jumlah_tersedia} dari {item.jumlah}</p>
                      {item.lokasi && <p>Lokasi: {item.lokasi}</p>}
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleShowDetail(item)}
                      >
                        Detail
                      </button>
                      {user && item.jumlah_tersedia > 0 && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleShowPeminjaman(item)}
                        >
                          Pinjam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Table view for mobile */}
            <div className="md:hidden overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Tersedia</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-bold">{item.nama}</div>
                        <div className="text-xs opacity-70">
                          Kode: {item.kode}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {item.jumlah_tersedia} / {item.jumlah}
                        </div>
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
                          
                          {user && item.jumlah_tersedia > 0 && (
                            <button
                              onClick={() => handleShowPeminjaman(item)}
                              className="btn btn-xs btn-circle btn-primary"
                              title="Pinjam"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && barang.length > 0 && (
          <div className="flex justify-between items-center p-4">
            <span className="text-sm">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, barang.length + ((currentPage - 1) * perPage))} dari total {barang.length + ((currentPage - 1) * perPage)} data
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
      {showDetailModal && selectedBarang && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">Detail Barang</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-sm opacity-70">Nama Barang</h4>
                <p className="text-lg font-bold">{selectedBarang.nama}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kode Barang</h4>
                <p className="font-mono">{selectedBarang.kode}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kategori</h4>
                <p>{selectedBarang.kategori?.nama || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Kondisi</h4>
                <span className={getKondisiBadgeClass(selectedBarang.kondisi)}>
                  {getKondisiLabel(selectedBarang.kondisi)}
                </span>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Jumlah Total</h4>
                <p>{selectedBarang.jumlah}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm opacity-70">Jumlah Tersedia</h4>
                <p>{selectedBarang.jumlah_tersedia}</p>
              </div>
              
              {selectedBarang.lokasi && (
                <div>
                  <h4 className="font-semibold text-sm opacity-70">Lokasi</h4>
                  <p>{selectedBarang.lokasi}</p>
                </div>
              )}
              
              {selectedBarang.tahun_pengadaan && (
                <div>
                  <h4 className="font-semibold text-sm opacity-70">Tahun Pengadaan</h4>
                  <p>{selectedBarang.tahun_pengadaan}</p>
                </div>
              )}
            </div>
            
            {selectedBarang.deskripsi && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm opacity-70">Deskripsi</h4>
                <p className="whitespace-pre-line">{selectedBarang.deskripsi}</p>
              </div>
            )}
            
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
              
              {user && selectedBarang.jumlah_tersedia > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleShowPeminjaman(selectedBarang);
                  }}
                >
                  Pinjam Barang
                </button>
              )}
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}></div>
        </div>
      )}
      
      {/* Peminjaman Modal */}
      {showPeminjamanModal && selectedBarang && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Form Peminjaman Barang</h3>
            
            <div className="mb-4">
              <p>
                Anda akan meminjam <span className="font-bold">{selectedBarang.nama}</span> ({selectedBarang.kode})
              </p>
            </div>
            
            {peminjamanError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{peminjamanError}</span>
              </div>
            )}
            
            {peminjamanSuccess && (
              <div className="alert alert-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{peminjamanSuccess}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmitPeminjaman}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Tanggal Pinjam */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tanggal Pinjam</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_pinjam"
                    value={peminjamanData.tanggal_pinjam}
                    onChange={handlePeminjamanInputChange}
                    className="input input-bordered w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Tanggal Kembali */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tanggal Kembali</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_kembali"
                    value={peminjamanData.tanggal_kembali}
                    onChange={handlePeminjamanInputChange}
                    className="input input-bordered w-full"
                    min={peminjamanData.tanggal_pinjam}
                  />
                </div>
                
                {/* Jumlah */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Jumlah</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah"
                    value={peminjamanData.jumlah}
                    onChange={handlePeminjamanInputChange}
                    className="input input-bordered w-full"
                    min="1"
                    max={selectedBarang.jumlah_tersedia}
                  />
                  <label className="label">
                    <span className="label-text-alt">Maksimal {selectedBarang.jumlah_tersedia}</span>
                  </label>
                </div>
              </div>
              
              {/* Keperluan */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Keperluan</span>
                </label>
                <textarea
                  name="keperluan"
                  value={peminjamanData.keperluan}
                  onChange={handlePeminjamanInputChange}
                  className="textarea textarea-bordered"
                  placeholder="Jelaskan keperluan peminjaman..."
                  rows="3"
                  required
                ></textarea>
              </div>
              
              {/* Catatan */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Catatan (opsional)</span>
                </label>
                <textarea
                  name="catatan"
                  value={peminjamanData.catatan}
                  onChange={handlePeminjamanInputChange}
                  className="textarea textarea-bordered"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows="2"
                ></textarea>
              </div>
              
              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>
                  Permintaan peminjaman Anda perlu disetujui oleh admin sebelum barang dapat dipinjam.
                </span>
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPeminjamanModal(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || peminjamanSuccess}
                >
                  {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : null}
                  Ajukan Peminjaman
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => !isSubmitting && !peminjamanSuccess && setShowPeminjamanModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default DaftarBarang;