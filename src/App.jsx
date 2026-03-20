import { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from './api/client';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import Search from './pages/Search';
import AnimeDetails from './pages/AnimeDetails';
import Profile from './pages/Profile';
import Faq from './pages/Faq';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './styles/variables.css';
import './styles/globals.css';
import './App.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <motion.main 
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ApolloProvider client={client}>
      <LanguageProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/search" element={<Layout><Search /></Layout>} />
              <Route path="/anime/:id" element={<Layout><AnimeDetails /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/faq" element={<Layout><Faq /></Layout>} />
              <Route path="/terms" element={<Layout><Terms /></Layout>} />
              <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </ApolloProvider>
  );
}

export default App;