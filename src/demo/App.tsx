/// <reference types="vite/client" />
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { DaisyPlayerWithRouter } from '../lib';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

function DaisyPlayerE2EFixtureRoute() {
  const { fixture = 'short-long' } = useParams();
  const dirUrl = useMemo(() => `${window.location.origin}/fixtures/${fixture}`, [fixture]);
  const pathPrefix = `e2e/${fixture}`;
  const bookmarkRouteParamName = 'bookmark';

  return (
    <DaisyPlayerWithRouter
      language='fr'
      dirUrl={dirUrl}
      appUrl={window.location.origin}
      pathPrefix={pathPrefix}
      bookmarkParam={bookmarkRouteParamName}
    />
  );
}

function App() {
  const streamPath = "/unzipped/BBR_13941A100/2d18d195354b74abe12a4f54696991b68fcf069e0e90c4f0ebe3ddd7e97aec56/1750769170";
  const dirUrl = `${import.meta.env.VITE_BASE_URL}${streamPath}`;
  const pathPrefix = 'book/dede100';
  const bookmarkRouteParamName = 'bookmark';
  const appUrl = import.meta.env.VITE_APP_URL;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${pathPrefix}`} replace />} />
        <Route
          path="/e2e/:fixture/:bookmark?"
          element={<DaisyPlayerE2EFixtureRoute />}
        />
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
