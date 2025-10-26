// API utilities for making authenticated requests with Axios
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  urlEncoded?: boolean;
  timeout?: number;
}

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

// Get API base URL from localStorage or use default
const getApiBaseUrl = (): string => {
  return localStorage.getItem('api_base_url') || DEFAULT_API_BASE_URL;
};

// Create axios instance with configurable base URL
const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Accept': 'application/json'
    },
    timeout: 10000 // 10 seconds timeout
  });
};

let axiosInstance: AxiosInstance = createAxiosInstance();

// Function to update the axios instance with new base URL
export const updateApiBaseUrl = (newBaseUrl: string): void => {
  localStorage.setItem('api_base_url', newBaseUrl);
  axiosInstance = createAxiosInstance();
  
  // Re-add interceptors to the new instance
  axiosInstance.interceptors.request.use(
    (config) => {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // Add auth header if token exists
      if (token && config.headers) {
        config.headers['Authorization'] = token;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage = error.response?.data?.error || `API request failed with status ${error.response?.status || 'unknown'}`;
      return Promise.reject(new Error(errorMessage));
    }
  );
};

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Add auth header if token exists
    if (token && config.headers) {
      config.headers['Authorization'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || `API request failed with status ${error.response?.status || 'unknown'}`;
    return Promise.reject(new Error(errorMessage));
  }
);

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    urlEncoded = false,
    timeout,
  } = options;

  // Prepare request config
  const config: AxiosRequestConfig = {
    method,
    url: endpoint,
    headers: { ...headers }
  };
  
  // Apply custom timeout if provided
  if (timeout) {
    config.timeout = timeout;
  }

  // Prepare request data
  if (body) {
    if (urlEncoded) {
      config.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
      if (typeof body === 'object') {
        const formData = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        config.data = formData.toString();
      } else {
        config.data = String(body);
      }
    } else {
      config.headers!['Content-Type'] = 'application/json';
      config.data = body; // Axios will automatically stringify JSON
    }
  }

  // Make the request
  try {
    const response: AxiosResponse<T> = await axiosInstance(config);
    return response.data;
  } catch (error) {
    throw error; // Error is already handled by the response interceptor
  }
}