import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdContentCopy } from 'react-icons/md';
import { User, Role } from '../types';
import { useTaskContext } from '../context/TaskContext';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editStaff?: User | null;
}

type FormData = {
  name: string;
  email: string;
  role: Role;
  department?: string;
};

const StaffModal = ({ isOpen, onClose, editStaff }: Props) => {
  const { addStaff, updateStaff } = useTaskContext();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (editStaff) {
      setValue('name', editStaff.name);
      setValue('email', editStaff.email);
      setValue('role', editStaff.role);
      setValue('department', editStaff.department || '');
    } else {
      reset();
      setValue('role', 'user');
    }
    setGeneratedPassword(null);
  }, [editStaff, isOpen, reset, setValue]);

  // const generatePassword = () => { ... } // Removed

  const onSubmit = async (data: FormData) => {
    // Sanitize email
    if (data.email) {
      data.email = data.email.trim().toLowerCase();
    }
    try {
      if (editStaff) {
        await updateStaff(editStaff.id, data);
        toast.success('Staff updated successfully');
        onClose();
      } else {
        // Call addStaff, which now returns the generated password from backend
        // Note: We don't send a password, the backend generates it or uses a default.
        // We can pass a default password if we want, or let backend handle it.
        const tempPassword = await addStaff(data);

        if (tempPassword) {
          setGeneratedPassword(tempPassword);
          toast.success('Staff created! Please share the password.');
        } else {
          toast.success('Staff created!');
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation failed. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Password copied to clipboard');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center text-navy-900 dark:text-slate-100">
              <h2 className="text-xl font-bold">
                {generatedPassword
                  ? 'Staff Created Successfully'
                  : editStaff
                    ? 'Edit Staff'
                    : 'Add New Staff'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            {generatedPassword ? (
              <div className="p-8 text-center space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">
                    Generated Password
                  </p>
                  <p className="text-2xl font-mono font-bold text-navy-900 dark:text-slate-100 tracking-wider">
                    {generatedPassword}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Please copy and share this temporary password with the staff
                  member. They will be required to change it upon their first
                  login.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => copyToClipboard(generatedPassword)}
                    className="btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <MdContentCopy /> Copy
                  </button>
                  <button onClick={onClose} className="btn btn-primary">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="input-field"
                    placeholder="John Doe"
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
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email',
                      },
                    })}
                    className="input-field"
                    placeholder="john@company.com"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    {...register('department')}
                    className="input-field"
                    placeholder="e.g. IT, HR, Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select {...register('role')} className="input-field">
                    <option value="user">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editStaff ? 'Save Changes' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StaffModal;
