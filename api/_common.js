const {CATALOG,bookKey,collectBook,reanalyzeExisting,publicRecord,testNaver,testOpenAI}=require('../lib/core');
const {getRecord,setRecord,storageMode}=require('../lib/storage'); const {getConfig}=require('../lib/config');
function send(res,code,obj){res.status(code).json(obj)}
async function refreshBook(level,book){if(!CATALOG[level]?.includes(book))throw new Error('등록되지 않은 학교급/교재입니다.');const cfg=getConfig();if(!cfg.NAVER_CLIENT_ID||!cfg.NAVER_CLIENT_SECRET)throw new Error('Vercel 환경변수에 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET을 입력해 주세요.');const key=bookKey(level,book),old=await getRecord(key)||{posts:[],analysis:null};const record=await collectBook(level,book,cfg,old);await setRecord(key,record);return publicRecord(level,book,record)}
async function reanalyzeBook(level,book){
  if(!CATALOG[level]?.includes(book))throw new Error('등록되지 않은 학교급/교재입니다.');
  const cfg=getConfig();
  if(!cfg.OPENAI_API_KEY)throw new Error('Vercel 환경변수에 OPENAI_API_KEY를 입력해 주세요.');
  const key=bookKey(level,book),old=await getRecord(key)||{posts:[],analysis:null};
  const record=await reanalyzeExisting(level,book,cfg,old);
  await setRecord(key,record);
  return publicRecord(level,book,record);
}

module.exports={CATALOG,bookKey,publicRecord,testNaver,testOpenAI,getRecord,storageMode,getConfig,send,refreshBook,reanalyzeBook};
