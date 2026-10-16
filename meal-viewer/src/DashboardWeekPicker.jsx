import { useId } from 'react';
import { ALL } from './viewer-model.mjs';
import { ComboSelect } from './FilterControls.jsx';
import {weekChoices} from './ui-model.mjs';
import {weekOptionHint} from './draft-tools.mjs';

export default function DashboardWeekPicker({ weeks, value, onChange, disabled }) {
  const id = useId();
  const choices=weekChoices(weeks),labels=choices.map(week=>week.label);
  const selectedLabel = choices.find(week=>week.weekKey===value)?.label || ALL;
  return <div className="dashboard-week-picker"><label htmlFor={id}>Tuần</label>
    <ComboSelect id={id} label="Tìm tuần" value={selectedLabel} values={labels} optionGroups={Object.fromEntries(choices.map(week=>[week.label,week.group]))} optionHints={Object.fromEntries(choices.map(week=>[week.label,weekOptionHint(week)]))} includeAll={false} placeholder="Tìm tháng hoặc ngày…" disabled={disabled}
      onSelect={label => {
        const index = labels.indexOf(label);
        if (index >= 0) onChange(choices[index].weekKey);
      }} />
  </div>;
}
