import { create } from 'zustand';
import axiosClient from '../../../api/axiosClient';

export const useAdminStore = create((set, get) => ({
  stats: null,
  users: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchStats: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get('/admin/stats');
      set({ stats: response.data.stats, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch stats', loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get('/users');
      set({ users: response.data.users || [], loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch users', loading: false });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.post('/auth/admin/create-user', userData);
      // Refresh user list and stats
      await get().fetchUsers();
      await get().fetchStats();
      set({ loading: false });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create user';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  toggleUserActive: async (userId, currentStatus) => {
    try {
      await axiosClient.patch(`/users/${userId}/active`, { active: !currentStatus });
      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          (user._id === userId || user.id === userId)
            ? { ...user, active: !currentStatus }
            : user
        )
      }));
      // Refresh stats
      get().fetchStats();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to toggle user status' });
    }
  },

  deleteUser: async (userId) => {
    try {
      await axiosClient.delete(`/users/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user._id !== userId && user.id !== userId)
      }));
      get().fetchStats();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete user' });
    }
  },
}));