import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logged_in') === 'true') {
      fetchUserFromCookie().then(() => {
        window.location.href = '/profile';
      });
      return;
    }

    fetchUserFromCookie();
  }, []);

  const fetchUserFromCookie = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        fetchUser(token);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
      }
    } catch (err) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Registration failed');
    
    const userRes = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
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
      headers: { 'Content-Type': 'application/x-www-urlencoded' },
      body: formData,
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || 'Login failed');
    
    const userRes = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
    });
    const userData = await userRes.json();
    setUser(userData);
    return result;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const updateProfile = async (data) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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