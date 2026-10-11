import { errorMessage } from './viewer-model.mjs';

export async function readLoginState(dashboard = false) {
  try {
    const session = await fetch('/api/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const identity = await session.json();
    if (!session.ok) throw new Error(errorMessage(identity.error, 'Không thể kiểm tra phiên đăng nhập.'));
    if (!identity.authenticated) return { auth: 'anonymous', message: 'Đăng nhập bằng Google để tiếp tục.' };
    if (!dashboard) return { auth: 'authenticated', message: '' };
    const access = await fetch('/api/dashboard?access=1', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(45000) });
    const body = await access.json();
    if (access.status === 401) return { auth: 'anonymous', message: errorMessage(body.error) };
    if (access.status === 403) return { auth: 'forbidden', message: errorMessage(body.error) };
    if (!access.ok) throw new Error(errorMessage(body.error));
    return { auth: 'authenticated', dashboardData: body, message: '' };
  } catch (error) {
    return { auth: 'error', message: errorMessage(error, 'Không thể kết nối. Hãy kiểm tra lại.') };
  }
}
