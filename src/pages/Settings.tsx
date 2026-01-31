import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Organization } from '../types';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Settings = () => {
  const { organization, updateOrganization } = useTaskContext();
  const { user, updateUserProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Organization>({
    defaultValues: organization,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data: Organization) => {
    updateOrganization(data);
    toast.success('Organization settings updated');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    updateUserProfile({
      password: passwordData.newPassword,
      needsPasswordChange: false,
    });
    setPasswordData({ newPassword: '', confirmPassword: '' });
    toast.success('Admin password updated successfully');
  };

  const handleClearPassword = () => {
    if (
      window.confirm(
        'Are you sure you want to clear the admin password? Admin will be able to login without a password.',
      )
    ) {
      updateUserProfile({
        password: undefined,
        needsPasswordChange: true,
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      toast.success('Admin password cleared successfully');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-slate-100">
        Settings
      </h1>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        <h2 className="text-lg font-bold text-navy-900 dark:text-slate-100 mb-6">
          Organization Details
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Organization Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input-field"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="input-field min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Logo URL
            </label>
            <input {...register('logo')} className="input-field" />
          </div>

          <div className="flex justify-end pt-4 border-t dark:border-slate-800">
            <button type="submit" className="btn btn-primary px-8">
              Update Organization
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        <h2 className="text-lg font-bold text-navy-900 dark:text-slate-100 mb-6">
          Admin Security
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                New Admin Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={
                    showNewPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showNewPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleClearPassword}
              className="btn bg-red-500 hover:bg-red-600 text-white px-6"
            >
              Clear Password
            </button>
            <button type="submit" className="btn btn-secondary px-8">
              Save New Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
