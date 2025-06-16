import { api } from './api'; // Pastikan import dengan { api }

export const getAllBarang = async (params = {}) => {
  try {
    // Gunakan api sebagai fungsi dengan opsi yang benar
    const response = await api('/barang', { 
      method: 'GET',
      params: params
    });
    return { data: response };
  } catch (error) {
    console.error('Error fetching barang:', error);
    throw error;
  }
};

export const getBarangById = async (id) => {
  try {
    const response = await api(`/barang/${id}`, { method: 'GET' });
    return { data: response };
  } catch (error) {
    console.error(`Error fetching barang with id ${id}:`, error);
    throw error;
  }
};

export const createBarang = async (data) => {
  try {
    const response = await api('/barang', {
      method: 'POST',
      data: data
    });
    return { data: response };
  } catch (error) {
    console.error('Error creating barang:', error);
    throw error;
  }
};

// Tambahkan fungsi update dan delete jika diperlukan