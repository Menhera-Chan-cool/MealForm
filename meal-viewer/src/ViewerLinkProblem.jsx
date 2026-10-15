const copy={
  route:['Không tìm thấy trang','Đường dẫn này không thuộc trang xem thực đơn. Hãy mở một trang bên dưới.'],
  invalid:['Liên kết không hợp lệ','Liên kết thiếu hoặc có mã tuần/bảng tính không hợp lệ. Hãy kiểm tra lại liên kết được chia sẻ.'],
  missing:['Không tìm thấy tuần trong liên kết','Máy chủ báo không tìm thấy tuần này. Bạn có thể chọn lại trong kho tuần.'],
  forbidden:['Chưa có quyền xem tuần này','Máy chủ từ chối truy cập. Thông báo này không xác nhận tuần có tồn tại hay không.'],
  'archive-only':['Tuần này chưa nằm trong kho','Kho chỉ mở các tuần cũ. Hãy kiểm tra trang tuần này hoặc tuần sau.'],
  connection:['Chưa tải được dữ liệu','Chưa kết nối hoặc chưa nhận được dữ liệu hợp lệ. Điều này không có nghĩa là tuần đã bị xóa.']
};
/** @param {{kind:string,message?:string,onRetry?:()=>void,onChangeAccount?:()=>void,archiveHref?:string}} props */
export default function ViewerLinkProblem({kind,message,onRetry,onChangeAccount,archiveHref='/history'}) {
  const [title,description]=copy[kind]||copy.connection;
  return <section className="login-panel viewer-link-problem" role="region" aria-label="Vấn đề liên kết"><h2>{title}</h2><p>{description}</p>{message&&<p>{message}</p>}<div className="actions"><a className="action-link" href="/newest">Tuần này</a><a className="action-link" href={archiveHref}>Kho tuần cũ</a>{kind==='archive-only'&&<a className="action-link" href="/next">Tuần sau</a>}{kind==='connection'&&onRetry&&<button type="button" onClick={onRetry}>Thử lại</button>}{kind==='forbidden'&&onChangeAccount&&<button type="button" className="secondary" onClick={onChangeAccount}>Đổi tài khoản Google</button>}</div></section>;
}
