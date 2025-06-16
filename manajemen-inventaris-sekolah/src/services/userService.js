import { api } from './api';

// Mendapatkan semua pengguna
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api('/users', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan pengguna berdasarkan ID
export const getUserById = async (id) => {
  try {
    const response = await api(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Membuat pengguna baru (admin)
export const createUser = async (userData) => {
  try {
    const response = await api('/users', {
      method: 'POST',
      data: userData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate pengguna
export const updateUser = async (id, userData) => {
  try {
    const response = await api(`/users/${id}`, {
      method: 'PUT',
      data: userData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus pengguna
export const deleteUser = async (id) => {
  try {
    const response = await api(`/users/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengubah role pengguna
export const changeUserRole = async (id, roleData) => {
  try {
    const response = await api(`/users/${id}/role`, {
      method: 'PATCH',
      data: roleData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan profil pengguna saat ini
export const getCurrentUserProfile = async () => {
  try {
    const response = await api('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate profil pengguna saat ini
export const updateCurrentUserProfile = async (profileData) => {
  try {
    const response = await api('/users/profile', {
      method: 'PUT',
      data: profileData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengubah password
export const changePassword = async (passwordData) => {
  try {
    const response = await api('/users/change-password', {
      method: 'POST',
      data: passwordData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};