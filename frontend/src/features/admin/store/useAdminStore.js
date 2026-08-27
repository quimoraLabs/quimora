import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

export const useAdminStore = create((set, get) => ({
  stats: null,
  users: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({ stats: response.data.stats, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch stats', loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // console.log(response.data);
      set({ users: response.data.users, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch users', loading: false });
    }
  },

  toggleUserActive: async (userId, currentStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/users/${userId}/active`,
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, active: !currentStatus } : user
        )
      }));
      // Refresh stats
      get().fetchStats();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to toggle user status' });
    }
  },

  deleteUser: async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId)
      }));
      get().fetchStats();
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete user' });
    }
  },
}));