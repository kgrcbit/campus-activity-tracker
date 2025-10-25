import {create} from 'zustand';
import axios from 'axios';

// Create a basic Axios instance with your backend URL (Naveen's server)
export const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Assume backend runs on port 5000
});

// Axios interceptor to automatically attach the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken'); // cite: 2.1
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // cite: 2.1
  }
  return config;
});

const useAuthStore = create((set) => ({
  token: localStorage.getItem('jwtToken') || null, // Check storage on load
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('jwtToken'),

  login: (token, user) => {
    localStorage.setItem('jwtToken', token); // cite: 2.1, 2.3
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;