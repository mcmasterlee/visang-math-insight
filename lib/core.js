const crypto = require('crypto');

const CATALOG = {
  '초등': ['교과서 개념잡기','개념플러스유형 라이트(LITE)','개념플러스유형 파워(POWER)','개념플러스연산 라이트(LITE)','개념플러스연산 파워(POWER)','수학의 신'],
  '중등': ['교과서 개념잡기','개념플러스유형 라이트(LITE)','개념플러스유형 파워(POWER)','개념플러스연산','유형만렙','수학의 신','완자 기출픽(PICK)','수학만 기출문제집'],
  '고등': ['개념플러스유형','개념루트','유형만렙','유형만렙 라이트(LITE)','수학의 신','완자 기출픽(PICK)']
};

const LEVEL_TERMS = {
  '초등': [
    /초등/g, /초등학생/g, /초[1-6](?!\d)/g, /초\s*[1-6]\s*학년/g,
    /초등\s*[1-6]\s*학년/g, /초등학교/g
  ],
  '중등': [
    /중등/g, /중학/g, /중학생/g, /중[1-3](?!\d)/g, /중\s*[1-3]\s*학년/g,
    /중학교/g
  ],
  '고등': [
    /고등/g, /고등학생/g, /고[1-3](?!\d)/g, /고\s*[1-3]\s*학년/g, /고등학교/g,
    /공통수학/g, /수학\s*[ⅠⅰIi1]/g, /수학\s*[ⅡⅱIi2]/g, /미적분/g, /확률과\s*통계/g, /확통/g, /기하/g
  ]
};

const ALIASES = {
  '교과서 개념잡기': ['교과서 개념잡기','교과서개념잡기'],
  '개념플러스유형 라이트(LITE)': ['개념플러스유형 라이트','개념플러스유형 lite','개념+유형 라이트','개념 플러스 유형 라이트','개념유형 라이트'],
  '개념플러스유형 파워(POWER)': ['개념플러스유형 파워','개념플러스유형 power','개념+유형 파워','개념 플러스 유형 파워','개념유형 파워'],
  '개념플러스연산 라이트(LITE)': ['개념플러스연산 라이트','개념플러스연산 lite','개념 플러스 연산 라이트'],
  '개념플러스연산 파워(POWER)': ['개념플러스연산 파워','개념플러스연산 power','개념 플러스 연산 파워'],
  '개념플러스연산': ['개념플러스연산','개념 플러스 연산'],
  '개념플러스유형': ['개념플러스유형','개념 플러스 유형','개념+유형'],
  '유형만렙': ['유형만렙'],
  '유형만렙 라이트(LITE)': ['유형만렙 라이트','유형만렙 lite'],
  '개념루트': ['개념루트'],
  '수학의 신': ['수학의 신','수학의신'],
  '완자 기출픽(PICK)': ['완자 기출픽','완자기출픽','완자 기출pick','완자기출pick'],
  '수학만 기출문제집': ['수학만 기출문제집','수학만기출문제집','수학만 기출']
};

const VARIANT_CONFLICTS = {
  '개념플러스유형 라이트(LITE)': ['파워','power'],
  '개념플러스유형 파워(POWER)': ['라이트','lite'],
  '개념플러스유형': ['라이트','lite','파워','power'],
  '개념플러스연산 라이트(LITE)': ['파워','power'],
  '개념플러스연산 파워(POWER)': ['라이트','lite'],
  '개념플러스연산': ['라이트','lite','파워','power'],
  '유형만렙 라이트(LITE)': [],
  '유형만렙': ['라이트','lite']
};

