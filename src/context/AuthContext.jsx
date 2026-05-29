import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (!res.ok) {
      const msg = Array.isArray(result.detail) ? result.detail[0]?.msg || 'Ошибка регистрации' : result.detail || 'Ошибка регистрации';
      throw new Error(msg);
    }
    
    const userRes = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
    });
    const userData = await userRes.json();
    setUser(userData);

    const redirectUrl = sessionStorage.getItem('redirect_after_login');
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login');
      window.location.href = redirectUrl;
    }

    return result;
  };

  const login = async (data) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(result.detail) ? result.detail[0]?.msg || 'Ошибка входа' : result.detail || 'Ошибка входа';
      throw new Error(msg);
    }
    
    const userRes = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
    });
    const userData = await userRes.json();
    setUser(userData);

    const redirectUrl = sessionStorage.getItem('redirect_after_login');
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login');
      window.location.href = redirectUrl;
    }

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
    window.location.href = '/profile';
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