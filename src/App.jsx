import { useState, memo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import SearchModal from './components/SearchModal';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Search from './pages/Search';
import AnimeDetails from './pages/AnimeDetails';
import AnimeWatch from './pages/AnimeWatch';
import Profile from './pages/Profile';
import Faq from './pages/Faq';
import Footer from './components/Footer';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dmca from './pages/Dmca';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import NotFound from './pages/NotFound';
import './styles/variables.css';
import './styles/globals.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Layout = memo(({ children, hideHeader, onSearchOpen }) => (
  <div className="layout">
    {!hideHeader && <Header onSearchOpen={onSearchOpen} />}
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
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = () => setSearchOpen(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="App">
              <Routes>
                <Route path="/" element={<Layout onSearchOpen={openSearch}><Home /></Layout>} />
                <Route path="/search" element={<Layout onSearchOpen={openSearch}><Search /></Layout>} />
                <Route path="/anime/:id" element={<Layout onSearchOpen={openSearch}><AnimeDetails /></Layout>} />
                <Route path="/anime/:id/watch" element={<Layout onSearchOpen={openSearch}><AnimeWatch /></Layout>} />
                <Route path="/profile" element={<Layout onSearchOpen={openSearch}><Profile /></Layout>} />
                <Route path="/faq" element={<Layout onSearchOpen={openSearch}><Faq /></Layout>} />
                <Route path="/terms" element={<Layout onSearchOpen={openSearch}><Terms /></Layout>} />
                <Route path="/privacy" element={<Layout onSearchOpen={openSearch}><Privacy /></Layout>} />
                <Route path="/dmca" element={<Layout onSearchOpen={openSearch}><Dmca /></Layout>} />
                <Route path="/login" element={<Layout hideHeader onSearchOpen={openSearch}><Login /></Layout>} />
                <Route path="/register" element={<Layout hideHeader onSearchOpen={openSearch}><Register /></Layout>} />
                <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
                <Route path="*" element={<Layout onSearchOpen={openSearch}><NotFound /></Layout>} />
              </Routes>
            </div>
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
