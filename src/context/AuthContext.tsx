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
    password?: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  changePassword: (
    password: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tm_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tm_user');
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tm_user');
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
        // Update local user state to reflect password change if needed (e.g., needsPasswordChange = false)
        setUser({ ...user, needsPasswordChange: false });
      }
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to change password'
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        changePassword,
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
