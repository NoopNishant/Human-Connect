import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, Moon, Sun, Command, Search } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import './index.css';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, key: '1' },
    { name: 'Templates', path: '/templates', icon: <Settings size={20} />, key: '2' },
    { name: 'Submit Report', path: '/submit', icon: <FileText size={20} />, key: '3' },
    { name: 'Volunteers', path: '/volunteers', icon: <Users size={20} />, key: '4' },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const handleKeyDown = (e) => {
      if (e.altKey) {
        const item = navItems.find(i => i.key === e.key);
        if (item) navigate(item.path);
        if (e.key === 't') toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(12px)',
        borderRight: 'var(--sidebar-border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ marginBottom: '2.5rem', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1, whiteSpace: 'nowrap', color: 'var(--primary-color)' }}>
            {"Human Connect".split('').map((char, index) => (
              <span key={index} className="fade-letter" style={{ animationDelay: `${index * 0.05}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
          <img src="/logo.png" alt="Logo" className="pixar-animate" style={{ height: '2.5rem', width: 'auto' }} />
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-light)',
                  backgroundColor: isActive ? 'rgba(79,70,229,0.1)' : 'transparent',
                  borderRadius: '12px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.name}</span>
                <kbd className="kbd" style={{ opacity: 0.5 }}>Alt+{item.key}</kbd>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme (Alt+T)">
              <div className="theme-toggle-knob">
                {isDark ? <Moon size={12} color="#4F46E5" /> : <Sun size={12} color="#F59E0B" />}
              </div>
            </button>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
            <Command size={14} />
            <span style={{ fontSize: '0.7rem' }}>Alt + [1-4] to Navigate</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import SubmitReport from './pages/SubmitReport';
import Volunteers from './pages/Volunteers';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/submit" element={<SubmitReport />} />
            <Route path="/volunteers" element={<Volunteers />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
