import { useEffect, useId, useState } from 'react';
import { ALL } from './viewer-model.mjs';
import { ComboSelect } from './FilterControls.jsx';

export default function DashboardWeekPicker({ weeks, value, onChange, disabled }) {
  const id = useId();
  const [query, setQuery] = useState('');
  useEffect(() => setQuery(''), [value]);
  const labels = weeks.map(week => {
    const name = week.name || week.weekKey;
    return weeks.filter(item => (item.name || item.weekKey) === name).length > 1 ? `${name} (${week.weekKey.split('_')[0]})` : name;
  });
  return <div className="dashboard-week-picker"><label htmlFor={id}>Tuần</label>
    <ComboSelect id={id} label="Tìm tuần" value={query || ALL} values={labels} includeAll={false} placeholder="Tìm tháng hoặc ngày…" disabled={disabled}
      onChange={text => setQuery(text === ALL ? '' : text)} onSelect={label => {
        const index = labels.indexOf(label);
        if (index >= 0) { onChange(weeks[index].weekKey); setQuery(''); }
      }} />
    <small className="selected-week-name">{weeks.find(week => week.weekKey === value)?.name || 'Chọn một tuần'}</small>
  </div>;
}
