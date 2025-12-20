import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<User>>({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
    },
  });

  const onSubmit = (data: Partial<User>) => {
    updateUserProfile(data);
    toast.success('Profile updated successfully');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-slate-100 mb-6">
        My Profile
      </h1>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="h-32 bg-navy-900 dark:bg-slate-800 w-full relative">
          <div className="absolute -bottom-12 left-8">
            <img
              src={
                user.avatar || `https://ui-avatars.com/api/?name=${user.name}`
              }
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Full Name
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
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="input-field"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Avatar URL
              </label>
              <input
                {...register('avatar')}
                className="input-field"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to use generated avatar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Role (Read Only)
              </label>
              <input
                value={user.role.toUpperCase()}
                readOnly
                className="input-field bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn btn-primary px-8">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
