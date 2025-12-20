import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Task, User, TaskStatus } from '../types';
import clsx from 'clsx';
import { MdAdd } from 'react-icons/md';

interface Props {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  userMap: Record<string, User>;
  onTaskClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAdd: () => void;
  color: string;
}

const KanbanColumn = ({
  id,
  title,
  tasks,
  userMap,
  onTaskClick,
  onEdit,
  onDelete,
  onAdd,
  color,
}: Props) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-[280px] w-80 shrink-0">
      <div
        className={clsx(
          'flex items-center justify-between p-3 rounded-t-xl border-t-4 bg-white dark:bg-slate-900 shadow-sm mb-3 dark:border-opacity-60',
          color
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-700 dark:text-slate-100">
            {title}
          </h3>
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">
            {tasks.length}
          </span>
        </div>
        {id === 'todo' && (
          <button
            onClick={onAdd}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-slate-100 transition-colors"
          >
            <MdAdd size={20} />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide pb-20"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              userMap={userMap}
              onClick={() => onTaskClick(task)}
              onEdit={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
