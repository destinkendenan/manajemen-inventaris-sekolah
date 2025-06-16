import { useState, useEffect } from 'react';
import { getAllBarang, deleteBarang, createBarang, updateBarang } from '../services/barangService';
import { getAllKategori } from '../services/kategoriService';
import useAuth from '../hooks/useAuth';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Barang = () => {
  const { user } = useAuth();
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const { values, handleChange, setValues, reset } = useForm({
    nama: '',
    kode: '',
    deskripsi: '',
    kategori_id: '',
    jumlah: 0,
    kondisi: 'baik',
    lokasi: '',
    tanggal_masuk: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBarang();
    fetchKategori();
  }, [currentPage, searchTerm]);

  const fetchBarang = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      };
      const response = await getAllBarang(params);
      
      // PERBAIKAN: Pastikan response.data selalu array
      setBarang(response.data?.data || []);
      
      // PERBAIKAN: Handle struktur response yang mungkin berbeda
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalItems(response.data?.pagination?.totalItems || 0);
    } catch (err) {
      setError('Gagal memuat data barang');
      console.error('Error fetching barang:', err);
      // PERBAIKAN: Set array kosong saat error
      setBarang([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKategori = async () => {
    try {
      const response = await getAllKategori();
      setKategori(response.data);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const openAddModal = () => {
    // Inisialisasi semua field yang diperlukan dengan nilai default
    setValues({
      nama: '',
      kode: '',
      deskripsi: '',
      kategori_id: '',
      jumlah: 1,
      jumlah_tersedia: 1,
      kondisi: 'baik',
      lokasi: '',
      tanggal_masuk: new Date().toISOString().split('T')[0]
    });
    
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setSelectedBarang(item);
    setValues({
      nama: item.nama,
      kode: item.kode,
      deskripsi: item.deskripsi,
      kategori_id: item.kategori_id,
      jumlah: item.jumlah,
      kondisi: item.kondisi,
      lokasi: item.lokasi,
      tanggal_masuk: item.tanggal_masuk?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (modalMode === 'add') {
        await createBarang(values);
      } else {
        await updateBarang(selectedBarang.id, values);
      }
      setShowModal(false);
      fetchBarang();
    } catch (err) {
      setError(err.message || `Gagal ${modalMode === 'add' ? 'menambahkan' : 'mengupdate'} barang`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteBarang(deleteId);
      setShowDeleteConfirm(false);
      fetchBarang();
    } catch (err) {
      setError('Gagal menghapus barang');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat pencarian
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Data Barang Inventaris</h1>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="form-control w-full md:w-1/3">
          <div className="input-group">
            <input
              type="text"
              placeholder="Cari barang..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            Tambah Barang
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : Array.isArray(barang) && barang.length === 0 ? (
        <div className="tidak-ada-data"></div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Kode</th>
                  <th>Nama Barang</th>
                  <th>Kategori</th>
                  <th>Jumlah</th>
                  <th>Kondisi</th>
                  <th>Lokasi</th>
                  {user?.role === 'admin' && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {barang.map((item, index) => (
                  <tr key={item.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{item.kode}</td>
                    <td>{item.nama}</td>
                    <td>{item.kategori?.nama || '-'}</td>
                    <td>{item.jumlah}</td>
                    <td>
                      <span className={`badge ${item.kondisi === 'baik' ? 'badge-success' : item.kondisi === 'rusak ringan' ? 'badge-warning' : 'badge-error'}`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td>{item.lokasi}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-xs btn-info" onClick={() => openEditModal(item)}>
                            Edit
                          </button>
                          <button className="btn btn-xs btn-error" onClick={() => openDeleteConfirm(item.id)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} barang
            </span>
            <div className="join">
              <button
                className="join-item btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`join-item btn ${currentPage === i + 1 ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="join-item btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Tambah/Edit Barang */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">
              {modalMode === 'add' ? 'Tambah Barang Baru' : 'Edit Barang'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Kode Barang</span>
                  </label>
                  <input
                    type="text"
                    name="kode"
                    className="input input-bordered"
                    value={values.kode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nama Barang</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    className="input input-bordered"
                    value={values.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Kategori</span>
                  </label>
                  <select
                    name="kategori_id"
                    className="select select-bordered"
                    value={values.kategori_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Pilih kategori</option>
                    {kategori.map(kat => (
                      <option key={kat.id} value={kat.id}>{kat.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Jumlah</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah"
                    className="input input-bordered"
                    min="0"
                    value={values.jumlah}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Kondisi</span>
                  </label>
                  <select
                    name="kondisi"
                    className="select select-bordered"
                    value={values.kondisi}
                    onChange={handleChange}
                    required
                  >
                    <option value="baik">Baik</option>
                    <option value="rusak ringan">Rusak Ringan</option>
                    <option value="rusak berat">Rusak Berat</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Lokasi</span>
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    className="input input-bordered"
                    value={values.lokasi}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tanggal Masuk</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_masuk"
                    className="input input-bordered"
                    value={values.tanggal_masuk}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Deskripsi</span>
                </label>
                <textarea
                  name="deskripsi"
                  className="textarea textarea-bordered h-24"
                  value={values.deskripsi}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                  {modalMode === 'add' ? 'Simpan' : 'Update'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
            <p className="py-4">Apakah Anda yakin ingin menghapus barang ini?</p>
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Batal
              </button>
              <button 
                className={`btn btn-error ${isLoading ? 'loading' : ''}`}
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                Hapus
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Barang;