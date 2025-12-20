import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MdWork, MdPerson, MdSunny, MdNightlight } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/logoLight.png';
import logoDark from '../assets/logoDark.png';

const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email: string) => {
    setLoading(true);
    setError('');
    const success = await login(email);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Login failed. User not found.');
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

          <div className="space-y-4">
            <button
              onClick={() => handleLogin('admin@company.com')}
              disabled={loading}
              className="w-full group relative p-4 border-2 border-transparent bg-navy-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 rounded-xl transition-all duration-200 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MdWork size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900 dark:text-slate-100">
                  Admin Access
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Full control over tasks & team
                </p>
              </div>
            </button>

            <button
              onClick={() => handleLogin('sarah@company.com')}
              disabled={loading}
              className="w-full group relative p-4 border-2 border-transparent bg-navy-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-green-500 rounded-xl transition-all duration-200 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MdPerson size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900 dark:text-slate-100">
                  Staff Access
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  View and manage your tasks
                </p>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Demo Mode: Click any option to login instantly</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
