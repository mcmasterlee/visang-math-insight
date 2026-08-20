const fs=require('fs'); const path=require('path');
const LOCAL_FILE=path.join(__dirname,'..','storage','data.json');
function supabaseConfig(){return {url:(process.env.SUPABASE_URL||'').replace(/\/$/,''),key:process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||''};}
function isRemote(){const c=supabaseConfig();return !!(c.url&&c.key);}
async function remoteGet(key){const c=supabaseConfig();const url=`${c.url}/rest/v1/book_snapshots?key=eq.${encodeURIComponent(key)}&select=data,updated_at&limit=1`;const r=await fetch(url,{headers:{apikey:c.key,Authorization:`Bearer ${c.key}`}});if(!r.ok)throw new Error(`Supabase 읽기 오류 ${r.status}: ${await r.text()}`);const rows=await r.json();return rows[0]?.data||null;}
async function remoteSet(key,data){const c=supabaseConfig();const url=`${c.url}/rest/v1/book_snapshots?on_conflict=key`;const r=await fetch(url,{method:'POST',headers:{apikey:c.key,Authorization:`Bearer ${c.key}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({key,data,updated_at:new Date().toISOString()})});if(!r.ok)throw new Error(`Supabase 저장 오류 ${r.status}: ${await r.text()}`);}
function localLoad(){try{return JSON.parse(fs.readFileSync(LOCAL_FILE,'utf8'))}catch{return {books:{}}}}
function localSave(db){fs.mkdirSync(path.dirname(LOCAL_FILE),{recursive:true});fs.writeFileSync(LOCAL_FILE,JSON.stringify(db,null,2),'utf8');}
async function getRecord(key){if(isRemote())return remoteGet(key);const db=localLoad();return db.books?.[key]||null;}
async function setRecord(key,data){if(isRemote())return remoteSet(key,data);const db=localLoad();db.books=db.books||{};db.books[key]=data;db.updatedAt=new Date().toISOString();localSave(db);}
function storageMode(){return isRemote()?'Supabase':'로컬 data.json';}
module.exports={getRecord,setRecord,storageMode,isRemote};
