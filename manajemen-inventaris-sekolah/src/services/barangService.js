import { api } from './api';

// Mendapatkan semua barang
export const getAllBarang = async (params = {}) => {
  try {
    const response = await api.get('/api/barang', { params });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        totalPages: 1,
        totalItems: 0,
        currentPage: 1
      }
    };
  } catch (error) {
    console.error('Error fetching barang:', error);
    throw error;
  }
};

// Mendapatkan barang berdasarkan ID
export const getBarangById = async (id) => {
  try {
    const response = await api(`/barang/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menambahkan barang baru
export const createBarang = async (barangData) => {
  try {
    const response = await api('/barang', {
      method: 'POST',
      data: barangData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate barang yang sudah ada
export const updateBarang = async (id, barangData) => {
  try {
    const response = await api(`/barang/${id}`, {
      method: 'PUT',
      data: barangData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus barang
export const deleteBarang = async (id) => {
  try {
    const response = await api(`/barang/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mencari barang berdasarkan kata kunci
export const searchBarang = async (keyword) => {
  try {
    const response = await api('/barang/search', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan barang berdasarkan kategori
export const getBarangByKategori = async (kategoriId) => {
  try {
    const response = await api(`/barang/kategori/${kategoriId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};