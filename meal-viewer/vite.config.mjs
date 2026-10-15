import { randomUUID } from 'node:crypto';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({command})=>{
  const id=command==='serve'?'development':randomUUID();
  return {define:{__MEAL_BUILD_ID__:JSON.stringify(id)},server:{watch:{ignored:['**/review/**','**/test-results/**']}},plugins:[tailwindcss(),{
    name:'meal-build-version',
    generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify({id})});},
    configureServer(server){server.middlewares.use('/version.json',(_req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({id}));});}
  },{
    name:'meal-host-404',enforce:'post',
    generateBundle(_options,bundle){const html=bundle['index.html'];if(!html||html.type!=='asset')throw new Error('Missing built application HTML for host 404.');this.emitFile({type:'asset',fileName:'404.html',source:html.source});}
  }]};
});
