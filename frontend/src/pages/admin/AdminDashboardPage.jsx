import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminStore } from '../../features/admin/store/useAdminStore';
import StatCard from "../../components/common/StatCard";
import { Users, UserCheck, BookOpen, GraduationCap } from 'lucide-react';
import AdminUserTable from '../../features/admin/components/AdminUserTable';
import AdminUserViewModal from '../../features/admin/components/AdminUserViewModal';
import NewUsersChart from '../../features/admin/components/NewUserChart';

const AdminDashboardPage = () => {
  const { stats, users, loading, fetchStats, fetchUsers, toggleUserActive, deleteUser } = useAdminStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []); // Empty dependency array — runs only once

  const handleViewUser = useCallback((user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  }, []);

  // Memoize stats data to prevent unnecessary re-renders
  const statsData = useMemo(() => [
    { title: 'Total Users', value: stats?.users?.total || 0, icon: Users, change: `${stats?.users?.active || 0} active`, gradient: 'from-blue-500 to-cyan-400' },
    { title: 'Active Users', value: stats?.users?.active || 0, icon: UserCheck, change: `${stats?.users?.deactivated || 0} deactivated`, gradient: 'from-green-500 to-emerald-400' },
    { title: 'Total Quizzes', value: stats?.instructorsOverview?.totalQuizzes || 0, icon: BookOpen, change: `${stats?.instructorsOverview?.publishedQuizzes || 0} published`, gradient: 'from-purple-500 to-indigo-400' },
    { title: 'Pass Rate', value: stats?.studentsOverview?.overallPassRate || '0%', icon: GraduationCap, change: `${stats?.studentsOverview?.totalAttempts || 0} attempts`, gradient: 'from-orange-500 to-amber-400' },
  ], [stats]);

  return (
    <div className="min-h-screen bg-main p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-main">Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">Manage users, quizzes, and monitor platform activity</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted bg-surface px-3 py-1.5 rounded-full border border-main shadow-card">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <StatCard key={idx} stat={{ ...stat, idx }} />
        ))}
      </div>

      {/* Chart + Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NewUsersChart data={[]} /> {/* Pass empty array to use sample data */}
        </div>
        <div className="bg-surface rounded-2xl shadow-card border border-main p-6 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-main mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-main pb-2">
              <span className="text-muted text-sm">Total Instructors</span>
              <span className="font-bold text-main">{stats?.instructorsOverview?.totalInstructors || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b border-main pb-2">
              <span className="text-muted text-sm">Published Quizzes</span>
              <span className="font-bold text-main">{stats?.instructorsOverview?.publishedQuizzes || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b border-main pb-2">
              <span className="text-muted text-sm">Total Attempts</span>
              <span className="font-bold text-main">{stats?.studentsOverview?.totalAttempts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Completion Rate</span>
              <span className="font-bold text-main">{stats?.studentsOverview?.completionRate || '0%'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <AdminUserTable
        users={users || []}
        loading={loading}
        onToggleActive={toggleUserActive}
        onDelete={deleteUser}
        onViewDetails={handleViewUser}
      />

      {/* View User Modal */}
      <AdminUserViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminDashboardPage;