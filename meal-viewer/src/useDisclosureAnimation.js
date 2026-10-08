import { useEffect, useRef, useState } from 'react';

export function shouldAnimateDisclosureClose(reducedMotion, motionOverride) {
  return !reducedMotion || motionOverride === 'full';
}

export default function useDisclosureAnimation(storageKey = '') {
  const [open, setOpen] = useState(() => {
    if (!storageKey || typeof window === 'undefined') return false;
    try { return window.localStorage.getItem(storageKey) === 'true'; }
    catch { return false; }
  });
  const [closing, setClosing] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!storageKey) return;
    try { window.localStorage.setItem(storageKey, String(open)); }
    catch { /* Disclosure still works for this page if storage is unavailable. */ }
  }, [open, storageKey]);

  function show() {
    window.clearTimeout(timer.current);
    setClosing(false);
    setOpen(true);
  }

  function hide() {
    if (!open) return;
    window.clearTimeout(timer.current);
    setOpen(false);
    if (!shouldAnimateDisclosureClose(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      document.documentElement.dataset.motionOverride
    )) return;
    setClosing(true);
    timer.current = window.setTimeout(() => setClosing(false), 1250);
  }

  return { open, closing, active: open || closing, show, hide, toggle: open ? hide : show };
}
