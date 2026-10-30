import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, IS_MOCK } from '@/integrations/supabase/client';

/**
 * One gate for every back-office page (same design as Creatr365's RequireAdmin):
 * no session → login; signed in but not in i365_admins → back to the public site.
 * The database checks the same thing again on every write (RLS + i365_is_admin),
 * so this gate is for the screen; the data is protected even without it.
 */
export async function isI365Admin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('i365_is_admin');
  if (error) { console.error('[i365] admin check failed', error); return false; }
  return data === true;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'allowed'>(IS_MOCK ? 'allowed' : 'checking');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (IS_MOCK) return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) navigate(`/backoffice/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
        return;
      }
      const ok = await isI365Admin();
      if (cancelled) return;
      if (!ok) { navigate('/', { replace: true }); return; }
      setStatus('allowed');
    })();
    return () => { cancelled = true; };
  }, [location.pathname, navigate]);

  if (status !== 'allowed') {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-muted border-t-foreground animate-spin" /></div>;
  }
  return <>{children}</>;
}
