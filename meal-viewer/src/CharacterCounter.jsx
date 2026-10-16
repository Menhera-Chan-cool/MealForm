import {characterBudget} from './operating-ui.mjs';
export default function CharacterCounter({id,value,limit,label}){
  const budget=characterBudget(value,limit);
  return <small id={id} className="character-counter" aria-label={`Ký tự còn lại của ${label}`} data-warning={budget.warning} aria-live={budget.warning?'polite':'off'}>{budget.remaining<0?`Vượt ${-budget.remaining} ký tự`:budget.remaining===0?`Đã đạt giới hạn ${limit} ký tự`:`Còn ${budget.remaining}/${limit} ký tự`}</small>;
}
