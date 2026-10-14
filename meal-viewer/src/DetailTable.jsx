export default function DetailTable({ model }) {
  const headers = model.headers || [];
  const rows = model.rows || [];
  const kind = index => index === model.nameIndex ? 'name' : index === model.timeIndex ? 'time' : 'value';

  return <div className="table-wrap detail-wrap" style={{'--detail-table-min':`${Math.max(480,headers.length*144)}px`}}><table>
    <thead><tr>{headers.map((header, index) => <th data-kind={kind(index)} key={`${header}-${index}`}>{header}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((header, index) => <td data-kind={kind(index)} key={index}>
      <span className="mobile-cell-label">{header}</span><span className={kind(index)==='name'?'response-card-name':kind(index)==='time'?'response-card-time':undefined}>{row[index] || ''}</span>
      {kind(index)==='name'&&model.timeIndex<0&&<small className="response-card-time projected-time">{model.rowTimes?.[rowIndex]||''}</small>}
    </td>)}</tr>) : <tr><td className="empty" colSpan={Math.max(headers.length, 1)}>Không có kết quả</td></tr>}</tbody>
  </table></div>;
}
