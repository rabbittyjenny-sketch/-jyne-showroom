import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isI365Admin } from '@/components/admin/RequireAdmin';

/** Back-office sign-in (its own URL, not linked from the public site). Same Supabase account as Creatr365. */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) { setErr('กรอกอีเมลและรหัสผ่าน'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr('เข้าสู่ระบบไม่สำเร็จ: ' + error.message); setBusy(false); return; }
    if (!(await isI365Admin())) {
      await supabase.auth.signOut();
      setErr('บัญชีนี้ยังไม่ได้เป็นผู้ดูแล iDEAS365');
      setBusy(false);
      return;
    }
    navigate(params.get('redirect') || '/backoffice/islands', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 i365-admin">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border bg-background p-6" noValidate>
        <h1 className="text-xl font-semibold">iDEAS365 · หลังบ้าน</h1>
        <div className="space-y-1"><Label>อีเมล</Label><Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} /></div>
        <div className="space-y-1"><Label>รหัสผ่าน</Label><Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(null); }} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'กำลังเข้า…' : 'เข้าสู่ระบบ'}</Button>
      </form>
    </div>
  );
}
