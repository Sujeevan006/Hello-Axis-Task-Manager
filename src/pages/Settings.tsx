import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Organization } from '../types';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const Settings = () => {
  const { organization, updateOrganization } = useTaskContext();
  const { user, changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Organization>({
    defaultValues: organization,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data: Organization) => {
    updateOrganization(data);
    toast.success('Organization settings updated');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Admin password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Current Admin Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                aria-label={
                  showCurrentPassword ? 'Hide password' : 'Show password'
                }
              >
                {showCurrentPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>
          </div>
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
          <div className="flex justify-end pt-2">
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
