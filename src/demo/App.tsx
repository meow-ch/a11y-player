import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { DaisyPlayerWithRouter } from '../lib';

function App() {
  const dirUrl = import.meta.env.VITE_BASE_URL + '/some/dir';
  const bookmarkRouteParamName = 'bookmark';
  const appUrl = import.meta.env.VITE_APP_URL;

  return (
    <Router>
      <Routes>
        <Route
          path={`/:${bookmarkRouteParamName}?`}
          element={
            <DaisyPlayerWithRouter
              language='fr'
              dirUrl={dirUrl}
              appUrl={appUrl}
              bookmarkParam={bookmarkRouteParamName}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
