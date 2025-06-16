import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, changeUserRole } from '../services/userService';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Users = () => {
  const [users, setUsers] = useState([]);  // Inisialisasi dengan array kosong
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

  // Perbaikan pada useEffect
  useEffect(() => {
    console.log('Users component mounted');
    fetchUsers();
  }, []);

  // Perbaikan pada fungsi fetchUsers
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers();
      console.log('Users data:', response); // Debug log
      setUsers(response?.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Gagal memuat data pengguna');
      setUsers([]); // Set empty array on error
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
    <div className="container p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manajemen Pengguna</h1>
      
      {/* Action buttons */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cari pengguna..."
            className="input input-bordered w-full max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="btn btn-primary"
            onClick={() => searchUsers()}>
            Cari
          </button>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => openAddModal()}>
          Tambah Pengguna
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : Array.isArray(users) && users.length === 0 ? (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Tidak ada data pengguna. Silakan tambahkan pengguna baru.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.role || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => openEditModal(user)}>
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-error"
                        onClick={() => confirmDelete(user.id)}>
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