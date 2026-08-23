'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string, targetRole?: string, skillsSummary?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
  loginDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const authData = await api.login({ email, password: pass });
    const userData: User = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      targetRole: authData.targetRole,
    };
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);
  };

  const register = async (
    email: string,
    pass: string,
    fullName: string,
    targetRole?: string,
    skillsSummary?: string
  ) => {
    const authData = await api.register({
      email,
      password: pass,
      fullName,
      targetRole,
      skillsSummary,
    });
    const userData: User = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      targetRole: authData.targetRole,
    };
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);
  };

  const loginDemo = async () => {
    try {
      await login('demo.candidate@jobtracker.dev', 'DemoPass123!');
    } catch (err) {
      // If demo user doesn't exist yet, automatically register demo user
      await register(
        'demo.candidate@jobtracker.dev',
        'DemoPass123!',
        'Jordan Vance',
        'Senior Full-Stack Engineer',
        'Java 21, Spring Boot, React, TypeScript, PostgreSQL, Docker, Microservices, Gemini AI, WSO2 API Platform'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
