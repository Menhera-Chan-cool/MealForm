import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL, matchOptions } from './viewer-model.mjs';
import ChevronIcon from './ChevronIcon.jsx';
import useDisclosureAnimation from './useDisclosureAnimation.js';

export function ComboSelect({ id, label, value, values, onChange, onSelect, disabled = false, placeholder, searchable = true, includeAll = true, className = '' }) {
  const root = useRef(null);
  const { open, closing, active, show, hide, toggle } = useDisclosureAnimation();
  const [query, setQuery] = useState('');
  const inputValue = searchable ? onSelect && open ? query : value === ALL ? '' : value : value;
  const searchQuery = onSelect ? query : inputValue;
  const matches = useMemo(() => searchable ? matchOptions(values, searchQuery) : values, [values, searchQuery, searchable]);
  const visibleItems = Math.min(Math.max(matches.length + (includeAll ? 1 : 0), 2), 5);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled]);

  useEffect(() => {
    const close = event => { if (open && !root.current?.contains(event.target)) hide(); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  function choose(next) {
    (onSelect || onChange)(next);
    hide();
  }

  function showOptions() {
    if (!open && onSelect) setQuery('');
    show();
  }

  return <div className={`combo ${active ? 'active' : ''} ${closing ? 'closing' : ''} ${className}`} ref={root}>
      <input
        id={id} type={searchable ? 'search' : 'text'} role="combobox" aria-label={label}
        aria-autocomplete={searchable ? 'list' : 'none'} readOnly={!searchable}
        aria-expanded={open} aria-controls={`${id}-options`}
        value={inputValue} disabled={disabled} placeholder={placeholder || (searchable ? id === 'name' ? 'Tìm nhanh tên…' : ALL : undefined)} autoComplete="off"
        onFocus={showOptions} onClick={showOptions}
        onChange={searchable ? event => { if (onSelect) setQuery(event.target.value); else onChange(event.target.value.trim() || ALL); show(); } : undefined}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); hide(); }
          if (event.key === 'ArrowDown' && open) {
            const first = root.current?.querySelector('.combo-option');
            if (first) { event.preventDefault(); first.focus(); }
          }
        }}
      />
      <button className="combo-toggle" type="button" disabled={disabled} aria-expanded={open} aria-controls={`${id}-options`} aria-label={`${open ? 'Đóng' : 'Mở'} danh sách ${label.toLocaleLowerCase()}`} onClick={() => {
        const nextOpen = !open;
        if (nextOpen && onSelect) setQuery('');
        toggle();
        if (nextOpen) root.current?.querySelector('input')?.focus();
      }}><ChevronIcon expanded={active} /></button>
      <div id={`${id}-options`} className={`combo-menu ${open ? 'open' : closing ? 'closing' : ''}`} role="listbox" aria-hidden={!open} inert={!open} style={{ '--dropdown-items': visibleItems }}>
        {includeAll && <button className="combo-option" type="button" role="option" aria-selected={value === ALL} onMouseDown={event => event.preventDefault()} onClick={() => choose(ALL)}>{ALL}</button>}
        {matches.length ? matches.map(option => <button
          key={option} className="combo-option" type="button" role="option"
          aria-selected={option === (onSelect ? value : inputValue)} onMouseDown={event => event.preventDefault()}
          onClick={() => choose(option)}>{option}</button>) : <div className="combo-empty">Không tìm thấy</div>}
      </div>
  </div>;
}

function SearchSelect({ id, label, value, values, onChange }) {
  return <div className="filter-field">
    <label htmlFor={id}>{label}</label>
    <ComboSelect id={id} label={label} value={value} values={values} onChange={onChange} />
  </div>;
}

export default function FilterControls({ days, nameOptions, mealOptions, filters, onChange }) {
  const dayOptions = days.map(day => typeof day === 'string' ? day : day.day);
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || !window.matchMedia('(max-width: 700px)').matches);
  const activeFilters = [
    ['name', 'Họ tên', filters.name],
    ['day', 'Ngày', filters.day],
    ['meal', 'Món', filters.meal]
  ].filter(([, , value]) => value && value !== ALL);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const sync = event => setExpanded(!event.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return <div className="filters" aria-label="Bộ lọc">
    <div className="filter-name-search">
      <SearchSelect id="name" label="Họ tên" value={filters.name} values={nameOptions} onChange={value => onChange('name', value)} />
    </div>
    <div className="mobile-filter-summary">
      <button className="secondary mobile-filter-toggle" type="button" aria-expanded={expanded} aria-controls="filter-fields-panel" onClick={() => setExpanded(value => !value)}>
        <span>Bộ lọc{activeFilters.length ? ` (${activeFilters.length})` : ''}</span>
        <ChevronIcon expanded={expanded} />
      </button>
    </div>
    <div id="filter-fields-panel" className={`filter-fields-clip ${expanded ? 'expanded' : 'collapsed'}`} aria-hidden={!expanded} inert={!expanded}>
      <div className="filter-fields">
        <SearchSelect id="day" label="Ngày" value={filters.day} values={dayOptions} onChange={value => onChange('day', value)} />
        <SearchSelect id="meal" label="Món" value={filters.meal} values={mealOptions} onChange={value => onChange('meal', value)} />
      </div>
    </div>
    {activeFilters.length > 0 && <div className="filter-chips" aria-label="Bộ lọc đang áp dụng" aria-live="polite">
      {activeFilters.map(([key, label, value]) => <button
        key={key} className="secondary filter-chip" type="button" aria-label={`Bỏ lọc ${label}: ${value}`}
        onClick={() => onChange(key, ALL)}
      ><span>{label}: {value}</span><span aria-hidden="true">×</span></button>)}
    </div>}
  </div>;
}
