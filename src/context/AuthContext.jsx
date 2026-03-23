import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Registration failed');
    
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('refreshToken', result.refresh_token);
    
    const userRes = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${result.access_token}` }
    });
    const userData = await userRes.json();
    setUser(userData);
    return result;
  };

  const login = async (data) => {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);
    
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Login failed');
    
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('refreshToken', result.refresh_token);
    
    const userRes = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${result.access_token}` }
    });
    const userData = await userRes.json();
    setUser(userData);
    return result;
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/';
  };

  const updateProfile = async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Update failed');
    setUser(result);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
