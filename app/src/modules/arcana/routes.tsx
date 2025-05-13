/**
 * Arcana Module Routes
 * 
 * This file defines the routes for the Arcana module.
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ArcanaPage from './pages/ArcanaPage';
import EnhancedArcanaPage from './pages/EnhancedArcanaPage';

/**
 * ArcanaRoutes - Component that defines the routes for the Arcana module
 */
export const ArcanaRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ArcanaPage />} />
      <Route path="/enhanced" element={<EnhancedArcanaPage />} />
    </Routes>
  );
};

export default ArcanaRoutes;
