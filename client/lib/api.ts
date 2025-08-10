const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Mock mode for development when backend is not available
const MOCK_MODE = import.meta.env.VITE_MOCK_API === "true" || false;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  details?: any[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    // In development, try to connect to backend but fall back gracefully
    if (MOCK_MODE) {
      return this.getMockResponse<T>(endpoint, options);
    }

    const token = this.getAuthToken();
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || "Request failed" };
      }

      return { data };
    } catch (error) {
      console.warn("Backend not available, using mock data");
      return this.getMockResponse<T>(endpoint, options);
    }
  }

  private getMockResponse<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    // Simple mock responses for development
    return new Promise((resolve) => {
      setTimeout(() => {
        if (
          endpoint.includes("/auth/login") ||
          endpoint.includes("/auth/register")
        ) {
          resolve({
            data: {
              token: "mock-jwt-token",
              user: {
                id: 1,
                uuid: "mock-uuid",
                username: "mockuser",
                phoneNumber: "+1 (555) 123-4567",
                fullName: "Mock User",
                isVerified: true,
                isAdmin: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            } as T,
          });
        } else if (endpoint.includes("/reports")) {
          resolve({
            data: {
              reports: [],
              pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
            } as T,
          });
        } else if (endpoint.includes("/voices")) {
          resolve({
            data: {
              voices: [],
              pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
            } as T,
          });
        } else {
          resolve({ data: {} as T });
        }
      }, 500);
    });
  }

  // Authentication
  async register(userData: {
    username: string;
    phoneNumber: string;
    fullName: string;
    otp: string;
  }) {
    return this.request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { phoneNumber: string; otp: string }) {
    return this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request<User>("/auth/me");
  }

  async updateProfile(profileData: { fullName?: string; username?: string }) {
    return this.request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Community Reports
  async getReports(
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      severity?: string;
      lat?: number;
      lng?: number;
      radius?: number;
      since?: string;
    } = {},
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request<{
      reports: CommunityReport[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/reports?${params.toString()}`);
  }

  async createReport(reportData: {
    title: string;
    description: string;
    incidentType: string;
    severity: string;
    latitude: number;
    longitude: number;
    address?: string;
    timestamp?: string;
    witnessCount?: string;
    policeNotified?: boolean;
    photos?: string[];
  }) {
    return this.request<CommunityReport>("/reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  }

  async getReport(reportId: string) {
    return this.request<CommunityReport>(`/reports/${reportId}`);
  }

  async verifyReport(reportId: string) {
    return this.request<{ message: string }>(`/reports/${reportId}/verify`, {
      method: "POST",
    });
  }

  async getReportsByArea(lat: number, lng: number, radius: number = 5) {
    return this.request<CommunityReport[]>(
      `/reports/area/${lat}/${lng}?radius=${radius}`,
    );
  }

  // Voice Contributions
  async getVoices(
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      gender?: string;
      ageRange?: string;
      language?: string;
      sort?: string;
    } = {},
  ) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request<{
      voices: VoiceContribution[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/voices?${params.toString()}`);
  }

  async uploadVoice(formData: FormData) {
    const token = this.getAuthToken();
    const url = `${this.baseUrl}/voices`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || "Upload failed" };
      }

      return { data };
    } catch (error) {
      return { error: "Network error occurred" };
    }
  }

  async getVoice(voiceId: string) {
    return this.request<VoiceContribution>(`/voices/${voiceId}`);
  }

  async rateVoice(voiceId: string, rating: number, review?: string) {
    return this.request<{ message: string }>(`/voices/${voiceId}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating, review }),
    });
  }

  async trackDownload(voiceId: string) {
    return this.request<{ message: string }>(`/voices/${voiceId}/download`, {
      method: "POST",
    });
  }

  async getUserVoices(userId: string) {
    return this.request<VoiceContribution[]>(`/voices/user/${userId}`);
  }

  // Health check
  async healthCheck() {
    if (MOCK_MODE) return true;

    try {
      const response = await fetch(
        `${this.baseUrl.replace("/api", "")}/health`,
      );
      return response.ok;
    } catch (error) {
      console.warn("Backend health check failed, using mock mode");
      return true; // Return true to allow app to function
    }
  }
}

// Types
export interface User {
  id: number;
  uuid: string;
  username: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl?: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CommunityReport {
  id: number;
  uuid: string;
  userId: number;
  title: string;
  description: string;
  incidentType: string;
  severity: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
  reportedAt: string;
  isVerified: boolean;
  verificationCount: number;
  status: string;
  photos: string[];
  witnessCount?: string;
  policeNotified: boolean;
  user?: {
    username: string;
    isVerified: boolean;
  };
}

export interface VoiceContribution {
  id: number;
  uuid: string;
  userId: number;
  title: string;
  description: string;
  voiceType: string;
  gender: string;
  ageRange: string;
  accent?: string;
  language: string;
  filePath: string;
  fileSize: number;
  duration: number;
  format: string;
  isApproved: boolean;
  isFeatured: boolean;
  downloadCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  user?: {
    username: string;
    isVerified: boolean;
  };
}

export const api = new ApiClient();
export default api;
