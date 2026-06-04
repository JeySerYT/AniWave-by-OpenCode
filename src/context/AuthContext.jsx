import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
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
      console.error('Failed to fetch user:', err);
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
    
    try {
      const userRes = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      const userData = await userRes.json();
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user after register:', err);
    }

    const redirectUrl = sessionStorage.getItem('redirect_after_login');
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login');
      navigate(redirectUrl);
    } else {
      navigate('/profile');
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
    
    try {
      const userRes = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      const userData = await userRes.json();
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user after login:', err);
    }

    const redirectUrl = sessionStorage.getItem('redirect_after_login');
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login');
      navigate(redirectUrl);
    } else {
      navigate('/profile');
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
    setUser(null);
    navigate('/');
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
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile, refresh: fetchUserFromCookie }}>
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