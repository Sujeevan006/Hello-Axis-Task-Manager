import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { User, Priority, Task } from '../types';
import { useTaskContext } from '../context/TaskContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  editTask?: Task | null;
}

type FormData = {
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  dueDate: string;
  timeAllocation: number;
};

const CreateTaskModal = ({ isOpen, onClose, users, editTask }: Props) => {
  const { addTask, updateTask } = useTaskContext();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  useEffect(() => {
    if (editTask) {
      setValue('title', editTask.title);
      setValue('description', editTask.description);
      setValue('assigneeId', editTask.assigneeId || '');
      setValue('priority', editTask.priority);
      setValue('dueDate', editTask.dueDate.split('T')[0]);
      setValue('timeAllocation', editTask.timeAllocation);
    } else {
      reset();
    }
  }, [editTask, isOpen, reset, setValue]);

  const onSubmit = (data: FormData) => {
    if (editTask) {
      updateTask(editTask.id, {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
      });
    } else {
      addTask({
        ...data,
        status: 'todo',
        dueDate: new Date(data.dueDate).toISOString(),
        creatorId: 'current-user-id-handled-in-context', // Context handles real ID
      });
    }
    onClose();
    reset();
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-navy-900">
                {editTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MdClose size={24} className="text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 overflow-y-auto space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  {...register('title', { required: 'Task name is required' })}
                  className="input-field"
                  placeholder="e.g. Design Homepage"
                />
                {errors.title && (
                  <span className="text-red-500 text-xs">
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  className="input-field min-h-[100px]"
                  placeholder="Detailed explanation..."
                />
                {errors.description && (
                  <span className="text-red-500 text-xs">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    {...register('assigneeId', {
                      required: 'Assignee is required',
                    })}
                    className="input-field"
                  >
                    <option value="">Select Staff</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {errors.assigneeId && (
                    <span className="text-red-500 text-xs">
                      {errors.assigneeId.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select {...register('priority')} className="input-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register('dueDate', {
                      required: 'Due date is required',
                    })}
                    className="input-field"
                  />
                  {errors.dueDate && (
                    <span className="text-red-500 text-xs">
                      {errors.dueDate.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('timeAllocation', {
                      required: true,
                      min: 0.1,
                    })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
