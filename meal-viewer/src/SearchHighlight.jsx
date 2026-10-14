import {highlightPieces} from './ui-clarity.mjs';
export default function SearchHighlight({text,query,accent=true}) {
  return highlightPieces(text,query,accent).map((part,index)=>part.match?<mark className="search-highlight" key={index}>{part.text}</mark>:part.text);
}
