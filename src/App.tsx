import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MapPage from './pages/MapPage';
import IslandPage from './pages/IslandPage';
import SectionPage from './pages/SectionPage';
import RoutePage from './pages/RoutePage';
import { RequireAdmin } from './components/admin/RequireAdmin';
import Login from './pages/admin/Login';
import Islands from './pages/admin/Islands';
import IslandEdit from './pages/admin/IslandEdit';
import SectionItems from './pages/admin/SectionItems';
import ItemTypes from './pages/admin/ItemTypes';
import Tags from './pages/admin/Tags';
import RoutesAdmin from './pages/admin/Routes';
import { Inquiries, Settings, Templates } from './pages/admin/Misc';
import { NotFoundBlock, PageShell, SiteHeader } from './components/site/SiteChrome';

const admin = (el: JSX.Element) => <RequireAdmin>{el}</RequireAdmin>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public site */}
        <Route path="/" element={<MapPage />} />
        <Route path="/i/:island" element={<IslandPage />} />
        <Route path="/i/:island/:section" element={<SectionPage />} />
        <Route path="/r/:route" element={<RoutePage />} />

        {/* back office — its own URL, never linked from the public pages */}
        <Route path="/backoffice/login" element={<Login />} />
        <Route path="/backoffice" element={<Navigate to="/backoffice/islands" replace />} />
        <Route path="/backoffice/islands" element={admin(<Islands />)} />
        <Route path="/backoffice/islands/:id" element={admin(<IslandEdit />)} />
        <Route path="/backoffice/sections/:id" element={admin(<SectionItems />)} />
        <Route path="/backoffice/item-types" element={admin(<ItemTypes />)} />
        <Route path="/backoffice/tags" element={admin(<Tags />)} />
        <Route path="/backoffice/routes" element={admin(<RoutesAdmin />)} />
        <Route path="/backoffice/inquiries" element={admin(<Inquiries />)} />
        <Route path="/backoffice/templates" element={admin(<Templates />)} />
        <Route path="/backoffice/settings" element={admin(<Settings />)} />

        <Route path="*" element={<PageShell tone="paper"><SiteHeader settings={null} /><NotFoundBlock /></PageShell>} />
      </Routes>
    </BrowserRouter>
  );
}
