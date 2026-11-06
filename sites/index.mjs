const page = String.raw`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>위고하이 풋살 데이터 분석</title>
<style>
:root{font:15px/1.55 "Pretendard","Malgun Gothic",system-ui,sans-serif;color:#162644;background:#f2f6fb;--line:#e1e8f3;--muted:#576783;--blue:#2f57c5;--mint:#008368}*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:20px}body{margin:0}a{color:inherit}button,input,select{font:inherit}button{cursor:pointer}
:focus-visible{outline:3px solid #3f69df;outline-offset:3px}.layout{display:grid;grid-template-columns:185px minmax(0,1fr);min-height:100vh}
.sidebar{background:#fdfefe;border-right:1px solid var(--line);padding:25px 14px;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:26px}
.brand{display:flex;gap:9px;align-items:center;font-size:14px;line-height:1.25}.brand small{display:block;color:var(--muted);font-size:10px;letter-spacing:.12em}
.crest{display:grid;place-items:center;color:white;background:#2549ad;border-radius:12px;width:34px;height:34px;flex:none}.sidebar nav{display:grid;gap:7px}
.sidebar nav a{text-decoration:none;font-size:13px;font-weight:650;padding:9px;border-radius:9px;color:#465d87}.sidebar nav a:first-child,.sidebar nav a:hover{background:#eaf0ff;color:#264bb3}
.sidebar footer{margin-top:auto;font-size:11px;color:var(--muted);line-height:1.6}
main{width:100%;min-width:0;max-width:1320px;margin:auto;padding:24px clamp(16px,3vw,40px) 50px}
.topline{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px}.eyebrow{font-size:11px;letter-spacing:.16em;font-weight:800;color:#36538c}
.status{padding:4px 10px;border-radius:20px;background:#e9f3ee;color:#286447;font-size:12px;font-weight:700}
.hero{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(110deg,#edf3ff,#e6f7f2);border:1px solid #d8e6f1;border-radius:21px;padding:24px 26px;margin-bottom:16px}
.hero h1{margin:5px 0;font-size:clamp(25px,3vw,39px);line-height:1.2;letter-spacing:-.055em}.hero p{margin:8px 0 0;color:#435875}
.pitch{position:absolute;right:3%;top:50%;transform:translateY(-50%) rotate(-9deg);width:33%;min-width:190px;max-width:350px;color:#469a83;opacity:.23;z-index:-1}
.pitch line,.pitch rect,.pitch circle,.pitch path{fill:none;stroke:currentColor;stroke-width:1.5}.pitch .ball{fill:#469a83;stroke:none}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.kpi{position:relative;overflow:hidden;padding:14px 15px;border-radius:14px;background:var(--surface);border:1px solid var(--edge);color:var(--ink)}
.kpi::after{content:"";width:74px;height:74px;border:1px solid currentColor;border-radius:50%;position:absolute;right:-18px;bottom:-31px;opacity:.18}
.kpi:nth-child(1){--surface:#e7efff;--edge:#d7e4ff;--ink:#234aa9}.kpi:nth-child(2){--surface:#e2f6ec;--edge:#d1eee1;--ink:#08745d}
.kpi:nth-child(3){--surface:#eeeafa;--edge:#e3daf8;--ink:#6041a5}.kpi:nth-child(4){--surface:#fff2e2;--edge:#f5e4ce;--ink:#91511a}
.kpi span{display:block;font-size:12px;font-weight:750}.kpi strong{font-variant-numeric:tabular-nums;display:block;font-size:clamp(24px,3vw,36px);letter-spacing:-.045em;line-height:1.25;margin:4px 0}.kpi small{font-size:11px}
.panels{display:grid;grid-template-columns:1.15fr 1fr;gap:12px;margin-top:14px}.panel{min-width:0;margin:0}
h2{margin:0 0 6px;font-size:18px;letter-spacing:-.04em}.chart-note{font-size:12px;color:var(--muted);margin:0 0 8px}.trend{min-height:164px}
.plot{display:block;width:100%;height:auto;overflow:visible}.axis{stroke:#e3e9f3;stroke-width:1}.ticks{fill:#566886;font-size:10px;font-family:system-ui,sans-serif}.goal-bar{fill:#6f91ef}.against-bar{fill:#78c9b3}.video-bar{fill:#6f73cf}
.legend{display:flex;gap:12px;font-size:11px;color:#526481}.legend span::before{display:inline-block;content:"";width:8px;height:8px;background:var(--dot);border-radius:50%;margin-right:5px}
section,details{background:white;border:1px solid var(--line);border-radius:15px;padding:16px 18px;margin:13px 0;box-shadow:0 3px 12px #1f3d6510}
.panel{margin:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}.chat{display:flex;gap:8px}.chat input{flex:1;min-width:0}
label{display:grid;gap:4px;font-size:13px}select,input,button{border:1px solid #ccd9ed;border-radius:9px;padding:8px 10px;background:white;color:inherit}
button[type=submit]{background:#284db6;color:white;border-color:#284db6;font-weight:700}.examples{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.examples button{font-size:12px;background:#f5f8ff}
form>button{margin-top:12px}summary{cursor:pointer;font-weight:700}.muted{color:var(--muted)}.table-wrap{overflow:auto}table{border-collapse:collapse;min-width:100%;white-space:nowrap;font-size:13px}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e7edf6}th{color:#465d83;background:#f3f7fe}
.chart-line{display:grid;grid-template-columns:minmax(76px,140px) 1fr auto;align-items:center;gap:8px;margin:7px 0}.bar{display:block;min-width:1px;height:13px;background:#4264d8;border-radius:5px}.bar.negative{background:#bc3d53}
.answer{font-size:19px;font-weight:750}.question{color:#354b80}.tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
@media(max-width:850px){.layout{display:block}.sidebar{height:auto;position:static;padding:12px 16px;flex-direction:row;flex-wrap:wrap;gap:10px;border:0;border-bottom:1px solid var(--line)}.sidebar nav{display:flex;flex-wrap:wrap;gap:2px}.sidebar nav a{padding:6px}.sidebar footer{display:none}}
@media(max-width:620px){main{padding-top:16px}.kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.panels{grid-template-columns:1fr}.hero{padding:20px}.pitch{opacity:.13;right:-30px}.sidebar nav a{font-size:11px}}
</style></head><body><div class="layout">
<aside class="sidebar"><div class="brand"><span class="crest" aria-hidden="true">
<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="m12 8 4 3-1.5 4.5h-5L8 11zm0 0V3m4 8 4.5-1.5m-6 6 3 3.5m-8-3.5L6.5 19M8 11 3.5 9.5"/></svg>
</span><strong>WE GO HIGH<small>FUTSAL DATA</small></strong></div>
<nav aria-label="사이트 메뉴"><a href="#overview">홈화면</a><a href="#recent">경기 기록</a><a href="#ask">풋살 챗봇</a><a href="#analysis">조건 분석</a><a href="#assignment">근거 확인</a></nav>
<footer>위고하이 풋살매치<br>운영 기록 조회 전용</footer></aside><main>
<div class="topline" id="overview"><span class="eyebrow">WGH 은평 / 풋살 데이터 센터</span><span id="data-status" class="status" aria-live="polite">운영 기록 연결 중</span></div>
<header class="hero">
<div class="eyebrow">WE GO HIGH · FUTSAL ANALYTICS</div><h1>위고하이 풋살 Q&A</h1><p>경기 흐름과 기록을 보고, 궁금한 점을 질문하세요.</p>
<svg class="pitch" viewBox="0 0 260 142" aria-hidden="true"><rect x="8" y="8" width="244" height="126" rx="4"/><line x1="130" y1="8" x2="130" y2="134"/><circle cx="130" cy="71" r="26"/><path d="M8 40c42 0 42 62 0 62m244-62c-42 0-42 62 0 62"/><rect x="1" y="56" width="7" height="30"/><rect x="252" y="56" width="7" height="30"/><circle class="ball" cx="130" cy="71" r="3"/></svg>
</header>
<div class="kpis" aria-label="주요 경기 지표">
<article class="kpi"><span>등록 경기</span><strong id="kpi-matches">—</strong><small>경기 기록 수</small></article>
<article class="kpi"><span>총 득점</span><strong id="kpi-goals">—</strong><small>위고하이 팀 득점</small></article>
<article class="kpi"><span>승률</span><strong id="kpi-win">—</strong><small>승리 ÷ 등록 경기</small></article>
<article class="kpi"><span>친선경기 영상</span><strong id="kpi-videos">—</strong><small>제목 분류 기준</small></article>
</div>
<div class="panels">
<section class="panel"><h2>월별 득점과 실점</h2><p class="chart-note">등록된 경기 기준 · 최근 기록이 있는 8개 월</p><div id="match-trend" class="trend muted">경기 차트 불러오는 중…</div><div class="legend"><span style="--dot:#6f91ef">득점</span><span style="--dot:#78c9b3">실점</span></div></section>
<section class="panel"><h2>월별 친선경기 영상</h2><p class="chart-note">영상 날짜 기준 · 최근 기록이 있는 8개 월</p><div id="video-trend" class="trend muted">영상 차트 불러오는 중…</div><div class="legend"><span style="--dot:#6f73cf">영상 수</span></div></section>
</div>
<section id="recent"><h2>최근 경기</h2><p class="chart-note">날짜와 상대팀, 등록된 점수를 확인하세요.</p><div id="recent-table" class="muted">경기 목록 불러오는 중…</div></section>
<section id="ask"><h2>말로 질문하기</h2><form id="chat"><div class="chat">
<input id="question" aria-label="풋살 질문" maxlength="500" required placeholder="친선경기 영상 몇 개야?">
<button type="submit">질문</button></div></form>
<div class="examples"><button type="button">친선경기 영상 몇 개야?</button><button type="button">친선경기는 얼마나 했어?</button><button type="button">월별 득점을 비교해줘</button></div></section>
<details id="analysis"><summary>조건으로 직접 분석</summary><form id="filters"><div class="grid">
<label>자료<select name="dataset"><option value="matches">경기 기록</option><option value="players">선수 누적 기록</option><option value="participation">경기별 선수 기록</option><option value="schedules">예정 일정</option><option value="videos">영상 목록</option></select></label>
<label>집계<select name="group"><option value="total">전체</option><option value="month">월별</option><option value="opponent">상대팀별</option><option value="league">리그별</option><option value="location">장소별</option><option value="rows">목록</option></select></label>
<label>경기 유형<select name="match_type"><option value="">전체</option><option>친선경기</option><option>위리그</option><option>정기훈련</option></select></label>
<label>상대팀<input name="opponent" maxlength="100"></label>
<label>시작일<input name="start" type="date"></label><label>종료일<input name="end" type="date"></label>
</div><button type="submit">조회하고 시각화</button></form></details>
<details id="assignment"><summary>근거 확인 과제</summary><p class="muted">경기 사실표의 근거를 찾아 사실ID와 함께 답합니다.</p>
<div id="evidence-questions" class="examples"></div></details>
<section id="result" aria-live="polite"><p class="muted">질문을 입력하거나 조회 조건을 선택하세요.</p></section>
</main></div><script>
const result = document.getElementById('result');
function node(tag, value, style) {
  const el = document.createElement(tag);
  if (value != null) el.textContent = String(value);
  if (style) el.className = style;
  return el;
}
function makeTable(rows) {
  const wrap = node('div', null, 'table-wrap');
  if (!rows || !rows.length) { wrap.append(node('p','조회된 기록이 없어요.')); return wrap; }
  const table = node('table');
  const columns = Object.keys(rows[0]);
  const head = table.createTHead().insertRow();
  columns.forEach(key => head.append(node('th',key)));
  const tbody = table.createTBody();
  rows.forEach(record => { const row = tbody.insertRow(); columns.forEach(key => row.append(node('td',record[key] ?? '—'))); });
  wrap.append(table);
  return wrap;
}
async function fetchResult(body, signal) {
  const response = await fetch('/api/query',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal});
  const data = await response.json();
  if (!response.ok) throw Error(typeof data.detail === 'string' ? data.detail : '조회 조건을 다시 확인해 주세요.');
  return data;
}
function svgNode(name, attributes, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg',name);
  Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,value));
  if (text != null) element.textContent=String(text);
  return element;
}
function renderTrend(id, rows, series, title) {
  const target=document.getElementById(id);
  if (!rows.length) { target.textContent='표시할 기록이 없어요.'; return; }
  const ordered=rows.slice().sort((a,b)=>a.month.localeCompare(b.month)).slice(-8);
  const max=Math.max(4,...ordered.flatMap(row=>series.map(item=>row[item.key])));
  const top=14, bottom=141, left=31, right=411;
  const groupWidth=(right-left)/ordered.length;
  const barWidth=Math.min(22,(groupWidth-8)/series.length);
  const svg=svgNode('svg',{class:'plot',viewBox:'0 0 424 168',role:'img','aria-label':title});
  svg.append(svgNode('title',{},ordered.map(row=>row.month+' '+series.map(item=>item.label+' '+row[item.key]).join(', ')).join(' / ')));
  for(let step=0;step<=4;step++){
    const scale=Math.ceil(max/4)*4, value=scale*step/4, y=bottom-(bottom-top)*step/4;
    svg.append(svgNode('line',{x1:left,x2:right,y1:y,y2:y,class:'axis'}));
    svg.append(svgNode('text',{x:left-7,y:y+3,'text-anchor':'end',class:'ticks'},value));
  }
  ordered.forEach((row,index)=>{
    const x=left+(index+.5)*groupWidth;
    series.forEach((item,offset)=>{
      const height=(bottom-top)*row[item.key]/(Math.ceil(max/4)*4);
      const bar=svgNode('rect',{x:x-series.length*barWidth/2+offset*barWidth+1,y:bottom-height,width:barWidth-2,height,rx:3,class:item.css});
      bar.append(svgNode('title',{},row.month+' · '+item.label+' '+row[item.key]));
      svg.append(bar);
    });
    svg.append(svgNode('text',{x,y:158,'text-anchor':'middle',class:'ticks'},row.month.slice(2)));
  });
  target.replaceChildren(svg);
}
function metric(id,value) { document.getElementById(id).textContent=value; }
async function loadDashboard() {
  const [matches,videos]=await Promise.allSettled([
    fetchResult({filters:{dataset:'matches',group:'month',metric:'scored'}}),
    fetchResult({filters:{dataset:'videos',group:'month',match_type:'친선경기'}})
  ]);
  if(matches.status==='fulfilled'){
    const data=matches.value, rows=data.table??[];
    const total=rows.reduce((sum,row)=>sum+Number(row['경기 수']||0),0);
    const wins=rows.reduce((sum,row)=>sum+Number(row['승']||0),0);
    const goals=rows.reduce((sum,row)=>sum+Number(row['득점']||0),0);
    metric('kpi-matches',total.toLocaleString('ko-KR'));
    metric('kpi-goals',goals.toLocaleString('ko-KR'));
    metric('kpi-win',total?(100*wins/total).toFixed(1)+'%':'—');
    renderTrend('match-trend',rows.filter(row=>/^\d{4}-\d{2}$/.test(row['구분'])).map(row=>({month:row['구분'],goals:Number(row['득점']||0),against:Number(row['실점']||0)})),
      [{key:'goals',label:'득점',css:'goal-bar'},{key:'against',label:'실점',css:'against-bar'}],'월별 득점과 실점');
    const recent=(data.records??[]).slice().sort((a,b)=>String(b['경기 날짜']).localeCompare(String(a['경기 날짜']))).slice(0,5);
    document.getElementById('recent-table').replaceChildren(makeTable(recent.map(row=>({
      '날짜':typeof row['경기 날짜']==='string'&&/^\d{4}-\d{2}-\d{2}/.test(row['경기 날짜'])
        ? row['경기 날짜'].slice(0,10).replaceAll('-','.') : row['경기 날짜'],
      '상대팀':row['상대팀'],'경기 유형':row['리그']||'미지정',
      '위고하이 점수':row['우리 득점']+' : '+row['상대 득점'],'장소':row['장소']
    }))));
  }else{
    metric('match-trend','경기 기록을 불러오지 못했어요.');
    metric('recent-table','경기 목록을 불러오지 못했어요.');
  }
  if(videos.status==='fulfilled'){
    const data=videos.value;
    metric('kpi-videos',(data.records??[]).length.toLocaleString('ko-KR'));
    renderTrend('video-trend',(data.chart??[]).map(item=>({month:item.label,videos:item.value})),
      [{key:'videos',label:'영상 수',css:'video-bar'}],'월별 친선경기 영상');
  }else{
    metric('video-trend','영상 기록을 불러오지 못했어요.');
  }
  metric('data-status',matches.status==='fulfilled'&&videos.status==='fulfilled'?'운영 DB 조회 완료':'일부 기록 조회 불가');
}
function download(rows) {
  const columns = Object.keys(rows[0]);
  const csvValue = value => {
    const v = String(value ?? '');
    return '"' + (/^[=+@\-]/.test(v) && typeof value !== 'number' ? "'" + v : v).replaceAll('"','""') + '"';
  };
  const csv = [columns.map(csvValue).join(','), ...rows.map(row => columns.map(k => csvValue(row[k])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'}));
  const link = node('a');
  link.href = url; link.download = 'wgh-analysis.csv'; link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
let active;
async function run(body) {
  active?.abort();
  const controller = new AbortController();
  active = controller;
  result.replaceChildren(node('p','기록을 조회하는 중이에요.','muted'));
  try {
    const data = await fetchResult(body,controller.signal);
    if (active !== controller) return;
    result.replaceChildren();
    if (body.question) result.append(node('p',body.question,'question'));
    result.append(node('p',data.message,'answer'));
    if (data.source) result.append(node('p',data.source,'muted'));
    if (data.cited) result.append(node('p','붙은 사실ID · '+(data.cited.join(', ') || '없음'),'muted'));
    if (data.evidence) {
      const evidence = node('details'); evidence.append(node('summary','검색된 근거'));
      data.evidence.forEach(item => evidence.append(node('p','['+item.id+'] '+item['내용']+' · '+item['출처'])));
      result.append(evidence);
    }
    if (data.chart?.length) {
      result.append(node('h2',data.chartTitle || '집계 차트'));
      const max = Math.max(1,...data.chart.map(item => Math.abs(item.value)));
      data.chart.forEach(item => {
        const row = node('div',null,'chart-line'), bar = node('span',null,item.value < 0 ? 'bar negative' : 'bar');
        bar.style.width = (Math.abs(item.value)/max*100)+'%';
        row.append(node('span',item.label),bar,node('strong',item.value)); result.append(row);
      });
    }
    if (data.table) {
      result.append(makeTable(data.table));
      if (data.table.length) {
        const save = node('button','결과 CSV 받기'); save.type='button'; save.onclick=()=>download(data.table); result.append(save);
      }
    }
    if (data.records?.length) {
      const details = node('details'); details.append(node('summary','집계에 사용한 기록'),makeTable(data.records)); result.append(details);
    }
  } catch (error) {
    if (!controller.signal.aborted) result.replaceChildren(node('p',error.message));
  }
}
document.getElementById('chat').addEventListener('submit',event=>{event.preventDefault();run({question:document.getElementById('question').value.trim()});});
document.getElementById('filters').addEventListener('submit',event=>{
  event.preventDefault(); const filters=Object.fromEntries([...new FormData(event.currentTarget)].filter(([,v])=>v)); run({filters});
});
document.querySelectorAll('section .examples button').forEach(button=>button.onclick=()=>run({question:button.textContent}));
[
  '2026년 10월 25일 WGH 은평과 WGH 왕십리의 경기 결과는?',
  '2026년 10월 25일 WGH 은평이 WGH 왕십리와 경기한 장소는?',
  '2026년 10월 7일 YDP전에서 득점한 선수는 누구인가요?'
].forEach(question=>{
  const button=node('button',question); button.type='button'; button.onclick=()=>run({question,evidence:true});
  document.getElementById('evidence-questions').append(button);
});
document.querySelectorAll('.sidebar a').forEach(link=>link.addEventListener('click',()=>{
  const section=document.querySelector(link.getAttribute('href'));
  if(section?.tagName==='DETAILS') section.open=true;
}));
loadDashboard();
</script></body></html>`;