const KEYWORD_RULES = [
  {word:'단기간 완성', terms:['단기간','짧은 기간','빠르게 완성','빠른 완성','한달 완성','한 달 완성','2주 완성','몇 주 만에','단기 완성']},
  {word:'내신 대비', terms:['내신','학교 시험','학교시험','시험 대비','시험대비']},
  {word:'개념 설명', terms:['개념 설명','개념정리','개념 정리','개념이 잘','개념 이해']},
  {word:'유형 학습', terms:['유형','문제 유형','유형별']},
  {word:'반복 학습', terms:['반복','반복학습','반복 학습','여러 번','회독']},
  {word:'복습', terms:['복습','복습용','복습하기']},
  {word:'선행', terms:['선행','예습','선행학습']},
  {word:'숙제 활용', terms:['숙제','과제','학원 숙제']},
  {word:'난이도', terms:['난이도','어렵','쉬운','쉽다','쉽고','적당한 난도','난도']},
  {word:'기초 학습', terms:['기초','기본기','기본 문제','기초 문제']},
  {word:'심화', terms:['심화','고난도','상위권','어려운 문제']},
  {word:'문제량', terms:['문제량','문제가 많','문제 수','문항 수']},
  {word:'오답 관리', terms:['오답','틀린 문제','오답노트']},
  {word:'연산', terms:['연산','계산','계산력']},
  {word:'실전 대비', terms:['실전','기출','시험 직전','마무리']}
];

