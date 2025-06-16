import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';

const KategoriManager = () => {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ nama: '', deskripsi: '' });
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchKategori();
  }, [currentPage, perPage]);

  useEffect(() => {
    if (search) {
      const delayDebounce = setTimeout(() => {
        fetchKategori();
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [search]);

  const fetchKategori = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await api('/kategori', { params });
      setKategori(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (err) {
      setError('Gagal memuat data kategori. Silakan coba lagi.');
      console.error('Error fetching kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nama.trim()) {
      errors.nama = 'Nama kategori tidak boleh kosong';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (formMode === 'add') {
        await api('/kategori', {
          method: 'POST',
          data: formData
        });
        setSuccess('Kategori berhasil ditambahkan');
      } else {
        await api(`/kategori/${selectedKategori.id}`, {
          method: 'PUT',
          data: formData
        });
        setSuccess('Kategori berhasil diperbarui');
      }
      
      // Reset form and refetch data
      resetForm();
      fetchKategori();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan kategori');
      console.error('Error saving kategori:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormMode('edit');
    setSelectedKategori(item);
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi || ''
    });
    
    // Scroll to form
    document.getElementById('kategoriForm').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${item.nama}"?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api(`/kategori/${item.id}`, {
        method: 'DELETE'
      });
      
      setSuccess('Kategori berhasil dihapus');
      fetchKategori();
    } catch (err) {
      setError(err.message || 'Gagal menghapus kategori');
      console.error('Error deleting kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormMode('add');
    setFormData({ nama: '', deskripsi: '' });
    setSelectedKategori(null);
    setFormErrors({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      {/* Form section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-8" id="kategoriForm">
        <h2 className="text-xl font-bold mb-4">
          {formMode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
        </h2>
        
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {success && (
          <div className="alert alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama Kategori</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className={`input input-bordered w-full ${formErrors.nama ? 'input-error' : ''}`}
                placeholder="Masukkan nama kategori"
              />
              {formErrors.nama && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.nama}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Deskripsi</span>
              </label>
              <input
                type="text"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Deskripsi kategori (opsional)"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-ghost"
              >
                Batal
              </button>
            )}
            
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : null}
              {formMode === 'add' ? 'Tambah Kategori' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
      
      {/* List section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Daftar Kategori</h2>
          
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Cari kategori..."
                className="input input-bordered"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-square" onClick={fetchKategori}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : kategori.length === 0 ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-lg">Tidak ada kategori yang ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Deskripsi</th>
                  <th>Jumlah Barang</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kategori.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.nama}</td>
                    <td>{item.deskripsi || '-'}</td>
                    <td>
                      <div className="badge badge-neutral">{item.jumlah_barang || 0}</div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-sm btn-ghost btn-circle"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn btn-sm btn-ghost btn-circle text-error"
                          title="Hapus"
                          disabled={item.jumlah_barang > 0}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && kategori.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, kategori.length + ((currentPage - 1) * perPage))} dari total {kategori.length + ((currentPage - 1) * perPage)} data
            </div>
            
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
    </div>
  );
};

export default KategoriManager;