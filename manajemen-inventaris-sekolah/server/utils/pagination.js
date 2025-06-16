const config = require('../config/config');

/**
 * Pagination utilities
 */

/**
 * Calculate limit and offset for pagination
 * @param {Number|String} page - Page number
 * @param {Number|String} size - Items per page
 * @returns {Object} Object containing limit and offset
 */
const getPagination = (page, size) => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(size, 10) || config.pagination.defaultLimit;
  
  // Ensure page and size are within valid ranges
  const validPageNumber = pageNumber > 0 ? pageNumber : 1;
  const validPageSize = pageSize > 0 && pageSize <= config.pagination.maxLimit 
    ? pageSize 
    : config.pagination.defaultLimit;
  
  // Calculate offset
  const offset = (validPageNumber - 1) * validPageSize;
  
  return {
    limit: validPageSize,
    offset
  };
};

/**
 * Format paginated data response
 * @param {Object} data - Sequelize findAndCountAll result
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @returns {Object} Formatted response with pagination info
 */
const getPagingData = (data, page, limit) => {
  const { count, rows } = data;
  const currentPage = parseInt(page, 10) || 1;
  const totalItems = count;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data: rows,
    pagination: {
      total_items: totalItems,
      total_pages: totalPages,
      current_page: currentPage,
      per_page: limit,
      has_next: currentPage < totalPages,
      has_previous: currentPage > 1
    }
  };
};

module.exports = {
  getPagination,
  getPagingData
};