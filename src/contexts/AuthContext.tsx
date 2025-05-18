import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
const API_URL = 'https://mypythonwebapp-edcjb3e3a0f5apg6.polandcentral-01.azurewebsites.net/api';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add response interceptor for handling token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user data
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const fetchUserData = async (token: string) => {
    try {
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(userResponse.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
      // If we can't fetch user data, the token might be invalid
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          return;
        }

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data if we have a valid token but no user data
        if (!user) {
          fetchUserData(token);
        }
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, user]);

  const login = async (username: string, password: string) => {
    try {
      // Create FormData for token request
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const { access_token } = response.data;
      setToken(access_token);
      
      // Get user info
      await fetchUserData(access_token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      await axios.post(`${API_URL}/register`, {
        email,
        username,
        password,
      });
      await login(username, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 