import { create } from 'zustand';
import { api } from '../services/api';

const TOKEN_KEY = 'drivehire_token';

const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  wishlist: JSON.parse(localStorage.getItem('drivehire_wishlist') || '[]'),
  applications: [],
  loading: false,
  error: null,

  // ── Auth ──
  initAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const { user } = await api.me();
      set({ user, token });
    } catch {
      // token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null });
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api.register(formData);
      localStorage.setItem(TOKEN_KEY, token);
      set({ token, user, loading: false });
      return user;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api.login({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      set({ token, user, loading: false });
      return user;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, applications: [], error: null });
  },

  updateProfile: async (body) => {
    set({ loading: true, error: null });
    try {
      const { user } = await api.updateProfile(body);
      set({ user, loading: false });
      return user;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // ── Wishlist (local) ──
  toggleWishlist: (jobId) => {
    const { wishlist } = get();
    const next = wishlist.includes(jobId)
      ? wishlist.filter(id => id !== jobId)
      : [...wishlist, jobId];
    localStorage.setItem('drivehire_wishlist', JSON.stringify(next));
    set({ wishlist: next });
  },

  // ── Applications (API) ──
  applyToJob: async (jobId) => {
    try {
      await api.apply(jobId);
      await get().fetchApplications();
    } catch {
      await get().fetchApplications();
    }
  },

  fetchApplications: async () => {
    const { user } = get();
    if (!user || user.role !== 'driver') return;
    try {
      const apps = await api.myApps();
      set({ applications: apps });
    } catch {
      // keep stale data
    }
  },

  clearError: () => set({ error: null }),
}));

export default useStore;
