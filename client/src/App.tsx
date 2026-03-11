import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormBuilderPage from './pages/FormBuilderPage';
import FormFillerPage from './pages/FormFillerPage';
import FormResponsesPage from './pages/FormResponsesPage';

function Header() {
  const { pathname } = useLocation();

  const navLink = (to: string, label: string): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: 500,
    color: pathname === to ? '#6c63ff' : '#5f6368',
    padding: '6px 14px',
    borderRadius: 8,
    background: pathname === to ? '#ede9ff' : 'transparent',
  });

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontSize: 20, fontWeight: 700, color: '#6c63ff', textDecoration: 'none' }}>📋 FormsLite</Link>
        <nav style={{ display: 'flex', gap: 4 }}>
          <Link to="/" style={navLink('/', 'My Forms')}>My Forms</Link>
          <Link to="/forms/new" style={{ ...navLink('/forms/new', ''), textDecoration: 'none' }}>+ New Form</Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Routes>
        <Route path="/"                    element={<HomePage />} />
        <Route path="/forms/new"           element={<FormBuilderPage />} />
        <Route path="/forms/:id/fill"      element={<FormFillerPage />} />
        <Route path="/forms/:id/responses" element={<FormResponsesPage />} />
      </Routes>
    </div>
  );
}
