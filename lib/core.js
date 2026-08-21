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
  {word:'개념 설명',terms:['개념 설명','개념정리','개념 정리','설명이 자세','설명이 친절','개념이 잘','개념 이해','설명이 쉬']},
  {word:'유형 학습',terms:['유형','문제 유형','유형별','유형 문제','유형이 다양']},
  {word:'문제 구성',terms:['문제 구성','문제구성','문항 구성','구성이 좋','구성이 알차']},
  {word:'난이도',terms:['난이도','난도','어렵','쉬운','쉽다','쉬워','적당한 난도','적당한 난이도']},
  {word:'내신 대비',terms:['내신','학교 시험','학교시험','시험 대비','시험대비','중간고사','기말고사']},
  {word:'반복 학습',terms:['반복','반복학습','반복 학습','여러 번','회독','반복하기']},
  {word:'복습',terms:['복습','복습용','복습하기','다시 풀']},
  {word:'선행',terms:['선행','예습','선행학습','미리 공부']},
  {word:'숙제 활용',terms:['숙제','과제','학원 숙제','숙제로']},
  {word:'기초 학습',terms:['기초','기본기','기본 문제','기초 문제','입문']},
  {word:'심화 학습',terms:['심화','고난도','상위권','어려운 문제','심화 문제']},
  {word:'문제량',terms:['문제량','문제가 많','문제 수','문항 수','문제도 많']},
  {word:'오답 관리',terms:['오답','틀린 문제','오답노트','틀린문제']},
  {word:'연산 훈련',terms:['연산','계산','계산력','연산력']},
  {word:'실전 대비',terms:['실전','기출','시험 직전','마무리','실전 문제']},
  {word:'해설 친절',terms:['해설','해설이 친절','풀이가 자세','설명이 친절']},
  {word:'학습 효과',terms:['실력 향상','성적','효과','이해가 잘','이해 잘','도움이 됐','도움이 되']},
  {word:'추천/만족',terms:['추천','만족','좋아요','좋다','괜찮','재구매']},
  {word:'단기간 완성',terms:['단기간','짧은 기간','빠르게 완성','빠른 완성','한달 완성','한 달 완성','2주 완성','단기 완성']},
  {word:'교재 편집',terms:['편집','글씨','디자인','구성 깔끔','보기 편','가독성']},
  {word:'분량 부담',terms:['분량','양이 많','양이 적','부담','진도']},
  {word:'기출 활용',terms:['기출','기출문제','시험 문제','기출픽','기출 문제집']}
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
function gradeEvidence(level,text){
  const raw=String(text).toLowerCase().normalize('NFKC');
  const patterns = level==='초등'
    ? [/초\s*([1-6])\s*학년/,/초([1-6])(?!\d)/]
    : level==='중등'
    ? [/(?:중|중학|중등)\s*([1-3])\s*학년/,/중([1-3])(?!\d)/]
    : [/(?:고|고등)\s*([1-3])\s*학년/,/고([1-3])(?!\d)/];
  for(const r of patterns){ const m=raw.match(r); if(m) return Number(m[1]); }
  return null;
}
function strictFilter(level,book,p){
  const text=`${p.title||''} ${p.description||''}`;
  if (!exactBookMatch(book,text)) return {ok:false,reason:'exact_name'};
  const lv=levelEvidence(level,text);
  // 학교급이 명시되지 않은 결과는 정확도를 위해 제외. 다른 학교급이 같이 잡힌 결과도 제외.
  if (!lv.own || lv.other) return {ok:false,reason:'level'};
  if (officialOrSales(p)) return {ok:false,reason:'sales'};
  p.grade = gradeEvidence(level,text);
  return {ok:true,reason:'accepted'};
}

function searchQueries(level,book){
  const name=bookAliases(book)[0];
  const levelQ = level==='초등' ? ['초등','초1','초2','초3','초4','초5','초6'] : level==='중등' ? ['중등','중학','중1','중2','중3'] : ['고등','고1','고2','고3','공통수학'];
  const intent=['후기','사용','수업','학원','공부방','문제집','추천','난이도'];
  const out=[];
  for(const l of levelQ) out.push(`"${name}" ${l}`);
  for(const i of intent) out.push(`"${name}" ${levelQ[0]} ${i}`);
  return [...new Set(out)].slice(0,16);
}