function nowKstISO(){ return new Date(Date.now()+9*60*60*1000).toISOString().replace('Z','+09:00'); }
function todayKst(){ return nowKstISO().slice(0,10); }
function stripHtml(s=''){ return String(s).replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").trim(); }
function normalize(s=''){ return stripHtml(s).toLowerCase().normalize('NFKC').replace(/[\s·ㆍ:;,_\-–—()\[\]{}'"!?./\\+]/g,''); }
function safeText(p){ return `${p.title||''} ${p.description||''}`.toLowerCase().normalize('NFKC'); }
function stableId(url){ return crypto.createHash('sha1').update(url).digest('hex').slice(0,16); }
function bookKey(level,book){ return `${level}::${book}`; }

function bookAliases(book){ return ALIASES[book] || [book.replace(/\((LITE|POWER|PICK)\)/gi,'').trim()]; }
function exactBookMatch(book,text){
  const n = normalize(text);
  const matched = bookAliases(book).some(a=>n.includes(normalize(a)));
  if (!matched) return false;
  const conflicts=VARIANT_CONFLICTS[book]||[];
  if (conflicts.some(x=>n.includes(normalize(x)))) return false;
  return true;
}
function levelEvidence(level,text){
  const raw=String(text).toLowerCase().normalize('NFKC');
  const own=(LEVEL_TERMS[level]||[]).some(r=>{r.lastIndex=0;return r.test(raw)});
  const other=Object.entries(LEVEL_TERMS).filter(([k])=>k!==level).some(([,rs])=>rs.some(r=>{r.lastIndex=0;return r.test(raw)}));
  return {own,other};
}
function officialOrSales(p){
  const t=safeText(p);
  const bad=['비상교육 공식','비상교재 공식','공식몰','구매하기','판매합니다','판매 중','정가','쿠폰','체험단 모집','서평단 모집','협찬','소정의 원고료','광고입니다','제공받아'];
  return bad.some(k=>t.includes(k));
}
function strictFilter(level,book,p){
  const text=`${p.title||''} ${p.description||''}`;
  if (!exactBookMatch(book,text)) return {ok:false,reason:'exact_name'};
  const lv=levelEvidence(level,text);
  if (!lv.own || lv.other) return {ok:false,reason:'level'};
  if (officialOrSales(p)) return {ok:false,reason:'sales'};
  return {ok:true,reason:'accepted'};
}

function searchQueries(level,book){
  const name=bookAliases(book)[0];
  const levelQ = level==='초등' ? ['초등','초1','초2','초3','초4','초5','초6'] : level==='중등' ? ['중등','중1','중2','중3'] : ['고등','고1','고2','고3','공통수학'];
  const out=levelQ.map(l=>`"${name}" ${l}`);
  out.push(`"${name}" ${levelQ[0]} 후기`);
  out.push(`"${name}" ${levelQ[0]} 학원`);
  return [...new Set(out)].slice(0,10);
}

function deriveKeywords(posts){
  const rows=[];
  for(const rule of KEYWORD_RULES){
    const ids=[];
    for(const p of posts){
      const t=safeText(p);
      if(rule.terms.some(term=>t.includes(term.toLowerCase()))) ids.push(p.id);
    }
    if(ids.length) rows.push({word:rule.word,count:ids.length,weight:Math.min(100,30+ids.length*9),postIds:ids});
  }
  rows.sort((a,b)=>b.count-a.count || b.weight-a.weight);
  return rows.slice(0,10);
}
function deriveFallbackSummary(posts,keywords){
  if(!posts.length) return '정밀 필터를 통과한 사용자 게시글이 아직 없습니다.';
  const top=keywords.slice(0,4).map(k=>`${k.word}(${k.count}건)`).join(', ');
  return `정밀 필터를 통과한 ${posts.length}건을 기준으로 확인한 결과, ${top||'사용 후기'} 관련 언급이 확인됩니다. AI 요약을 사용할 수 없을 때는 실제 게시글에 포함된 표현만 집계합니다.`;
}

async function callNaver(type,query,cfg,display=40){
  const endpoint=type==='blog'?'blog':'cafearticle';
  const url=`https://naverapihub.apigw.ntruss.com/search/v1/${endpoint}?query=${encodeURIComponent(query)}&display=${display}&start=1&sort=date&format=json`;
  let r=await fetch(url,{headers:{'X-NCP-APIGW-API-KEY-ID':cfg.NAVER_CLIENT_ID,'X-NCP-APIGW-API-KEY':cfg.NAVER_CLIENT_SECRET}});
  if(r.status===401){
    const legacy=`https://openapi.naver.com/v1/search/${endpoint}.json?query=${encodeURIComponent(query)}&display=${display}&start=1&sort=date`;
    r=await fetch(legacy,{headers:{'X-Naver-Client-Id':cfg.NAVER_CLIENT_ID,'X-Naver-Client-Secret':cfg.NAVER_CLIENT_SECRET}});
  }
  const txt=await r.text(); let j; try{j=JSON.parse(txt)}catch{j={message:txt}}
  if(!r.ok) throw new Error(`네이버 API 오류 (${r.status}): ${typeof j==='string'?j:(j.errorMessage||j.message||JSON.stringify(j))}`);
  return (j.items||[]).map(x=>({
    id:stableId(x.link), title:stripHtml(x.title), url:x.link, description:stripHtml(x.description), postdate:x.postdate||'',
    source:type==='blog'?'네이버 블로그':'네이버 카페', author:stripHtml(x.bloggername||x.cafename||''), firstSeenAt:nowKstISO()
  })).filter(x=>/^https?:\/\//.test(x.url));
}

async function testNaver(cfg){
  if(!cfg.NAVER_CLIENT_ID||!cfg.NAVER_CLIENT_SECRET) return {ok:false,error:'네이버 Client ID/Client Secret을 입력해 주세요.'};
  try{await callNaver('blog','비상교육 수학',cfg,1);return {ok:true,label:'네이버 검색 API'};}catch(e){return {ok:false,error:e.message};}
}
async function testOpenAI(cfg){
  if(!cfg.OPENAI_API_KEY) return {ok:false,error:'OpenAI API Key가 입력되지 않았습니다.'};
  try{const r=await fetch('https://api.openai.com/v1/models',{headers:{Authorization:`Bearer ${cfg.OPENAI_API_KEY}`}});if(r.ok)return{ok:true,label:'OpenAI API'};return{ok:false,error:`OpenAI API ${r.status}: ${await r.text()}`};}catch(e){return{ok:false,error:e.message};}
}

async function analyzeWithOpenAI(level,book,posts,cfg){
  if(!cfg.OPENAI_API_KEY||!posts.length) return null;
  const compact=posts.slice(0,60).map((p,i)=>({id:p.id,title:p.title,description:p.description,source:p.source,date:p.postdate}));
  const schema={type:'object',additionalProperties:false,properties:{summary:{type:'string'},positive:{type:'integer',minimum:0,maximum:100},neutral:{type:'integer',minimum:0,maximum:100},negative:{type:'integer',minimum:0,maximum:100},topics:{type:'array',minItems:3,maxItems:5,items:{type:'string'}}},required:['summary','positive','neutral','negative','topics']};
  const instructions=`당신은 한국 교육교재 VOC 분석가입니다. 이미 엄격한 교재명/학교급 필터를 통과한 실제 검색 결과만 분석합니다. 광고나 공식 소개처럼 보이는 내용은 근거로 삼지 말고, 제공된 문장 밖의 사실은 추측하지 마세요. 감성 비율 합계는 100이 되게 하세요.`;
  const input=`학교급: ${level}\n교재명: ${book}\n게시글 데이터(JSON): ${JSON.stringify(compact)}`;
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${cfg.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:cfg.OPENAI_MODEL||'gpt-5-mini',instructions,input,text:{format:{type:'json_schema',name:'voc_analysis',strict:true,schema}}})});
  if(!r.ok){const body=await r.text();const err=new Error(`OpenAI API 오류 (${r.status}): ${body}`);err.status=r.status;throw err;}
  const j=await r.json();let text=j.output_text; if(!text&&Array.isArray(j.output)){for(const item of j.output)for(const c of(item.content||[]))if(c.type==='output_text'&&c.text)text=c.text;}
  return text?JSON.parse(text):null;
}

function mergePosts(oldPosts,newPosts){
  const map=new Map((oldPosts||[]).map(p=>[p.url,p]));
  for(const p of newPosts){ if(map.has(p.url))p.firstSeenAt=map.get(p.url).firstSeenAt; map.set(p.url,p); }
  return [...map.values()].sort((a,b)=>(b.postdate||'').localeCompare(a.postdate||''));
}

async function collectBook(level,book,cfg,oldRecord={posts:[],analysis:null}){
  const stats={raw:0,duplicate:0,rejectedExactName:0,rejectedLevel:0,rejectedSales:0,accepted:0};
  const all=[];
  for(const q of searchQueries(level,book)){
    const [b,c]=await Promise.all([callNaver('blog',q,cfg,30),callNaver('cafe',q,cfg,30)]); all.push(...b,...c);
  }
  stats.raw=all.length;
  const uniq=[...new Map(all.map(p=>[p.url,p])).values()]; stats.duplicate=all.length-uniq.length;
  const accepted=[];
  for(const p of uniq){const f=strictFilter(level,book,p); if(f.ok)accepted.push(p); else if(f.reason==='exact_name')stats.rejectedExactName++; else if(f.reason==='level')stats.rejectedLevel++; else stats.rejectedSales++;}
  stats.accepted=accepted.length;
  const merged=mergePosts(oldRecord.posts,accepted).filter(p=>strictFilter(level,book,p).ok);
  const keywords=deriveKeywords(merged);
  let ai=null,aiError=null;
  try{ai=await analyzeWithOpenAI(level,book,merged,cfg);}catch(e){aiError=e.message;}
  const analysis={
    summary:ai?.summary||deriveFallbackSummary(merged,keywords),
    positive:Number.isInteger(ai?.positive)?ai.positive:null,
    neutral:Number.isInteger(ai?.neutral)?ai.neutral:null,
    negative:Number.isInteger(ai?.negative)?ai.negative:null,
    topics:ai?.topics||keywords.slice(0,5).map(k=>k.word),
    keywords,
    aiStatus:ai?'ok':(cfg.OPENAI_API_KEY?'error':'off'),
    aiError
  };
  return {posts:merged,analysis,lastUpdated:nowKstISO(),filterStats:stats};
}

function publicRecord(level,book,record){
  const posts=(record?.posts||[]).sort((a,b)=>(b.postdate||'').localeCompare(a.postdate||''));
  return {level,book,mentions:posts.length,today:posts.filter(p=>(p.firstSeenAt||'').slice(0,10)===todayKst()).length,posts,analysis:record?.analysis||null,lastUpdated:record?.lastUpdated||null,filterStats:record?.filterStats||null};
}

module.exports={CATALOG,bookKey,nowKstISO,todayKst,collectBook,publicRecord,testNaver,testOpenAI,deriveKeywords,strictFilter,searchQueries};
