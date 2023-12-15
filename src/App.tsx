import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import "./App.css"
import 'mapbox-gl/dist/mapbox-gl.css';

import PageLoader from "./components/PageLoader";
import { BublrUser, UserContext } from './types/bubble-types';
import LandingPage from './pages/LandingPage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BubblesPage = lazy(() => import('./pages/BubblesPage'));
const BubblePage = lazy(() => import('./pages/BubblePage'));

function App() {
  const [userContext, setUserContext] = useState<UserContext>({
    loggedIn: false,
    user: null,
  });

  return (
    <div className='app-container'>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage userContext={userContext} setUserContext={(c: UserContext) => setUserContext(c)} />} />
            <Route path="/register" element={<RegisterPage userContext={userContext} setUserContext={(c: UserContext) => setUserContext(c)} />} />
            <Route path="/bubbles" element={<BubblesPage userContext={userContext} setUserContext={(c: UserContext) => setUserContext(c)} />} />
            <Route path="/bubbles/:bubbleId" element={<BubblePage userContext={userContext} />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

export default App;
