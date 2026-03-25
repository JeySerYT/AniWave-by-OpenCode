import { useState, useEffect, memo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Search from './pages/Search';
import AnimeDetails from './pages/AnimeDetails';
import AnimeWatch from './pages/AnimeWatch';
import Profile from './pages/Profile';
import Faq from './pages/Faq';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import './styles/variables.css';
import './styles/globals.css';
import './App.css';

const Layout = memo(({ children, hideHeader }) => (
  <div className="layout">
    {!hideHeader && <Header />}
    <motion.main 
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.main>
  </div>
));

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/search" element={<Layout><Search /></Layout>} />
              <Route path="/anime/:id" element={<Layout><AnimeDetails /></Layout>} />
              <Route path="/anime/:id/watch" element={<Layout><AnimeWatch /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/faq" element={<Layout><Faq /></Layout>} />
              <Route path="/terms" element={<Layout><Terms /></Layout>} />
              <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
              <Route path="/login" element={<Layout hideHeader><Login /></Layout>} />
              <Route path="/register" element={<Layout hideHeader><Register /></Layout>} />
              <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;