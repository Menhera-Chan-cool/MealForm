import type {Page} from '@playwright/test';
const assets=new Map<string,Promise<{body:Buffer,contentType:string}>>();
export async function useImmutableAssets(page:Page,origin:string){
  const target=new URL(origin);if(target.protocol!=='https:'||!target.hostname.endsWith('.vercel.app')||target.origin!==origin)throw Error('Expected an immutable Vercel origin');
  await page.route('http://127.0.0.1:5175/**',async route=>{
    const request=route.request(),url=new URL(request.url());
    // Test services override this route; no unmatched request may reach a real API.
    if(request.method()!=='GET'||url.pathname.startsWith('/api/'))return route.abort();
    const key=target.origin+(request.resourceType()==='document'?'/':url.pathname);
    if(!assets.has(key))assets.set(key,fetch(key,{signal:AbortSignal.timeout(30000)}).then(async response=>{
      if(!response.ok)throw Error('Immutable asset returned '+response.status);
      return {body:Buffer.from(await response.arrayBuffer()),contentType:response.headers.get('content-type')||'application/octet-stream'};
    }));
    await route.fulfill({status:200,...await assets.get(key)});
  });
}
