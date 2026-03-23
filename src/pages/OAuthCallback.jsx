import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function OAuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const provider = location.pathname.split('/').pop();

    if (!code) {
      setError('No authorization code received');
      return;
    }

    const fetchToken = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/auth/oauth/${provider}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `code=${encodeURIComponent(code)}`
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'OAuth failed');
        }

        const tokens = await response.json();
        
        localStorage.setItem('token', tokens.access_token);
        localStorage.setItem('refreshToken', tokens.refresh_token);

        const userRes = await fetch('http://localhost:8081/api/auth/me', {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          localStorage.setItem('user', JSON.stringify(userData));
          window.location.href = '/profile';
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchToken();
  }, [location, navigate]);

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
          <h2 style={{ color: '#ff4d4d', marginBottom: '16px' }}>OAuth Error</h2>
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
            Back to Login
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
        <p>Completing sign in...</p>
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