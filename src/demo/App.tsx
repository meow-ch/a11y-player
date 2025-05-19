import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { DaisyPlayerWithRouter } from '../lib';

function App() {
  const streamPath = "/unzipped/BBR_13812A100/5b6fc4a84eaac8041668e49658c981a5b4ee820afabc5e612bbf9fea541523bd/1747738070";
  const dirUrl = `${import.meta.env.VITE_BASE_URL}${streamPath}`;
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
