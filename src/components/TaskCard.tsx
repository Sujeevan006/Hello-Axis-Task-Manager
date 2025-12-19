import React from 'react';
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
    high: 'text-red-500 bg-red-50',
    medium: 'text-orange-500 bg-orange-50',
    low: 'text-green-500 bg-green-50',
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
        'bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative',
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
          <div className="hidden group-hover:flex gap-1 bg-white shadow-sm rounded-lg p-1 absolute top-2 right-2">
            <button
              onClick={onEdit}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
            >
              <MdEdit size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
            >
              <MdDelete size={14} />
            </button>
          </div>
        )}
      </div>

      <h4 className="text-gray-900 font-medium mb-3 line-clamp-2">
        {task.title}
      </h4>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MdAccessTime size={14} />
          <span>{format(new Date(task.dueDate), 'MMM d')}</span>
        </div>

        {assignee && (
          <div className="flex items-center gap-2" title={assignee.name}>
            <img
              src={
                assignee.avatar ||
                `https://ui-avatars.com/api/?name=${assignee.name}`
              }
              alt={assignee.name}
              className="w-6 h-6 rounded-full border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
