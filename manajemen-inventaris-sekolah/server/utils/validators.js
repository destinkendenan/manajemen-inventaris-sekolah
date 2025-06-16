/**
 * Validation utilities for data validation across the application
 */
const validators = {
  /**
   * Email validation
   * @param {String} email - Email to validate
   * @returns {Boolean} True if email is valid
   */
  isValidEmail: (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Password validation (at least 6 chars with at least one letter and one number)
   * @param {String} password - Password to validate
   * @returns {Boolean} True if password meets requirements
   */
  isValidPassword: (password) => {
    if (!password || password.length < 6) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  },

  /**
   * Name validation (non-empty, no special chars except spaces, hyphens, and apostrophes)
   * @param {String} name - Name to validate
   * @returns {Boolean} True if name is valid
   */
  isValidName: (name) => {
    if (!name || name.trim() === '') return false;
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name);
  },

  /**
   * Validate inventory item code format (alphanumeric, may include hyphens)
   * @param {String} code - Item code to validate
   * @returns {Boolean} True if code is valid
   */
  isValidItemCode: (code) => {
    if (!code || code.trim() === '') return false;
    const codeRegex = /^[a-zA-Z0-9-]+$/;
    return codeRegex.test(code);
  },

  /**
   * Validate quantity (positive integer)
   * @param {Number} quantity - Quantity to validate
   * @returns {Boolean} True if quantity is valid
   */
  isValidQuantity: (quantity) => {
    if (quantity === undefined || quantity === null) return false;
    return Number.isInteger(quantity) && quantity >= 0;
  },

  /**
   * Validate that a date is in the future
   * @param {String|Date} date - Date to validate
   * @returns {Boolean} True if date is in the future
   */
  isFutureDate: (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj > now;
  },

  /**
   * Validate that an end date comes after a start date
   * @param {String|Date} startDate - Start date
   * @param {String|Date} endDate - End date
   * @returns {Boolean} True if end date is after start date
   */
  isValidDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    return endObj > startObj;
  },

  /**
   * Validate ID is a positive integer
   * @param {Number|String} id - ID to validate
   * @returns {Boolean} True if ID is valid
   */
  isValidId: (id) => {
    if (id === undefined || id === null) return false;
    const parsedId = parseInt(id, 10);
    return !isNaN(parsedId) && parsedId > 0;
  },

  /**
   * Validate phone number format
   * @param {String} phone - Phone number to validate
   * @returns {Boolean} True if phone number is valid
   */
  isValidPhone: (phone) => {
    if (!phone) return false;
    // Basic validation for international phone numbers
    const phoneRegex = /^[0-9\+\-\(\)\s]{8,15}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate student/employee ID number
   * @param {String} idNumber - ID number to validate
   * @returns {Boolean} True if ID number is valid
   */
  isValidIdNumber: (idNumber) => {
    if (!idNumber) return false;
    // Basic validation for NIS/NIP (alphanumeric, at least 5 chars)
    const idRegex = /^[a-zA-Z0-9]{5,20}$/;
    return idRegex.test(idNumber);
  },

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @param {Number|String} params.page - Page number
   * @param {Number|String} params.per_page - Items per page
   * @returns {Object} Validated and normalized pagination parameters
   */
  validatePagination: (params) => {
    const page = parseInt(params.page, 10) || 1;
    const perPage = parseInt(params.per_page, 10) || 10;
    
    return {
      page: page > 0 ? page : 1,
      perPage: perPage > 0 && perPage <= 100 ? perPage : 10
    };
  },

  /**
   * Validate sorting parameters
   * @param {Object} params - Sorting parameters
   * @param {String} params.sort_by - Field to sort by
   * @param {String} params.sort_order - Sort order (asc/desc)
   * @param {Array} allowedFields - List of field names allowed for sorting
   * @returns {Object} Validated and normalized sorting parameters
   */
  validateSorting: (params, allowedFields) => {
    const defaultField = allowedFields[0] || 'id';
    const sortBy = params.sort_by && allowedFields.includes(params.sort_by) 
      ? params.sort_by 
      : defaultField;
      
    const sortOrder = params.sort_order && ['asc', 'desc'].includes(params.sort_order.toLowerCase())
      ? params.sort_order.toLowerCase()
      : 'asc';
    
    return { sortBy, sortOrder };
  },

  /**
   * Validate item condition value
   * @param {String} condition - Condition to validate
   * @returns {Boolean} True if condition is valid
   */
  isValidCondition: (condition) => {
    if (!condition) return false;
    const validConditions = ['baik', 'rusak_ringan', 'rusak_berat'];
    return validConditions.includes(condition);
  },

  /**
   * Validate user role
   * @param {String} role - Role to validate
   * @returns {Boolean} True if role is valid
   */
  isValidRole: (role) => {
    if (!role) return false;
    const validRoles = ['admin', 'petugas', 'user'];
    return validRoles.includes(role);
  },

  /**
   * Validate user status
   * @param {String} status - Status to validate
   * @returns {Boolean} True if status is valid
   */
  isValidStatus: (status) => {
    if (!status) return false;
    const validStatuses = ['active', 'inactive'];
    return validStatuses.includes(status);
  }
};

module.exports = validators;