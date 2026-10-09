import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { readdir, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
const base='http://127.0.0.1:3102', secret=randomBytes(32).toString('hex');
const db=await PGlite.create();
for(const m of (await readdir('prisma/migrations')).filter(n=>/^\d/.test(n)).sort()) await db.exec(await readFile(`prisma/migrations/${m}/migration.sql`,'utf8'));
const server=new PGLiteSocketServer({db,host:'127.0.0.1',port:55442}); await server.start();
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3102'],{env:{...process.env,NODE_ENV:'production',JOURNAL_PASSWORD:secret,APP_ORIGIN:base,LOCAL_ONLY:'true',DATABASE_URL:'postgresql://postgres:postgres@127.0.0.1:55442/postgres?connection_limit=1&pgbouncer=true&statement_cache_size=0'},stdio:'ignore'});
try {
 let ready=false; for(let i=0;i<40;i++){try{if((await fetch(base+'/api/workspace')).status===401){ready=true;break;}}catch{} await new Promise(r=>setTimeout(r,250));} assert.ok(ready,'production ready');
 const login=async(password,origin=base)=>fetch(base+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
 assert.equal((await login(secret,'https://untrusted.example')).status,403);
 assert.equal((await login('wrong')).status,401);
 const res=await login(secret); assert.equal(res.status,200); const header=res.headers.get('set-cookie'); assert.match(header,/HttpOnly/i); assert.match(header,/Secure/i); assert.match(header,/SameSite=strict/i);
 const cookie=header.split(';')[0]; assert.equal((await fetch(base+'/api/workspace',{headers:{Cookie:cookie}})).status,200);
 assert.equal((await fetch(base+'/api/workspace',{headers:{Cookie:cookie+'bad'}})).status,401);
 assert.equal((await fetch(base+'/api/workspace',{method:'POST',headers:{Cookie:cookie,Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'})).status,403);
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=','base64');
 const upload=new FormData();upload.set('file',new Blob([image],{type:'image/png'}),'test.png');
 const uploaded=await fetch(base+'/api/uploads',{method:'POST',headers:{Cookie:cookie,Origin:base},body:upload});assert.equal(uploaded.status,201);const {url}=await uploaded.json();
 assert.equal((await fetch(base+url,{redirect:'manual'})).status,307);
 assert.equal((await fetch(base+url,{headers:{Cookie:cookie}})).status,200);
 assert.equal((await fetch(base+'/_next/image?url='+encodeURIComponent(url)+'&w=640&q=75',{redirect:'manual'})).status,307);
 const {unlink}=await import('node:fs/promises');await unlink('public'+url);
 console.log('PASS: production denies LOCAL_ONLY bypass, unauthenticated and tampered sessions, cross-origin writes; valid signed secure cookie grants access.');
} finally { child.kill('SIGTERM'); await new Promise(r=>child.once('exit',r)); await server.stop(); await new Promise(r=>setTimeout(r,100)); await db.close(); }
