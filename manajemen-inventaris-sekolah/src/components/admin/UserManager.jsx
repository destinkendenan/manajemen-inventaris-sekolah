import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ErrorAlert from '../common/ErrorAlert';
import useAuth from '../../hooks/useAuth';

const UserManager = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Search and pagination states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Form states
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, perPage, roleFilter]);

  useEffect(() => {
    if (search) {
      const delayDebounce = setTimeout(() => {
        fetchUsers();
      }, 500);
      
      return () => clearTimeout(delayDebounce);
    }
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage
      };
      
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      
      const response = await api('/users', { params });
      setUsers(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (err) {
      setError('Gagal memuat data pengguna. Silakan coba lagi.');
      console.error('Error fetching users:', err);
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
    
    if (!formData.name.trim()) {
      errors.name = 'Nama tidak boleh kosong';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email tidak boleh kosong';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (formMode === 'add' && !formData.password) {
      errors.password = 'Password tidak boleh kosong';
    }
    
    if (formMode === 'add' && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Konfirmasi password tidak cocok';
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
      // Prepare data based on mode
      const userData = { ...formData };
      
      // If editing and password is empty, don't send it
      if (formMode === 'edit' && !userData.password) {
        delete userData.password;
        delete userData.password_confirmation;
      }
      
      if (formMode === 'add') {
        await api('/users', {
          method: 'POST',
          data: userData
        });
        setSuccess('Pengguna berhasil ditambahkan');
      } else {
        await api(`/users/${selectedUser.id}`, {
          method: 'PUT',
          data: userData
        });
        setSuccess('Pengguna berhasil diperbarui');
      }
      
      // Reset form and refresh data
      setShowUserModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(err.message || 'Terjadi kesalahan saat menyimpan data pengguna');
      }
      console.error('Error saving user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = () => {
    setFormMode('add');
    resetForm();
    setShowUserModal(true);
  };

  const handleEdit = (user) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await api(`/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      
      setSuccess('Pengguna berhasil dihapus');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Gagal menghapus pengguna');
      console.error('Error deleting user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'user',
      status: 'active'
    });
    setFormErrors({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setCurrentPage(1);
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
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}
      
      {/* Filter and Action Section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold mb-4 md:mb-0">Kelola Pengguna</h2>
          
          <button
            className="btn btn-primary"
            onClick={handleAdd}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Pengguna
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Cari nama atau email..."
                className="input input-bordered w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-square" onClick={fetchUsers}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Role Filter */}
          <div className="form-control">
            <select
              className="select select-bordered w-full"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Semua Peran</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          
          {/* Per Page and Reset */}
          <div className="flex justify-between items-center gap-2">
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
                {[10, 25, 50, 100].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            
            <button
              className="btn btn-outline btn-sm"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-base-100 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-lg">Tidak ada pengguna yang ditemukan</p>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn btn-xs btn-circle btn-ghost"
                        title="Edit"
                        disabled={user.id === currentUser?.id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(user)}
                        className="btn btn-xs btn-circle btn-ghost text-error"
                        title="Hapus"
                        disabled={user.id === currentUser?.id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex justify-between items-center p-4">
            <span className="text-sm">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, users.length + ((currentPage - 1) * perPage))} dari total {users.length + ((currentPage - 1) * perPage)} data
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
      
      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {formMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nama</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="Nama lengkap"
                  />
                  {formErrors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.name}</span>
                    </label>
                  )}
                </div>
                
                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="Email"
                  />
                  {formErrors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.email}</span>
                    </label>
                  )}
                </div>
                
                {/* Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      {formMode === 'add' ? 'Password' : 'Password (kosongkan jika tidak diubah)'}
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.password ? 'input-error' : ''}`}
                    placeholder="Password"
                  />
                  {formErrors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.password}</span>
                    </label>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Konfirmasi Password</span>
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.password_confirmation ? 'input-error' : ''}`}
                    placeholder="Konfirmasi password"
                  />
                  {formErrors.password_confirmation && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.password_confirmation}</span>
                    </label>
                  )}
                </div>
                
                {/* Role */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Peran</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {/* Status */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowUserModal(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : null}
                  {formMode === 'add' ? 'Tambah' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => !isSubmitting && setShowUserModal(false)}></div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus pengguna 
              <span className="font-bold"> {selectedUser.name}</span>?
            </p>
            <p className="text-sm text-error mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                className={`btn btn-error ${isSubmitting ? 'loading' : ''}`}
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : null}
                Hapus
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isSubmitting && setShowDeleteModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default UserManager;