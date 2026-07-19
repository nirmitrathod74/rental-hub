export const API_ROOT = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : `${window.location.protocol}//${window.location.hostname}:8000`);
const BASE_URL = `${API_ROOT}/api`;

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure the path starts with /media/ if it's a relative path from DRF
  let normalizedPath = path;
  if (!normalizedPath.startsWith('/media/') && !normalizedPath.startsWith('media/')) {
    normalizedPath = `/media/${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
  }
  
  return `${API_ROOT}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};

// Retrieve JWT access token from localStorage and construct request authorization headers
const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- CUSTOM DRF ERROR RESPONSE PARSER ---
// Processes failed HTTP responses (non-2xx) and extracts human-readable validation messages.
// This is critical because Django REST Framework returns errors nested by field (e.g. {errors: {username: ["already exists"]}}).
const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    let errorMessage = err.detail || err.error || err.message;
    
    // Check if error response contains a structured 'errors' object (Django serializer validation dictionary)
    if (err.errors && typeof err.errors === 'object') {
      const firstField = Object.keys(err.errors)[0];
      const fieldError = err.errors[firstField];
      // Format it as: "fieldname: error message" (e.g., "username: A user with that username already exists.")
      if (Array.isArray(fieldError) && fieldError.length > 0) {
        errorMessage = `${firstField}: ${fieldError[0]}`;
      } else if (typeof fieldError === 'string') {
        errorMessage = `${firstField}: ${fieldError}`;
      }
    }
    
    // Fallback to raw stringified JSON if no specific error message was parsed
    if (!errorMessage && Object.keys(err).length) {
      errorMessage = JSON.stringify(err);
    }
    throw new Error(errorMessage || 'API Request Failed');
  }
  return response.json();
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const headers = getHeaders();
    // If the body is FormData (used for file/image uploads), browser automatically sets boundary,
    // so we delete the default application/json 'Content-Type' header.
    if (isFormData) {
      delete headers['Content-Type'];
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const headers = getHeaders();
    if (isFormData) {
      delete headers['Content-Type'];
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
