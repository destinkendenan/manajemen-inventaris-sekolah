import { api } from './api';

// Mendapatkan semua peminjaman
export const getAllPeminjaman = async (params = {}) => {
  try {
    const response = await api('/peminjaman', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan peminjaman berdasarkan ID
export const getPeminjamanById = async (id) => {
  try {
    const response = await api(`/peminjaman/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan peminjaman berdasarkan user
export const getPeminjamanByUser = async (userId) => {
  try {
    const response = await api(`/peminjaman/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan peminjaman aktif (belum dikembalikan)
export const getPeminjamanAktif = async () => {
  try {
    const response = await api('/peminjaman/aktif');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Membuat peminjaman baru
export const createPeminjaman = async (peminjamanData) => {
  try {
    const response = await api('/peminjaman', {
      method: 'POST',
      data: peminjamanData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate status peminjaman
export const updateStatusPeminjaman = async (id, statusData) => {
  try {
    const response = await api(`/peminjaman/${id}/status`, {
      method: 'PATCH',
      data: statusData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Proses pengembalian barang
export const kembalikanBarang = async (id, pengembalianData) => {
  try {
    const response = await api(`/peminjaman/${id}/kembali`, {
      method: 'POST',
      data: pengembalianData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan riwayat peminjaman
export const getRiwayatPeminjaman = async (params = {}) => {
  try {
    const response = await api('/peminjaman/riwayat', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};