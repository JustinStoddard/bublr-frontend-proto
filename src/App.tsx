import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css"
import 'mapbox-gl/dist/mapbox-gl.css';

import PageLoader from "./components/PageLoader";
import { UserContext } from './types/bubble-types';
import LandingPage from './pages/LandingPage';
import { getLocalStorageItem, setLocalStorageItem } from './utils/localStorage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BubblesPage = lazy(() => import('./pages/BubblesPage'));
const BubblePage = lazy(() => import('./pages/BubblePage'));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

function App() {
  const [userContext, setUserContext] = useState<UserContext>(() => {
    const defaultContext: UserContext = {
      loggedIn: false,
      user: null,
    };
    const userContext = getLocalStorageItem('userContext', defaultContext);
    return userContext as UserContext;
  });

  const storeUserContext = (c: UserContext) => {
    setLocalStorageItem('userContext', c);
    setUserContext(c);
  };

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage userContext={userContext} setUserContext={(c: UserContext) => storeUserContext(c)} />} />
          <Route path="/register" element={<RegisterPage userContext={userContext} setUserContext={(c: UserContext) => storeUserContext(c)} />} />
          <Route path="/bubbles" element={<BubblesPage userContext={userContext} setUserContext={(c: UserContext) => storeUserContext(c)} />} />
          <Route path="/bubbles/:bubbleId" element={<BubblePage userContext={userContext} />} />
          <Route path="/communities" element={<CommunitiesPage userContext={userContext} setUserContext={(c: UserContext) => storeUserContext(c)} />} />
          <Route path="/notifications" element={<NotificationsPage userContext={userContext} setUserContext={(c: UserContext) => storeUserContext(c)} />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
