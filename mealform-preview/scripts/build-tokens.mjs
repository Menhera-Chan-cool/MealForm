import {buildTokens} from '../../meal-viewer/scripts/build-tokens.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
export {buildTokens};
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const tokens=JSON.parse(await readFile(new URL('../../meal-viewer/design/tokens.json',import.meta.url),'utf8'));await buildTokens(tokens,fileURLToPath(new URL('../src/generated/',import.meta.url)));}
