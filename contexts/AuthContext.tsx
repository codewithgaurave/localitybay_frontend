import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void; // Direct login method
  loginAsync: (email: string, password: string) => Promise<void>; // Async login
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  
  console.log('🔐 AuthProvider state:', { user: !!user, isAuthenticated, isLoading });

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('🔐 Initializing auth...');
    try {
      if (authService.isAuthenticated()) {
        console.log('🔐 User is authenticated, fetching user data...');
        const userData = await authService.getCurrentUser();
        console.log('🔐 User data fetched:', userData);
        setUser(userData);
      } else {
        console.log('🔐 User is not authenticated');
      }
    } catch (error) {
      console.error("💥 Failed to initialize auth:", error);
      // Clear invalid token
      authService.clearAuth();
    } finally {
      console.log('🔐 Auth initialization complete, isLoading = false');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      console.log('✅ Login successful:', response.data.user);
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add login method that accepts user and token directly
  const loginWithUserData = (user: User, token: string) => {
    setUser(user);
    console.log('✅ Login with user data successful:', user);
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear local state even if server logout fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Clear invalid token
      authService.clearAuth();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: loginWithUserData, // Use the direct login method
    loginAsync: login, // Keep async login for login page
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
