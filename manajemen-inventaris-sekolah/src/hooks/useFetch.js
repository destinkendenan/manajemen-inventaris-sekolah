// filepath: c:\Users\HP\Documents\SEM_4\PEMROGRAMAN WEB LANJUTAN\PROJECT WEB\manajemen-inventaris-sekolah\manajemen-inventaris-sekolah\src\hooks\useFetch.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const useFetch = (initialUrl = '', initialOptions = {}) => {
  const [url, setUrl] = useState(initialUrl);
  const [options, setOptions] = useState(initialOptions);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefetchIndex(prevIndex => prevIndex + 1);
  }, []);

  const fetchData = useCallback(async (url, options) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api(url, options);
      setData(response.data);
      return response.data;
    } catch (error) {
      setError(error.message || 'Something went wrong');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (url) {
      fetchData(url, options);
    }
  }, [url, options, refetchIndex, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    fetchData,
    setUrl,
    setOptions
  };
};

export default useFetch;