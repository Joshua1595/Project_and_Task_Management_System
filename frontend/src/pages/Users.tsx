import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { 
  Users, Plus, Search, Mail, Shield, 
  Trash2, Edit, AlertCircle, Check, X, ShieldAlert, ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Omit<User, 'password_hash'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Omit<User, 'password_hash'> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [isActive, setIsActive] = useState(true);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'Administrator') {
      loadUsersData();
    }
  }, [currentUser]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) return;

    try {
      await api.createUser({
        full_name: fullName,
        email,
        password,
        role
      });
      setIsAddOpen(false);
      resetForm();
      loadUsersData();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleOpenEdit = (user: Omit<User, 'password_hash'>) => {
    setSelectedUser(user);
    setFullName(user.full_name);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.is_active);
    setPassword(''); // Leave password blank unless resetting
    setIsEditOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !fullName || !email || !role) return;

    try {
      await api.updateUser(selectedUser.id, {
        full_name: fullName,
        email,
        role,
        is_active: isActive,
        ...(password ? { password } : {}) // Include password only if typed
      });
      setIsEditOpen(false);
      resetForm();
      loadUsersData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own active administrator account!");
      return;
    }
    setDeleteConfirmId(id);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteUser(deleteConfirmId);
      loadUsersData();
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
      setDeleteConfirmId(null);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('Employee');
    setIsActive(true);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (uRole: UserRole) => {
    switch (uRole) {
      case 'Administrator': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'Project Manager': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Employee': return 'bg-slate-100 text-slate-650 border-slate-200';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="user-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search users by name, email, or role..."
          />
        </div>

        <button
          id="user-add-modal-btn"
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer transition-all"
        >
          <Plus className="h-4.5 w-4.5 mr-1.5" />
          Register User
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users List Container */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">User Profile</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Role Privilege</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Registration Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <img 
                      src={userItem.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
                      alt={userItem.full_name} 
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{userItem.full_name}</span>
                      {userItem.id === currentUser?.id && (
                        <span className="text-xxs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-100">You</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                    <span className="flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      {userItem.email}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(userItem.role)}`}>
                      <Shield className="h-3.5 w-3.5 mr-1 shrink-0" />
                      {userItem.role}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xxs font-extrabold border uppercase tracking-wider ${
                      userItem.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {userItem.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-450 font-semibold">
                    {new Date(userItem.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        id={`user-edit-btn-${userItem.id}`}
                        onClick={() => handleOpenEdit(userItem)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Edit User Info"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        id={`user-delete-btn-${userItem.id}`}
                        disabled={userItem.id === currentUser?.id}
                        onClick={() => handleDeleteUser(userItem.id)}
                        className={`p-1.5 rounded-lg text-slate-400 cursor-pointer ${
                          userItem.id === currentUser?.id 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'hover:bg-red-50 hover:text-red-600'
                        }`}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsAddOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-lg text-slate-900">Register New User</h3>
                <button 
                  id="user-add-close-btn"
                  onClick={() => setIsAddOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label htmlFor="u-fullname" className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    id="u-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Michael Jordan"
                  />
                </div>

                <div>
                  <label htmlFor="u-email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    id="u-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="u-pass" className="block text-sm font-semibold text-slate-700">Initial Password</label>
                  <input
                    id="u-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="u-role" className="block text-sm font-semibold text-slate-700">Access Privilege Role</label>
                  <select
                    id="u-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Employee">Employee (Completes tasks)</option>
                    <option value="Project Manager">Project Manager (Creates projects/tasks)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="user-add-cancel-btn"
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="user-add-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {isEditOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setIsEditOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full overflow-hidden relative z-10"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-lg text-slate-900">Edit User Profile</h3>
                <button 
                  id="user-edit-close-btn"
                  onClick={() => setIsEditOpen(false)} 
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="p-6 space-y-4">
                <div>
                  <label htmlFor="ue-fullname" className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    id="ue-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="ue-email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    id="ue-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="ue-pass" className="block text-sm font-semibold text-slate-700">
                    Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
                  </label>
                  <input
                    id="ue-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 block w-full border border-slate-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="ue-role" className="block text-sm font-semibold text-slate-700">Access Privilege Role</label>
                  <select
                    id="ue-role"
                    value={role}
                    disabled={selectedUser.id === currentUser?.id}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1.5 block w-full border border-slate-250 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="Employee">Employee (Completes tasks)</option>
                    <option value="Project Manager">Project Manager (Creates projects/tasks)</option>
                    {selectedUser.role === 'Administrator' && (
                      <option value="Administrator">Administrator (Manages users/system)</option>
                    )}
                  </select>
                </div>

                {selectedUser.id !== currentUser?.id && (
                  <div className="flex items-center justify-between p-3.5 border border-slate-150 rounded-2xl bg-slate-50/50">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Account Status</p>
                      <p className="text-xs text-slate-500">Allow this user to sign in to the platform.</p>
                    </div>
                    <button
                      id="user-edit-toggle-active"
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className="text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none cursor-pointer"
                    >
                      {isActive ? (
                        <ToggleRight className="h-9 w-9 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="h-9 w-9 text-slate-400" />
                      )}
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    id="user-edit-cancel-btn"
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="user-edit-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setDeleteConfirmId(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full overflow-hidden relative z-10 p-6 space-y-5"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Delete User?</h3>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    Are you sure you want to delete this user? This will permanently delete the user account and unassign them from all tasks. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  id="user-delete-cancel-btn"
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="user-delete-confirm-btn"
                  type="button"
                  onClick={confirmDeleteUser}
                  className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 shadow-xs cursor-pointer"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
