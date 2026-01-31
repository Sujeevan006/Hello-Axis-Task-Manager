import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { User, Priority, Task, TaskStatus } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';

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
  status: TaskStatus;
  dueDate?: string;
  timeAllocation?: number;
};

const CreateTaskModal = ({ isOpen, onClose, users, editTask }: Props) => {
  const { addTask, updateTask } = useTaskContext();
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);

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
    const fetchDetailedTask = async () => {
      if (editTask?.id) {
        try {
          const task = await taskAPI.getById(editTask.id);
          setDetailedTask(task);
        } catch (error) {
          console.error('Failed to fetch detailed task info');
        }
      } else {
        setDetailedTask(null);
      }
    };

    if (isOpen) {
      fetchDetailedTask();
    }
  }, [editTask, isOpen]);

  useEffect(() => {
    if (editTask) {
      setValue('title', editTask.title);
      setValue('description', editTask.description);
      setValue('assigneeId', editTask.assigneeId || '');
      setValue('priority', editTask.priority);
      setValue('status', editTask.status);
      setValue(
        'dueDate',
        editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
      );
      setValue('timeAllocation', editTask.timeAllocation || 0);
    } else {
      reset();
      setDetailedTask(null);
    }
  }, [editTask, isOpen, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      timeAllocation: data.timeAllocation
        ? Number(data.timeAllocation)
        : undefined,
    };

    try {
      if (editTask) {
        await updateTask(editTask.id, formattedData);
        toast.success('Task updated');
      } else {
        await addTask({
          ...formattedData,
          // creatorId is handled by context/backend
        } as any);
        toast.success('Task created');
      }
      onClose();
      reset();
    } catch (error) {
      toast.error('Failed to save task');
    }
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
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-navy-900 dark:text-slate-100">
                {editTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <MdClose
                  size={24}
                  className="text-gray-500 dark:text-slate-400"
                />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 overflow-y-auto space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select {...register('priority')} className="input-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Task Status (Process)
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="input-field"
                  defaultValue="todo"
                >
                  <option value="todo">To Do</option>
                  <option value="in-process">In Process</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Time (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('timeAllocation', {
                      min: 0,
                    })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {detailedTask &&
                detailedTask.activityLogs &&
                detailedTask.activityLogs.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100 mb-3">
                      Activity History
                    </h3>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {detailedTask.activityLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-xs">
                          <div className="min-w-[60px] text-gray-400">
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleDateString()
                              : ''}
                          </div>
                          <div>
                            <p className="text-gray-700 dark:text-slate-300 font-medium">
                              {log.action}
                            </p>
                            <p className="text-gray-400">
                              User:{' '}
                              {users.find((u) => u.id === log.userId)?.name ||
                                log.userId}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
