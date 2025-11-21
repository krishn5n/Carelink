import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    verify: () => apiClient.get('/auth/verify'),
};

// Patient API
export const patientAPI = {
    getVitals: (patientId, params) =>
        apiClient.get(`/api/patients/${patientId}/vitals`, { params }),
    getLatestVitals: (patientId) =>
        apiClient.get(`/api/patients/${patientId}/vitals/latest`),
    getProfile: (patientId) =>
        apiClient.get(`/api/patients/${patientId}/profile`),
};

// Doctor API
export const doctorAPI = {
    getPatients: (doctorId) =>
        apiClient.get(`/api/doctors/${doctorId}/patients`),
    getAlerts: (doctorId, params) =>
        apiClient.get(`/api/doctors/${doctorId}/alerts`, { params }),
    assignPatient: (doctorId, patientId) =>
        apiClient.post(`/api/doctors/${doctorId}/assign`, { patientId }),
};

export default apiClient;