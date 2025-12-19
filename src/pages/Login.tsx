import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MdWork, MdPerson } from 'react-icons/md';

const Login = () => {
  const { login } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-navy-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-12">
            <MdWork className="text-white text-3xl -rotate-12" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-200">Sign in to manage your tasks</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleLogin('admin@company.com')}
              disabled={loading}
              className="w-full group relative p-4 border-2 border-transparent bg-navy-50 hover:bg-white hover:border-blue-500 rounded-xl transition-all duration-200 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MdWork size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Admin Access</h3>
                <p className="text-sm text-gray-500">
                  Full control over tasks & team
                </p>
              </div>
            </button>

            <button
              onClick={() => handleLogin('sarah@company.com')}
              disabled={loading}
              className="w-full group relative p-4 border-2 border-transparent bg-navy-50 hover:bg-white hover:border-green-500 rounded-xl transition-all duration-200 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MdPerson size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Staff Access</h3>
                <p className="text-sm text-gray-500">
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
