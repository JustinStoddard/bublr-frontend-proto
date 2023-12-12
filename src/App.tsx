import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PageLoader from "./components/Loader";

const HomePage = lazy(() => import('./pages/HomePage'));

function App() {
  return (
    <Router>
      <Routes>
        <Suspense fallback={<PageLoader />}>
          <Route path="/" element={<HomePage />} />
        </Suspense>
      </Routes>
    </Router>
  );
}

export default App;
