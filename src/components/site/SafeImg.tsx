import { useState, type ReactNode } from 'react';

/** An image that shows `fallback` instead of a broken-image icon when the file is missing or blocked. */
export function SafeImg({ src, alt = '', className, fallback = null, loading }: { src: string | null | undefined; alt?: string; className?: string; fallback?: ReactNode; loading?: 'lazy' | 'eager' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} loading={loading} onError={() => setFailed(true)} />;
}
