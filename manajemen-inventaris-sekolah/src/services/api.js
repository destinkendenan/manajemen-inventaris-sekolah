import axios from 'axios';
import { handleApiError } from '../utils/errorHandlers';

// URL API base
const baseURL = 'http://localhost:5000/api';

// Instance Axios
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor untuk menambahkan token ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk handling response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handling error 401 (unauthorized) - token expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(handleApiError(error));
  }
);

// Fungsi API wrapper
export const api = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const { method = 'GET', data = null, params = null, ...restOptions } = options;
    
    const config = {
      url,
      method,
      ...restOptions
    };
    
    if (data) {
      config.data = data;
    }
    
    if (params) {
      config.params = params;
    }
    
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};