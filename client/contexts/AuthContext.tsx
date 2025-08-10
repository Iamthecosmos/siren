import React, { createContext, useContext, useEffect, useState } from "react";
import { User, api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (profileData: {
    fullName?: string;
    username?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        const response = await api.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        } else {
          // Invalid token, clear it
          localStorage.removeItem("auth_token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });

      if (response.data) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    try {
      const response = await api.register(userData);

      if (response.data) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Registration failed",
        };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: {
    fullName?: string;
    username?: string;
  }) => {
    try {
      const response = await api.updateProfile(profileData);

      if (response.data) {
        setUser(response.data);
        return { success: true };
      } else {
        return { success: false, error: response.error || "Update failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
