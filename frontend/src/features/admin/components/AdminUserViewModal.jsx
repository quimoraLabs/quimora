import React from 'react';
import { X, Mail, User, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import ModalWrapper from '../../../components/common/ModalWrapper';

const AdminUserViewModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const getRoleBadge = (role) => {
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="User Details" size="md">
      <div className="space-y-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <img
            src={user.avatar?.url || `https://api.dicebear.com/9.x/identicon/svg?seed=${user.username}`}
            alt={user.name}
            className="w-16 h-16 rounded-full bg-elevated border-2 border-main object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-main">{user.name || 'Unnamed'}</h3>
            <p className="text-sm text-muted">@{user.username || 'no-username'}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-elevated rounded-xl border border-main">
            <Mail className="w-5 h-5 text-muted" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-main">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-elevated rounded-xl border border-main">
            <Shield className="w-5 h-5 text-muted" />
            <div>
              <p className="text-xs text-muted">Role</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                {user.role || 'user'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-elevated rounded-xl border border-main">
            <Calendar className="w-5 h-5 text-muted" />
            <div>
              <p className="text-xs text-muted">Joined</p>
              <p className="text-sm font-medium text-main">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-elevated rounded-xl border border-main">
            {user.active !== false ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="text-xs text-muted">Status</p>
              <p className={`text-sm font-medium ${user.active !== false ? 'text-green-600' : 'text-red-600'}`}>
                {user.active !== false ? 'Active' : 'Deactivated'}
              </p>
            </div>
          </div>
        </div>

        {/* Extra Info (Optional) */}
        {user.bio && (
          <div className="p-3 bg-elevated rounded-xl border border-main">
            <p className="text-xs text-muted">Bio</p>
            <p className="text-sm text-main mt-1">{user.bio}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-mid text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AdminUserViewModal;