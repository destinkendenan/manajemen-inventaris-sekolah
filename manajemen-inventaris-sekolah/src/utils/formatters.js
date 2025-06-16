/**
 * Format tanggal ke format Indonesia
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

/**
 * Format tanggal dan waktu ke format Indonesia
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

/**
 * Format angka sebagai mata uang Rupiah
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Potong teks menjadi panjang tertentu dan tambahkan ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

/**
 * Kapitalisasi kata pertama dalam string
 */
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Format status peminjaman untuk tampilan badge
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'menunggu':
      return 'badge badge-warning';
    case 'dipinjam':
      return 'badge badge-info';
    case 'dikembalikan':
      return 'badge badge-success';
    case 'ditolak':
      return 'badge badge-error';
    case 'terlambat':
      return 'badge badge-error';
    default:
      return 'badge';
  }
};

/**
 * Format kondisi barang untuk tampilan badge
 */
export const getKondisiBadgeClass = (kondisi) => {
  switch (kondisi) {
    case 'baik':
      return 'badge badge-success';
    case 'rusak ringan':
      return 'badge badge-warning';
    case 'rusak berat':
      return 'badge badge-error';
    case 'hilang':
      return 'badge badge-error';
    default:
      return 'badge';
  }
};