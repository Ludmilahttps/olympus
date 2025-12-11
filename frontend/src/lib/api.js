import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Ou de onde você estiver pegando o token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de token expirado, etc.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Exemplo: se o token JWT expirou e a resposta é 401
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Lógica para refresh token aqui, se aplicável
      // Ex: const newAccessToken = await refreshToken();
      // api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      // return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

// Serviços da API
export const authAPI = {
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/register/', userData),
  logout: () => api.post('/auth/logout/'),
  refreshToken: (refreshToken) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

export const workspacesAPI = {
  getAll: (params) => api.get('/workspaces/', { params }),
  getById: (id) => api.get(`/workspaces/${id}/`),
  create: (data) => api.post('/workspaces/', data),
  update: (id, data) => api.patch(`/workspaces/${id}/`, data),
  delete: (id) => api.delete(`/workspaces/${id}/`),
  addReview: (id, review) => api.post(`/workspaces/${id}/reviews/`, review),
  uploadImage: (id, formData) => api.post(`/workspaces/${id}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const tripsAPI = {
  getAll: () => api.get('/trips/'),
  getById: (id) => api.get(`/trips/${id}/`),
  create: (data) => api.post('/trips/', data),
  update: (id, data) => api.patch(`/trips/${id}/`, data),
  delete: (id) => api.delete(`/trips/${id}/`),
  addWorkspace: (id, workspace) => api.post(`/trips/${id}/workspaces/`, workspace),
  addItinerary: (id, item) => api.post(`/trips/${id}/itinerary/`, item),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.patch(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};