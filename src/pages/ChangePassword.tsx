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

const ChangePassword = () => {
  const { changePassword, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(password, newPassword);
      if (result.success) {
        setSuccess('New password updated successfully');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-white mb-2">
            Change Password
          </h1>
          <p className="text-blue-200 dark:text-slate-300">
            You must change your password to continue
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}

          {success && !error && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm text-center border border-green-200 dark:border-green-900/30">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                name="newPassword"
                type="password"
                required
                className="input-field"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel & Logout
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
