// Public pages of the new islands. Only the original pages' CSS is loaded here
// (no Tailwind reset), so they render exactly like the original island pages.
import { createRoot } from 'react-dom/client';
import PublicApp from './PublicApp';
import './legacy/legacy.css';
import './legacy/extra.css';
import './site.css';

createRoot(document.getElementById('root')!).render(<PublicApp />);
