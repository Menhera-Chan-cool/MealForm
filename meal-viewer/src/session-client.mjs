import { errorMessage } from './viewer-model.mjs';
import { safeErrorReport } from './safe-error-report.mjs';

export async function readLoginState(dashboard = false) {
  try {
    const session = await fetch('/api/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const identity = await session.json();
    if (!session.ok) throw Object.assign(new Error(errorMessage(identity.error, 'Không thể kiểm tra phiên đăng nhập.')), { status: session.status });
    if (!identity.authenticated) return { auth: 'anonymous', message: 'Đăng nhập bằng Google để tiếp tục.' };
    if (!dashboard) return { auth: 'authenticated', message: '' };
    const access = await fetch('/api/dashboard?access=1', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(45000) });
    const body = await access.json();
    if (access.status === 401) return { auth: 'anonymous', message: errorMessage(body.error), failure: safeErrorReport('session', { status: access.status }) };
    if (access.status === 403) return { auth: 'forbidden', message: errorMessage(body.error), failure: safeErrorReport('session', { status: access.status }) };
    if (!access.ok) throw Object.assign(new Error(errorMessage(body.error)), { status: access.status });
    return { auth: 'authenticated', dashboardData: body, message: '' };
  } catch (error) {
    return { auth: 'error', message: errorMessage(error, 'Không thể kết nối. Hãy kiểm tra lại.'), failure: safeErrorReport('session', error) };
  }
}
