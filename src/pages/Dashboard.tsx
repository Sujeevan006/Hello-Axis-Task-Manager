import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  MdAssignment,
  MdPendingActions,
  MdDoneAll,
  MdTimer,
} from 'react-icons/md';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all"
  >
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg ${color}`}
    >
      <Icon />
    </div>
    <div>
      <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
        {title}
      </p>
      <h3 className="text-2xl font-bold text-navy-900 dark:text-slate-100">
        {value}
      </h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { tasks, isLoading } = useTaskContext();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 dark:border-slate-100"></div>
      </div>
    );
  }

  // Filter for dashboard
  const myTasks =
    user?.role === 'admin'
      ? tasks
      : tasks.filter(
          (t) => t.assigneeId === user?.id || t.creatorId === user?.id
        );

  const todo = myTasks.filter((t) => t.status === 'todo').length;
  const inProcess = myTasks.filter((t) => t.status === 'in-process').length;
  const review = myTasks.filter((t) => t.status === 'review').length;
  const completed = myTasks.filter((t) => t.status === 'completed').length;

  const recentTasks = [...myTasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="To Do"
          value={todo}
          icon={MdAssignment}
          color="bg-blue-500"
          delay={0.1}
        />
        <StatCard
          title="In Process"
          value={inProcess}
          icon={MdPendingActions}
          color="bg-amber-500"
          delay={0.2}
        />
        <StatCard
          title="Review"
          value={review}
          icon={MdTimer}
          color="bg-purple-500"
          delay={0.3}
        />
        <StatCard
          title="Completed"
          value={completed}
          icon={MdDoneAll}
          color="bg-green-500"
          delay={0.4}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-navy-900 dark:text-slate-100 mb-4">
          Recent Tasks
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                <th className="pb-3 pl-2">Task</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 pl-2 font-medium text-navy-900 dark:text-slate-200">
                    {task.title}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${
                        task.status === 'completed'
                          ? 'status-completed'
                          : task.status === 'review'
                          ? 'status-review'
                          : task.status === 'in-process'
                          ? 'status-process'
                          : 'status-todo'
                      }`}
                    >
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${
                        task.priority === 'high'
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500 dark:text-slate-400">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : 'No date'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTasks.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
