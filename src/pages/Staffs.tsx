import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdEmail } from 'react-icons/md';
import { User } from '../types';
import StaffModal from '../modals/StaffModal';
import toast from 'react-hot-toast';

const Staffs = () => {
  const { users, deleteStaff } = useTaskContext();
  const { user: currentUser } = useAuth(); // for admin check logic safety
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      deleteStaff(id);
      toast.success('Staff removed');
    }
  };

  const handleEdit = (staff: User) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-500">
        Access Denied. Admin only.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Team Members</h1>
          <p className="text-gray-500">Manage your organization's staff</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <MdAdd size={20} />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <img
              src={
                user.avatar || `https://ui-avatars.com/api/?name=${user.name}`
              }
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-gray-100 object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-navy-900 truncate">{user.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                <MdEmail size={14} />
                <span className="truncate">{user.email}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide 
                ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEdit(user)}
                className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MdEdit size={18} />
              </button>
              {user.id !== currentUser.id && ( // Prevent self-delete
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors"
                >
                  <MdDelete size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editStaff={editingStaff}
      />
    </div>
  );
};

export default Staffs;
