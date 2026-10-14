import { useId } from 'react';
import { ALL } from './viewer-model.mjs';
import { ComboSelect } from './FilterControls.jsx';

export default function DashboardWeekPicker({ weeks, value, onChange, disabled }) {
  const id = useId();
  const labels = weeks.map(week => {
    const name = week.name || week.weekKey;
    return weeks.filter(item => (item.name || item.weekKey) === name).length > 1 ? `${name} (${week.weekKey.split('_')[0]})` : name;
  });
  const selectedLabel = labels[weeks.findIndex(week => week.weekKey === value)] || ALL;
  return <div className="dashboard-week-picker"><label htmlFor={id}>Tuần</label>
    <ComboSelect id={id} label="Tìm tuần" value={selectedLabel} values={labels} includeAll={false} placeholder="Tìm tháng hoặc ngày…" disabled={disabled}
      onSelect={label => {
        const index = labels.indexOf(label);
        if (index >= 0) onChange(weeks[index].weekKey);
      }} />
  </div>;
}
