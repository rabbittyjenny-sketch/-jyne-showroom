import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// the back office is a dark console (same as the Creatr365 admin) — the public pages never load this entry
document.documentElement.classList.add('dark');
document.body.classList.add('admin-modal-surface'); // square corners also on dialogs (they render outside the layout)

createRoot(document.getElementById('root')!).render(<App />);
