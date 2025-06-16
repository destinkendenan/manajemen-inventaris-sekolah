/**
 * Menangani error dari respons API
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Error respons dari server (status tidak 2xx)
    const { status, data } = error.response;
    
    if (status === 401) {
      return {
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        logout: true
      };
    }
    
    if (status === 403) {
      return {
        message: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
        type: 'forbidden'
      };
    }
    
    if (status === 404) {
      return {
        message: 'Data tidak ditemukan.',
        type: 'not_found'
      };
    }
    
    if (status === 422) {
      // Validation error
      let validationErrors = [];
      if (data.errors) {
        // Laravel validation format
        Object.keys(data.errors).forEach(key => {
          validationErrors = [...validationErrors, ...data.errors[key]];
        });
      }
      
      return {
        message: validationErrors.length > 0 
          ? validationErrors.join(' ') 
          : (data.message || 'Data yang dimasukkan tidak valid.'),
        type: 'validation'
      };
    }
    
    if (status >= 500) {
      return {
        message: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
        type: 'server'
      };
    }
    
    // Default error message from server
    return {
      message: data.message || 'Terjadi kesalahan pada aplikasi.',
      type: 'general'
    };
  }
  
  if (error.request) {
    // Request dibuat tapi tidak ada respons
    return {
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      type: 'network'
    };
  }
  
  // Error pada saat setup request
  return {
    message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
    type: 'unknown'
  };
};

/**
 * Format error untuk toast/alert notifications
 */
export const formatErrorForDisplay = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Terjadi kesalahan. Silakan coba lagi.';
};

/**
 * Log error ke console dengan format yang baik
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV !== 'production') {
    console.group(`Error${context ? ` in ${context}` : ''}`);
    console.error(error);
    
    if (error.response) {
      console.log('Response:', error.response);
    }
    
    console.groupEnd();
  }
};