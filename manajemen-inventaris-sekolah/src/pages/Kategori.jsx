import { useState, useEffect } from 'react';
import { getAllKategori, createKategori, updateKategori, deleteKategori } from '../services/kategoriService';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Kategori = () => {
  const [kategori, setKategori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { values, handleChange, setValues, reset } = useForm({
    nama: '',
    deskripsi: '',
    kode: ''
  });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    setIsLoading(true);
    try {
      const response = await getAllKategori();
      setKategori(response.data);
    } catch (err) {
      setError('Gagal memuat data kategori');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    reset();
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setSelectedKategori(item);
    setValues({
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      kode: item.kode
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
        await createKategori(values);
      } else {
        await updateKategori(selectedKategori.id, values);
      }
      setShowModal(false);
      fetchKategori();
    } catch (err) {
      setError(err.message || `Gagal ${modalMode === 'add' ? 'menambahkan' : 'mengupdate'} kategori`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteKategori(deleteId);
      setShowDeleteConfirm(false);
      fetchKategori();
    } catch (err) {
      setError('Gagal menghapus kategori. Pastikan tidak ada barang yang menggunakan kategori ini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Kategori</h1>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="flex justify-end mb-6">
        <button className="btn btn-primary" onClick={openAddModal}>
          Tambah Kategori
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : kategori.length === 0 ? (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Tidak ada data kategori. Silakan tambahkan kategori baru.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>No.</th>
                <th>Kode</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th>Jumlah Barang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kategori.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.kode}</td>
                  <td>{item.nama}</td>
                  <td>{item.deskripsi || '-'}</td>
                  <td>{item.jumlah_barang || 0}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah/Edit Kategori */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {modalMode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Kode Kategori</span>
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

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Nama Kategori</span>
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

              <div className="form-control mb-4">
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
            <p className="py-4">Apakah Anda yakin ingin menghapus kategori ini? Semua barang dalam kategori ini akan kehilangan kategorinya.</p>
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

export default Kategori;