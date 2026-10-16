import {shortFilename} from './operate-accessibility.mjs';

export function FilenameText({name=''}){return <span className="source-filename-text" aria-label={name} title={name}>{shortFilename(name)}</span>;}
export default function SourceFilename({name=''}){
  return shortFilename(name)===name?<span className="source-filename-full">{name}</span>:<details className="source-filename-details"><summary><FilenameText name={name}/><span className="sr-only"> · Xem tên tệp đầy đủ</span></summary><p className="source-filename-full">{name}</p></details>;
}
