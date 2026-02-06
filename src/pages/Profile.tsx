import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import { MdVisibility, MdVisibilityOff, MdCameraAlt } from 'react-icons/md';

const Profile = () => {
  const { user, updateUserProfile, changePassword } = useAuth();
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          setImagePreview(base64String);
          await updateUserProfile({ avatar: base64String });
          toast.success('Profile image updated successfully');
        } catch (error) {
          toast.error('Failed to update profile image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: Partial<User>) => {
    try {
      await updateUserProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
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
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-slate-100 mb-1">
          My Profile
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Manage your account information and security
        </p>
      </div>

      {user.needs_password_change && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl text-amber-800 dark:text-amber-400 text-sm">
          <strong>Security Notice:</strong> Please update your password to
          secure your account.
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="h-32 bg-navy-900 dark:bg-slate-800 w-full relative">
          <div className="absolute -bottom-12 left-8">
            <div
              className="relative group cursor-pointer"
              onClick={handleImageClick}
            >
              <img
                src={
                  imagePreview ||
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}`
                }
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-900 transition-opacity group-hover:opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <MdCameraAlt size={32} className="text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 -mt-2">
            Click on the profile picture to upload a new photo
          </p>
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
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn btn-primary px-8">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">
        <h2 className="text-lg font-bold text-navy-900 dark:text-slate-100 mb-6">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Current Password
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
                New Password
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
                Confirm Password
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
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
