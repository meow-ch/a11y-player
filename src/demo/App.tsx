import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { DaisyPlayerWithRouter } from '../lib';

function App() {
  const streamPath = "/unzipped/BBR_13941A100/2d18d195354b74abe12a4f54696991b68fcf069e0e90c4f0ebe3ddd7e97aec56/1750769170";
  const dirUrl = `${import.meta.env.VITE_BASE_URL}${streamPath}`;
  const pathPrefix = 'book/dede100';
  const bookmarkRouteParamName = 'bookmark';
  const appUrl = import.meta.env.VITE_APP_URL;

  return (
    <Router>
      <Routes>
        <Route
          path={`${pathPrefix}/:${bookmarkRouteParamName}?`}
          element={
            <DaisyPlayerWithRouter
              language='fr'
              dirUrl={dirUrl}
              appUrl={appUrl}
              pathPrefix={pathPrefix}
              bookmarkParam={bookmarkRouteParamName}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
