import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard,
  MdTaskAlt,
  MdPeople,
  MdSettings,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdSunny,
  MdNightlight,
} from 'react-icons/md';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/logoLight.png';
import logoDark from '../assets/logoDark.png';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: MdDashboard,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: MdTaskAlt,
      roles: ['admin', 'staff'],
    },
    { name: 'Staffs', path: '/staffs', icon: MdPeople, roles: ['admin'] },
    {
      name: 'Profile',
      path: '/profile',
      icon: MdPerson,
      roles: ['admin', 'staff'],
    },
    { name: 'Settings', path: '/settings', icon: MdSettings, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'staff')
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white shadow-xl transform transition-transform duration-300 lg:transform-none flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 flex items-center justify-between lg:justify-center border-b border-navy-800">
          <div className="flex items-center gap-3">
            <img
              src={theme === 'light' ? logoLight : logoDark}
              alt="Logo"
              className="h-10 w-auto"
            />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Axivers
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <MdClose size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                )
              }
            >
              <item.icon
                size={22}
                className={clsx('group-hover:scale-110 transition-transform')}
              />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-navy-800/50">
            <img
              src={
                user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`
              }
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-2 text-gray-300 hover:bg-navy-800 hover:text-white rounded-lg transition-colors border border-navy-800"
          >
            {theme === 'light' ? (
              <MdNightlight size={20} />
            ) : (
              <MdSunny size={20} />
            )}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-navy-900 dark:text-slate-100 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <MdMenu size={24} />
          </button>

          <div className="flex items-center gap-2">
            <img
              src={theme === 'light' ? logoLight : logoDark}
              alt="Logo"
              className="h-8 w-auto"
            />
            <span className="font-bold text-navy-900 dark:text-slate-100">
              {navItems.find((i) => i.path === location.pathname)?.name ||
                'Task App'}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="text-navy-900 dark:text-slate-100 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {theme === 'light' ? (
              <MdNightlight size={20} />
            ) : (
              <MdSunny size={20} />
            )}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
