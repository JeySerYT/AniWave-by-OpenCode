import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../api/config';

function OAuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      try {
        const userRes = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include'
        });
        
        if (userRes.ok) {
          if (window.opener) {
            window.opener.postMessage('oauth-login', window.location.origin);
            window.close();
          } else {
            window.location.href = '/profile';
          }
        } else {
          setError('Ошибка авторизации');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    verify();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#fff'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <h2 style={{ color: '#ff4d4d', marginBottom: '16px' }}>Ошибка OAuth</h2>
          <p style={{ color: '#888' }}>{error}</p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#6c5ce7',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Назад
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: '#0f0f0f'
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: 'center', color: '#fff' }}
      >
        <div className="loading-spinner" style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #333',
          borderTop: '3px solid #6c5ce7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p>Завершение входа...</p>
      </motion.div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default OAuthCallback;