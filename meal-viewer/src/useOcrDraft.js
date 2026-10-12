import { useEffect, useRef, useState } from 'react';
import { deleteOcrDraft, readOcrDraft, writeOcrDraft } from './ocr-draft.mjs';
import { safeErrorReport } from './safe-error-report.mjs';

export default function useOcrDraft(accountId, enabled, value, onRestore) {
  const [loadedAccount, setLoadedAccount] = useState('');
  const [status, setStatus] = useState('');
  const [failure, setFailure] = useState(null);
  const queue = useRef(Promise.resolve());
  const restore = useRef(onRestore); restore.current = onRestore;
  const generation = useRef(0);
  const revision = useRef(0);
  useEffect(() => {
    const current = ++generation.current;
    setFailure(null);
    restore.current({ image: '', filename: '', menu: null });
    if (!enabled || !accountId) { setLoadedAccount(''); setStatus(''); return; }
    setStatus('Đang kiểm tra nháp trên thiết bị…');
    readOcrDraft(accountId).then(draft => {
      if (current !== generation.current) return;
      if (draft) restore.current(draft);
      setStatus(draft ? 'Đã khôi phục nháp. Hãy rà soát trước khi tạo tuần.' : '');
    }).catch(error => { if (current === generation.current) { setFailure(safeErrorReport('draft', error)); setStatus(error.message); } })
      .finally(() => { if (current === generation.current) setLoadedAccount(accountId); });
    return () => { generation.current++; };
  }, [accountId, enabled]);

  useEffect(() => {
    if (!enabled || !accountId || loadedAccount !== accountId || !value.image) return;
    const current = generation.current;
    const latest = ++revision.current;
    setStatus('Đang lưu nháp…');
    queue.current = queue.current.catch(() => {}).then(() => writeOcrDraft(accountId, value));
    queue.current.then(() => { if (current === generation.current && latest === revision.current) { setFailure(null); setStatus('Đã lưu nháp trên thiết bị.'); } })
      .catch(error => { if (current === generation.current && latest === revision.current) { setFailure(safeErrorReport('draft', error)); setStatus(error.message); } });
  }, [accountId, enabled, loadedAccount, value.image, value.filename, value.images, value.menu]);

  async function clear() {
    const current = generation.current;
    const latest = ++revision.current;
    queue.current = queue.current.catch(() => {}).then(() => deleteOcrDraft(accountId));
    try { await queue.current; }
    catch (error) { if (current === generation.current) setFailure(safeErrorReport('draft', error)); throw error; }
    if (current === generation.current && latest === revision.current) setStatus('Đã xóa nháp trên thiết bị.');
  }
  async function flush() {
    if (!value.image) { await queue.current; return; }
    if (!enabled || !accountId || loadedAccount !== accountId) throw new Error('Nháp chưa sẵn sàng để lưu.');
    const current=generation.current;
    queue.current=queue.current.catch(()=>{}).then(()=>writeOcrDraft(accountId,value));
    await queue.current;
    if(current!==generation.current)throw new Error('Tài khoản đã thay đổi khi lưu nháp.');
  }
  return { status, failure, clear, flush, ready: Boolean(enabled && accountId && loadedAccount === accountId) };
}
