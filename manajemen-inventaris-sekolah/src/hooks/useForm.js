//Documents\SEM_4\PEMROGRAMAN WEB LANJUTAN\PROJECT WEB\manajemen-inventaris-sekolah\manajemen-inventaris-sekolah\src\hooks\useForm.js
import { useState } from 'react';

const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Reset error for this field when user edits it
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const setError = (name, message) => {
    setErrors((prev) => ({
      ...prev,
      [name]: message
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    setValues,
    reset,
    setError,
    clearErrors
  };
};

export default useForm;