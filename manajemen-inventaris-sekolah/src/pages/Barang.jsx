import React, { useState, useEffect } from 'react';
import { getAllBarang, createBarang, updateBarang, deleteBarang } from '../services/barangService';
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
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  
  // State untuk modal tambah barang
  const [showModal, setShowModal] = useState(false);
  
  // State untuk form
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    deskripsi: '',
    kategori_id: '',
    jumlah: 1,
    jumlah_tersedia: 1,
    kondisi: 'baik',
    lokasi: '',
    tahun_pengadaan: new Date().getFullYear()
  });
  
  // State untuk error validasi
  const [formErrors, setFormErrors] = useState({});

  // State untuk loading saat submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tambahkan state baru
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State untuk notifikasi
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // success, error, warning, info
  });
  
  useEffect(() => {
    console.log("Barang component mounted");
    fetchData();
    fetchKategori();
  }, []);

  // Fungsi untuk mengambil data dari API
  const fetchData = async (search = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Parameter untuk API request
      const params = { 
        search: search
      };
      
      console.log("Fetching barang with params:", params);
      const barangResponse = await getAllBarang(params);
      
      // Simpan data barang
      const items = barangResponse?.data?.data || [];
      setBarang(items);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Gagal memuat data: ${err.message}`);
    } finally {
      setIsLoading(false);
      setSearching(false);
    }
  };
  
  // Fungsi untuk mengambil kategori
  const fetchKategori = async () => {
    try {
      console.log("Fetching kategori...");
      const response = await getAllKategori();
      console.log("Raw kategori response:", response);
      
      // Adaptasi terhadap berbagai format respons
      let kategoriData;
      if (response.data) {
        // Format: { data: [...] }
        kategoriData = response.data;
      } else if (Array.isArray(response)) {
        // Format: [...]
        kategoriData = response;
      } else {
        console.error("Unexpected kategori response format:", response);
        kategoriData = [];
      }
      
      console.log("Processed kategori data:", kategoriData);
      setKategori(kategoriData);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };
  
  // Fungsi untuk menangani pencarian
  const handleSearch = () => {
    setSearching(true);
    setSearchSubmitted(true);
    fetchData(searchTerm);
  };
  
  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === '') {
      setSearchSubmitted(false);
      fetchData('');
    }
  };
  
  // Fungsi untuk membuka modal tambah barang
  const openAddModal = () => {
    // Reset form
    setFormData({
      kode: '',
      nama: '',
      deskripsi: '',
      kategori_id: '',
      jumlah: 1,
      jumlah_tersedia: 1,
      kondisi: 'baik',
      lokasi: '',
      tahun_pengadaan: new Date().getFullYear()
    });
    
    // Reset errors
    setFormErrors({});
    
    // Pastikan kategori sudah diambil (refresh data kategori)
    fetchKategori();
    
    // Buka modal
    setShowModal(true);
  };
  
  // Reset form function
  const resetForm = () => {
    setFormData({
      kode: '',
      nama: '',
      deskripsi: '',
      kategori_id: '',
      jumlah: 1,
      jumlah_tersedia: 1,
      kondisi: 'baik',
      lokasi: '',
      tahun_pengadaan: new Date().getFullYear()
    });
    setFormErrors({});
  };
  
  // Handler untuk perubahan input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Konversi nilai numerik
    const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
    
    // Hapus error untuk field ini jika ada
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Fungsi validasi form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.kode.trim()) errors.kode = "Kode barang wajib diisi";
    if (!formData.nama.trim()) errors.nama = "Nama barang wajib diisi";
    if (!formData.kategori_id) errors.kategori_id = "Kategori wajib dipilih";
    if (!formData.jumlah || formData.jumlah < 1) errors.jumlah = "Jumlah minimal 1";
    if (formData.jumlah_tersedia > formData.jumlah) {
      errors.jumlah_tersedia = "Tidak boleh lebih dari jumlah total";
    }
    if (!formData.lokasi.trim()) errors.lokasi = "Lokasi wajib diisi";
    
    return errors;
  };
  
  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && selectedBarang) {
        // Mode edit: Update barang yang ada
        await updateBarang(selectedBarang.id, formData);
        // Ganti alert dengan notifikasi
        showNotification("Barang berhasil diperbarui");
      } else {
        // Mode tambah: Buat barang baru
        await createBarang(formData);
        // Ganti alert dengan notifikasi
        showNotification("Barang berhasil ditambahkan");
      }
      
      // Tutup modal
      setShowModal(false);
      setIsEditMode(false);
      setSelectedBarang(null);
      
      // Refresh data
      fetchData(searchTerm);
    } catch (err) {
      console.error("Error saving barang:", err);
      
      let errorMessage = isEditMode ? "Gagal memperbarui barang" : "Gagal menambahkan barang";
      if (err.response?.data?.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.message) {
        errorMessage += ": " + err.message;
      }
      
      // Ganti alert dengan notifikasi error
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fungsi untuk membuka modal edit
  const openEditModal = (barang) => {
    // Set barang yang dipilih
    setSelectedBarang(barang);
    setIsEditMode(true);
    
    // Set form data dengan data barang yang dipilih
    setFormData({
      kode: barang.kode || '',
      nama: barang.nama || '',
      deskripsi: barang.deskripsi || '',
      kategori_id: barang.kategori_id || barang.kategori?.id || '',
      jumlah: barang.jumlah || 1,
      jumlah_tersedia: barang.jumlah_tersedia || 1,
      kondisi: barang.kondisi || 'baik',
      lokasi: barang.lokasi || '',
      tahun_pengadaan: barang.tahun_pengadaan || new Date().getFullYear()
    });
    
    // Reset errors
    setFormErrors({});
    
    // Buka modal
    setShowModal(true);
    
    // Pastikan kategori sudah diambil
    if (kategori.length === 0) {
      fetchKategori();
    }
  };
  
  // Fungsi untuk konfirmasi delete
  const openDeleteConfirm = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };
  
  // Fungsi untuk menghapus barang
  const handleDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    
    try {
      await deleteBarang(deletingId);
      
      // Refresh data
      fetchData(searchTerm);
      
      // Tutup konfirmasi
      setShowDeleteConfirm(false);
      setDeletingId(null);
      
      // Ganti alert dengan notifikasi
      showNotification("Barang berhasil dihapus");
    } catch (err) {
      console.error("Error deleting barang:", err);
      
      let errorMessage = "Gagal menghapus barang";
      if (err.response?.data?.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.message) {
        errorMessage += ": " + err.message;
      }
      
      // Ganti alert dengan notifikasi error
      showNotification(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Helper function untuk menampilkan notifikasi
  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({...prev, show: false}));
    }, 3000);
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
                setSearchSubmitted(false);
                fetchData('');
              }}
            >
              Reset
            </button>
          )}
        </div>
        
        <button 
          className="btn btn-success"
          onClick={openAddModal}
        >
          Tambah Barang
        </button>
      </div>
      
      {/* Status pencarian */}
      {searchTerm && searchSubmitted && !isLoading && (
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
                      <td>{index + 1}</td>
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
                          <button 
                            className="btn btn-xs btn-warning"
                            onClick={() => openEditModal(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-xs btn-error"
                            onClick={() => openDeleteConfirm(item.id)}
                          >
                            Hapus
                          </button>
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
        </>
      )}
      
      {/* Modal Tambah/Edit Barang dengan desain yang lebih baik */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-10 bg-black bg-opacity-60">
          <div className="relative bg-base-200 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-base-300">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-base-300 bg-base-300 rounded-t-lg">
              <h2 className="text-xl font-bold text-base-content">
                {isEditMode ? 'Edit Barang' : 'Tambah Barang Baru'}
              </h2>
              <button 
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={() => {
                  setShowModal(false);
                  setIsEditMode(false);
                  setSelectedBarang(null);
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Body Modal */}
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {/* Kode Barang */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Kode Barang</span>
                    </label>
                    <input 
                      type="text" 
                      name="kode" 
                      placeholder="Masukkan kode barang"
                      className={`input input-bordered input-sm ${formErrors.kode ? 'input-error' : ''}`}
                      value={formData.kode}
                      onChange={handleChange}
                    />
                    {formErrors.kode && (
                      <label className="label py-0">
                        <span className="label-text-alt text-error text-xs">{formErrors.kode}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Nama Barang */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Nama Barang</span>
                    </label>
                    <input 
                      type="text" 
                      name="nama" 
                      placeholder="Masukkan nama barang"
                      className={`input input-bordered input-sm ${formErrors.nama ? 'input-error' : ''}`}
                      value={formData.nama}
                      onChange={handleChange}
                    />
                    {formErrors.nama && (
                      <label className="label py-0">
                        <span className="label-text-alt text-error text-xs">{formErrors.nama}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Kategori */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Kategori</span>
                      {/* Tambahkan tombol refresh untuk memudahkan debugging */}
                      <button 
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          fetchKategori();
                        }}
                        title="Refresh kategori"
                      >
                        ↻
                      </button>
                    </label>
                    
                    <select 
                      name="kategori_id" 
                      className={`select select-bordered select-sm ${formErrors.kategori_id ? 'select-error' : ''}`}
                      value={formData.kategori_id}
                      onChange={handleChange}
                    >
                      <option value="">Pilih Kategori</option>
                      {console.log("Rendering kategori dropdown with data:", kategori)}
                      {kategori && kategori.length > 0 ? (
                        kategori.map((kat, index) => (
                          <option key={kat.id || kat._id || index} value={kat.id || kat._id}>
                            {kat.nama || kat.name || `Kategori ${index + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Tidak ada kategori tersedia</option>
                      )}
                    </select>
                    
                    {/* Menampilkan debug info jika tidak ada kategori */}
                    {(!kategori || kategori.length === 0) && (
                      <div className="text-xs text-warning mt-1">
                        Tidak ada data kategori. Coba refresh halaman.
                      </div>
                    )}
                    
                    {formErrors.kategori_id && (
                      <label className="label py-0">
                        <span className="label-text-alt text-error text-xs">{formErrors.kategori_id}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Jumlah */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Jumlah Total</span>
                    </label>
                    <input 
                      type="number" 
                      name="jumlah" 
                      min="1"
                      className={`input input-bordered input-sm ${formErrors.jumlah ? 'input-error' : ''}`}
                      value={formData.jumlah}
                      onChange={handleChange}
                    />
                    {formErrors.jumlah && (
                      <label className="label py-0">
                        <span className="label-text-alt text-error text-xs">{formErrors.jumlah}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Jumlah Tersedia */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Jumlah Tersedia</span>
                    </label>
                    <input 
                      type="number" 
                      name="jumlah_tersedia" 
                      min="0"
                      max={formData.jumlah}
                      className={`input input-bordered input-sm ${formErrors.jumlah_tersedia ? 'input-error' : ''}`}
                      value={formData.jumlah_tersedia}
                      onChange={handleChange}
                    />
                    {formErrors.jumlah_tersedia && (
                      <label className="label py-0">
                        <span className="label-text-alt text-error text-xs">{formErrors.jumlah_tersedia}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Kondisi */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Kondisi</span>
                    </label>
                    <select 
                      name="kondisi" 
                      className="select select-bordered select-sm"
                      value={formData.kondisi}
                      onChange={handleChange}
                    >
                      <option value="baik">Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="rusak_berat">Rusak Berat</option>
                    </select>
                  </div>
                  
                  {/* Lokasi */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Lokasi</span>
                    </label>
                    <input 
                      type="text" 
                      name="lokasi" 
                      placeholder="Masukkan lokasi penyimpanan"
                      className={`input input-bordered input-sm ${formErrors.lokasi ? 'input-error' : ''}`}
                      value={formData.lokasi}
                      onChange={handleChange}
                    />
                    {formErrors.lokasi && (
                      <label className="label py-0">
                        <span className="label-text-alt text-error text-xs">{formErrors.lokasi}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Tahun Pengadaan */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Tahun Pengadaan</span>
                    </label>
                    <input 
                      type="number" 
                      name="tahun_pengadaan" 
                      min="2000"
                      max={new Date().getFullYear()}
                      className="input input-bordered input-sm"
                      value={formData.tahun_pengadaan}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* Deskripsi - full width */}
                  <div className="form-control col-span-1 md:col-span-2">
                    <label className="label py-1">
                      <span className="label-text font-medium">Deskripsi</span>
                    </label>
                    <textarea 
                      name="deskripsi" 
                      placeholder="Masukkan deskripsi barang (opsional)"
                      className="textarea textarea-bordered text-sm h-20"
                      value={formData.deskripsi}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
                
                {/* Tombol aksi */}
                <div className="flex justify-end mt-5 border-t border-base-300 pt-4">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline mr-2" 
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-sm btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>
              
              {/* Debug info - tambahkan di modal */}
              <div className="text-xs mt-4 p-2 bg-base-300 rounded">
                <details>
                  <summary>Debug Info</summary>
                  <p>Kategori state: {JSON.stringify(kategori)}</p>
                  <p>Kategori length: {kategori ? kategori.length : 'undefined'}</p>
                  <p>Kategori type: {kategori ? Array.isArray(kategori) ? 'Array' : typeof kategori : 'undefined'}</p>
                  <button className="btn btn-xs mt-2" onClick={fetchKategori}>Reload Kategori</button>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md mx-4 border border-base-300">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6">Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.</p>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button 
                className="btn btn-sm btn-error" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  'Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifikasi */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 toast toast-${notification.type}`}>
          <div className="alert alert-${notification.type} shadow-lg">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{notification.message}</span>
            </div>
            <div className="flex-none">
              <button className="btn btn-sm btn-ghost" onClick={() => setNotification({ ...notification, show: false })}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Barang;