const json = (data, status) => Response.json(data, {status, headers:{'cache-control':'no-store'}});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(page, {headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
    }
    if (url.pathname !== '/api/query' || request.method !== 'POST') return json({detail:'페이지를 찾지 못했어요.'},404);
    if (!request.headers.get('oai-authenticated-user-id')) return json({detail:'사이트 열람 권한으로 로그인해 주세요.'},401);
    if (request.headers.get('origin') !== url.origin) return json({detail:'사이트 화면에서 다시 요청해 주세요.'},403);
    if (!env.WGH_GATEWAY_URL || !env.WGH_GATEWAY_TOKEN) return json({detail:'운영 DB 연결 설정이 필요해요.'},503);
    const raw = await request.text();
    if (raw.length > 4000) return json({detail:'질문이 너무 길어요.'},413);
    let stage = 'gateway configuration';
    try {
      const gateway = new URL('/api/wgh/query',env.WGH_GATEWAY_URL);
      if (gateway.protocol !== 'https:') throw Error('HTTPS required');
      stage = 'gateway request';
      const outbound = new Request(gateway.href,{
        method:'POST',redirect:'manual',body:raw,
        headers:{'content-type':'application/json','authorization':'Bearer '+String(env.WGH_GATEWAY_TOKEN).trim()}
      });
      const upstream = await fetch(outbound);
      stage = 'gateway response';
      if (upstream.status >= 300 && upstream.status < 400) throw Error('Gateway redirect');
      return json(await upstream.json(),upstream.status);
    } catch (error) {
      const detail = String(error?.message ?? '').replace(/https?:\/\/\S+/g,'[url]').replace(/Bearer\s+\S+/gi,'Bearer [redacted]');
      console.error('WGH gateway failure', stage, error?.name, detail.slice(0,160));
      return json({detail:'운영 자료를 조회하지 못했어요. 잠시 후 다시 시도해 주세요.'},502);
    }
  }
};
