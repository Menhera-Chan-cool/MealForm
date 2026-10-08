export default function DetailTable({ model }) {
  const headers = model.headers || [];
  const rows = model.rows || [];

  return <div className="table-wrap detail-wrap"><table>
    <thead><tr>{headers.map((header, index) => <th key={`${header}-${index}`}>{header}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((header, index) => <td key={index}>
      <span className="mobile-cell-label">{header}</span><span>{row[index] || ''}</span>
    </td>)}</tr>) : <tr><td className="empty" colSpan={Math.max(headers.length, 1)}>Không có kết quả</td></tr>}</tbody>
  </table></div>;
}
