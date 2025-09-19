const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${url}`, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
};

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    return makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  login: async (credentials) => {
    return makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  googleAuth: async (idToken) => {
    return makeRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },
  getProfile: async () => {
    return makeRequest("/auth/profile");
  },
  updateProfile: async (profileData) => {
    return makeRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

// Files API functions
export const filesAPI = {
  upload: async (formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Don't set Content-Type for FormData
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Upload failed");
    }
    return response.json();
  },
  getUserFiles: async (page = 1, limit = 10) => {
    return makeRequest(`/files/user-files?page=${page}&limit=${limit}`);
  },
  getFileInfo: async (fileId) => {
    return makeRequest(`/files/info/${fileId}`);
  },
  downloadFile: async (fileId, password = null) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Download failed");
    }
    return response.json();
  },
  deleteFile: async (fileId) => {
    return makeRequest(`/files/${fileId}`, {
      method: "DELETE",
    });
  },
};

// Utility function to download file from base64
export const downloadFileFromBase64 = (base64Data, filename, mimeType) => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
