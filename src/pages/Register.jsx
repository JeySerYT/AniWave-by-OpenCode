import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.svg';
import { API_URL } from '../api/config';
import './Auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!agreed) {
      setError('Вы должны принять условия');
      return;
    }

    setLoading(true);
    try {
      await register({ email, username, password, terms_accepted: agreed, privacy_accepted: agreed });
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const response = await fetch(`${API_URL}/auth/oauth/${provider}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.auth_url) {
        const popup = window.open(data.auth_url, 'oauth_popup', 'width=600,height=700,focus=yes');
        if (!popup) {
          window.location.href = data.auth_url;
          return;
        }
        const handleMessage = (event) => {
          if (event.data === 'oauth-login') {
            window.removeEventListener('message', handleMessage);
            window.location.href = '/profile';
          }
        };
        window.addEventListener('message', handleMessage);
        const pollTimer = setInterval(() => {
          if (popup.closed) {
            clearInterval(pollTimer);
            window.removeEventListener('message', handleMessage);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <img src={Logo} alt="AniWave" />
            </Link>
            <h1>Создать аккаунт</h1>
            <p>Присоединяйтесь к AniWave</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="form-group">
              <div className="input-wrap">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                />
                <Mail size={16} className="input-icon" />
                <label>Email</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrap">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  minLength={3}
                  maxLength={30}
                  required
                />
                <User size={16} className="input-icon" />
                <label>Имя пользователя</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrap">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  minLength={8}
                  required
                />
                <Lock size={16} className="input-icon" />
                <label>Пароль</label>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  Я согласен с <Link to="/terms">Условиями использования</Link> и <Link to="/privacy">Политикой конфиденциальности</Link>
                </span>
              </label>
            </div>

            <motion.button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading || !agreed}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? 'Загрузка...' : 'Регистрация'}
            </motion.button>
          </form>

          <div className="auth-divider">
            <span>или</span>
          </div>

          <div className="oauth-buttons">
            <motion.button 
              type="button"
              className="oauth-btn google"
              onClick={() => handleOAuthLogin('google')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </motion.button>
            <motion.button 
              type="button"
              className="oauth-btn github"
              onClick={() => handleOAuthLogin('github')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </motion.button>
          </div>

          <p className="auth-switch">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
