import { randomUUID } from 'node:crypto';
import { defineConfig } from 'vite';

export default defineConfig(({command})=>{
  const id=command==='serve'?'development':randomUUID();
  return {define:{__MEAL_BUILD_ID__:JSON.stringify(id)},plugins:[{
    name:'meal-build-version',
    generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify({id})});},
    configureServer(server){server.middlewares.use('/version.json',(_req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({id}));});}
  }]};
});
