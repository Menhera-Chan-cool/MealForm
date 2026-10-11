import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DEFAULT_DASHBOARD_VIEW, readDashboardView, writeDashboardView } from './dashboard-cache.mjs';
import { nearestViewAnchor } from './dashboard-model.mjs';

export default function useDashboardView(account, week, tab, data, verified) {
  const read = () => readDashboardView(account, week) || { ...DEFAULT_DASHBOARD_VIEW };
  const [record, setRecord] = useState(() => ({ account, week, view: read() }));
  const listRef = useRef(null), toolbarRef = useRef(null), restoring = useRef(false);
  const view = record.account === account && record.week === week ? record.view : read();
  const current = useRef(null); current.current = { account, week, tab, view };
  const scope = useRef({ account, week });
  const pending = useRef({ account, week, view, cached: false, fresh: false, interacted: false });

  function save() {
    const state = current.current;
    if (!state.account || !state.week || state.tab !== 'delete' || restoring.current) return;
    const list = listRef.current;
    const next = { ...state.view, windowY: window.scrollY, listY: list?.scrollTop || 0, anchor: '', index: 0, offset: 0 };
    if (list?.dataset.weekKey === state.week) {
      const elements = [...list.querySelectorAll('[data-response-id]')];
      const top = Math.max(0, list.getBoundingClientRect().top, toolbarRef.current?.getBoundingClientRect().bottom || 0);
      const index = elements.findIndex(el => { const box = el.getBoundingClientRect(); return box.bottom > top && box.top < innerHeight; });
      if (index >= 0) { next.index = index; next.anchor = elements[index].dataset.responseId; next.offset = elements[index].getBoundingClientRect().top - top; }
    }
    writeDashboardView(state.account, state.week, next);
    return next;
  }

  function update(patch) {
    pending.current.interacted = true;
    const state = current.current;
    setRecord({ account: state.account, week: state.week, view: { ...state.view, ...patch } });
  }

  useLayoutEffect(() => {
    if (scope.current.account === account && scope.current.week === week) return;
    scope.current = { account, week };
    const saved = read();
    pending.current = { account, week, view: saved, cached: false, fresh: false, interacted: false };
    setRecord({ account, week, view: saved });
  }, [account, week]);

  useEffect(() => {
    if (tab === 'delete' && record.account === account && record.week === week && !restoring.current) save();
  }, [record, account, week, tab]);

  useLayoutEffect(() => {
    const plan = pending.current;
    if (tab !== 'delete' || data?.week?.weekKey !== week || plan.account !== account || plan.week !== week || plan.interacted || (verified ? plan.fresh : plan.cached)) return;
    const list = listRef.current;
    if (!list) return;
    if (verified) plan.fresh = true; else plan.cached = true;
    restoring.current = true;
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, plan.view.windowY);
      list.scrollTop = plan.view.listY;
      const elements = [...list.querySelectorAll('[data-response-id]')];
      if (plan.view.anchor && elements.length) {
        const index = nearestViewAnchor(elements.map(el => el.dataset.responseId), plan.view.anchor, plan.view.index);
        const top = Math.max(0, list.getBoundingClientRect().top, toolbarRef.current?.getBoundingClientRect().bottom || 0);
        const delta = elements[index].getBoundingClientRect().top - top - plan.view.offset;
        if (list.scrollHeight > list.clientHeight + 1) list.scrollTop += delta;
        else window.scrollBy(0, delta);
      }
      requestAnimationFrame(() => { restoring.current = false; });
    });
    return () => { cancelAnimationFrame(frame); restoring.current = false; };
  }, [account, week, tab, data, verified]);

  useEffect(() => {
    let timer;
    const changed = () => { if (tab === 'delete' && !restoring.current) { clearTimeout(timer); timer = setTimeout(save, 120); } };
    const interact = () => { if (current.current.tab === 'delete' && !restoring.current) pending.current.interacted = true; };
    window.addEventListener('scroll', changed, { capture: true, passive: true });
    window.addEventListener('pagehide', save);
    window.addEventListener('wheel', interact, { passive: true });
    window.addEventListener('touchstart', interact, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', changed, true); window.removeEventListener('pagehide', save); window.removeEventListener('wheel', interact); window.removeEventListener('touchstart', interact); };
  }, [account, week, tab]);
  return { view, update, save, listRef, toolbarRef };
}
