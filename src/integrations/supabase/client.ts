import { createClient } from '@supabase/supabase-js';

// Same Supabase project as Creatr365 (central database); iDEAS365 only uses i365_ tables
// and reads Creatr365 articles/toolbox through their existing public policies.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const IS_MOCK = import.meta.env.VITE_MOCK === '1' || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(
  SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_PUBLISHABLE_KEY || 'mock-key',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // separate session key, so signing in here never touches a Creatr365 session in the same browser
      storageKey: 'i365-auth',
    },
  },
);

/** Public base of the Creatr365 site, for "read on Creatr365" links. */
export const C365_URL = (import.meta.env.VITE_C365_URL as string | undefined) || 'https://c365.ideas365.space';
