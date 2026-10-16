import { useEffect } from 'react';

export default function ActionToast({ message, kind = 'info', onDismiss }) {
  useEffect(()=>{window.dispatchEvent(new Event('meal-layout-changed'));},[message]);
  useEffect(() => {
    if (!message || kind !== 'success') return undefined;
    const timer = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(timer);
  }, [message, kind, onDismiss]);
  if (!message) return null;
  return <aside className={`action-toast ${kind}`} role={kind === 'error' ? 'alert' : 'status'} aria-live={kind === 'error' ? 'assertive' : 'polite'}>
    <span>{message}</span><button type="button" aria-label="Đóng thông báo" onClick={onDismiss}>×</button>
  </aside>;
}
