import axios from "axios";
import Cookies from 'js-cookie';


const API_BASE_URL =  "http://localhost:5000/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Ensures cookies (JWT) are sent with requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach token before every request
apiClient.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle token expiry
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized - Redirecting to Login");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default apiClient;
