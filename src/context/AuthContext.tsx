import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '../types';
import { authAPI, userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  register: (userData: any) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  changePassword: (
    password: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
  checkPasswordChangeRequired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        try {
          const profile = await authAPI.getMe();
          setUser(profile);
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // TEMPORARY: Hardcoded superadmin for development testing
    // TODO: Remove when backend registration is properly set up
    if (
      import.meta.env.DEV &&
      email === 'superadmin@axivers.com' &&
      password === 'Axis@123'
    ) {
      console.log('⚠️ USING HARDCODED SUPERADMIN CREDENTIALS FOR DEVELOPMENT');
      const mockUser = {
        id: 'superadmin-dev-id',
        name: 'Super Admin',
        email: 'superadmin@axivers.com',
        role: 'admin' as const,
        avatar: null,
        department: 'Management',
        needs_password_change: false,
        created_at: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'dev-superadmin-token-12345');
      return { success: true };
    }

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await userAPI.update(user.id, data);
        setUser(updatedUser);
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    }
  };

  const changePassword = async (password: string, newPassword: string) => {
    try {
      const response = await authAPI.changePassword(password, newPassword);
      if (response.success && user) {
        setUser({ ...user, needs_password_change: false });
      }
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to change password',
      );
    }
  };

  const checkPasswordChangeRequired = () => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return savedUser.needs_password_change === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isLoading,
        changePassword,
        checkPasswordChangeRequired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
