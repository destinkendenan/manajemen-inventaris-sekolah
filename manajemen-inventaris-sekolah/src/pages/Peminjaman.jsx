import { useState, useEffect } from 'react';
import { 
  getAllPeminjaman, 
  getPeminjamanByUser, 
  createPeminjaman, 
  updateStatusPeminjaman, 
  kembalikanBarang 
} from '../services/peminjamanService';
import { getAllBarang } from '../services/barangService';
import useAuth from '../hooks/useAuth';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Peminjaman = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [peminjaman, setPeminjaman] = useState([]);
  const [barang, setBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const { values, handleChange, reset, setValues } = useForm({
    barang_id: '',
    jumlah: 1,
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    tanggal_kembali: '',
    keterangan: ''
  });

  const { values: returnValues, handleChange: handleReturnChange, reset: resetReturn } = useForm({
    kondisi_kembali: 'baik',
    catatan: ''
  });

  useEffect(() => {
    fetchPeminjaman();
    fetchBarang();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchPeminjaman = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'semua' ? statusFilter : undefined,
        search: searchTerm || undefined
      };

      let response;
      if (isAdmin) {
        response = await getAllPeminjaman(params);
      } else {
        response = await getPeminjamanByUser(user.id, params);
      }

      setPeminjaman(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError('Gagal memuat data peminjaman');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await getAllBarang({ status: 'tersedia' });
      setBarang(response.data);
    } catch (err) {
      console.error('Gagal memuat barang:', err);
    }
  };

  const openPeminjamanModal = () => {
    reset();
    setShowModal(true);
  };

  const openReturnModal = (item) => {
    setSelectedPeminjaman(item);
    resetReturn();
    setShowReturnModal(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    setIsLoading(true);
    try {
      await updateStatusPeminjaman(id, { status: newStatus });
      fetchPeminjaman();
    } catch (err) {
      setError(`Gagal mengubah status peminjaman: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePeminjaman = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createPeminjaman({
        ...values,
        user_id: user.id
      });
      setShowModal(false);
      fetchPeminjaman();
    } catch (err) {
      setError(err.message || 'Gagal membuat peminjaman');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await kembalikanBarang(selectedPeminjaman.id, returnValues);
      setShowReturnModal(false);
      fetchPeminjaman();
    } catch (err) {
      setError(err.message || 'Gagal mengembalikan barang');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {isAdmin ? 'Manajemen Peminjaman' : 'Peminjaman Saya'}
      </h1>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="form-control">
            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="dikembalikan">Dikembalikan</option>
              <option value="ditolak">Ditolak</option>
              <option value="terlambat">Terlambat</option>
            </select>
          </div>

          <div className="form-control w-full sm:w-64">
            <div className="input-group">
              <input
                type="text"
                placeholder="Cari peminjaman..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button className="btn btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary w-full md:w-auto"
          onClick={openPeminjamanModal}
        >
          Ajukan Peminjaman
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : peminjaman.length === 0 ? (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Tidak ada data peminjaman ditemukan.</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Barang</th>
                  {isAdmin && <th>Peminjam</th>}
                  <th>Jumlah</th>
                  <th>Tanggal Pinjam</th>
                  <th>Tanggal Kembali</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {peminjaman.map((item, index) => (
                  <tr key={item.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{item.barang?.nama || '-'}</td>
                    {isAdmin && <td>{item.user?.name || '-'}</td>}
                    <td>{item.jumlah}</td>
                    <td>{new Date(item.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                    <td>
                      {item.tanggal_kembali 
                        ? new Date(item.tanggal_kembali).toLocaleDateString('id-ID') 
                        : '-'}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {isAdmin && item.status === 'menunggu' && (
                          <>
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() => handleStatusChange(item.id, 'dipinjam')}
                            >
                              Setujui
                            </button>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => handleStatusChange(item.id, 'ditolak')}
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {(isAdmin || user.id === item.user_id) && item.status === 'dipinjam' && (
                          <button
                            className="btn btn-xs btn-info"
                            onClick={() => openReturnModal(item)}
                          >
                            Kembalikan
                          </button>
                        )}
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => {
                            setSelectedPeminjaman(item);
                            // Implement detail view if needed
                          }}
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} peminjaman
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

      {/* Modal Ajukan Peminjaman */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Ajukan Peminjaman Barang</h3>
            <form onSubmit={handleCreatePeminjaman}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Barang</span>
                </label>
                <select
                  name="barang_id"
                  className="select select-bordered"
                  value={values.barang_id}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Pilih barang</option>
                  {barang.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nama} ({item.kode}) - Tersedia: {item.jumlah}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Jumlah</span>
                </label>
                <input
                  type="number"
                  name="jumlah"
                  className="input input-bordered"
                  value={values.jumlah}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Tanggal Pinjam</span>
                </label>
                <input
                  type="date"
                  name="tanggal_pinjam"
                  className="input input-bordered"
                  value={values.tanggal_pinjam}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Tanggal Kembali (Rencana)</span>
                </label>
                <input
                  type="date"
                  name="tanggal_kembali"
                  className="input input-bordered"
                  value={values.tanggal_kembali}
                  onChange={handleChange}
                  min={values.tanggal_pinjam}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Keterangan</span>
                </label>
                <textarea
                  name="keterangan"
                  className="textarea textarea-bordered h-24"
                  value={values.keterangan}
                  onChange={handleChange}
                  placeholder="Tujuan peminjaman..."
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
                  Ajukan
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}

      {/* Modal Pengembalian */}
      {showReturnModal && selectedPeminjaman && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Pengembalian Barang</h3>
            <p className="mb-4">
              Anda akan mengembalikan: <span className="font-semibold">{selectedPeminjaman.barang?.nama || 'Barang'}</span>
            </p>
            <form onSubmit={handleReturnSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Kondisi Barang Saat Dikembalikan</span>
                </label>
                <select
                  name="kondisi_kembali"
                  className="select select-bordered"
                  value={returnValues.kondisi_kembali}
                  onChange={handleReturnChange}
                  required
                >
                  <option value="baik">Baik</option>
                  <option value="rusak ringan">Rusak Ringan</option>
                  <option value="rusak berat">Rusak Berat</option>
                  <option value="hilang">Hilang</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Catatan Pengembalian</span>
                </label>
                <textarea
                  name="catatan"
                  className="textarea textarea-bordered h-24"
                  value={returnValues.catatan}
                  onChange={handleReturnChange}
                  placeholder="Catatan mengenai kondisi barang..."
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowReturnModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                  Kembalikan
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowReturnModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Peminjaman;