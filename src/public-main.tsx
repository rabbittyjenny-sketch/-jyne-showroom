// In-site React pages (COMMUNITY HARBOR). Tailwind base for the copied components + the original blog page design.
import { createRoot } from 'react-dom/client';
import PublicApp from './PublicApp';
import './index.css';
import './community/community.css';

createRoot(document.getElementById('root')!).render(<PublicApp />);
