import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

const AdminUserTable = ({
  users = [],
  loading = false,
  onToggleActive,
  onDelete,
  onViewDetails,
  searchPlaceholder = "Search users by name, email, or username..."
}) => {
  // Local state for search, filter, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'instructor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-main overflow-hidden">
      {/* Header with Search & Filter */}
      <div className="p-5 border-b border-main flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-main">All Users</h3>
          <span className="text-xs text-muted bg-elevated px-2.5 py-1 rounded-full">
            {filteredUsers.length} users
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-main border border-main rounded-xl text-sm text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-mid/50 transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative w-full sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-main border border-main rounded-xl text-sm text-main focus:outline-none focus:ring-2 focus:ring-brand-mid/50 appearance-none transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-elevated border-b border-main">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">User</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-muted">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-brand-mid border-t-transparent rounded-full animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-muted">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'No users match your filters' 
                    : 'No users found'}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user.id || user._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-elevated/50 transition-colors"
                >
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar?.url || `https://api.dicebear.com/9.x/identicon/svg?seed=${user.username}`}
                        alt={user.name}
                        className="w-9 h-9 rounded-full bg-elevated border border-main object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium text-main">{user.name || 'Unnamed'}</p>
                        <p className="text-xs text-muted">@{user.username || 'no-username'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-muted truncate max-w-[180px]">
                    {user.email}
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {user.role || 'user'}
                    </span>
                  </td>

                  {/* Status Badge + Toggle */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        user.active !== false
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.active !== false ? 'Active' : 'Deactivated'}
                      </span>
                      <button
                        onClick={() => onToggleActive(user.id || user._id, user.active !== false)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.active !== false
                            ? 'hover:bg-red-50 text-muted hover:text-red-600 dark:hover:bg-red-900/20'
                            : 'hover:bg-green-50 text-muted hover:text-green-600 dark:hover:bg-green-900/20'
                        }`}
                        title={user.active !== false ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.active !== false ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewDetails?.(user)}
                        className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user.id || user._id)}
                        className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="sm:hidden relative inline-block text-left">
                      <Menu>
                        <MenuButton className="p-1.5 rounded-lg hover:bg-elevated text-muted transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems
                          anchor="bottom end"
                          className="z-50 rounded-xl border border-main bg-surface p-1 shadow-lg focus:outline-none min-w-36"
                        >
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                onClick={() => onViewDetails?.(user)}
                                className={`${
                                  focus ? 'bg-elevated' : ''
                                } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-main`}
                              >
                                <Eye className="w-4 h-4" /> View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                onClick={() => onToggleActive(user.id || user._id, user.active !== false)}
                                className={`${
                                  focus ? 'bg-elevated' : ''
                                } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                                  user.active !== false ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {user.active !== false ? (
                                  <><UserX className="w-4 h-4" /> Deactivate</>
                                ) : (
                                  <><UserCheck className="w-4 h-4" /> Activate</>
                                )}
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                onClick={() => onDelete(user.id || user._id)}
                                className={`${
                                  focus ? 'bg-elevated' : ''
                                } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600`}
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-main flex items-center justify-between">
          <p className="text-xs text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-elevated text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-brand-mid text-white'
                    : 'hover:bg-elevated text-muted'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-elevated text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;