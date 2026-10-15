import {CircleHelp} from 'lucide-react';
import useAnchoredPopover from './useAnchoredPopover.js';

export default function FieldHelp({label,children}) {
  const popover=useAnchoredPopover();
  return <span className="field-help"><button type="button" ref={popover.trigger} className="secondary field-help-trigger" aria-label={`Giải thích ${label}`} aria-expanded={popover.open} aria-controls={popover.id} aria-describedby={popover.id} popoverTarget={popover.id}><CircleHelp size={18} aria-hidden="true"/></button><span ref={popover.panel} id={popover.id} popover="auto" role="note" aria-label={label} className="ui-anchored-popover field-help-note" {...popover.events}>{children}</span></span>;
}
