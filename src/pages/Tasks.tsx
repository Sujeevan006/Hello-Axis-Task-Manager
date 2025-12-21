import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../modals/CreateTaskModal';
import { Task, TaskStatus, Priority } from '../types';
import { MdSearch, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { tasks, users, moveTask, deleteTask } = useTaskContext();
  const { user: currentUser } = useAuth();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');

  const userMap = useMemo(() => {
    return users.reduce((acc, user) => ({ ...acc, [user.id]: user }), {});
  }, [users]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.id === activeId);
    // Find the drop column status
    // If over item is a column container (droppable id is status)
    // If over item is a task (sortable), find its status

    let newStatus: TaskStatus | undefined;

    // Check if dropped directly on a column
    if (['todo', 'in-process', 'review', 'completed'].includes(overId)) {
      newStatus = overId as TaskStatus;
    } else {
      // Dropped on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (task && newStatus && task.status !== newStatus) {
      moveTask(task.id, newStatus);
      toast.success(`Moved to ${newStatus.replace('-', ' ')}`, { icon: '👏' });
    }

    setActiveTask(null);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Permission check logic from prompt:
      // "Staff View only tasks assigned to them or created by them"
      // "Admin sees all tasks"
      if (currentUser?.role !== 'admin') {
        if (t.assigneeId !== currentUser?.id && t.creatorId !== currentUser?.id)
          return false;
      }

      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchPriority =
        filterPriority === 'all' || t.priority === filterPriority;
      const matchStaff = filterStaff === 'all' || t.assigneeId === filterStaff;

      return matchSearch && matchPriority && matchStaff;
    });
  }, [tasks, search, filterPriority, filterStaff, currentUser]);

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'border-blue-500' },
    { id: 'in-process', title: 'In Process', color: 'border-amber-500' },
    { id: 'review', title: 'Review', color: 'border-purple-500' },
    { id: 'completed', title: 'Completed', color: 'border-green-500' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-slate-100">
            Tasks Board
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Manage tasks efficiently
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-2">
            <select
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
            >
              <option value="all">All Staff</option>
              {users
                .filter((u) => u.role !== 'admin')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <MdAdd size={20} />
              <span className="hidden sm:inline">Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-6 pb-4 min-w-max">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                userMap={userMap}
                tasks={filteredTasks.filter((t) => t.status === col.id)}
                onTaskClick={(task) => {
                  // Open detail modal - To implement
                  // For now, let's just use Edit flow or separate detail
                  setEditingTask(task); // Temporarily using edit modal as detail viewer
                  setIsModalOpen(true);
                }}
                onEdit={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    try {
                      await deleteTask(id);
                      toast.success('Task deleted');
                    } catch (error) {
                      toast.error('Failed to delete task');
                    }
                  }
                }}
                onAdd={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              userMap={userMap}
              onClick={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users} // Pass all users for assignment
        editTask={editingTask}
      />
    </div>
  );
};

export default Tasks;
