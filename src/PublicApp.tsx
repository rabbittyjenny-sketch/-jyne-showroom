import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CommunityList from './community/CommunityList';
import CommunityArticle from './community/CommunityArticle';

/** Anything else goes back to the island map. */
function ToMap() {
  useEffect(() => { window.location.replace('/index.html'); }, []);
  return null;
}

/** In-site React pages (app.html): COMMUNITY HARBOR. Every other island page is a static page in public/. */
export default function PublicApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/community" element={<CommunityList />} />
        <Route path="/community/:slug" element={<CommunityArticle />} />
        <Route path="*" element={<ToMap />} />
      </Routes>
    </BrowserRouter>
  );
}
