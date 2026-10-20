import {useState} from 'react';
import HelpDrawer from './HelpDrawer.jsx';
import {SetupInstructions} from './SetupChecklist.jsx';
export default function SetupHelp(){
  const [open,setOpen]=useState(false);
  return <><button type="button" className="secondary" onClick={()=>setOpen(true)}>Hướng dẫn cài đặt (7 bước)</button>{open&&<HelpDrawer title="Hướng dẫn cài đặt" onClose={()=>setOpen(false)}><SetupInstructions heading={false}/></HelpDrawer>}</>;
}
