import {spawn} from 'node:child_process';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=await mkdtemp(path.join(tmpdir(),'tradinglog-test-'));
const env={...process.env,JOURNAL_LOCAL_DIR:dir,JOURNAL_DB_PORT:'55446',PORT:'3131',JOURNAL_TEST_DATA:'true',TEST_BASE_URL:'http://127.0.0.1:3131'};
const server=spawn(process.execPath,['scripts/local-dev.mjs'],{env,stdio:['ignore','ignore','ignore']});
async function run(file){await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['scripts/'+file],{env,stdio:'inherit'});p.on('exit',code=>code===0?resolve():reject(new Error(file+' failed: '+code)));});}
try{let ready=false;for(let n=0;n<120;n++){try{if((await fetch(env.TEST_BASE_URL+'/api/workspace')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw new Error('Serveur de test indisponible');await run('integration.mjs');await run('multiasset-check.mjs');await run('learning-check.mjs');await run('restore-check.mjs');if(process.env.JOURNAL_BROWSER_CHECK==='true')await run('browser-check.mjs');console.log('Integration suite completed on isolated test database: '+dir);}finally{server.kill('SIGTERM');}
