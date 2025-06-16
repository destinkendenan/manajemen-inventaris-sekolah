import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, changeUserRole } from '../services/userService';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const { values, handleChange, setValues, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined
      };
      const response = await getAllUsers(params);
      setUsers(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError('Gagal memuat data pengguna');
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

  const openEditModal = (user) => {
    setSelectedUser(user);
    setValues({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role
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
      if (values.password !== values.password_confirmation) {
        throw new Error('Password dan konfirmasi password tidak cocok');
      }

      if (modalMode === 'add') {
        await createUser(values);
      } else {
        const userData = { ...values };
        if (!userData.password) {
          delete userData.password;
          delete userData.password_confirmation;
        }
        await updateUser(selectedUser.id, userData);
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Gagal ${modalMode === 'add' ? 'menambahkan' : 'mengupdate'} pengguna`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUser(deleteId);
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (err) {
      setError('Gagal menghapus pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setIsLoading(true);
    try {
      await changeUserRole(id, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError('Gagal mengubah role pengguna');
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
      <h1 className="text-2xl font-bold mb-6">Manajemen Pengguna</h1>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="form-control w-full md:w-1/3">
          <div className="input-group">
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          Tambah Pengguna
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : users.length === 0 ? (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Tidak ada data pengguna ditemukan.</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tanggal Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="select select-bordered select-sm"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-xs btn-info" onClick={() => openEditModal(user)}>
                          Edit
                        </button>
                        <button className="btn btn-xs btn-error" onClick={() => openDeleteConfirm(user.id)}>
                          Hapus
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
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengguna
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

      {/* Modal Tambah/Edit Pengguna */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {modalMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Nama</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered"
                  value={values.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered"
                  value={values.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Password {modalMode === 'edit' && '(Kosongkan jika tidak ingin mengubah)'}</span>
                </label>
                <input
                  type="password"
                  name="password"
                  className="input input-bordered"
                  value={values.password}
                  onChange={handleChange}
                  required={modalMode === 'add'}
                  minLength={6}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Konfirmasi Password</span>
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  className="input input-bordered"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  required={modalMode === 'add' || values.password !== ''}
                  minLength={6}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  name="role"
                  className="select select-bordered"
                  value={values.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
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
            <p className="py-4">Apakah Anda yakin ingin menghapus pengguna ini?</p>
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

export default Users;