import axios from 'axios';

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect if we're already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start the backend server on port 5000.');
    }

    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    throw new Error('Cannot connect to backend server. Make sure it\'s running on port 5000.');
  }
};

// Auth services
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Task services
export const taskService = {
  getTasks: (params = {}) =>
    api.get('/tasks', { params }),

  getTask: (id) =>
    api.get(`/tasks/${id}`),

  createTask: (taskData) =>
    api.post('/tasks', taskData),

  updateTask: (id, taskData) =>
    api.put(`/tasks/${id}`, taskData),

  deleteTask: (id) =>
    api.delete(`/tasks/${id}`),
};

// Add notification services
export const notificationService = {
  getNotifications: (params = {}) =>
    api.get('/notifications', { params }),

  markAsRead: (id) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all'),

  deleteNotification: (id) =>
    api.delete(`/notifications/${id}`),

  getUnreadCount: () =>
    api.get('/notifications', { params: { unreadOnly: true, limit: 1 } })
      .then(res => res.data.unreadCount),
};

export default api;