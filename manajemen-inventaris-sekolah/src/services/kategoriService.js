import { api } from './api'; // Pastikan import dengan { api }

export const getAllKategori = async () => {
  try {
    const response = await api('/kategori', { method: 'GET' });
    return { data: response };
  } catch (error) {
    console.error('Error fetching kategori:', error);
    throw error;
  }
};

// Mendapatkan kategori berdasarkan ID
export const getKategoriById = async (id) => {
  try {
    const response = await api(`/kategori/${id}`, { method: 'GET' });
    return { data: response };
  } catch (error) {
    console.error(`Error fetching kategori with id ${id}:`, error);
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