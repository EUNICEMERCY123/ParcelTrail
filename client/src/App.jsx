// Main application shell with sticky top bar and route layout (Module 4 React Router)
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import MyParcelsPage from './pages/MyParcelsPage';
import PickupPointsPage from './pages/PickupPointsPage';
import RecordsPage from './pages/RecordsPage';

function App() {
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 900) {
        if (window.scrollY !== 0) window.scrollTo(0, 0);
        const el = document.scrollingElement || document.documentElement;
        if (el && el.scrollTop !== 0) el.scrollTop = 0;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    const target = document.scrollingElement || document.documentElement;
    if (target) target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (target) target.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell app-layout">
        <TopBar />
        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/my-parcels" element={<MyParcelsPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/pickup-points" element={<PickupPointsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
