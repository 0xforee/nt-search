// API utilities for making authenticated requests

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  urlEncoded?: boolean;
}

export const API_BASE_URL = 'http://localhost:3000/api/v1';

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    urlEncoded = false,
  } = options;

  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'accept': 'application/json',
    ...headers,
  };

  // Add auth header if token exists
  if (token) {
    requestHeaders['Authorization'] = token;
  }

  // Prepare request body
  let requestBody: string | undefined;
  
  if (body) {
    if (urlEncoded) {
      requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      if (typeof body === 'object') {
        const formData = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        requestBody = formData.toString();
      } else {
        requestBody = String(body);
      }
    } else {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  // Make the request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  // Handle response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}