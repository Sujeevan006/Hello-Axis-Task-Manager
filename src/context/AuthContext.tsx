import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '../types';

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
  updateUserProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
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
      // Sync with tm_users list
      const savedUsers = localStorage.getItem('tm_users');
      if (savedUsers) {
        const users: User[] = JSON.parse(savedUsers);
        const index = users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          users[index] = user;
          localStorage.setItem('tm_users', JSON.stringify(users));
        }
      }
    } else {
      localStorage.removeItem('tm_user');
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    const savedUsers = localStorage.getItem('tm_users');
    let allUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];

    // Special case for Mail Admin
    if (email === 'admin@gmail.com') {
      let admin = allUsers.find((u) => u.email === email);

      if (!admin) {
        // First ever login for the super admin - no password needed
        admin = {
          id: 'admin-001',
          name: 'Admin',
          email: 'admin@gmail.com',
          role: 'admin',
          needsPasswordChange: true,
        };
        allUsers.push(admin);
        localStorage.setItem('tm_users', JSON.stringify(allUsers));
        setUser(admin);
        return { success: true };
      }

      // If admin hasn't set a password yet, allow login without password
      if (!admin.password) {
        setUser(admin);
        return { success: true };
      }

      // If admin has set a password, require it
      if (!password) {
        return { success: false, error: 'Password is required' };
      }

      if (admin.password === password) {
        setUser(admin);
        return { success: true };
      }

      return { success: false, error: 'Incorrect password' };
    }

    const foundUser = allUsers.find((u) => u.email === email);
    if (foundUser) {
      if (!foundUser.password) {
        return {
          success: false,
          error: 'Account not fully set up. Please contact admin.',
        };
      }
      if (foundUser.password === password) {
        setUser(foundUser);
        return { success: true };
      }
      return { success: false, error: 'Incorrect password' };
    }

    return { success: false, error: 'User not found' };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
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
