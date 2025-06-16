import { api } from './api';

// Login user
export const login = async (credentials) => {
  try {
    const response = await api('/auth/login', {
      method: 'POST',
      data: credentials
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await api('/auth/register', {
      method: 'POST',
      data: userData
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api('/auth/logout', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api('/auth/user');
    return response.user;
  } catch (error) {
    throw error;
  }
};

// Update profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api('/auth/profile', {
      method: 'PUT',
      data: profileData
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api('/auth/change-password', {
      method: 'POST',
      data: passwordData
    });
    return response;
  } catch (error) {
    throw error;
  }
};