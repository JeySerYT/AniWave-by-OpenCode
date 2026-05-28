import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const redirectUrl = sessionStorage.getItem('redirect_after_login');
if (redirectUrl) {
  sessionStorage.removeItem('redirect_after_login');
  window.location.href = redirectUrl;
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
