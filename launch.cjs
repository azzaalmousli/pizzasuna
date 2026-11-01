const {spawn}=require('node:child_process');
const path=require('node:path');
const base='http://127.0.0.1:3015';
function open(url){const browser=spawn('explorer.exe',[url],{windowsHide:true,stdio:'ignore'});browser.unref()}
async function healthy(){try{const r=await fetch(base+'/api/health',{signal:AbortSignal.timeout(1000)});return r.ok&&(await r.json()).version==='demo-2026-10-29'}catch(e){if(e.cause?.code==='EACCES')throw Error('Local networking is blocked in this environment. Double-click Start-Pizzasuna.cmd directly in Windows File Explorer.');return false}}
(async()=>{if(await healthy()){open(base);open(base+'/admin');return}
 const child=spawn(process.execPath,[path.join(__dirname,'site/server.js')],{cwd:__dirname,env:{...process.env,PORT:'3015',HOST:'127.0.0.1'},stdio:'inherit',windowsHide:true});
 let stopped=false;child.on('exit',code=>{stopped=true;process.exitCode=code||0});process.on('SIGINT',()=>child.kill());
 for(let i=0;i<40&&!stopped;i++){if(await healthy()){open(base);open(base+'/admin');console.log('Keep this window open. Press Ctrl+C to stop Pizzasuna.');return}await new Promise(r=>setTimeout(r,250))}
 console.error('Could not start Pizzasuna. Check that port 3015 is free and Node.js 24 is installed.');child.kill();process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1});
