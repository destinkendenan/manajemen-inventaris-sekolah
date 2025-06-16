import { api } from './api';

// Mendapatkan semua kategori
export const getAllKategori = async () => {
  try {
    const response = await api('/kategori');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan kategori berdasarkan ID
export const getKategoriById = async (id) => {
  try {
    const response = await api(`/kategori/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menambahkan kategori baru
export const createKategori = async (kategoriData) => {
  try {
    const response = await api('/kategori', {
      method: 'POST',
      data: kategoriData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate kategori yang sudah ada
export const updateKategori = async (id, kategoriData) => {
  try {
    const response = await api(`/kategori/${id}`, {
      method: 'PUT',
      data: kategoriData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus kategori
export const deleteKategori = async (id) => {
  try {
    const response = await api(`/kategori/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};