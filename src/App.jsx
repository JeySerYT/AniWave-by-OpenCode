import { useState, memo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import SearchModal from './components/SearchModal';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const AnimeDetails = lazy(() => import('./pages/AnimeDetails'));
const AnimeWatch = lazy(() => import('./pages/AnimeWatch'));
const Profile = lazy(() => import('./pages/Profile'));
const Collections = lazy(() => import('./pages/Collections'));
const Settings = lazy(() => import('./pages/Settings'));
const Faq = lazy(() => import('./pages/Faq'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Dmca = lazy(() => import('./pages/Dmca'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const NotFound = lazy(() => import('./pages/NotFound'));
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
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <div className="App">
              <Suspense fallback={<div className="page-loading" style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#888'}}>Загрузка...</div>}>
              <Routes>
                <Route path="/" element={<Layout onSearchOpen={openSearch}><Home /></Layout>} />
                <Route path="/catalog" element={<Layout onSearchOpen={openSearch}><Catalog /></Layout>} />
                <Route path="/search" element={<Navigate to="/catalog" replace />} />
                <Route path="/anime/:id" element={<Layout onSearchOpen={openSearch}><AnimeDetails /></Layout>} />
                <Route path="/anime/:id/watch" element={<Layout onSearchOpen={openSearch}><AnimeWatch /></Layout>} />
                <Route path="/profile" element={<Layout onSearchOpen={openSearch}><Profile /></Layout>} />
                <Route path="/my-list" element={<Layout onSearchOpen={openSearch}><Collections /></Layout>} />
                <Route path="/settings" element={<Layout onSearchOpen={openSearch}><Settings /></Layout>} />
                <Route path="/faq" element={<Layout onSearchOpen={openSearch}><Faq /></Layout>} />
                <Route path="/terms" element={<Layout onSearchOpen={openSearch}><Terms /></Layout>} />
                <Route path="/privacy" element={<Layout onSearchOpen={openSearch}><Privacy /></Layout>} />
                <Route path="/dmca" element={<Layout onSearchOpen={openSearch}><Dmca /></Layout>} />
                <Route path="/login" element={<Layout hideHeader onSearchOpen={openSearch}><Login /></Layout>} />
                <Route path="/register" element={<Layout hideHeader onSearchOpen={openSearch}><Register /></Layout>} />
                <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
                <Route path="*" element={<Layout onSearchOpen={openSearch}><NotFound /></Layout>} />
              </Routes>
              </Suspense>
            </div>
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
