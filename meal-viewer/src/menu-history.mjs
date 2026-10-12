const empty = () => ({ past: [], present: null, future: [], group: '' });

export function menuHistoryReducer(state = empty(), action) {
  if (action.type === 'reset') return { ...empty(), present: typeof action.value === 'function' ? action.value(state.present) : action.value };
  if (action.type === 'commit') return { ...state, group: '' };
  if (action.type === 'undo') return state.past.length ? { past: state.past.slice(0, -1), present: state.past.at(-1), future: [state.present, ...state.future], group: '' } : state;
  if (action.type === 'redo') return state.future.length ? { past: [...state.past, state.present].slice(-50), present: state.future[0], future: state.future.slice(1), group: '' } : state;
  if (!['edit','apply'].includes(action.type) || (!state.present&&action.type!=='apply')) return state;
  const value = typeof action.value === 'function' ? action.value(state.present) : action.value;
  if (JSON.stringify(value) === JSON.stringify(state.present)) return state;
  return { past: action.group && action.group === state.group ? state.past : [...state.past, state.present].slice(-50), present: value, future: [], group: action.group || '' };
}
