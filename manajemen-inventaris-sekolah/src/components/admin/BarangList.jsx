import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ErrorAlert from '../common/ErrorAlert';
import { api } from '../../services/api';

const BarangList = ({ onEdit, onDelete, onView }) => {
  const { user } = useAuth();
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [kategoriList, setKategoriList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchKategori();
    fetchBarang();
  }, [currentPage, perPage, sortBy, sortOrder, kategoriFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search !== '') {
        fetchBarang();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchKategori = async () => {
    try {
      const response = await api('/kategori');
      setKategoriList(response.data || []);
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
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search) {
        params.search = search;
      }

      if (kategoriFilter) {
        params.kategori_id = kategoriFilter;
      }

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

  const handleReset = () => {
    setSearch('');
    setKategoriFilter('');
    setSortBy('updated_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Format tanggal ke format Indonesia
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Rendering indikator sort
  const renderSortIndicator = (field) => {
    if (sortBy !== field) return null;
    
    return sortOrder === 'asc' 
      ? <span className="ml-1">▲</span> 
      : <span className="ml-1">▼</span>;
  };

  return (
    <div className="w-full">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      {/* Filter and Search */}
      <div className="bg-base-100 p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="form-control flex-1">
            <div className="input-group">
              <input
                type="text"
                placeholder="Cari nama atau kode barang..."
                className="input input-bordered w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-square" onClick={fetchBarang}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="form-control md:w-64">
            <select
              className="select select-bordered w-full"
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map(kategori => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-outline" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="flex justify-between items-center">
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
          
          {user?.role === 'admin' && (
            <Link to="/barang/tambah" className="btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Barang
            </Link>
          )}
        </div>
      </div>

      {/* Tabel Barang */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : barang.length === 0 ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-lg">Tidak ada data barang yang ditemukan</p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="cursor-pointer" onClick={() => handleSort('kode')}>
                  Kode {renderSortIndicator('kode')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort('nama')}>
                  Nama Barang {renderSortIndicator('nama')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort('kategori_id')}>
                  Kategori {renderSortIndicator('kategori_id')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort('jumlah')}>
                  Jumlah {renderSortIndicator('jumlah')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort('kondisi')}>
                  Kondisi {renderSortIndicator('kondisi')}
                </th>
                <th className="cursor-pointer" onClick={() => handleSort('updated_at')}>
                  Terakhir Diperbarui {renderSortIndicator('updated_at')}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barang.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="font-mono">{item.kode}</span>
                  </td>
                  <td>{item.nama}</td>
                  <td>{item.kategori?.nama || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.jumlah}</span>
                      {item.jumlah_tersedia < item.jumlah && (
                        <div className="badge badge-info badge-sm" title="Jumlah tersedia">
                          {item.jumlah_tersedia}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`badge ${
                        item.kondisi === 'baik' ? 'badge-success' : 
                        item.kondisi === 'rusak_ringan' ? 'badge-warning' : 'badge-error'
                      }`}
                    >
                      {item.kondisi === 'baik' ? 'Baik' : 
                       item.kondisi === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}
                    </span>
                  </td>
                  <td>{formatDate(item.updated_at)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onView(item)}
                        className="btn btn-xs btn-circle btn-ghost"
                        title="Detail"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {user?.role === 'admin' && (
                        <>
                          <button 
                            onClick={() => onEdit(item)}
                            className="btn btn-xs btn-circle btn-ghost"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          <button 
                            onClick={() => onDelete(item)}
                            className="btn btn-xs btn-circle btn-ghost text-error"
                            title="Hapus"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                // Only show a limited number of page buttons
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
    </div>
  );
};

export default BarangList;