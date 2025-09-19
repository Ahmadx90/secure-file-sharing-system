import { auth } from "../integrations/firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Get the current user's ID token for authentication
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  });

  // Add custom headers from options
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.append(key, value);
    });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(errorData.error || "API request failed");
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

// File API functions
export const fileApi = {
  // Upload a file (using FormData for file upload)
  upload: async (formData: FormData) => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    return response.json();
  },

  // Delete a file
  delete: async (fileId: string) => {
    return apiRequest(`/api/files/${fileId}`, {
      method: "DELETE",
    });
  },

  // Download a file
  download: async (fileId: string) => {
    const token = await getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/files/download/${fileId}`,
      {
        method: "GET",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Download failed");
    }

    // For file downloads, return the blob
    return response.blob();
  },

  // Get file information
  getFileInfo: async (fileId: string) => {
    return apiRequest(`/api/files/info/${fileId}`);
  },

  // Get public file information
  getPublicFileInfo: async (fileId: string) => {
    return apiRequest(`/api/files/public/${fileId}`);
  },

  // Get user's files
  getUserFiles: async (page = 1, limit = 10) => {
    return apiRequest(`/api/files/user-files?page=${page}&limit=${limit}`);
  },
};

// Auth API functions
export const authApi = {
  // Login with email/password
  login: async (email: string, password: string) => {
    // This should be handled by Firebase client directly
    // Backend login is for token verification only
    return { success: true, message: "Use Firebase auth directly on client" };
  },

  // Signup with email/password
  signup: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    return apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  },

  // Google authentication
  googleAuth: async (token: string) => {
    return apiRequest("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  // Verify token
  verifyToken: async (token: string) => {
    return apiRequest("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};

// User API functions
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return apiRequest("/api/users/profile");
  },

  // Update user profile
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  }) => {
    return apiRequest("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};

export default apiRequest;
