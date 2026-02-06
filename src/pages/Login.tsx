import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  MdSunny,
  MdNightlight,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/logoLight.png';
import logoDark from '../assets/logoDark.png';

const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // If user needs password change, redirection is handled
      // by ProtectedRoute in App.tsx when navigating to /
      navigate('/');
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 p-4 transition-colors duration-200 relative">
      <button
        onClick={toggleTheme}
        className="fixed top-8 right-8 p-3 rounded-xl bg-white dark:bg-slate-900 shadow-lg text-navy-900 dark:text-slate-100 border border-gray-100 dark:border-slate-800 hover:scale-110 transition-transform"
      >
        {theme === 'light' ? <MdNightlight size={24} /> : <MdSunny size={24} />}
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border dark:border-slate-800"
      >
        <div className="bg-navy-900 dark:bg-slate-800 p-8 text-center">
          <img
            src={theme === 'light' ? logoLight : logoDark}
            alt="Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-200 dark:text-slate-300">
            Sign in to manage your tasks
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center border dark:border-red-900/30">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              const password = formData.get('password') as string;
              handleLogin(email, password);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="enter@company.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Login with your registered email</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
