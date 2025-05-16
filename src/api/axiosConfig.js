import axios from 'axios';

// Determine the base URL based on environment
const API_URL = import.meta.env.PROD 
    ? 'https://online-loan-application-backend.vercel.app' // Production URL
    : 'http://localhost:8080'; // Development URL

// Create axios instance with base URL
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000, // 10 second timeout
    withCredentials: false // Set to false for cross-domain requests without credentials
});

// Request interceptor for adding the token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            // Unauthorized, clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
