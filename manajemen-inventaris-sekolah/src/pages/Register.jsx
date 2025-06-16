import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { values, handleChange, errors, setError: setFieldError } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    agree_terms: false
  });

  const validateForm = () => {
    let isValid = true;

    if (values.password !== values.password_confirmation) {
      setFieldError('password_confirmation', 'Password dan konfirmasi password tidak cocok');
      isValid = false;
    }

    if (values.password.length < 6) {
      setFieldError('password', 'Password minimal 6 karakter');
      isValid = false;
    }

    if (!values.agree_terms) {
      setFieldError('agree_terms', 'Anda harus menyetujui syarat dan ketentuan');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md shadow-xl bg-base-100">
          <div className="card-body">
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pendaftaran berhasil! Anda akan dialihkan ke halaman login...</span>
            </div>
            <div className="text-center mt-4">
              <Link to="/login" className="btn btn-primary">
                Ke Halaman Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-8">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-6">Daftar Akun</h1>
          
          {error && (
            <ErrorAlert 
              message={error} 
              onClose={() => setError(null)} 
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Nama Lengkap</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nama lengkap"
                className="input input-bordered"
                value={values.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={values.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
                value={values.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              {errors.password && (
                <span className="text-error text-sm mt-1">{errors.password}</span>
              )}
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Konfirmasi Password</span>
              </label>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi password"
                className={`input input-bordered ${errors.password_confirmation ? 'input-error' : ''}`}
                value={values.password_confirmation}
                onChange={handleChange}
                required
              />
              {errors.password_confirmation && (
                <span className="text-error text-sm mt-1">{errors.password_confirmation}</span>
              )}
            </div>

            <div className="form-control mb-6">
              <label className={`cursor-pointer label justify-start gap-2 ${errors.agree_terms ? 'text-error' : ''}`}>
                <input
                  type="checkbox"
                  name="agree_terms"
                  checked={values.agree_terms}
                  onChange={handleChange}
                  className={`checkbox checkbox-sm ${errors.agree_terms ? 'checkbox-error' : ''}`}
                />
                <span className="label-text">
                  Saya menyetujui syarat dan ketentuan
                </span>
              </label>
              {errors.agree_terms && (
                <span className="text-error text-sm mt-1">{errors.agree_terms}</span>
              )}
            </div>

            <div className="form-control">
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                Daftar
              </button>
            </div>
          </form>

          <div className="divider">ATAU</div>

          <p className="text-center">
            Sudah punya akun?{' '}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;