function deriveKeywords(posts){
  const rows=[];
  for(const rule of KEYWORD_RULES){
    const ids=[]; let score=0;
    for(const p of posts){
      const title=String(p.title||'').toLowerCase(), desc=String(p.description||'').toLowerCase();
      const th=rule.terms.some(t=>title.includes(t.toLowerCase())), dh=rule.terms.some(t=>desc.includes(t.toLowerCase()));
      if(th||dh){ids.push(p.id);score+=th?2:1;}
    }
    if(ids.length) rows.push({word:rule.word,count:ids.length,score,weight:Math.min(100,25+score*6),postIds:ids});
  }
  rows.sort((a,b)=>b.score-a.score||b.count-a.count||b.weight-a.weight);
  return rows.slice(0,12);
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


function classifySource(url='', title='', description=''){
  const u=String(url).toLowerCase(), t=`${title} ${description}`.toLowerCase();
  if(u.includes('cafe.naver.com')) return '네이버 카페';
  if(u.includes('blog.naver.com')) return '네이버 블로그';
  if(u.includes('tistory.com')) return '티스토리';
  if(u.includes('aladin.co.kr')) return '알라딘 후기';
  if(u.includes('yes24.com') || u.includes('yes24.co.kr')) return 'YES24 후기';
  if(u.includes('kyobobook.co.kr')) return '교보문고 후기';
  if(u.includes('blog') || u.includes('review')) return '웹 후기';
  return '웹문서';
}
async function callNaverWeb(query,cfg,display=40){
  const url=`https://naverapihub.apigw.ntruss.com/search/v1/webkr?query=${encodeURIComponent(query)}&display=${display}&start=1&sort=date&format=json`;
  let r=await fetch(url,{headers:{'X-NCP-APIGW-API-KEY-ID':cfg.NAVER_CLIENT_ID,'X-NCP-APIGW-API-KEY':cfg.NAVER_CLIENT_SECRET}});
  if(r.status===401){
    const legacy=`https://openapi.naver.com/v1/search/webkr.json?query=${encodeURIComponent(query)}&display=${display}&start=1`;
    r=await fetch(legacy,{headers:{'X-Naver-Client-Id':cfg.NAVER_CLIENT_ID,'X-Naver-Client-Secret':cfg.NAVER_CLIENT_SECRET}});
  }
  const txt=await r.text(); let j; try{j=JSON.parse(txt)}catch{j={message:txt}}
  if(!r.ok) throw new Error(`네이버 웹검색 API 오류 (${r.status}): ${j.errorMessage||j.message||JSON.stringify(j)}`);
  return (j.items||[]).map(x=>({
    id:stableId(x.link), title:stripHtml(x.title), url:x.link, description:stripHtml(x.description),
    postdate:'', source:classifySource(x.link,x.title,x.description), author:'', firstSeenAt:nowKstISO()
  })).filter(x=>/^https?:\/\//.test(x.url));
}
function preferredCommunity(p){
  const u=(p.url||'').toLowerCase();
  // 공도비 및 후기성 외부 출처는 우선 유지하되, 최종 교재명/학교급 필터는 동일 적용.
  if((p.author||'').includes('공도비') || u.includes('gongdobi')) p.source='공도비 카페';
  return p;
}

async function testNaver(cfg){
  if(!cfg.NAVER_CLIENT_ID||!cfg.NAVER_CLIENT_SECRET) return {ok:false,error:'네이버 Client ID/Client Secret을 입력해 주세요.'};
  try{await callNaver('blog','비상교육 수학',cfg,1);return {ok:true,label:'네이버 검색 API'};}catch(e){return {ok:false,error:e.message};}
}
async function testOpenAI(cfg){
  if(!cfg.OPENAI_API_KEY) return {ok:false,error:'OpenAI API Key가 입력되지 않았습니다.'};
  try{const r=await fetch('https://api.openai.com/v1/models',{headers:{Authorization:`Bearer ${cfg.OPENAI_API_KEY}`}});if(r.ok)return{ok:true,label:'OpenAI API'};return{ok:false,error:`OpenAI API ${r.status}: ${await r.text()}`};}catch(e){return{ok:false,error:e.message};}
}

async function analyzeBatchWithOpenAI(level,book,posts,cfg,batchNo,batchTotal){
  const compact=posts.map(p=>({id:p.id,title:p.title,description:p.description,source:p.source,date:p.postdate}));
  const schema={type:'object',additionalProperties:false,properties:{
    summary:{type:'string'},
    topics:{type:'array',minItems:1,maxItems:7,items:{type:'string'}},
    sentiments:{type:'array',items:{type:'object',additionalProperties:false,properties:{
      id:{type:'string'},
      label:{type:'string',enum:['positive','neutral','negative']},
      evidence:{type:'string'},
      needsReview:{type:'boolean'},
      reviewEvidence:{type:'string'},
      hasImprovementPoint:{type:'boolean'},
      improvementCategory:{type:'string',enum:['난이도','개념 설명','문제 구성','문제량','해설','편집·가독성','학습 부담','정답·부가자료','기타','없음']},
      improvementEvidence:{type:'string'},
      userClass:{type:'string',enum:['high_preference','neutral','improvement_request']}
    },required:['id','label','evidence','needsReview','reviewEvidence','hasImprovementPoint','improvementCategory','improvementEvidence','userClass']}}
  },required:['summary','topics','sentiments']};

  const instructions=`당신은 한국 교육교재 VOC 분석가입니다.
이 분석은 ${batchNo}/${batchTotal}번째 묶음입니다.
각 게시글을 반드시 개별적으로 판정하세요. sentiments에는 입력된 모든 게시글 id가 정확히 한 번씩 포함되어야 합니다.
userClass는 화면에 공개할 사용자 관점 분류입니다.
- high_preference: 실제 사용 후 만족, 추천, 재구매 의사, 학습 효과, 아이가 잘 푼다는 등 뚜렷한 호평이 중심.
- neutral: 자료 공유, 출간 정보, 구매 문의, 파일 요청, 단순 기록처럼 평가가 뚜렷하지 않은 정보성 글.
- improvement_request: 전체적으로 좋은 평가더라도 아이가 어려워함, 설명 부족, 문제량 아쉬움, 해설 불편, 구성 개선 요청 등 교재 개선에 참고할 구체적 아쉬움이 실제 문장에 하나라도 핵심적으로 존재.
improvement_request는 '부정 사용자'라는 뜻이 아니라 개선에 도움이 되는 솔직한 사용 경험입니다.
광고·공식 소개 문구는 평가 근거로 사용하지 마세요.
evidence는 userClass 판정 근거가 되는 실제 표현을 30자 이내로 작성하세요.
hasImprovementPoint는 개선 포인트가 있으면 true.
improvementCategory는 난이도/개념 설명/문제 구성/문제량/해설/편집·가독성/학습 부담/정답·부가자료/기타 중 하나, 없으면 '없음'.
improvementEvidence는 개선 포인트의 직접 근거 표현을 40자 이내로, 없으면 빈 문자열.
summary는 이 묶음에서 반복되는 사용자 경험을 2~4문장으로 요약하세요.
topics는 이 묶음에서 실제 반복되는 주제만 작성하세요.`;

  const input=`학교급: ${level}\n교재명: ${book}\n게시글 데이터(JSON): ${JSON.stringify(compact)}`;
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{Authorization:`Bearer ${cfg.OPENAI_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      model:cfg.OPENAI_MODEL||'gpt-5-mini',
      instructions,input,
      text:{format:{type:'json_schema',name:'voc_analysis',strict:true,schema}}
    })
  });
  if(!r.ok){const body=await r.text();const err=new Error(`OpenAI API 오류 (${r.status}): ${body}`);err.status=r.status;throw err;}
  const j=await r.json();let text=j.output_text;
  if(!text&&Array.isArray(j.output)){for(const item of j.output)for(const c of(item.content||[]))if(c.type==='output_text'&&c.text)text=c.text;}
  return text?JSON.parse(text):null;
}

async function analyzeWithOpenAI(level,book,posts,cfg){
  if(!cfg.OPENAI_API_KEY||!posts.length) return null;

  // 전체 후기를 빠짐없이 분석한다. 너무 큰 요청을 피하기 위해 50건씩 분할.
  const BATCH_SIZE=50;
  const batches=[];
  for(let i=0;i<posts.length;i+=BATCH_SIZE)batches.push(posts.slice(i,i+BATCH_SIZE));

  const allSentiments=[];
  const summaries=[];
  const topicCounts=new Map();

  for(let i=0;i<batches.length;i++){
    const result=await analyzeBatchWithOpenAI(level,book,batches[i],cfg,i+1,batches.length);
    if(!result)continue;

    const expected=new Set(batches[i].map(p=>String(p.id)));
    const returned=new Set();
    for(const x of result.sentiments||[]){
      if(expected.has(String(x.id))&&!returned.has(String(x.id))){
        allSentiments.push(x);
        returned.add(String(x.id));
      }
    }

    // 모델이 일부 id를 누락하면 해당 게시글은 neutral로 추측하지 않고 '미분류'로 남긴다.
    if(result.summary)summaries.push(result.summary);
    for(const t of result.topics||[])topicCounts.set(t,(topicCounts.get(t)||0)+1);
  }

  const topics=[...topicCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,7).map(x=>x[0]);
  return {
    summary:summaries.join(' ').slice(0,2400),
    topics,
    sentiments:allSentiments
  };
}

function applyAIAnalysis(level,book,posts,ai){
  const keywords=deriveKeywords(posts);
  const classified=(ai?.sentiments||[]).filter(x=>posts.some(p=>String(p.id)===String(x.id)));
  const byId=new Map(classified.map(x=>[String(x.id),x]));

  for(const p of posts){
    const sx=byId.get(String(p.id));
    // 이전 판정을 먼저 지워서 재분석 결과가 남도록 한다.
    delete p.sentimentLabel; delete p.sentimentEvidence;
    delete p.needsReview; delete p.reviewEvidence;
    delete p.hasImprovementPoint; delete p.improvementCategory;
    delete p.improvementEvidence; delete p.userClass;

    if(sx){
      p.sentimentLabel=sx.label;
      p.sentimentEvidence=sx.evidence||'';
      p.needsReview=Boolean(sx.needsReview);
      p.reviewEvidence=sx.reviewEvidence||'';
      p.hasImprovementPoint=Boolean(sx.hasImprovementPoint);
      p.improvementCategory=sx.improvementCategory||'없음';
      p.improvementEvidence=sx.improvementEvidence||'';
      p.userClass=sx.userClass;
    }
  }

  const counts={high_preference:0,neutral:0,improvement_request:0};
  for(const x of classified){
    if(counts[x.userClass]!==undefined)counts[x.userClass]++;
  }
  const total=classified.length;
  const pct=n=>total?Math.round(n/total*100):null;

  return {
    summary:ai?.summary||deriveFallbackSummary(posts,keywords),
    positive:pct(counts.high_preference),
    neutral:pct(counts.neutral),
    negative:pct(counts.improvement_request),
    sentimentStats:{
      total,
      visiblePosts:posts.length,
      positive:counts.high_preference,
      neutral:counts.neutral,
      negative:counts.improvement_request,
      highPreference:counts.high_preference,
      improvementRequest:counts.improvement_request,
      method:'현재 저장 후기 전체를 50건씩 나누어 게시글별 AI 사용자 관점 분류',
      evidence:classified
    },
    topics:ai?.topics?.length?ai.topics:keywords.slice(0,7).map(k=>k.word),
    keywords,
    aiStatus:ai?'ok':'off',
    aiError:null
  };
}

async function reanalyzeExisting(level,book,cfg,oldRecord={posts:[],analysis:null}){
  const posts=(oldRecord.posts||[])
    .filter(p=>strictFilter(level,book,p).ok)
    .sort((a,b)=>(b.postdate||'').localeCompare(a.postdate||''));

  if(!posts.length)throw new Error('분석할 저장 후기가 없습니다.');
  if(!cfg.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY가 설정되어 있지 않습니다.');

  const ai=await analyzeWithOpenAI(level,book,posts,cfg);
  const analysis=applyAIAnalysis(level,book,posts,ai);
  return {
    ...oldRecord,
    posts,
    analysis,
    lastUpdated:nowKstISO(),
    analysisUpdatedAt:nowKstISO()
  };
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
    const results=await Promise.allSettled([
      callNaver('blog',q,cfg,30),
      callNaver('cafe',q,cfg,30),
      callNaverWeb(q,cfg,30)
    ]);
    for(const r of results) if(r.status==='fulfilled') all.push(...r.value.map(preferredCommunity));
  }
  stats.raw=all.length;
  const uniq=[...new Map(all.map(p=>[p.url,p])).values()]; stats.duplicate=all.length-uniq.length;
  const accepted=[];
  for(const p of uniq){const f=strictFilter(level,book,p); if(f.ok)accepted.push(p); else if(f.reason==='exact_name')stats.rejectedExactName++; else if(f.reason==='level')stats.rejectedLevel++; else stats.rejectedSales++;}
  stats.accepted=accepted.length;
  const merged=mergePosts(oldRecord.posts,accepted).filter(p=>strictFilter(level,book,p).ok);
  let ai=null,aiError=null;
  try{ai=await analyzeWithOpenAI(level,book,merged,cfg);}catch(e){aiError=e.message;}
  let analysis;
  if(ai){
    analysis=applyAIAnalysis(level,book,merged,ai);
  }else{
    const keywords=deriveKeywords(merged);
    analysis={
      summary:deriveFallbackSummary(merged,keywords),
      positive:null,neutral:null,negative:null,
      sentimentStats:{total:0,visiblePosts:merged.length,positive:0,neutral:0,negative:0,highPreference:0,improvementRequest:0,method:'AI 분석 미완료',evidence:[]},
      topics:keywords.slice(0,7).map(k=>k.word),keywords,
      aiStatus:cfg.OPENAI_API_KEY?'error':'off',aiError
    };
  }
  return {posts:merged,analysis,lastUpdated:nowKstISO(),filterStats:stats};
}

function publicRecord(level,book,record){
  const posts=(record?.posts||[])
    .filter(p=>strictFilter(level,book,p).ok)
    .sort((a,b)=>(b.postdate||'').localeCompare(a.postdate||''));

  const visibleIds=new Set(posts.map(p=>p.id));
  const freshKeywords=deriveKeywords(posts);
  const oldAnalysis=record?.analysis||null;
  const oldEvidence=(oldAnalysis?.sentimentStats?.evidence||[]).filter(x=>visibleIds.has(x.id));
  const evById=new Map(oldEvidence.map(x=>[x.id,x]));

  const classified=[];
  for(const p of posts){
    const ev=evById.get(p.id);
    let userClass=p.userClass||ev?.userClass;
    if(!userClass){
      const hasImprovement=Boolean(p.hasImprovementPoint ?? ev?.hasImprovementPoint);
      const label=p.sentimentLabel||ev?.label;
      if(hasImprovement) userClass='improvement_request';
      else if(label==='positive') userClass='high_preference';
      else if(label==='neutral'||label==='negative') userClass='neutral';
    }
    if(!['high_preference','neutral','improvement_request'].includes(userClass)) continue;

    classified.push({
      id:p.id,
      userClass,
      label:p.sentimentLabel||ev?.label||null,
      evidence:p.sentimentEvidence||ev?.evidence||'',
      hasImprovementPoint:Boolean(p.hasImprovementPoint ?? ev?.hasImprovementPoint),
      improvementCategory:p.improvementCategory||ev?.improvementCategory||'없음',
      improvementEvidence:p.improvementEvidence||ev?.improvementEvidence||''
    });
  }

  const counts={high_preference:0,neutral:0,improvement_request:0};
  for(const x of classified) counts[x.userClass]++;
  const total=classified.length;
  const pct=n=>total?Math.round(n/total*100):null;

  let analysis=null;
  if(posts.length){
    analysis=oldAnalysis?{...oldAnalysis}:{
      summary:deriveFallbackSummary(posts,freshKeywords),
      topics:freshKeywords.slice(0,5).map(k=>k.word),
      aiStatus:'off',aiError:null
    };
    analysis.keywords=freshKeywords;
    analysis.positive=pct(counts.high_preference);
    analysis.neutral=pct(counts.neutral);
    analysis.negative=pct(counts.improvement_request);
    analysis.sentimentStats={
      total,
      visiblePosts:posts.length,
      positive:counts.high_preference,
      neutral:counts.neutral,
      negative:counts.improvement_request,
      highPreference:counts.high_preference,
      improvementRequest:counts.improvement_request,
      method:'현재 표시 후기의 사용자 관점 AI 분류 건수로 직접 계산',
      evidence:classified
    };
  }

  return {
    level,book,
    mentions:posts.length,
    today:posts.filter(p=>(p.firstSeenAt||'').slice(0,10)===todayKst()).length,
    posts,analysis,
    lastUpdated:record?.lastUpdated||null,
    filterStats:record?.filterStats||null
  };
}

module.exports={CATALOG,bookKey,nowKstISO,todayKst,collectBook,reanalyzeExisting,publicRecord,testNaver,testOpenAI,deriveKeywords,strictFilter,searchQueries};
