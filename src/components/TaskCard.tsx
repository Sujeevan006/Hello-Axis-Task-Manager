import { Task, User } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdAccessTime, MdEdit, MdDelete } from 'react-icons/md';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

interface TaskCardProps {
  task: Task;
  userMap: Record<string, User>;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const TaskCard = ({
  task,
  userMap,
  onClick,
  onEdit,
  onDelete,
}: TaskCardProps) => {
  const { user } = useAuth();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = {
    high: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30',
    medium:
      'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30',
    low: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30',
  };

  const assignee = task.assigneeId ? userMap[task.assigneeId] : null;

  const canEdit = user?.role === 'admin' || user?.id === task.creatorId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative border-b-2',
        isDragging && 'ring-2 ring-blue-500 shadow-xl rotate-2'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded',
            priorityColor[task.priority]
          )}
        >
          {task.priority}
        </span>
        {canEdit && (
          <div className="hidden group-hover:flex gap-1 bg-white dark:bg-slate-800 shadow-sm rounded-lg p-1 absolute top-2 right-2 border dark:border-slate-700">
            <button
              onClick={onEdit}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <MdEdit size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <MdDelete size={14} />
            </button>
          </div>
        )}
      </div>

      <h4 className="text-gray-900 dark:text-slate-100 font-medium mb-3 line-clamp-2">
        {task.title}
      </h4>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        {task.dueDate ? (
          <div className="flex items-center gap-1">
            <MdAccessTime size={14} />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        ) : (
          <div />
        )}

        {assignee && (
          <div className="flex items-center gap-2" title={assignee.name}>
            <img
              src={
                assignee.avatar ||
                `https://ui-avatars.com/api/?name=${assignee.name}`
              }
              alt={assignee.name}
              className="w-6 h-6 rounded-full border border-gray-200 dark:border-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
