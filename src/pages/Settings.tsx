import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Organization } from '../types';

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
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="input-field"
                placeholder="••••••••"
              />
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
