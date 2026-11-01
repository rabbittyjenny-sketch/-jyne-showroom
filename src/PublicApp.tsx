import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IslandPage from './pages/IslandPage';
import SectionPage from './pages/SectionPage';
import RoutePage from './pages/RoutePage';

/** Anything that is not a new-island page goes back to the original map. */
function ToMap() {
  useEffect(() => { window.location.replace('/'); }, []);
  return null;
}

export default function PublicApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/i/:island" element={<IslandPage />} />
        <Route path="/i/:island/:section" element={<SectionPage />} />
        <Route path="/r/:route" element={<RoutePage />} />
        <Route path="*" element={<ToMap />} />
      </Routes>
    </BrowserRouter>
  );
}
