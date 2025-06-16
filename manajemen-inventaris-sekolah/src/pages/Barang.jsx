import React, { useState, useEffect } from 'react';
import { getAllBarang } from '../services/barangService';
import { getAllKategori } from '../services/kategoriService';

const Barang = () => {
  // State dasar
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  // Load data saat komponen dimount
  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk mengambil data dari API
  const fetchData = async (search = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Parameter untuk API request
      const params = { 
        page: currentPage, 
        limit: itemsPerPage,
        search: search  // Parameter search dikirim ke API
      };
      
      console.log("Fetching barang with search:", search);
      const barangResponse = await getAllBarang(params);
      
      // Simpan data barang
      setBarang(barangResponse?.data?.data || []);
      
      // Update total pages jika ada pagination
      if (barangResponse?.data?.pagination) {
        setTotalPages(barangResponse.data.pagination.totalPages || 1);
      }
      
      // Load kategori hanya sekali
      if (kategori.length === 0) {
        const kategoriResponse = await getAllKategori();
        setKategori(kategoriResponse?.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
      setSearching(false);
    }
  };
  
  // Fungsi untuk menangani pencarian
  const handleSearch = () => {
    setSearching(true);
    setCurrentPage(1); // Reset ke halaman pertama saat pencarian baru
    fetchData(searchTerm);
  };
  
  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Jika input kosong, otomatis fetch semua data
    if (value === '') {
      setCurrentPage(1); // Reset ke halaman pertama
      fetchData(''); // Fetch semua data tanpa filter
    }
  };
  
  // Render UI
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Barang</h1>
      
      {/* Search bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex">
          <input 
            type="text" 
            placeholder="Cari kode, nama, atau kategori..." 
            className="input input-bordered w-full max-w-xs" 
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn btn-primary ml-2"
            onClick={handleSearch}
            disabled={searching || searchTerm === ''}
          >
            {searching ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <span>Cari</span>
            )}
          </button>
          {searchTerm && (
            <button 
              className="btn btn-ghost ml-1"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
                fetchData('');
              }}
            >
              Reset
            </button>
          )}
        </div>
        
        <button className="btn btn-success">
          Tambah Barang
        </button>
      </div>
      
      {/* Status pencarian */}
      {searchTerm && !isLoading && (
        <div className="mb-4 p-2 bg-base-200 rounded-lg">
          <p className="text-base-content">
            {barang.length > 0 ? (
              <>Hasil pencarian untuk: <span className="font-bold">{searchTerm}</span> ({barang.length} item ditemukan)</>
            ) : (
              <>Tidak ditemukan hasil untuk: <span className="font-bold">{searchTerm}</span></>
            )}
          </p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {/* Data table */}
          {Array.isArray(barang) && barang.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Lokasi</th>
                    <th>Kondisi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.kode || "-"}</td>
                      <td>{item.nama || "-"}</td>
                      <td>{item.kategori?.nama || "-"}</td>
                      <td>{item.jumlah || 0} / {item.jumlah_tersedia || 0}</td>
                      <td>{item.lokasi || "-"}</td>
                      <td>
                        <span className={`badge ${
                          item.kondisi === 'baik' ? 'badge-success' : 
                          item.kondisi === 'rusak_ringan' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {item.kondisi === 'baik' ? 'Baik' : 
                           item.kondisi === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-1">
                          <button className="btn btn-xs btn-info">Detail</button>
                          <button className="btn btn-xs btn-warning">Edit</button>
                          <button className="btn btn-xs btn-error">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>
                {searchTerm 
                  ? `Tidak ada barang yang cocok dengan kata kunci "${searchTerm}"` 
                  : "Tidak ada data barang tersedia"}
              </span>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="btn-group">
                <button 
                  className="btn" 
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    fetchData(searchTerm);
                  }}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                <button className="btn">Halaman {currentPage} dari {totalPages}</button>
                <button 
                  className="btn" 
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    fetchData(searchTerm);
                  }}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Barang;