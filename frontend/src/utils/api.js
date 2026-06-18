import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // Sesuaikan dengan port 3000 backend lu
});

// Otomatis nyisipin token ke Header kalau user udah login
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;