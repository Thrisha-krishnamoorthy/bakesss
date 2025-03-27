
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginCredentials, RegistrationData } from '../utils/types';
import { login, registerUser } from '../utils/api';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegistrationData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await login(credentials);
      
      // In a real app, the backend would return the user object
      // For now, we'll simulate it with a fake user from localStorage (if exists) or create a new one
      const storedUser = localStorage.getItem(`user_${credentials.email}`);
      let loggedInUser: AuthUser;
      
      if (storedUser) {
        loggedInUser = JSON.parse(storedUser);
      } else {
        // Create a fake user object for demo purposes
        loggedInUser = {
          id: Math.floor(Math.random() * 1000),
          name: credentials.email.split('@')[0],
          email: credentials.email,
          phone: '123-456-7890',
          role: 'user'
        };
        localStorage.setItem(`user_${credentials.email}`, JSON.stringify(loggedInUser));
      }
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegistrationData): Promise<boolean> => {
    try {
      setLoading(true);
      await registerUser(data);
      
      // For demo, we'll automatically log the user in after registration
      const newUser: AuthUser = {
        id: Math.floor(Math.random() * 1000),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'user'
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem(`user_${data.email}`, JSON.stringify(newUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please check your information and try again",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
