import {loginTargetLabel} from './reading-ui.mjs';

export default function LoginContext(){
  return <aside className="login-context" role="region" aria-label="Trang sẽ mở sau đăng nhập"><strong>{loginTargetLabel(window.location.pathname,window.location.search)}</strong><p>Sau khi đăng nhập, bạn sẽ tiếp tục tại liên kết hiện tại.</p></aside>;
}
