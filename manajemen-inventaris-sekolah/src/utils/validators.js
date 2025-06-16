/**
 * Validasi email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validasi password (minimal 6 karakter)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validasi bahwa field tidak kosong
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
};

/**
 * Validasi bahwa value adalah angka
 */
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validasi bahwa value adalah angka positif
 */
export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

/**
 * Validasi bahwa value adalah integer
 */
export const isInteger = (value) => {
  return isNumber(value) && Number.isInteger(parseFloat(value));
};

/**
 * Validasi bahwa value adalah integer positif
 */
export const isPositiveInteger = (value) => {
  return isInteger(value) && parseInt(value) > 0;
};

/**
 * Validasi bahwa tanggal akhir lebih besar dari tanggal awal
 */
export const isEndDateAfterStartDate = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
};

/**
 * Mendapatkan pesan error berdasarkan jenis validasi
 */
export const getValidationMessage = (type, fieldName = 'Field') => {
  const messages = {
    required: `${fieldName} tidak boleh kosong`,
    email: `${fieldName} harus berupa email yang valid`,
    password: `${fieldName} minimal harus 6 karakter`,
    number: `${fieldName} harus berupa angka`,
    positiveNumber: `${fieldName} harus berupa angka positif`,
    integer: `${fieldName} harus berupa bilangan bulat`,
    positiveInteger: `${fieldName} harus berupa bilangan bulat positif`,
    dateRange: `Tanggal akhir harus setelah tanggal mulai`
  };
  
  return messages[type] || `${fieldName} tidak valid`;
};

/**
 * Validasi schema untuk form
 */
export const validateForm = (values, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const value = values[field];
    const rules = schema[field];
    
    if (rules.required && !isNotEmpty(value)) {
      errors[field] = getValidationMessage('required', rules.label || field);
    } else if (rules.email && value && !isValidEmail(value)) {
      errors[field] = getValidationMessage('email', rules.label || field);
    } else if (rules.password && value && !isValidPassword(value)) {
      errors[field] = getValidationMessage('password', rules.label || field);
    } else if (rules.number && value && !isNumber(value)) {
      errors[field] = getValidationMessage('number', rules.label || field);
    } else if (rules.positiveNumber && value && !isPositiveNumber(value)) {
      errors[field] = getValidationMessage('positiveNumber', rules.label || field);
    } else if (rules.integer && value && !isInteger(value)) {
      errors[field] = getValidationMessage('integer', rules.label || field);
    } else if (rules.positiveInteger && value && !isPositiveInteger(value)) {
      errors[field] = getValidationMessage('positiveInteger', rules.label || field);
    }
    
    // Custom validator
    if (rules.custom && value) {
      const customError = rules.custom(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};