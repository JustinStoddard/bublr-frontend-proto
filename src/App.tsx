import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css"
import 'mapbox-gl/dist/mapbox-gl.css';

import PageLoader from "./components/PageLoader";

const LoginPage = lazy(() => import('./pages/LoginPage'));
const BubblesPage = lazy(() => import('./pages/BubblesPage'));
const BubblePage = lazy(() => import('./pages/BubblePage'));

function App() {
  return (
    <div className='app-container'>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/bubbles" element={<BubblesPage />} />
            <Route path="/bubbles/:bubbleId" element={<BubblePage />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
