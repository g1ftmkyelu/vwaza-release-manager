import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6155';

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      statusCode?: number;
    };
  };
  message: string;
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }

    const error: ApiError = {
      response: {
        status: response.status,
        data: errorData,
      },
      message: errorData.message || response.statusText,
    };
    throw error;
  }

  const contentType = response.headers.get('content-type');
  let data: T;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {

    data = {} as T; 
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
};

const handleError = (error: ApiError) => {
  const status = error.response?.status;
  const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';

  if (status === 401) {
    localStorage.removeItem('jwt_token');
    toast.error('Session expired or invalid. Please log in again.');
    window.location.href = '/login';
  } else if (status === 403) {
    toast.error('You do not have permission to perform this action.');
  } else if (status === 409) {
    toast.error(errorMessage);
  } else if (status === 429) {
    toast.error(errorMessage);
  } else if (status && status >= 500) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.error(errorMessage);
  }

  return Promise.reject(error);
};

const request = async <T>(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('jwt_token');
  const headers: HeadersInit = {
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (data instanceof FormData) {
    body = data;
    delete headers['Content-Type'];
  } else if (data) {
    body = JSON.stringify(data);
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body,
      ...options,
    });
    return await handleResponse<T>(response);
  } catch (error: any) {
    return handleError(error);
  }
};

const api = {
  get: <T>(url: string, options?: RequestInit) => request<T>('GET', url, undefined, options),
  post: <T>(url: string, data?: any, options?: RequestInit) => request<T>('POST', url, data, options),
  put: <T>(url: string, data?: any, options?: RequestInit) => request<T>('PUT', url, data, options),
  delete: <T>(url: string, options?: RequestInit) => request<T>('DELETE', url, undefined, options),
};

export default api;