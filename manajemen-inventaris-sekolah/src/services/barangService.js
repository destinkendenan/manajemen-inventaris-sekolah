import { api } from './api';

export const getAllBarang = async (params = {}) => {
  try {
    // Konversi nama parameter ke format yang diharapkan oleh backend
    const queryParams = {
      page: params.page,
      per_page: params.limit, // Server menggunakan 'per_page' bukan 'limit'
      search: params.search
    };
    
    console.log("Sending API request with params:", queryParams);
    
    const response = await api('/barang', { 
      method: 'GET',
      params: queryParams
    });
    
    console.log("API response:", response);
    
    // Format respons untuk digunakan oleh komponen
    return { 
      data: {
        data: response.data || [],
        pagination: {
          totalPages: response.meta?.last_page || 1,
          totalItems: response.meta?.total || 0,
          currentPage: response.meta?.current_page || params.page || 1
        }
      }
    };
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
    console.log("Creating barang with data:", data);
    
    // Pastikan data numerik dikonversi dengan benar
    const payload = {
      ...data,
      kategori_id: parseInt(data.kategori_id),
      jumlah: parseInt(data.jumlah),
      jumlah_tersedia: parseInt(data.jumlah_tersedia),
      tahun_pengadaan: parseInt(data.tahun_pengadaan)
    };
    
    const response = await api('/barang', {
      method: 'POST',
      data: payload
    });
    
    console.log("Create barang response:", response);
    return { data: response };
  } catch (error) {
    console.error('Error creating barang:', error);
    throw error;
  }
};

// Tambahkan fungsi update dan delete jika diperlukan