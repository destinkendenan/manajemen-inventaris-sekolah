// Documents\SEM_4\PEMROGRAMAN WEB LANJUTAN\PROJECT WEB\manajemen-inventaris-sekolah\manajemen-inventaris-sekolah\src\pages\Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useForm from '../hooks/useForm';
import ErrorAlert from '../components/common/ErrorAlert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { values, handleChange } = useForm({
    email: '',
    password: '',
    remember: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({
        email: values.email,
        password: values.password,
        remember: values.remember
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          
          {error && (
            <ErrorAlert 
              message={error} 
              onClose={() => setError(null)} 
            />
          )}

          <form onSubmit={handleSubmit}>
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
                className="input input-bordered"
                value={values.password}
                onChange={handleChange}
                required
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover">Lupa password?</a>
              </label>
            </div>

            <div className="form-control mb-6">
              <label className="cursor-pointer label justify-start gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={values.remember}
                  onChange={handleChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text">Ingat saya</span>
              </label>
            </div>

            <div className="form-control">
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
                Login
              </button>
            </div>
          </form>

          <div className="divider">ATAU</div>

          <p className="text-center">
            Belum punya akun?{' '}
            <Link to="/register" className="link link-primary">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;