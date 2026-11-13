/* LS Cassava — ລະບົບຕິດຕາມການດຳເນີນທຸລະກິດ ຜະລິດ-ສົ່ງອອກ ແປ້ງມັນຕົ້ນ */
(function(){
'use strict';

/* ===== Data layer: Supabase → model ===== */
const CFG=window.LS_CONFIG||{};
const sb=window.supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
const FN={xan:'ຊະນະຄາມ',nan:'ນານ'};
const p2=n=>String(n).padStart(2,'0');
const dfmt=d=>d?`${p2(d.getDate())}/${p2(d.getMonth()+1)}/${d.getFullYear()}`:'—';
const toDate=s=>s?new Date(String(s).slice(0,10)+'T00:00:00'):null;
const isoOf=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
let ROLE='viewer',USERNAME='';
let SET={},SEASON='2026-27',S0=new Date(2026,8,1),NM=9,M=[],NOWI=0,NOWFRAC=0,FX=3242;
let plan={},act={},PL={},SEASON_NET={},PU={},CMF={xan:[],nan:[]},contracts=[],SHIP=[],PROC=[],PROD=[],MOVES=[],STK={},LAST={},LOANS=[],LTX=[],OUT_NC={xan:0,nan:0},ADV={xan:0,nan:0},PEND={xan:0,nan:0};
const AK=['proc','trucks','kip','toProd','waste','prod','p25','p850','onspec','offspec','pulp','pulpSold','exp','e25','e850','inv','invT','rev','revT','cash','ded','dir','ind','int'];
const PLK=['rexp','rpulp','raw','oth','mkt','salL','salF','admin','maint','support','asset','othI','int'];
const owe=fs=>{const a=fs.reduce((t,f)=>t+ADV[f],0),p=fs.reduce((t,f)=>t+PEND[f],0),o=[];if(a>0.05)o.push(`ໄດ້ເງິນແລ້ວ ຍັງບໍ່ສົ່ງ ${fmt(a,1)} ໂຕນ`);if(p>0.05)o.push(`ສົ່ງແລ້ວ ລໍຖ້າລາຄາ ${fmt(p,1)} ໂຕນ`);return o.join(' · ')||'ສົ່ງ ແລະ ໃບແຈ້ງໜີ້ ກົງກັນ'};
const mi=d=>(d.getFullYear()-S0.getFullYear())*12+d.getMonth()-S0.getMonth();
const monthDate=i=>new Date(S0.getFullYear(),S0.getMonth()+i,1);
async function fetchAll(table,filter){
 const out=[];for(let from=0;;from+=1000){let q=sb.from(table).select('*').range(from,from+999);if(filter)q=filter(q);
  const {data,error}=await q;if(error)throw error;out.push(...data);if(data.length<1000)break}
 return out}
async function loadAll(){
 const settings=await fetchAll('settings');SET=Object.fromEntries(settings.map(r=>[r.key,r.value]));
 const sea=SET.season||{code:'2026-27',start:'2026-09-01',months:9};SEASON=sea.code;S0=toDate(sea.start);NM=sea.months;
 const f=q=>q.eq('season',SEASON);
 const [plans,procs,prods,moves,ships,cons,costs,loans,ltx]=await Promise.all([fetchAll('plans',f),fetchAll('procurements',f),fetchAll('production',f),fetchAll('stock_moves',f),
  fetchAll('shipments',f),fetchAll('contracts',f),fetchAll('cost_entries',f),fetchAll('loans'),fetchAll('loan_txns')]);
 buildModel({plans,procs,prods,moves,ships,cons,costs,loans,ltx});
}
function buildModel(D){
 FX=(SET.fx&&+SET.fx.rate)||3242;
 M=[...Array(NM)].map((_,i)=>{const d=monthDate(i);return p2(d.getMonth()+1)+'/'+d.getFullYear()});
 const now=new Date(),ni=mi(now);NOWI=Math.max(0,Math.min(NM-1,ni));
 NOWFRAC=ni>=NM?1:ni<0?0:(now.getDate()-1)/new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
 const z=()=>Array(NM).fill(0),zm=()=>({p:z(),a:z()});
 for(const fc of ['xan','nan']){
  plan[fc]={proc:z(),prod:z(),exp:z(),rev:z(),dir:z(),ind:z(),net:z(),rexp:z()};
  act[fc]=Object.fromEntries(AK.map(k=>[k,z()]));PL[fc]=Object.fromEntries(PLK.map(k=>[k,zm()]));
  SEASON_NET[fc]=0;PU[fc]={rexp:0,rpulp:0,raw:0,oth:0,ind:0,int:0,prod:0,proc:0,exp:0};
 }
 const map={rexp:'rev_exp',rpulp:'rev_pulp',raw:'raw',oth:'oth',mkt:'mkt',salL:'sal_l',salF:'sal_f',admin:'admin',maint:'maint',support:'support',asset:'asset',othI:'oth_i',int:'interest'};
 D.plans.forEach(r=>{const fc=r.factory,i=mi(toDate(r.month)),n=k=>+r[k]||0;
  SEASON_NET[fc]+=n('net');const u=PU[fc];u.rexp+=n('rev_exp');u.rpulp+=n('rev_pulp');u.raw+=n('raw');u.oth+=n('oth')+n('mkt');
  u.ind+=n('sal_l')+n('sal_f')+n('admin')+n('maint')+n('support')+n('asset')+n('oth_i');u.int+=n('interest');u.prod+=n('prod_t');u.proc+=n('proc_t');u.exp+=n('exp_t');
  if(i<0||i>=NM)return;const P=plan[fc];
  P.proc[i]+=n('proc_t');P.prod[i]+=n('prod_t');P.exp[i]+=n('exp_t');P.rexp[i]+=n('rev_exp');P.rev[i]+=n('rev_exp')+n('rev_pulp');
  P.dir[i]+=n('raw')+n('oth')+n('mkt');P.ind[i]+=n('sal_l')+n('sal_f')+n('admin')+n('maint')+n('support')+n('asset')+n('oth_i');P.net[i]+=n('net');
  PLK.forEach(k=>PL[fc][k].p[i]+=n(map[k]))});
 const add=(fc,k,d,v)=>{const i=mi(d);if(i>=0&&i<NM&&act[fc])act[fc][k][i]+=v};
 PROC=D.procs.map(r=>({...r,d:toDate(r.date)}));PROD=D.prods.map(r=>({...r,d:toDate(r.date)}));MOVES=D.moves.map(r=>({...r,d:toDate(r.date)}));SHIP=D.ships.map(r=>({...r,d:toDate(r.date)})).sort((a,b)=>a.d-b.d);
 PROC.forEach(r=>{const n=+r.net_kg||0;add(r.factory,'proc',r.d,n/1000);if(n>0)add(r.factory,'trucks',r.d,1);add(r.factory,'kip',r.d,+r.amount||0);add(r.factory,'waste',r.d,(+r.waste_kg||0)/1000)});
 PROD.forEach(r=>{const f=r.factory,d=r.d;add(f,'toProd',d,(+r.net_raw_kg||0)/1000);add(f,'prod',d,(+r.output_kg||0)/1000);add(f,'p25',d,(+r.p25_kg||0)/1000);add(f,'p850',d,(+r.p850_kg||0)/1000);
  add(f,'onspec',d,(+r.onspec_kg||0)/1000);add(f,'offspec',d,(+r.offspec_kg||0)/1000);add(f,'pulp',d,(+r.pulp_kg||0)/1000)});
 MOVES.forEach(r=>{const w=(+r.weight_kg||0)/1000;if(r.kind==='pulp'){add(r.factory,'pulpSold',r.d,w);return}
  if(r.direction==='out'&&!/reprocess/i.test(r.buyer_type||'')){add(r.factory,'exp',r.d,w);add(r.factory,+r.bag_size===850?'e850':'e25',r.d,w)}});
 SHIP.forEach(r=>{add(r.factory,'inv',r.d,+r.amount||0);add(r.factory,'invT',r.d,+r.tons||0);add(r.factory,'cash',r.d,+r.cash||0);add(r.factory,'ded',r.d,+r.deduct||0)});
 const pp=+SET.pulp_price||0;
 // revenue is recognised when starch leaves the warehouse: each out-ton takes the price of the
 // oldest invoice lot by lot number (Sheet 2.1) of the same customer; tons without a lot wait for a price
 {const fw=x=>String(x||'').trim().split(/\s+/)[0].toLowerCase(),cu={};PEND={xan:0,nan:0};
  D.cons.forEach(c=>{if(fw(c.customer))cu[c.factory+'|'+c.contract_no]=fw(c.customer)});
  const lots={};SHIP.forEach(s=>{const c=D.cons.find(c=>c.factory===s.factory&&(s.contract_no||'').startsWith(c.contract_no));const k=c&&cu[c.factory+'|'+c.contract_no];
   if(!k||!(+s.tons>0))return;(lots[s.factory+'|'+k]=lots[s.factory+'|'+k]||[]).push({n:String(s.invoice_no||s.contract_no||''),t:+s.tons,px:(+s.amount||0)/(+s.tons)})});
  Object.values(lots).forEach(L=>L.sort((a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true})));
  MOVES.filter(r=>r.kind==='starch'&&r.direction==='out'&&!/reprocess/i.test(r.buyer_type||'')).sort((a,b)=>a.d-b.d).forEach(r=>{
   let w=(+r.weight_kg||0)/1000;const L=lots[r.factory+'|'+fw(r.company)]||[];
   while(w>1e-9&&L.length){const q=Math.min(w,L[0].t);add(r.factory,'rev',r.d,q*L[0].px);add(r.factory,'revT',r.d,q);w-=q;L[0].t-=q;if(L[0].t<1e-9)L.shift()}if(w>1e-9&&PEND[r.factory]!=null)PEND[r.factory]+=w});
  ADV={xan:0,nan:0};Object.entries(lots).forEach(([k,L])=>{const f=k.split('|')[0];if(ADV[f]!=null)ADV[f]+=L.reduce((t,l)=>t+l.t,0)})}
 for(const fc of ['xan','nan'])for(let i=0;i<NM;i++){PL[fc].rexp.a[i]=act[fc].rev[i];PL[fc].rpulp.a[i]=act[fc].pulpSold[i]*pp}
 CMF={xan:[],nan:[]};
 D.costs.forEach(r=>{const fc=r.factory,i=mi(toDate(r.month));if(i<0||i>=NM||!PL[fc]||!PL[fc][r.category])return;PL[fc][r.category].a[i]+=+r.amount||0;if(!CMF[fc].includes(i))CMF[fc].push(i);
  const g=r.category==='int'?'int':['raw','oth','mkt'].includes(r.category)?'dir':'ind';act[fc][g][i]+=+r.amount||0});
 CMF.xan.sort((a,b)=>a-b);CMF.nan.sort((a,b)=>a-b);
 // P&L counts closed months only: the current month joins once it has ended
 {const ni=mi(new Date()),closed=ni>=NM?NM:Math.max(0,ni);CMF.xan=CMF.xan.filter(i=>i<closed);CMF.nan=CMF.nan.filter(i=>i<closed)}
 // contracts
 contracts=D.cons.map(c=>{const sh=SHIP.filter(s=>(s.contract_no||'').startsWith(c.contract_no));
  return [c.factory,c.contract_no,c.customer||'',c.grade||'',+c.tons||0,'',+c.deposit_total||0,sh.reduce((t,s)=>t+(+s.tons||0),0),sh.reduce((t,s)=>t+(+s.amount||0),0),sh.reduce((t,s)=>t+(+s.deduct||0),0),+c.deposit_received||0,c.deduct_pct==null?null:+c.deduct_pct,c.value==null?null:+c.value,c.note||'',c.destination||'',0]});
 {const fw=x=>String(x||'').trim().split(/\s+/)[0].toLowerCase();OUT_NC={xan:0,nan:0};
  MOVES.filter(r=>r.kind==='starch'&&r.direction==='out'&&!/reprocess/i.test(r.buyer_type||'')).forEach(r=>{const w=(+r.weight_kg||0)/1000;const c=contracts.find(c=>c[0]===r.factory&&fw(c[2])&&fw(c[2])===fw(r.company));if(c)c[15]+=w;else if(OUT_NC[r.factory]!=null)OUT_NC[r.factory]+=w})}
 // stock
 const os=SET.opening_stock||{};
 for(const fc of ['xan','nan']){const o=os[fc]||{},A=act[fc],S=k=>A[k].reduce((a,b)=>a+b,0);
  const s25=(o.s25||0)/1000+S('p25')-S('e25'),s850=(o.s850||0)/1000+S('p850')-S('e850');
  const raw=PROC.filter(r=>r.factory===fc).reduce((t,r)=>t+(+r.net_kg||0)-(+r.to_prod_kg||0)-(+r.waste_kg||0),0)/1000;
  STK[fc]={s25,s850,starch:s25+s850,pulp:S('pulp')-S('pulpSold'),raw:Math.max(0,raw),open:((o.s25||0)+(o.s850||0))/1000}}
 const mx=a=>a.length?new Date(Math.max(...a.map(r=>r.d))):null;
 LAST={proc:mx(PROC),prod:mx(PROD),move:mx(MOVES),ship:mx(SHIP)};
 LOANS=D.loans.sort((a,b)=>(a.sort||0)-(b.sort||0));LTX=D.ltx;
}
const lastData=()=>{const ds=Object.values(LAST).filter(Boolean);return ds.length?new Date(Math.max(...ds)):null};
const asOfTxt=()=>`ເກັບຊື້ ${dfmt(LAST.proc)} · ຜະລິດ ${dfmt(LAST.prod)} · ສົ່ງອອກ ${dfmt(LAST.ship||LAST.move)}`;
const yday=()=>{const d=new Date();d.setDate(d.getDate()-1);return d};
const cmOf=fs=>[...new Set(fs.flatMap(f=>CMF[f]))].sort((a,b)=>a-b);
const mLbl=ixs=>!ixs.length?'ຍັງບໍ່ມີຂໍ້ມູນ':ixs.length===1?M[ixs[0]]:`${M[ixs[0]].slice(0,2)}–${M[ixs[ixs.length-1]]}`;
const planConv=fs=>{const p=fs.reduce((t,f)=>t+PU[f].proc,0),d=fs.reduce((t,f)=>t+PU[f].prod,0);return d?p/d:null};

const st={f:'all',p:'season'};
const $=s=>document.querySelector(s);
const fmt=(n,d=0)=>n==null||isNaN(n)?'—':Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const kip=n=>{const a=Math.abs(n);if(a>=1e9)return fmt(n/1e9,2)+' ຕື້';if(a>=1e6)return fmt(n/1e6,1)+' ລ້ານ';return fmt(n)};
const mcny=n=>fmt(n/1e6,2);
const facs=()=>st.f==='all'?['xan','nan']:[st.f];
const idxs=()=>st.p==='season'?[...Array(NOWI+1).keys()]:[+st.p];
const pname=()=>st.p==='season'?`ລະດູ ${SEASON} ເຖິງ ${dfmt(yday()).slice(0,5)}`:M[+st.p];
const sumA=(k,fs,ix)=>fs.reduce((t,f)=>t+ix.reduce((a,i)=>a+(act[f][k][i]||0),0),0);
const planTD=(k,fs,ix)=>fs.reduce((t,f)=>t+ix.reduce((a,i)=>a+plan[f][k][i]*(i===NOWI?NOWFRAC:1),0),0);
const planFull=(k,fs,ix)=>fs.reduce((t,f)=>t+(st.p==='season'?plan[f][k].reduce((a,b)=>a+b,0):ix.reduce((a,i)=>a+plan[f][k][i],0)),0);
function status(r){if(r==null||!isFinite(r))return['mute','ບໍ່ມີແຜນ'];if(r>=.9)return['good','✓ ຕາມແຜນ'];if(r>=.6)return['warn','▲ ຊ້າກວ່າແຜນ'];return['crit','✕ ຕ່ຳກວ່າແຜນຫຼາຍ']}
const ach=(a,p)=>p?1+(a-p)/Math.abs(p):null; // 100% = ຕາມແຜນ, ໃຊ້ໄດ້ທັງຕົວເລກລົບ
const achC=(a,p)=>p?1+(p-a)/Math.abs(p):null; // ຕົ້ນທຶນ: ຕ່ຳກວ່າແຜນ = ເກີນ 100%
const AB=r=>{if(r==null||!isFinite(r))return '<span class="src">—</span>';const c=r>=1?'good':r>=.9?'warn':'crit';return `<span class="ab ${c}"><span class="ab-t"><i style="width:${Math.max(0,Math.min(1,r))*100}%"></i></span><b>${pct(r)}</b></span>`};
const DF=(d,good,f)=>Math.abs(d)<.05?'<span class="src">—</span>':`<span class="df ${good?'pos':'neg'}">${d>0?'▲':'▼'} ${(d>0?'+':'')+f(d)}</span>`;
const pct=r=>r==null||!isFinite(r)?'—':fmt(r*100,Math.abs(r)<.1?1:0)+'%';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function kpi(l,v,u,d,s){return `<div class="kpi"><div class="lbl">${l}</div><div class="v num">${v}<small>${u||''}</small></div><div class="d">${d||''}</div>${s?`<span class="pill ${s[0]}" style="margin-top:6px">${s[1]}</span>`:''}</div>`}

/* tooltip */
const tip=$('#tip');
document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(!t){tip.hidden=true;return}tip.innerHTML=t.dataset.tip;tip.hidden=false;
 const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;tip.style.left=x+'px';tip.style.top=y+'px'});
function niceStep(r){const p=Math.pow(10,Math.floor(Math.log10(r||1)));const m=r/p;return (m<=1?1:m<=2?2:m<=5?5:10)*p}
const q=s=>s.replace(/"/g,'&quot;');

function barChart(el,cats,series,opt={}){
 const vals=series.flatMap(s=>s.data.map(v=>v||0));const max=Math.max(1,...vals),min=Math.min(0,...vals);
 const VL=!!opt.vl,neg=VL&&min<0;const W=560,H=(opt.h||230)+(VL?30:0)+(neg?36:0),P={l:52,r:8,t:VL?42:12,b:30+(neg?36:0)};const iw=W-P.l-P.r,ih=H-P.t-P.b;
 const step=niceStep((max-min)/4);const top=Math.ceil(max/step)*step,bot=Math.floor(min/step)*step;
 const y=v=>P.t+ih-((v-bot)/(top-bot))*ih;const gw=iw/cats.length;const n=series.length;const bw=Math.max(3,Math.min(26,(gw*.72)/n-2));
 let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.label||''}">`;
 for(let v=bot;v<=top+1e-9;v+=step)s+=`<line class="grid" x1="${P.l}" x2="${W-P.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${P.l-6}" y="${y(v)+4}" text-anchor="end">${fmt(v,opt.axd||0)}</text>`;
 const every=Math.ceil(cats.length/(opt.maxLbl||10));
 cats.forEach((c,i)=>{const gx=P.l+i*gw;const x0=gx+(gw-(bw+2)*n+2)/2;
  let tt=`<b>${c}</b>`;series.forEach(se=>tt+=`<br>${se.name}: ${se.data[i]==null?'—':fmt(se.data[i],opt.dec||0)}${opt.unit||''}`);
  series.forEach((se,j)=>{const v=se.data[i];if(v==null||v===0)return;const x=x0+j*(bw+2);const y0=y(0),yv=y(v);const top_=Math.min(y0,yv),hh=Math.abs(y0-yv);const r=Math.min(3,hh,bw/2);
   const c2=typeof se.color==='function'?se.color(v):se.color;
   if(VL){const lab=fmt(v,opt.dec&&Math.abs(v)<100?opt.dec:0),cx=x+bw/2,isA=j===n-1;
    s+=`<text class="vlab" transform="translate(${cx+3.5},${v>0?yv-4:yv+4}) rotate(-90)" text-anchor="${v>0?'start':'end'}" style="font-size:10px;font-weight:${isA?700:500};fill:${isA?(v<0?'var(--crit,#b42318)':'var(--s1)'):'var(--ink-3,#8a948d)'}">${lab}</text>`}
   s+=v>0?`<path d="M${x},${y0}V${yv+r}Q${x},${yv} ${x+r},${yv}H${x+bw-r}Q${x+bw},${yv} ${x+bw},${yv+r}V${y0}Z" fill="${c2}" pointer-events="none"/>`
         :`<path d="M${x},${y0}V${yv-r}Q${x},${yv} ${x+r},${yv}H${x+bw-r}Q${x+bw},${yv} ${x+bw},${yv-r}V${y0}Z" fill="${c2}" pointer-events="none"/>`});
  s+=`<rect class="hit" x="${gx}" y="${P.t}" width="${gw}" height="${ih}" data-tip="${q(tt)}"/>`;
  if(i%every===0)s+=`<text x="${gx+gw/2}" y="${H-10}" text-anchor="middle">${c}</text>`});
 s+=`<line class="base" x1="${P.l}" x2="${W-P.r}" y1="${y(0)}" y2="${y(0)}"/></svg>`;
 if(series.length>1)s+=`<div class="legend" style="margin-top:6px">${series.map(se=>`<span><i style="background:${typeof se.color==='function'?se.color(1):se.color}"></i>${se.name}</span>`).join('')}</div>`;
 el.innerHTML=s}
function lineChart(el,cats,vals,opt){
 const W=560,H=230,P={l:46,r:16,t:16,b:30};const iw=W-P.l-P.r,ih=H-P.t-P.b;const lo=opt.lo,hi=opt.hi;const y=v=>P.t+ih-((v-lo)/(hi-lo))*ih;const x=i=>P.l+iw*(i+.5)/cats.length;
 let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.label}">`;
 for(let v=lo;v<=hi+1e-9;v+=opt.step)s+=`<line class="grid" x1="${P.l}" x2="${W-P.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${P.l-6}" y="${y(v)+4}" text-anchor="end">${fmt(v,opt.axd||0)}</text>`;
 if(opt.target!=null)s+=`<line x1="${P.l}" x2="${W-P.r}" y1="${y(opt.target)}" y2="${y(opt.target)}" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W-P.r}" y="${y(opt.target)-6}" text-anchor="end" style="fill:var(--good)">${opt.tlabel}</text>`;
 let d='';vals.forEach((v,i)=>{d+=(i?'L':'M')+x(i)+','+y(v)});s+=`<path d="${d}" fill="none" stroke="var(--s1)" stroke-width="2"/>`;
 const every=Math.ceil(cats.length/9);
 vals.forEach((v,i)=>{const bad=opt.bad&&opt.bad(v);if(opt.dots||bad||i===vals.length-1)s+=`<circle cx="${x(i)}" cy="${y(v)}" r="${bad?5:4}" fill="${bad?'var(--crit)':'var(--s1)'}" stroke="var(--surface)" stroke-width="2"/>`;
  s+=`<rect class="hit" x="${x(i)-iw/cats.length/2}" y="${P.t}" width="${iw/cats.length}" height="${ih}" data-tip="${q(`<b>${cats[i]}</b><br>${fmt(v,opt.dec||0)} ${opt.unit}`)}"/>`;
  if(i%every===0)s+=`<text x="${x(i)}" y="${H-10}" text-anchor="middle">${cats[i]}</text>`});
 el.innerHTML=s+'</svg>'}

let UNIT={};
function render(){
 if(!M.length)return;
 $('#asOf').textContent=asOfTxt();
 const fs=facs(),ix=idxs(),hasX=fs.includes('xan'),hasN=fs.includes('nan');
 const proc=sumA('proc',fs,ix),toProd=sumA('toProd',fs,ix),prod=sumA('prod',fs,ix),exp=sumA('exp',fs,ix),inv=sumA('inv',fs,ix),pk=sumA('kip',fs,ix),pulp=sumA('pulp',fs,ix);
 const tdP=planTD('proc',fs,ix),tdD=planTD('prod',fs,ix),tdE=planTD('exp',fs,ix);
 const fP=planFull('proc',fs,ix),fD=planFull('prod',fs,ix),fE=planFull('exp',fs,ix);
 const stockT=fs.reduce((t,f)=>t+STK[f].starch,0);const rawStock=fs.reduce((t,f)=>t+STK[f].raw,0);const PC=planConv(fs);const CMs=cmOf(fs);
 const conv=prod?proc/prod:null;const loss=proc?1-toProd/proc:null;
 const dep=contracts.filter(c=>fs.includes(c[0])).reduce((t,c)=>t+c[10]-c[9],0);

 const ixPL=ix.filter(i=>CMs.includes(i));const plNet=(F,w)=>ixPL.reduce((t,i)=>{const g=k=>F.reduce((a,f)=>a+PL[f][k][w][i],0);return t+g('rexp')+g('rpulp')-['raw','oth','mkt','salL','salF','admin','maint','support','asset','othI','int'].reduce((a,k)=>a+g(k),0)},0);
 const nAct=plNet(fs,'a'),nPl=plNet(fs,'p');
 $('#flow').innerHTML=[
  ['ເກັບຊື້ມັນຕົ້ນ',fmt(proc,0),'ໂຕນ',`${kip(pk)} ກີບ · ${pct(tdP?proc/tdP:null)} ຂອງແຜນເຖິງມື້ນີ້`,tdP?proc/tdP:0,`ລາຄາສະເລ່ຍ ${proc?fmt(pk/proc/1000):'—'} ກີບ/kg`],
  ['ຜະລິດແປ້ງ',fmt(prod,1),'ໂຕນ',`${pct(tdD?prod/tdD:null)} ຂອງແຜນເຖິງມື້ນີ້ · ກາກມັນ ${fmt(pulp,0)} ໂຕນ`,tdD?prod/tdD:0,`ອັດຕາແປງ ${conv?fmt(conv,2):'—'} : 1 (ແຜນ ${PC?fmt(PC,2):'—'})`],
  ['ສົ່ງອອກ',fmt(exp,0),'ໂຕນ',`${pct(tdE?exp/tdE:null)} ຂອງແຜນເຖິງມື້ນີ້`,tdE?exp/tdE:0,owe(fs)],
  ['ກຳໄລ/ຂາດທຶນ ສຸດທິ',mcny(nAct),'ລ້ານ ຢວນ',`ແຜນ ${mcny(nPl)} ລ້ານ · ${mLbl(ixPL)}`,null,(()=>{const r=nPl?1+(nAct-nPl)/Math.abs(nPl):null;return `<span class="pill ${r>=1?'good':r>=.9?'warn':'crit'}" style="margin-top:8px">ປະຕິບັດໄດ້ ${pct(r)}</span>`})()]
 ].map(([l,v,u,sub,bar,r])=>`<div class="step"><div class="lbl">${l}</div><div class="big num">${v}<small>${u}</small></div><div class="sub">${sub}</div>${bar==null?'':`<div class="bar"><i style="width:${Math.min(100,bar*100)}%"></i></div>`}${String(r).startsWith('<')?r:`<span class="ratio">${r}</span>`}<span class="arrow" aria-hidden="true">→</span></div>`).join('');

 $('#pvaNote').textContent=pname();

 $('#pva').innerHTML=[['ເກັບຊື້ມັນຕົ້ນ',proc,tdP,fP],['ຜະລິດແປ້ງ',prod,tdD,fD],['ສົ່ງອອກແປ້ງ',exp,tdE,fE]].map(([n,a,td,full])=>{
  const r=td?a/td:null;const [c,t]=status(r);const sc=Math.max(full,a,1);
  return `<div class="pva-row"><div class="name">${n}<small>ແຜນທັງໄລຍະ ${fmt(full)} ໂຕນ</small></div>
  <div class="track" data-tip="${q(`<b>${n}</b><br>ຕົວຈິງ ${fmt(a,1)} ໂຕນ<br>ແຜນເຖິງມື້ນີ້ ${fmt(td)} ໂຕນ<br>ແຜນທັງໄລຍະ ${fmt(full)} ໂຕນ`)}"><span class="plan" style="width:${full/sc*100}%"></span><span class="act" style="width:${a/sc*100}%"></span><span class="tick" style="left:${td/sc*100}%"></span></div>
  <div class="val"><b class="num">${fmt(a)}</b> / ${fmt(td)} ໂຕນ<br><span class="pill ${c}">${t} · ${pct(r)}</span></div></div>`}).join('');


 const ser=k=>M.map((_,i)=>fs.reduce((t,f)=>t+(plan[f][k][i]||0),0));
 const sera=k=>M.map((_,i)=>i>NOWI?null:fs.reduce((t,f)=>t+(act[f][k][i]||0),0));
 barChart($('#chMonthlyProc'),M.map(m=>m.slice(0,2)+'/'+m.slice(5)),[{name:'ແຜນ',data:ser('proc'),color:'var(--s1-ghost)'},{name:'ຕົວຈິງ',data:sera('proc'),color:'var(--s1)'}],{unit:' ໂຕນ',label:'ເກັບຊື້ລາຍເດືອນ',vl:1});
 barChart($('#chMonthlyExp'),M.map(m=>m.slice(0,2)+'/'+m.slice(5)),[{name:'ແຜນ',data:ser('exp'),color:'var(--s1-ghost)'},{name:'ຕົວຈິງ',data:sera('exp'),color:'var(--s1)'}],{unit:' ໂຕນ',label:'ສົ່ງອອກລາຍເດືອນ',vl:1});
 barChart($('#chMonthlyProd'),M.map(m=>m.slice(0,2)+'/'+m.slice(5)),[{name:'ແຜນ',data:ser('prod'),color:'var(--s1-ghost)'},{name:'ຕົວຈິງ',data:sera('prod'),color:'var(--s1)'}],{unit:' ໂຕນ',dec:1,label:'ຜະລິດລາຍເດືອນ',vl:1});

 // unit economics (actual months with cost data vs season plan)
 const sumPU=k=>fs.reduce((t,f)=>t+PU[f][k],0),P_T=sumPU('prod');const LA=k=>fs.reduce((t,f)=>t+ixPL.reduce((a,i)=>a+PL[f][k].a[i],0),0);
 const A_T=fs.reduce((t,f)=>t+ixPL.reduce((a,i)=>a+act[f].prod[i],0),0),A_E=fs.reduce((t,f)=>t+ixPL.reduce((a,i)=>a+act[f].revT[i],0),0);
 const aInd=['salL','salF','admin','maint','support','asset','othI'].reduce((t,k)=>t+LA(k),0);
 const U=[['ລາຄາຂາຍແປ້ງ (ຕໍ່ ໂຕນ ທີ່ສົ່ງອອກ)',P_T?sumPU('rexp')/sumPU('exp'):0,A_E?LA('rexp')/A_E:0,1],
  ['ລາຍຮັບກາກມັນ (ຕໍ່ ໂຕນ ແປ້ງ)',P_T?sumPU('rpulp')/P_T:0,A_T?LA('rpulp')/A_T:0,1],
  ['ຕົ້ນທຶນເກັບຊື້ມັນຕົ້ນ',P_T?sumPU('raw')/P_T:0,A_T?LA('raw')/A_T:0,-1],
  ['ຕົ້ນທຶນທາງກົງອື່ນ',P_T?sumPU('oth')/P_T:0,A_T?(LA('oth')+LA('mkt'))/A_T:0,-1],
  ['ຕົ້ນທຶນທາງອ້ອມ',P_T?sumPU('ind')/P_T:0,A_T?aInd/A_T:0,-1],
  ['ດອກເບ້ຍ',P_T?sumPU('int')/P_T:0,A_T?LA('int')/A_T:0,-1]];
 const totP=U.slice(2).reduce((t,r)=>t+r[1],0),totA=U.slice(2).reduce((t,r)=>t+r[2],0);UNIT={totA,totP,price:U[0][2]};
 $('#tUnit').innerHTML=!A_T?'<tbody><tr><td class="src">ຍັງບໍ່ມີຂໍ້ມູນຕົ້ນທຶນ ຫຼື ການຜະລິດ ສຳລັບໄລຍະນີ້</td></tr></tbody>':`<thead><tr><th>ລາຍການ</th><th class="n">ແຜນ</th><th class="n">ຕົວຈິງ</th><th class="n">ສ່ວນຕ່າງ</th></tr></thead><tbody>`+
  U.map(([n,p,a,sg])=>{const d=a-p;const bad=sg>0?d<0:d>0;return `<tr><td>${n}</td><td class="n">${fmt(p)}</td><td class="n">${fmt(a)}</td><td class="n ${bad?'neg':'pos'}">${d>0?'+':''}${fmt(d)}</td></tr>`}).join('')+
  `<tr><td><b>ຕົ້ນທຶນລວມ</b></td><td class="n"><b>${fmt(totP)}</b></td><td class="n"><b>${fmt(totA)}</b></td><td class="n ${totA>totP?'neg':'pos'}"><b>${totA-totP>0?'+':''}${fmt(totA-totP)}</b></td></tr>`+
  `<tr class="total"><td>ກຳໄລ ຕໍ່ ໂຕນ</td><td class="n">${fmt(U[0][1]+U[1][1]-totP)}</td><td class="n ${U[0][2]+U[1][2]-totA<0?'neg':'pos'}">${fmt(U[0][2]+U[1][2]-totA)}</td><td></td></tr></tbody>`;
 const aProcPL=fs.reduce((t,f)=>t+ixPL.reduce((a,i)=>a+act[f].proc[i],0),0),aConv=A_T?aProcPL/A_T:null;

 // factory comparison
 const fr=f=>{const p=sumA('proc',[f],ix),d=sumA('prod',[f],ix),e=sumA('exp',[f],ix),c=['dir','ind','int'].reduce((t,k)=>t+ixPL.reduce((a,i)=>a+act[f][k][i],0),0),td=planTD('proc',[f],ix);const ct=contracts.filter(x=>x[0]===f).reduce((t,x)=>t+x[4],0);return [FN[f],p,d,e,c,d?c/d:null,ct,td?p/td:null]};
 const rs=[fr('xan'),fr('nan')];
 $('#cmpNote').textContent=pname()+' · ໂຕນ';
 const prF=F=>plNet(F,'a');const rvF=F=>ixPL.reduce((t,i)=>t+F.reduce((a,f)=>a+PL[f].rexp.a[i]+PL[f].rpulp.a[i],0),0);const rv0=rvF(['xan']),rv1=rvF(['nan']);const pr0=prF(['xan']),pr1=prF(['nan']);
 $('#cmp').innerHTML=`<thead><tr><th>ໂຮງງານ</th><th class="n">ເກັບຊື້</th><th class="n">ຜະລິດ</th><th class="n">ສົ່ງອອກ</th><th class="n">ລາຍຮັບ (ລ້ານ¥)</th><th class="n">ລາຍຈ່າຍ (ລ້ານ¥)</th><th class="n">ກຳໄລ (ລ້ານ¥)</th></tr></thead><tbody>`+
  rs.map((r,i)=>{const pr=i?pr1:pr0;return `<tr><td>${r[0]}</td><td class="n">${fmt(r[1])}</td><td class="n">${fmt(r[2],1)}</td><td class="n">${fmt(r[3])}</td><td class="n">${ixPL.length?mcny(i?rv1:rv0):'—'}</td><td class="n">${mcny(r[4])}</td><td class="n ${ixPL.length?(pr<0?'neg':'pos'):''}">${ixPL.length?mcny(pr):'—'}</td></tr>`}).join('')+
  `<tr class="total"><td>ລວມ</td>${[1,2,3].map(k=>`<td class="n">${fmt(rs[0][k]+rs[1][k],k===2?1:0)}</td>`).join('')}<td class="n">${ixPL.length?mcny(rv0+rv1):'—'}</td><td class="n">${mcny(rs[0][4]+rs[1][4])}</td><td class="n ${ixPL.length?(pr0+pr1<0?'neg':'pos'):''}">${ixPL.length?mcny(pr0+pr1):'—'}</td></tr></tbody>`;

 // procure
 pvaBlock('proc','Proc',fs);pvaBlock('prod','Prod',fs);pvaBlock('exp','Exp',fs);
 const trucks=sumA('trucks',fs,ix);
 $('#kProc').innerHTML=kpi('ເກັບຊື້ຕົວຈິງ',fmt(proc,1),'ໂຕນ',`ແຜນເຖິງມື້ນີ້ ${fmt(tdP)} ໂຕນ`,status(tdP?proc/tdP:null))+kpi('ມູນຄ່າ',kip(pk),'ກີບ',`≈ ${mcny(pk/FX)} ລ້ານ ຢວນ`)+kpi('ຈຳນວນຖ້ຽວ',fmt(trucks),'ຖ້ຽວ',trucks?`ສະເລ່ຍ ${fmt(proc/trucks,1)} ໂຕນ/ຖ້ຽວ`:'')+kpi('ລາຄາສະເລ່ຍ',proc?fmt(pk/proc/1000):'—','ກີບ/kg',ix.filter(i=>fs.some(f=>act[f].proc[i])).map(i=>{const p=fs.reduce((t,f)=>t+act[f].proc[i],0),k=fs.reduce((t,f)=>t+act[f].kip[i],0);return `${M[i].slice(0,2)}: ${fmt(k/p/1000)}`}).join(' · '));
 const procDay=(()=>{const by={};PROC.filter(r=>fs.includes(r.factory)&&(+r.net_kg||0)>0).forEach(r=>{const k=r.date;by[k]=by[k]||[0,0];by[k][0]+=+r.net_kg;by[k][1]+=+r.amount||0});return Object.keys(by).sort().map(k=>[k.slice(8,10)+'/'+k.slice(5,7),by[k][0]/1000,by[k][1]/by[k][0]])})();
 barChart($('#chProcDay'),procDay.map(d=>d[0]),[{name:'ເກັບຊື້',data:procDay.map(d=>d[1]),color:'var(--s1)'}],{unit:' ໂຕນ',dec:1,label:'ເກັບຊື້ຕໍ່ມື້',maxLbl:8});
 if(procDay.length){const pv=procDay.map(d=>d[2]).filter(v=>v<1e5),tg=SET.cassava_price_target&&+SET.cassava_price_target.value;const lo=Math.floor(Math.min(...pv,tg||1e9)/50)*50-50,hi=Math.ceil(Math.max(...pv,tg||0)/50)*50+50;lineChart($('#chPrice'),procDay.map(d=>d[0]),procDay.map(d=>Math.min(d[2],hi)),{lo,hi,step:niceStep((hi-lo)/6),unit:'ກີບ/kg',label:'ລາຄາເກັບຊື້',target:tg||null,tlabel:tg?`${SET.cassava_price_target.label||'ເປົ້າໝາຍ'}: ${fmt(tg)}`:''})}else $('#chPrice').innerHTML='<p class="issue">ຍັງບໍ່ມີຂໍ້ມູນ</p>';
 const _pm=1;$('#tProcM').innerHTML=`<thead><tr><th>ເດືອນ</th><th class="n">ຖ້ຽວ</th><th class="n">ເກັບຊື້ (ໂຕນ)</th><th class="n">ມູນຄ່າ (ກີບ)</th><th class="n">ກີບ/kg</th><th class="n">ເຂົ້າຜະລິດ (ໂຕນ)</th><th class="n">ສູນເສຍ</th></tr></thead><tbody>`+
  [...Array(NOWI+1).keys()].filter(i=>fs.some(f=>act[f].proc[i])).map(i=>{const p=fs.reduce((t,f)=>t+act[f].proc[i],0),k=fs.reduce((t,f)=>t+act[f].kip[i],0),tp=fs.reduce((t,f)=>t+act[f].toProd[i],0),tr=fs.reduce((t,f)=>t+act[f].trucks[i],0);return `<tr><td>${M[i]}</td><td class="n">${fmt(tr)}</td><td class="n">${fmt(p,1)}</td><td class="n">${kip(k)}</td><td class="n">${p?fmt(k/p/1000):'—'}</td><td class="n">${fmt(tp,1)}</td><td class="n">${p?pct(1-tp/p):'—'}</td></tr>`}).join('')+
  (fs.some(f=>act[f].proc[NOWI])?'':`<tr><td>${M[NOWI]}</td><td colspan="6" class="issue">ຍັງບໍ່ມີຂໍ້ມູນ · ແຜນ ${fmt(fs.reduce((t,f)=>t+plan[f].proc[NOWI],0))} ໂຕນ</td></tr>`)+'</tbody>';
 const sup=(()=>{const by={};PROC.filter(r=>fs.includes(r.factory)&&(+r.net_kg||0)>0).forEach(r=>{const k=r.supplier||'—';by[k]=by[k]||[k,r.account_name||'',0,0,0];by[k][2]++;by[k][3]+=+r.net_kg;by[k][4]+=+r.amount||0});return Object.values(by).map(v=>[v[0],v[1],v[2],v[3],v[4]/v[3]]).sort((a,b)=>b[3]-a[3])})();
 const SUP_TOT=sup.reduce((t,s)=>t+s[3],0),SUP_N=sup.reduce((t,s)=>t+s[2],0),supTop=sup.slice(0,8);
 $('#tSup').innerHTML=sup.length?`<thead><tr><th>ຜູ້ສົ່ງ</th><th class="n">ຖ້ຽວ</th><th class="n">ໂຕນ</th><th class="n">ກີບ/kg</th><th>ສ່ວນແບ່ງ</th></tr></thead><tbody>`+
  supTop.map(s=>`<tr><td>${esc(s[0])}<div class="src">${esc(s[1])}</div></td><td class="n">${s[2]}</td><td class="n">${fmt(s[3]/1000,1)}</td><td class="n">${fmt(s[4])}</td><td><span class="mini"><i style="width:${s[3]/SUP_TOT*100*2}%"></i></span>${pct(s[3]/SUP_TOT)}</td></tr>`).join('')+
  (sup.length>8?`<tr><td>ອື່ນໆ ${sup.length-8} ລາຍ</td><td class="n">${SUP_N-supTop.reduce((t,s)=>t+s[2],0)}</td><td class="n">${fmt((SUP_TOT-supTop.reduce((t,s)=>t+s[3],0))/1000,1)}</td><td></td><td>${pct(1-supTop.reduce((t,s)=>t+s[3],0)/SUP_TOT)}</td></tr>`:'')+'</tbody>':'<tbody><tr><td class="src">ຍັງບໍ່ມີຂໍ້ມູນການເກັບຊື້</td></tr></tbody>';

 // produce
 $('#kProd').innerHTML=kpi('ແປ້ງຜະລິດໄດ້',fmt(prod,1),'ໂຕນ',`ແຜນເຖິງມື້ນີ້ ${fmt(tdD)} ໂຕນ`,status(tdD?prod/tdD:null))+kpi('ອັດຕາແປງ',conv?fmt(conv,2):'—',': 1',`ໂຕນ ມັນຕົ້ນທີ່ເກັບຊື້ ຕໍ່ ໂຕນ ແປ້ງ · ແຜນ ${PC?fmt(PC,2):'—'}`)+(()=>{const on=sumA('onspec',fs,ix),off=sumA('offspec',fs,ix);return kpi('On spec',on+off?pct(on/(on+off)):'—','',`25 kg: ${fmt(sumA('p25',fs,ix),1)} ໂຕນ · 850 kg: ${fmt(sumA('p850',fs,ix),1)} ໂຕນ`)})()+kpi('ກາກມັນ',fmt(pulp,1),'ໂຕນ',`ຂາຍ/ອອກແລ້ວ ${fmt(sumA('pulpSold',fs,ix),1)} ໂຕນ · ເຫຼືອ ${fmt(fs.reduce((t,f)=>t+STK[f].pulp,0),1)} ໂຕນ`);
 const prodRows=PROD.filter(r=>fs.includes(r.factory)&&(+r.raw_kg||0)>0&&(+r.output_kg||0)>0).sort((a,b)=>a.d-b.d).map(r=>[r.date.slice(8,10)+'/'+r.date.slice(5,7),+r.raw_kg,r.starch_pct==null?null:+r.starch_pct,+r.expected_kg||0,+r.output_kg,(+r.raw_kg)/(+r.output_kg),+r.pulp_kg||0]);
 barChart($('#chDaily'),prodRows.map(r=>r[0]),[{name:'ແປ້ງ',data:prodRows.map(r=>r[4]/1000),color:'var(--s1)'}],{unit:' ໂຕນ',dec:1,label:'ແປ້ງຕໍ່ມື້',maxLbl:8});
 if(prodRows.length)lineChart($('#chConv'),prodRows.map(r=>r[0]),prodRows.map(r=>r[5]),{lo:Math.min(3,Math.floor(Math.min(...prodRows.map(r=>r[5]))*2)/2),hi:Math.max(5.5,Math.ceil(Math.max(...prodRows.map(r=>r[5]))*2)/2),step:.5,axd:1,dec:2,unit:'ໂຕນ ມັນ / ໂຕນ ແປ້ງ',label:'ອັດຕາແປງ',target:PC,tlabel:PC?'ແຜນ '+fmt(PC,2):'',dots:true,bad:v=>v>4.5});else $('#chConv').innerHTML='<p class="issue">ຍັງບໍ່ມີຂໍ້ມູນ</p>';
 if(!prodRows.length)$('#chDaily').innerHTML='<p class="issue">ຍັງບໍ່ມີຂໍ້ມູນ</p>';
 $('#tProd').innerHTML=prodRows.length?`<thead><tr><th>ວັນທີ</th><th class="n">ມັນຕົ້ນ (kg)</th><th class="n">% ແປ້ງໃນຫົວ</th><th class="n">ຄວນໄດ້ (kg)</th><th class="n">ໄດ້ຕົວຈິງ (kg)</th><th class="n">ໄດ້/ຄວນໄດ້</th><th class="n">ອັດຕາແປງ</th><th class="n">ກາກມັນ (kg)</th><th>ສະຖານະ</th></tr></thead><tbody>`+
  prodRows.slice().reverse().map(r=>{const e=r[3]?r[4]/r[3]:null;const s=e>1.02?['warn','ເກີນ 100%: ກວດ']:r[5]>4.5?['crit','ສິ້ນເປືອງ']:['good','ປົກກະຕິ'];return `<tr><td>${r[0]}</td><td class="n">${fmt(r[1])}</td><td class="n">${r[2]==null?'—':fmt(r[2],1)+'%'}</td><td class="n">${fmt(r[3])}</td><td class="n">${fmt(r[4])}</td><td class="n">${pct(e)}</td><td class="n">${fmt(r[5],2)}</td><td class="n">${fmt(r[6])}</td><td><span class="pill ${s[0]}">${s[1]}</span></td></tr>`}).join('')+'</tbody>':'<tbody><tr><td class="src">ຍັງບໍ່ມີຂໍ້ມູນການຜະລິດ</td></tr></tbody>';

 // sales
 const cs=contracts.filter(c=>fs.includes(c[0]));const S=i=>cs.reduce((t,c)=>t+(c[i]||0),0);
 const cT=S(4),cDep=S(6),cRecv=S(10),cInvT=S(7),cOff=S(9),cBal=cRecv-cOff,cOwe=cDep-cRecv;
 $('#kSales').innerHTML=kpi('ສົ່ງອອກ (ອອກສາງ)',fmt(exp),'ໂຕນ',`ແຜນເຖິງມື້ນີ້ ${fmt(tdE)} ໂຕນ<br>${owe(fs)}`,status(tdE?exp/tdE:null))+kpi('ສັນຍາທັງໝົດ',fmt(cT),'ໂຕນ',`${cs.length} ສັນຍາ · ${pct(cT/plan_total(fs,'prod'))} ຂອງແຜນຜະລິດທັງລະດູ`)+
  kpi('ລາຄາສົ່ງອອກສະເລ່ຍ',sumA('invT',fs,ix)?fmt(sumA('inv',fs,ix)/sumA('invT',fs,ix)):'—','ຢວນ/ໂຕນ',exp?`ຕາມມື້ສົ່ງອອກ · ຊ່ວງ ${(()=>{const pr=SHIP.filter(s=>fs.includes(s.factory)&&s.price>0).map(s=>+s.price);return pr.length?fmt(Math.min(...pr))+'–'+fmt(Math.max(...pr)):'—'})()} · ມູນຄ່າໃບແຈ້ງໜີ້ ${mcny(sumA('inv',fs,ix))} ລ້ານ`:'ຍັງບໍ່ມີການສົ່ງອອກ')+
  kpi('ສິນຄ້າຄ້າງສາງ',fmt(stockT,1),'ໂຕນ',stockT?`ແປ້ງ · 25 kg: ${fmt(fs.reduce((t,f)=>t+STK[f].s25,0),1)} · 850 kg: ${fmt(fs.reduce((t,f)=>t+STK[f].s850,0),1)} · ກາກມັນ ${fmt(fs.reduce((t,f)=>t+STK[f].pulp,0),2)} ໂຕນ`:'ບໍ່ມີສິນຄ້າໃນສາງ');
 $('#tCon').innerHTML=`<thead><tr><th>ເລກທີສັນຍາ</th><th>ຜູ້ຊື້</th><th>ໂຮງງານ</th><th class="n">ປະລິມານ (ໂຕນ)</th><th class="n">ມູນຄ່າສັນຍາ (ຢວນ)</th><th class="n">% ຫັກຈາກລາຍຮັບ</th><th>ອອກສາງ (ໂຕນ)</th><th class="n">ອອກໃບແຈ້ງໜີ້ (ໂຕນ)</th><th class="n">ລໍຖ້າໃບແຈ້ງໜີ້ (ໂຕນ)</th></tr></thead><tbody>`+
  cs.map(c=>`<tr><td class="mono">${c[1]}</td><td>${c[2]}<div class="src">${c[3]}</div></td><td>${FN[c[0]]}</td><td class="n">${fmt(c[4])}</td><td class="n">${c[12]?fmt(c[12]):'<span class="pill mute">ລໍຖ້າຂໍ້ມູນ</span>'}</td><td class="n">${c[11]==null?'<span class="pill mute">ລໍຖ້າຂໍ້ມູນ</span>':`<b>${pct(c[11])}</b>`}</td><td style="white-space:nowrap"><span class="mini"><i style="width:${Math.min(100,c[15]/c[4]*100)}%"></i></span>${fmt(c[15])} (${pct(c[15]/c[4])})</td><td class="n">${fmt(c[7])}</td><td class="n">${c[15]-c[7]>0.5?`<span class="pill warn">${fmt(c[15]-c[7])}</span>`:'—'}</td></tr>`).join('')+
  (fs.reduce((t,f)=>t+OUT_NC[f],0)>0.5?`<tr><td colspan="6" class="issue">ອອກສາງ ທີ່ຈັບຄູ່ກັບສັນຍາບໍ່ໄດ້ (ຊື່ບໍລິສັດໃນ Sheet 5.x ບໍ່ກົງກັບຜູ້ຊື້)</td><td>${fmt(fs.reduce((t,f)=>t+OUT_NC[f],0))}</td><td></td><td></td></tr>`:'')+
  `<tr class="total"><td colspan="3">ລວມ</td><td class="n">${fmt(cT)}</td><td class="n">${cs.every(c=>c[12])?fmt(S(12)):'—'}</td><td></td><td>${fmt(S(15)+fs.reduce((t,f)=>t+OUT_NC[f],0))}</td><td class="n">${fmt(cInvT)}</td><td class="n">${fmt(Math.max(0,S(15)+fs.reduce((t,f)=>t+OUT_NC[f],0)-cInvT))}</td></tr></tbody>`;
 $('#tDep').innerHTML=`<thead><tr><th>ເລກທີສັນຍາ</th><th>ຜູ້ຊື້</th><th>ໂຮງງານ</th><th class="n">ມັດຈຳລວມ</th><th class="n">ໄດ້ຮັບແລ້ວ</th><th class="n">ຍັງຄ້າງຮັບ</th><th class="n">ຫັກຈາກເງິນມັດຈຳແລ້ວ</th><th class="n">ມັດຈຳຄົງເຫຼືອ</th><th>ໝາຍເຫດ</th></tr></thead><tbody>`+
  cs.map(c=>{const owe=c[6]-c[10];return `<tr><td class="mono">${c[1]}</td><td>${c[2].split(' ')[0]}</td><td>${FN[c[0]]}</td><td class="n">${fmt(c[6])}</td><td class="n pos">${fmt(c[10])}</td><td class="n">${owe>0?`<span class="pill warn">${fmt(owe)}</span>`:'<span class="pill good">✓ 0</span>'}</td><td class="n">${fmt(c[9])}</td><td class="n"><b>${fmt(c[10]-c[9])}</b></td><td class="src">${esc(c[13])}</td></tr>`}).join('')+
  `<tr class="total"><td colspan="3">ລວມ</td><td class="n">${fmt(cDep)}</td><td class="n">${fmt(cRecv)}</td><td class="n">${fmt(cOwe)}</td><td class="n">${fmt(cOff)}</td><td class="n">${fmt(cBal)}</td><td></td></tr></tbody>`;

 // export price & market
 const shipped=SHIP.filter(s=>fs.includes(s.factory)).map(s=>[dfmt(s.d),s.invoice_no||'—',+s.tons,+s.price,+s.amount,+s.cash,+s.deduct]);const planPx=(()=>{const e=fs.reduce((t,f)=>t+PU[f].exp,0);return e?fs.reduce((t,f)=>t+PU[f].rexp,0)/e:null})();
 if(shipped.length){const pv=shipped.map(v=>v[3]).concat(planPx?[planPx]:[]);const lo=Math.floor(Math.min(...pv)/200)*200-200,hi=Math.ceil(Math.max(...pv)/200)*200+200;lineChart($('#chExpPrice'),shipped.map(v=>v[0].slice(0,5)),shipped.map(v=>v[3]),{lo,hi,step:200,unit:'ຢວນ/ໂຕນ',label:'ລາຄາສົ່ງອອກ',target:planPx,tlabel:planPx?'ລາຄາຕາມແຜນ '+fmt(planPx):'',dots:true})}
 else $('#chExpPrice').innerHTML='<p class="issue">ຍັງບໍ່ມີການສົ່ງອອກ</p>';
 const MK={};cs.forEach(c=>{const k=c[2].split(' ')[0];if(c[14])MK[k]=c[14]});
 const byB={};cs.forEach(c=>{const k=c[2].split(' ')[0];byB[k]=byB[k]||{name:c[2],t:0,sh:0,n:0};byB[k].t+=c[4];byB[k].n++;byB[k].sh+=c[7]});
 const mk=Object.entries(byB).sort((a,b)=>b[1].t-a[1].t),mT=mk.reduce((t,[,v])=>t+v.t,0),mx=Math.max(1,...mk.map(([,v])=>v.t));
 $('#mkt').innerHTML=mk.map(([k,v])=>`<div class="pva-row"><div class="name">${v.name.replace(' Supply Chain','').replace(' International Trade','').replace(' Transportation','')}<small>${MK[k]||'ຈີນ'} · ${v.n} ສັນຍາ</small></div>
  <div class="track" data-tip="${q(`<b>${v.name}</b><br>ສັນຍາ ${fmt(v.t)} ໂຕນ<br>ສົ່ງອອກແລ້ວ ${fmt(v.sh)} ໂຕນ`)}"><span class="plan" style="width:${v.t/mx*100}%"></span><span class="act" style="width:${v.sh/mx*100}%"></span></div>
  <div class="val"><b class="num">${fmt(v.t)}</b> ໂຕນ · ${pct(v.t/mT)}<br><span class="pill ${v.sh?'good':'mute'}">ສົ່ງແລ້ວ ${fmt(v.sh)} ໂຕນ</span></div></div>`).join('');
 $('#mktNote').textContent=`ສັນຍາລວມ ${fmt(mT)} ໂຕນ ຈາກ ${mk.length} ຜູ້ຊື້.`;
 $('#tShip').innerHTML=shipped.length?`<thead><tr><th>ວັນທີ</th><th>ໃບແຈ້ງໜີ້</th><th class="n">ໂຕນ</th><th class="n">ລາຄາ ມື້ສົ່ງ/ໂຕນ</th><th class="n">ມູນຄ່າ</th><th class="n">ເງິນສົດ</th><th class="n">ຫັກຈາກເງິນມັດຈຳ</th><th>ອອກສາງ</th></tr></thead><tbody>`+
  shipped.map(v=>`<tr><td>${v[0]}</td><td class="mono">${v[1]}</td><td class="n">${fmt(v[2])}</td><td class="n">${fmt(v[3])}</td><td class="n">${fmt(v[4])}</td><td class="n">${fmt(v[5])}</td><td class="n">${fmt(v[6])}</td><td><span class="pill good">✓</span></td></tr>`).join('')+
  (()=>{const g=i=>shipped.reduce((t,v)=>t+v[i],0);return `<tr class="total"><td colspan="2">ລວມ ສົ່ງອອກແລ້ວ</td><td class="n">${fmt(g(2))}</td><td class="n">${fmt(g(4)/g(2))}</td><td class="n">${fmt(g(4))}</td><td class="n">${fmt(g(5))}</td><td class="n">${fmt(g(6))}</td><td></td></tr>`})()+
  ''+'</tbody>':'<tbody><tr><td class="src">ຍັງບໍ່ມີການສົ່ງອອກ</td></tr></tbody>';

 // cost: P&L plan vs actual (V2)
 const L=(k,w,i,F=fs)=>F.reduce((t,f)=>t+PL[f][k][w][i],0);
 const achPill=r=>r==null?'—':`<span class="pill ${r>=1?'good':r>=.9?'warn':'crit'}">${pct(r)}</span>`;
 const ROWS=[['prod','ຜະລິດແປ້ງ (ໂຕນ)','q'],['exp','ສົ່ງອອກ (ໂຕນ)','q'],
  ['REV','II. ລາຍຮັບລວມ','h',['rexp','rpulp']],['rexp','• ລາຍຮັບສົ່ງອອກແປ້ງ','r'],['rpulp','• ລາຍຮັບກາກມັນ','r'],
  ['DIR','III. ຕົ້ນທຶນທາງກົງ','h',['raw','oth','mkt']],['raw','• ຕົ້ນທຶນມັນຕົ້ນ','c'],['oth','• ຕົ້ນທຶນທາງກົງອື່ນ','c'],['mkt','• ຕົ້ນທຶນການຕະຫຼາດ','c'],
  ['DM','► ກຳໄລກ່ອນຫັກຕົ້ນທຶນທາງອ້ອມ','m',[['REV'],['DIR']]],
  ['IND','IV. ຕົ້ນທຶນທາງອ້ອມ','h',['salL','salF','admin','maint','support','asset','othI']],['salL','• ເງິນເດືອນ ລາວ','c'],['salF','• ເງິນເດືອນ ຕ່າງປະເທດ','c'],['admin','• ງົບປະມານບໍລິຫານທົ່ວໄປ','c'],
  ['maint','• ສ້ອມແປງ ບຳລຸງຮັກສາ, ຕຶກ/ໂຮງຈັກ','c'],['support','• ຊຸກຍູ້ຕ່າງໆ','c'],['asset','• ຊື້ຊັບສິນ','c'],['othI','• ອາກອນ, ຜົນຕອບແທນ, ສຳນັກງານໃຫຍ່','c'],
  ['EBIT','► ກຳໄລດຳເນີນງານ (EBIT)','m',[['REV'],['DIR','IND']]],['int','V. ດອກເບ້ຍທະນາຄານ','c'],
  ['NET','VII. ກຳໄລ/ຂາດທຶນ ສຸດທິ','n',[['REV'],['DIR','IND','int']]]];
 const grpKeys={REV:['rexp','rpulp'],DIR:['raw','oth','mkt'],IND:['salL','salF','admin','maint','support','asset','othI'],int:['int']};
 const V=(key,w,i,F=fs)=>{if(key==='prod'||key==='exp')return F.reduce((t,f)=>t+(w==='p'?plan:act)[f][key][i],0);if(PL.xan[key])return L(key,w,i,F);if(grpKeys[key])return grpKeys[key].reduce((t,k)=>t+L(k,w,i,F),0);const r=ROWS.find(x=>x[0]===key);return r[3][0].reduce((t,k)=>t+V(k,w,i,F),0)-r[3][1].reduce((t,k)=>t+V(k,w,i,F),0)};
 const TOT=st.p==='season'?CMs:CMs.filter(i=>i===+st.p),COLS=st.p==='season'?CMs.slice(-2):TOT;const TL=mLbl(TOT);
 const V2=(key,w,F)=>TOT.reduce((t,i)=>t+V(key,w,i,F),0);
 const COST=(w,F)=>['DIR','IND','int'].reduce((t,k)=>t+V2(k,w,F),0);
 const netA=M.map((_,i)=>CMs.includes(i)?V('NET','a',i):null);
 const revP=V2('REV','p'),revA=V2('REV','a');
 const costP=['DIR','IND','int'].reduce((t,k)=>t+V2(k,'p'),0),costA=['DIR','IND','int'].reduce((t,k)=>t+V2(k,'a'),0);
 const seasonNet=fs.reduce((t,f)=>t+SEASON_NET[f],0);
 const nP=V2('NET','p'),nA=V2('NET','a');
 $('#kCost').innerHTML=kpi('ລາຍຮັບ '+TL,mcny(revA),'ລ້ານ ຢວນ',`ແຜນ ${mcny(revP)} ລ້ານ · ${pct(revP?revA/revP:null)}`,status(revP?revA/revP:null))+
  kpi('ຕົ້ນທຶນລວມ '+TL,mcny(costA),'ລ້ານ ຢວນ',`ແຜນ ${mcny(costP)} ລ້ານ · ໃຊ້ໄປ ${pct(costP?costA/costP:null)} ຂອງແຜນ`,[achC(costA,costP)>=1?'good':achC(costA,costP)>=.9?'warn':'crit','ປະຕິບັດໄດ້ '+pct(achC(costA,costP))])+
  kpi('ກຳໄລ/ຂາດທຶນ ສຸດທິ '+TL,mcny(nA),'ລ້ານ ຢວນ',`ແຜນ ${mcny(nP)} ລ້ານ · ສ່ວນຕ່າງ ${nA-nP>0?'+':''}${mcny(nA-nP)}`,[ach(nA,nP)>=1?'good':ach(nA,nP)>=.9?'warn':'crit','ປະຕິບັດໄດ້ '+pct(ach(nA,nP))])+
  kpi('ກຳໄລ ທັງລະດູ ຕາມແຜນ',mcny(seasonNet),'ລ້ານ ຢວນ','ລະດູ '+SEASON);
 const netPlanM=M.map((_,i)=>fs.reduce((t,f)=>t+plan[f].net[i],0)/1e6);
 barChart($('#chNet'),M.map(m=>m.slice(0,2)+'/'+m.slice(5)),[{name:'ແຜນ',data:netPlanM,color:'var(--s1-ghost)'},{name:'ຕົວຈິງ',data:netA.map(v=>v==null?null:v/1e6),color:'var(--s1)'}],{unit:' ລ້ານ ຢວນ',dec:2,label:'ກຳໄລ/ຂາດທຶນ ລາຍເດືອນ',vl:1});
 $('#tPLf').innerHTML=`<thead><tr><th>ໂຮງງານ</th><th class="n">ລາຍຮັບ ແຜນ</th><th class="n">ລາຍຮັບ ຈິງ</th><th class="n">ຕົ້ນທຶນ ແຜນ</th><th class="n">ຕົ້ນທຶນ ຈິງ</th><th class="n">ກຳໄລ ແຜນ</th><th class="n">ກຳໄລ ຈິງ</th><th>ປະຕິບັດໄດ້</th></tr></thead><tbody>`+
  [['xan'],['nan'],['xan','nan']].map(F=>{const np=V2('NET','p',F),na=V2('NET','a',F);return `<tr${F.length>1?' class="total"':''}><td>${F.length>1?'ລວມ':FN[F[0]]}</td><td class="n">${mcny(V2('REV','p',F))}</td><td class="n">${mcny(V2('REV','a',F))}</td><td class="n">${mcny(COST('p',F))}</td><td class="n">${mcny(COST('a',F))}</td><td class="n">${mcny(np)}</td><td class="n ${na>=np?'pos':'neg'}">${mcny(na)}</td><td>${achPill(ach(na,np))}</td></tr>`}).join('')+'</tbody>';
 $('#plNote').textContent=`${st.f==='all'?'ລວມ 2 ໂຮງງານ':'ໂຮງງານ '+FN[st.f]} · ໜ່ວຍ: ພັນ ຢວນ`;
 const kf=v=>fmt(v/1000);
 $('#tPL').innerHTML=`<thead><tr class="g"><th rowspan="2" class="lbl">ລາຍການ</th>${COLS.map(i=>`<th class="n gm" colspan="2">${M[i]}</th>`).join('')}<th class="n gt" colspan="2">ລວມ ${TL}</th><th class="n gt" rowspan="2">ສ່ວນຕ່າງ</th><th class="gt" rowspan="2">ປະຕິບັດໄດ້</th></tr><tr>${COLS.map(()=>'<th class="n gm pl">ແຜນ</th><th class="n gm">ຕົວຈິງ</th>').join('')}<th class="n gt pl">ແຜນ</th><th class="n gt">ຕົວຈິງ</th></tr></thead><tbody>`+
  ROWS.map(plRow).join('')+'</tbody>';
 const plHead=$('#tPL').querySelector('thead').outerHTML;
 $('#tPLs').innerHTML=plHead+'<tbody>'+[['REV','II. ລາຍຮັບລວມ','h'],['DIR','III. ຕົ້ນທຶນທາງກົງ','h'],['IND','IV. ຕົ້ນທຶນທາງອ້ອມ','h'],['int','V. ດອກເບ້ຍທະນາຄານ','h'],['NET','ກຳໄລ/ຂາດທຶນ ສຸດທິ','n']].map(plRow).join('')+'</tbody>';
 $('#plsNote').textContent=$('#plNote').textContent;
 function plRow([k,n,t]){const p=COLS.map(i=>V(k,'p',i)),a=COLS.map(i=>V(k,'a',i));const P=V2(k,'p'),A=V2(k,'a'),d=A-P;const q=t==='q';const F=q?(v=>fmt(v)):kf;
   const isCost=t==='c'||(t==='h'&&k!=='REV')||k==='int';const good=isCost?d<=0:d>=0;
   const r=!P?null:isCost?achC(A,P):(t==='m'||t==='n')?ach(A,P):A/P;
   const neg=v=>(t==='m'||t==='n')&&v<0?' neg':'';
   return `<tr class="r-${t}"><td class="lbl">${n}</td>${COLS.map((_,j)=>`<td class="n pl${j?' gs':''}">${F(p[j])}</td><td class="n ac${neg(a[j])}">${F(a[j])}</td>`).join('')}<td class="n pl gs tt">${F(P)}</td><td class="n ac tt${neg(A)}">${F(A)}</td><td class="n tt ${Math.abs(d)<.5?'':good?'pos':'neg'}">${d>0?'+':''}${F(d)}</td><td class="tt">${P?achPill(r):'—'}</td></tr>`}
 // stock
 const SK=k=>fs.reduce((t,f)=>t+STK[f][k],0);
 $('#kStock').innerHTML=kpi('ແປ້ງ On spec',fmt(SK('starch'),1),'ໂຕນ',`25 kg: ${fmt(SK('s25'),1)} · 850 kg: ${fmt(SK('s850'),1)}`)+kpi('ກາກມັນ',fmt(SK('pulp'),2),'ໂຕນ',`${fmt(+SET.pulp_price||0)} ຢວນ/ໂຕນ`)+kpi('ມັນຕົ້ນຄ້າງລານ',fmt(SK('raw'),1),'ໂຕນ',dfmt(LAST.proc),SK('raw')>150?['warn','! ຄວນເຂົ້າຜະລິດໄວ']:null)+kpi('ຄິດເປັນຕູ້ (28 ໂຕນ)',fmt(SK('starch')/28,1),'ຕູ້',`ສັນຍາຍັງເຫຼືອ ${fmt(contracts.filter(c=>fs.includes(c[0])).reduce((t,c)=>t+Math.max(0,c[4]-c[7]),0))} ໂຕນ`);
 let open=fs.reduce((t,f)=>t+STK[f].open,0);const rowsS=[...Array(NOWI+1).keys()].map(i=>{const pr=fs.reduce((t,f)=>t+act[f].prod[i],0),ex=fs.reduce((t,f)=>t+act[f].exp[i],0);const r=[M[i],open,pr,ex,open+pr-ex];open=r[4];return r});
 $('#tStock').innerHTML=`<thead><tr><th>ເດືອນ</th><th class="n">ຍົກມາ</th><th class="n">+ ຜະລິດ</th><th class="n">− ສົ່ງອອກ</th><th class="n">= ເຫຼືອ</th></tr></thead><tbody>`+rowsS.map((r,k)=>`<tr${k===rowsS.length-1?' class="total"':''}><td>${r[0]}</td>${r.slice(1).map(v=>`<td class="n">${fmt(v,1)}</td>`).join('')}</tr>`).join('')+'</tbody>';
 const lastPx=(SHIP.filter(s=>fs.includes(s.factory)).slice(-1)[0]||{}).price;
 $('#tStockVal').innerHTML=`<thead><tr><th>ລາຄາທີ່ໃຊ້</th><th class="n">ຢວນ/ໂຕນ</th><th class="n">ມູນຄ່າ (ຢວນ)</th></tr></thead><tbody>`+
  [['ລາຄາສົ່ງອອກ ຄັ້ງລ່າສຸດ',+lastPx||0],['ຕົ້ນທຶນຕົວຈິງ ຕໍ່ ໂຕນ (ອ້າງອີງ)',UNIT.totA||0]].map(([n,p])=>`<tr><td>${n}</td><td class="n">${p?fmt(p):'—'}</td><td class="n">${p?fmt(SK('starch')*p):'—'}</td></tr>`).join('')+'</tbody>';
}
function pvaBlock(key,pre,fs){
 const P=M.map((_,i)=>fs.reduce((t,f)=>t+(plan[f][key][i]||0),0));
 const A=M.map((_,i)=>i<=NOWI&&(i<NOWI||fs.some(f=>act[f][key][i]))?fs.reduce((t,f)=>t+(act[f][key][i]||0),0):null);
 const yr=P.reduce((a,b)=>a+b,0),ytd=A.reduce((a,b)=>a+(b||0),0);
 const td=P.reduce((t,v,i)=>t+(i<NOWI?v:i===NOWI?v*NOWFRAC:0),0);
 const left=Math.max(0,yr-ytd),mLeft=Math.max(1,M.length-NOWI);
 const pill=r=>r==null?'—':`<span class="pill ${r>=1?'good':r>=.9?'warn':'crit'}">${pct(r)}</span>`;
 $('#pk'+pre).innerHTML=kpi('ແຜນໝົດປີ',fmt(yr),'ໂຕນ',`${M[0]}–${M[M.length-1]}`)+kpi('ຕົວຈິງສະສົມ',fmt(ytd,1),'ໂຕນ',`${pct(yr?ytd/yr:null)} ຂອງແຜນໝົດປີ`,[yr&&ytd/yr>=1?'good':'mute','ໝົດປີ '+pct(yr?ytd/yr:null)])+
  kpi('ທຽບແຜນເຖິງມື້ນີ້',pct(td?ytd/td:null),'',`ແຜນເຖິງ ${dfmt(yday()).slice(0,5)}: ${fmt(td)} ໂຕນ`,status(td?ytd/td:null))+kpi('ຍັງເຫຼືອທີ່ຕ້ອງປະຕິບັດ',fmt(left),'ໂຕນ',`≈ ${fmt(left/mLeft)} ໂຕນ/ເດືອນ ໃນ ${mLeft} ເດືອນທີ່ເຫຼືອ`);
 barChart($('#pc'+pre),M.map(m=>m.slice(0,2)+'/'+m.slice(5)),[{name:'ແຜນ',data:P,color:'var(--s1-ghost)'},{name:'ຕົວຈິງ',data:A,color:'var(--s1)'}],{unit:' ໂຕນ',dec:1,label:'ແຜນ VS ຕົວຈິງ ລາຍເດືອນ',vl:1});
 let cp=0,ca=0;
 $('#pt'+pre).innerHTML=`<thead><tr><th>ເດືອນ</th><th class="n">ແຜນ</th><th class="n">ຕົວຈິງ</th><th>ປະຕິບັດໄດ້</th><th class="n">ແຜນສະສົມ</th><th class="n">ຈິງສະສົມ</th><th>ສະສົມ</th></tr></thead><tbody>`+
  M.map((m,i)=>{cp+=P[i];const has=A[i]!=null;if(has)ca+=A[i];
   return `<tr><td>${m}</td><td class="n">${fmt(P[i])}</td><td class="n">${has?fmt(A[i],1):'—'}</td><td>${has?pill(P[i]?A[i]/P[i]:null):i===NOWI?'<span class="pill mute">ລໍຖ້າຂໍ້ມູນ</span>':''}</td><td class="n">${fmt(cp)}</td><td class="n">${has?fmt(ca,1):''}</td><td>${has?pill(cp?ca/cp:null):''}</td></tr>`}).join('')+
  `<tr class="total"><td>ໝົດປີ</td><td class="n">${fmt(yr)}</td><td class="n">${fmt(ytd,1)}</td><td>${pill(yr?ytd/yr:null)}</td><td colspan="3"></td></tr></tbody>`;
}
function plan_total(fs,k){return fs.reduce((t,f)=>t+plan[f][k].reduce((a,b)=>a+b,0),0)}

/* controls */
$('#factorySeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;st.f=b.dataset.f;document.querySelectorAll('#factorySeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));save();render()});
$('#period').addEventListener('change',e=>{st.p=e.target.value;save();render()});
function save(){try{localStorage.setItem('ls-view2',JSON.stringify(st))}catch(e){}}
try{const s=JSON.parse(localStorage.getItem('ls-view2')||'null');if(s&&['all','xan','nan'].includes(s.f)){Object.assign(st,s);$('#period').value=st.p;document.querySelectorAll('#factorySeg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.f===st.f))}}catch(e){}
const views=['overview','procure','produce','sales','cost','stock','debt','import'];
function route(){const h=location.hash.slice(1);const v=views.includes(h)?h:'overview';views.forEach(x=>$('#v-'+x).hidden=x!==v);document.querySelectorAll('.tabs a').forEach(a=>a.getAttribute('href')==='#'+v?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'))}
addEventListener('hashchange',route);

/* ===== Excel import → Supabase ===== */
const nz=s=>String(s??'').toLowerCase().replace(/[\s_\-\.\(\)\/\\%:（）\n]+/g,'');
const num=v=>typeof v==='number'?v:(v==null||v===''||v==='-')?0:(+String(v).replace(/,/g,'')||0);
const facOfName=n=>/snk/i.test(n)?'xan':/\bmn\b|mn$|-mn/i.test(n)?'nan':null;
const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function parseDate(v){if(v instanceof Date&&!isNaN(v))return new Date(v.getFullYear(),v.getMonth(),v.getDate());if(typeof v==='number'&&v>40000&&v<60000){const d=new Date(Date.UTC(1899,11,30)+v*864e5);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())}
 const s=String(v??'').trim();let m;if(m=s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/))return new Date(+m[3]<100?2000+ +m[3]:+m[3],MON[m[2].toLowerCase()],+m[1]);
 if(m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))return new Date(+m[3],+m[2]-1,+m[1]);if(m=s.match(/^(\d{4})-(\d{2})-(\d{2})/))return new Date(+m[1],+m[2]-1,+m[3]);return null}
function findHdr(rows,frags,maxR=12){for(let r=0;r<Math.min(maxR,rows.length);r++){const row=rows[r]||[];if(frags.every(f=>row.some(c=>c!=null&&nz(c).includes(nz(f)))))return r}return -1}
function ci(hdr,...frags){return hdr.findIndex(c=>c!=null&&frags.every(f=>nz(c).includes(nz(f))))}
function inSeason(d){return d&&d>=S0&&d<monthDate(NM+3)}
const P={};
P.procurements=(rows,fac)=>{const h=findHdr(rows,['ເລກບີນ']);if(h<0)return null;const H=rows[h];
 const c={d:ci(H,'ວັນທີ'),sup:ci(H,'ລາຍຊື່'),acc:ci(H,'ຊື້ເຈົ້'),tk:ci(H,'ເລກບີນ'),tr:ci(H,'ທະບຽນລົດ'),g:ci(H,'ຈຳນວນເຂົ້າລານ'),n:ci(H,'ຈຳນວນຮັບເຂົ້າຕົວຈີ່ງ'),p:ci(H,'ລາຄາ'),a:ci(H,'ຈຳນວນເງີນ'),tp:ci(H,'ເຄື່ອນຍ້າຍ'),w:ci(H,'ມັນເສຍ')};
 const out=[];rows.slice(h+1).forEach(r=>{const d=parseDate(r[c.d]);if(!inSeason(d))return;const n=num(r[c.n]),a=num(r[c.a]),tp=c.tp>=0?num(r[c.tp]):0,w=c.w>=0?num(r[c.w]):0;if(!n&&!a&&!tp&&!w)return;
  out.push({season:SEASON,factory:fac,date:isoOf(d),supplier:r[c.sup]!=null?String(r[c.sup]).trim():null,account_name:r[c.acc]!=null?String(r[c.acc]).trim():null,ticket_no:r[c.tk]!=null?String(r[c.tk]):null,truck:r[c.tr]!=null?String(r[c.tr]):null,
   gross_kg:num(r[c.g]),net_kg:n,price:num(r[c.p]),amount:a,to_prod_kg:tp,waste_kg:w})});return out};
P.production=(rows,fac)=>{const h=findHdr(rows,['ຮັບມັນຕົ້ນດິບເຂົ້າ']);if(h<0)return null;const H=rows[h];
 const c={d:ci(H,'入库日期'),sh:ci(H,'ຊ່ວງການຜະລິດ'),ln:ci(H,'生产线'),raw:ci(H,'原材料'),nr:ci(H,'ມັນດີບລົບສີງເຈືອປົນອອກ','kg'),st:ci(H,'淀粉含量','ເປີເຊັນ'),ex:ci(H,'ແປ້ງທີ່ຄວນໄດ້'),
  p25:ci(H,'ແປງດີ 25'),p850:ci(H,'ແປງດີ 850'),on:ci(H,'onspecfood'),off:ci(H,'offspecrenew'),out:ci(H,'ແປງທີ່ຜະລິດໄດ້'),pulp:ci(H,'ກາກມັນ','kg')};
 const out=[];rows.slice(h+1).forEach(r=>{const d=parseDate(r[c.d]);if(!inSeason(d))return;const raw=num(r[c.raw]),o=num(r[c.out]);if(!raw&&!o)return;
  const sp=num(r[c.st]);out.push({season:SEASON,factory:fac,date:isoOf(d),shift:r[c.sh]!=null?String(r[c.sh]):null,line:r[c.ln]!=null?String(r[c.ln]):null,raw_kg:raw,net_raw_kg:num(r[c.nr]),
   starch_pct:sp?(sp<=1?sp*100:sp):null,expected_kg:num(r[c.ex]),p25_kg:num(r[c.p25]),p850_kg:num(r[c.p850]),onspec_kg:num(r[c.on]),offspec_kg:num(r[c.off]),output_kg:o,pulp_kg:c.pulp>=0?num(r[c.pulp]):0})});return out};
P.stock_moves=(rows,fac)=>{const h=findHdr(rows,['出库日期']);if(h<0)return null;const H=rows[h];
 const c={d:ci(H,'出库日期'),b:ci(H,'合同单号'),pr:ci(H,'货品名称'),bags:ci(H,'出库数量'),bs:ci(H,'ຂະໜາດເປົາ'),w:ci(H,'总重量'),co:ci(H,'出货人'),no:ci(H,'备注'),s:ci(H,'status')};
 const out=[];rows.slice(h+1).forEach(r=>{const d=parseDate(r[c.d]);if(!inSeason(d))return;const w=num(r[c.w]);if(!w)return;const pr=String(r[c.pr]??'');
  const pulp=/ກາກມັນ|薯渣/.test(pr);out.push({season:SEASON,factory:fac,date:isoOf(d),kind:pulp?'pulp':'starch',direction:String(r[c.s]??'').trim().toLowerCase()||null,buyer_type:r[c.b]!=null?String(r[c.b]).trim():null,
   product:pr||null,bag_size:pulp?null:(/850/.test(pr)?850:25),bags:num(r[c.bags]),weight_kg:w,company:r[c.co]!=null?String(r[c.co]).trim():null,note:r[c.no]!=null?String(r[c.no]).trim():null})});return out};
P.shipments=(rows,fac)=>{const h=findHdr(rows,['ເລກທີສັນຍາ','ວັນທີ່ສົ່ງອອກ']);if(h<0)return null;const H=rows[h];
 const c={no:ci(H,'ເລກທີສັນຍາ'),p:ci(H,'unitprice'),a:ci(H,'ຈຳນວນເງີນ','amount'),d:ci(H,'ວັນທີ່ສົ່ງອອກ'),t:ci(H,'出仓'),cash:ci(H,'ໄດ້ຮັບເງີນແລ້ວ'),ded:ci(H,'deductadvance')};
 const out=[];let last=null,k=0;rows.slice(h+1).forEach(r=>{const no=r[c.no]!=null&&String(r[c.no]).trim()?String(r[c.no]).trim():null;if(no){last=no;k=0}
  const d=parseDate(r[c.d]),t=num(r[c.t]);if(!inSeason(d)||!t)return;const inv=no||(last?`${last} (${++k})`:null);
  out.push({season:SEASON,factory:fac,date:isoOf(d),invoice_no:inv,contract_no:inv,tons:t,price:num(r[c.p]),amount:num(r[c.a]),cash:num(r[c.cash]),deduct:num(r[c.ded])})});return out};
P.deposits=rows=>{const h=findHdr(rows,['continvno']);if(h<0)return null;const H=rows[h];const c={inv:ci(H,'continvno'),m:ci(H,'customadvancedeposit'),r:ci(H,'status'),s:ci(H,'remark')};
 const by={};rows.slice(h+1).forEach(r=>{if(!/advance/i.test(String(r[c.r]??''))||!/receiv/i.test(String(r[c.s]??'')))return;
  const key=String(r[c.inv]??'').trim().replace(/^INV-/i,'').replace(/-\d+$/,'');if(!key)return;by[key]=(by[key]||0)+num(r[c.m])});return by};
const CAT=code=>{const c=String(code).replace(/-(SNK|MN)$/i,'');if(/^salary-f/i.test(code))return 'salF';const b=c.split('-')[0].toLowerCase();
 return ({hh:'raw',tran:'oth',bio:'oth',packing:'oth',labor:'oth',electric:'oth',salary:'salL',admin:'admin',maint:'maint',cons:'maint',support:'support',asset:'asset',benefits:'othI',insurance:'othI',tax:'othI',lease:'othI',interest:'int'})[b]||null};
P.costs=(rows,fac)=>{const h=rows.findIndex(r=>r&&r.some(c=>nz(c)==='ເນື້ອໃນ'));if(h<0)return null;const H=rows[h];const mc=[];H.forEach((v,j)=>{if(typeof v==='number'&&v>=1&&v<=12)mc.push([j,v])});
 const out=[];rows.slice(h+1).forEach(r=>{const code=r&&r[0]!=null?String(r[0]).trim():'';if(!/^[A-Za-z]+(-[A-Za-z]+)?$/.test(code))return;const cat=CAT(code);if(!cat)return;
  mc.forEach(([j,mo])=>{const y=mo>=S0.getMonth()+1?S0.getFullYear():S0.getFullYear()+1;const v=num(r[j]);if(!v)return;
   out.push({season:SEASON,factory:fac,month:`${y}-${p2(mo)}-01`,code:code.replace(/-(SNK|MN)$/i,''),category:cat,amount:v})})});return out};
P.plans=rows=>{const out=[];const blocks=[];rows.forEach((r,i)=>{const a=String(r&&r[0]||'');if(/P&L PROJECTION/i.test(a)){const fac=/ຊະນະຄາມ/.test(a)?'xan':/ນານ/.test(a)?'nan':null;if(fac)blocks.push([fac,i])}});
 if(!blocks.length)return null;
 blocks.forEach(([fac,b],bi)=>{const end=bi+1<blocks.length?blocks[bi+1][1]:rows.length;const B=rows.slice(b,end);const g=pre=>{const r=B.find(x=>x&&String(x[0]||'').trim().startsWith(pre));return r?r.slice(1,11).map(num):Array(10).fill(0)};
  const C={proc_t:g('ຮັບຊື້ມັນຕົ້ນ'),prod_t:g('ຜະລິດແປ້ງ/ໂຕນ'),exp_t:g('ຈໍານວນສົ່ງອອກ'),rev_exp:g('ລາຍຮັບສົ່ງອອກ'),rev_pulp:g('ລາຍຮັບຈາກການຂາຍກາກມັນ'),raw:g('• ຕົ້ນທຶນມັນຕົ້ນ'),oth:g('• ຕົ້ນທຶນທາງກົງອື່ນ'),mkt:g('• ຕົ້ນທຶນການຕະຫຼາດ'),
   sal_l:g('• ເງິນເດືອນ ລາວ'),sal_f:g('• ເງິນເດືອນ ຕ່າງປະເທດ'),admin:g('• ງົບປະມານບໍລິຫານທົ່ວໄປ'),support:g('• ຊຸກຍູ້ຕ່າງໆ'),asset:g('• ຊື້ຊັບສິນປະເພດຕ່າງໆ'),interest:g('V. ລາຍຈ່າຍດອກເບ້ຍທະນາຄານ'),net:g('VII.')};
  const m1=g('• ຄ່າສ້ອມແປງບຳລຸງຮັກສາ'),m2=g('• ຄ່າສ້ອມແປງຕຶກ'),o1=g('• ຜົນຕອບແທນ'),o2=g('• ອາກອນ'),o3=g('• ລາຍຈ່າຍສຳນັກງານໃຫຍ່');
  for(let i=0;i<10;i++){const row={season:SEASON,factory:fac,month:isoOf(monthDate(i))};Object.keys(C).forEach(k=>row[k]=C[k][i]);row.maint=m1[i]+m2[i];row.oth_i=o1[i]+o2[i]+o3[i];out.push(row)}});
 return out};
const SHEETS=[
 {key:'procurements',lo:'ເກັບຊື້ມັນຕົ້ນ',test:n=>/cassava\s*in.?out/i.test(n)},
 {key:'production',lo:'ການຜະລິດ',test:n=>/produced/i.test(n)},
 {key:'stock_moves',lo:'ອອກສາງ / ຂາຍ',test:n=>/tapioca\s*sale/i.test(n)},
 {key:'shipments',lo:'ໃບແຈ້ງໜີ້ ສົ່ງອອກ',test:n=>/ຕິດຕາມການສົ່ງອອກ/.test(n)},
 {key:'deposits',lo:'ເງິນມັດຈຳສັນຍາ',test:n=>/^2\.3|contract\s*\d\d/i.test(n)},
 {key:'costs',lo:'ຕົ້ນທຶນລາຍເດືອນ',test:n=>/^cost of (snk|mn)/i.test(n.trim())},
 {key:'plans',lo:'ແຜນລະດູ (P&L Projection)',test:n=>/pl projection \(v2\)/i.test(n)}];
let PARSED=null;
function parseWorkbook(wb,file){
 const res=[],data={procurements:{},production:{},stock_moves:{},shipments:{},costs:{},deposits:null,plans:null};
 wb.SheetNames.forEach(n=>{const sp=SHEETS.find(s=>s.test(n));if(!sp){res.push({name:n,kind:'skip'});return}
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:null,raw:true});const fac=facOfName(n);
  try{const v=P[sp.key](rows,fac);if(v==null){res.push({name:n,kind:'unknown',lo:sp.lo});return}
   if(sp.key==='deposits'){data.deposits=v;res.push({name:n,kind:'ok',lo:sp.lo,table:'contracts',rows:Object.keys(v).length,fac:'ທັງ 2 ໂຮງງານ',note:Object.entries(v).map(([k,x])=>`${k}: ${fmt(x)}`).join(' · ')});return}
   if(sp.key==='plans'){data.plans=v;res.push({name:n,kind:'ok',lo:sp.lo,table:'plans',rows:v.length,fac:'ທັງ 2 ໂຮງງານ'});return}
   if(!fac){res.push({name:n,kind:'unknown',lo:sp.lo,note:'ບໍ່ຮູ້ໂຮງງານ ຈາກຊື່ Sheet'});return}
   data[sp.key][fac]=(data[sp.key][fac]||[]).concat(v);
   const ds=v.map(r=>r.date||r.month).sort();res.push({name:n,kind:'ok',lo:sp.lo,table:sp.key==='costs'?'cost_entries':sp.key,rows:v.length,fac:FN[fac],from:ds[0],to:ds[ds.length-1]});
  }catch(e){res.push({name:n,kind:'error',lo:sp.lo,note:e.message})}});
 // interest booked in both cost sheets for the same month = one shared amount → split 50/50
 if(SET.interest_split!==false&&data.costs.xan&&data.costs.nan){const ix=data.costs.xan.filter(r=>r.category==='int'),in_=data.costs.nan.filter(r=>r.category==='int');
  ix.forEach(a=>{const b=in_.find(x=>x.month===a.month&&Math.abs(x.amount-a.amount)<1);if(b){a.amount/=2;b.amount/=2;res.push({name:'—',kind:'note',note:`ດອກເບ້ຍ ${a.month.slice(0,7)}: ${fmt(a.amount*2)} ລົງທັງ 2 ໂຮງງານ → ແບ່ງ 50/50`})}})}
 PARSED={file,data,res};return res}
const fmtD=s=>s?s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4):'—';
function showResults(file,res){
 $('#impResult').hidden=false;$('#impTitle').textContent='ຜົນການກວດ: '+file;
 const ok=res.filter(r=>r.kind==='ok');$('#impSub').textContent=`${res.filter(r=>r.kind!=='note').length} Sheet · ນຳເຂົ້າ ${ok.length} · ຂ້າມ ${res.filter(r=>r.kind==='skip').length}`;
 const order={ok:0,note:1,unknown:2,error:2,skip:3};
 $('#tImp').innerHTML=`<thead><tr><th>Sheet</th><th>ຂໍ້ມູນ</th><th>ຕາຕະລາງ</th><th class="n">ແຖວ</th><th>ໂຮງງານ</th><th>ຊ່ວງວັນທີ</th><th>ໝາຍເຫດ</th></tr></thead><tbody>`+
  res.slice().sort((a,b)=>order[a.kind]-order[b.kind]).map(r=>r.kind==='skip'?`<tr><td class="mono">${esc(r.name)}</td><td><span class="pill mute">ບໍ່ກ່ຽວ: ຂ້າມ</span></td><td colspan="5"></td></tr>`:
   r.kind==='note'?`<tr><td></td><td colspan="6" class="issue">• ${esc(r.note)}</td></tr>`:
   r.kind!=='ok'?`<tr><td class="mono">${esc(r.name)}</td><td><span class="pill crit">✕ ${r.lo}</span></td><td colspan="5" class="issue">${esc(r.note||'ອ່ານຫົວຖັນບໍ່ໄດ້')}</td></tr>`:
   `<tr><td class="mono">${esc(r.name)}</td><td><span class="pill good">✓ ${r.lo}</span></td><td class="mono">${r.table}</td><td class="n">${fmt(r.rows)}</td><td>${r.fac}</td><td>${r.from?fmtD(r.from)+' – '+fmtD(r.to):'—'}</td><td class="issue">${r.rows?esc(r.note||''):'ບໍ່ມີຂໍ້ມູນ: ຈະລຶບຂໍ້ມູນເກົ່າຂອງໂຮງງານນີ້'}</td></tr>`).join('')+'</tbody>';
 $('#impSum').textContent=`ພ້ອມບັນທຶກ ${fmt(ok.reduce((t,r)=>t+r.rows,0))} ແຖວ. ຂໍ້ມູນລະດູ ${SEASON} ຂອງ Sheet ທີ່ພົບ ຈະຖືກແທນທີ່ດ້ວຍຂໍ້ມູນໃນໄຟລ໌ນີ້.`;
 $('#commit').disabled=ROLE!=='admin'||!ok.length;
 $('#impResult').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
async function insertChunks(table,rows){for(let i=0;i<rows.length;i+=500){const {error}=await sb.from(table).insert(rows.slice(i,i+500));if(error)throw error}}
async function commitImport(){
 if(!PARSED)return;const {data,file}=PARSED;const btn=$('#commit'),msg=$('#impSum');btn.disabled=true;let total=0;
 try{
  for(const t of ['procurements','production','stock_moves','shipments']){for(const [fac,rows] of Object.entries(data[t])){msg.textContent=`ກຳລັງບັນທຶກ ${t} (${FN[fac]}) …`;
    let {error}=await sb.from(t).delete().eq('season',SEASON).eq('factory',fac);if(error)throw error;await insertChunks(t,rows);total+=rows.length}}
  for(const [fac,rows] of Object.entries(data.costs)){msg.textContent=`ກຳລັງບັນທຶກ ຕົ້ນທຶນ (${FN[fac]}) …`;let {error}=await sb.from('cost_entries').delete().eq('season',SEASON).eq('factory',fac);if(error)throw error;await insertChunks('cost_entries',rows);total+=rows.length}
  if(data.plans){msg.textContent='ກຳລັງບັນທຶກ ແຜນ …';let {error}=await sb.from('plans').delete().eq('season',SEASON);if(error)throw error;await insertChunks('plans',data.plans);total+=data.plans.length}
  if(data.deposits){const cons=await fetchAll('contracts',q=>q.eq('season',SEASON));for(const c of cons){const key=Object.keys(data.deposits).find(k=>c.contract_no.endsWith(k)||c.contract_no.includes(k));
    if(key){const {error}=await sb.from('contracts').update({deposit_received:data.deposits[key]}).eq('contract_no',c.contract_no);if(error)throw error;total++}}}
  await sb.from('import_log').insert({file_name:file,rows:total,sheets:PARSED.res.filter(r=>r.kind==='ok').map(r=>({sheet:r.name,table:r.table,rows:r.rows}))});
  await sb.from('settings').upsert({key:'last_import',value:{file,at:new Date().toISOString(),by:USERNAME,rows:total}});
  msg.textContent=`ບັນທຶກແລ້ວ ${fmt(total)} ແຖວ. ກຳລັງໂຫຼດຂໍ້ມູນໃໝ່ …`;await refreshAll();msg.textContent=`ບັນທຶກແລ້ວ ${fmt(total)} ແຖວ ຈາກ ${file}. ທຸກໜ້າອັບເດດແລ້ວ.`;toast('ນຳເຂົ້າສຳເລັດ: '+fmt(total)+' ແຖວ');PARSED=null;
 }catch(e){msg.textContent='ບັນທຶກບໍ່ສຳເລັດ: '+(e.message||e)+'. ກວດສິດ admin ຫຼື ອິນເຕີເນັດ ແລ້ວລອງໃໝ່.';btn.disabled=false}}
function readWB(wb,file){showResults(file,parseWorkbook(wb,file))}
function handle(f){if(!window.XLSX){toast('ໂຫຼດຕົວອ່ານ Excel ບໍ່ສຳເລັດ. ກວດອິນເຕີເນັດ ແລ້ວລອງໃໝ່');return}
 toast('ກຳລັງອ່ານ '+f.name+' …');const rd=new FileReader();rd.onload=e=>{try{readWB(XLSX.read(e.target.result,{type:'array',cellDates:true}),f.name)}catch(err){toast('ອ່ານໄຟລ໌ບໍ່ໄດ້: '+err.message)}};rd.readAsArrayBuffer(f)}
$('#file').addEventListener('change',e=>{if(e.target.files[0])handle(e.target.files[0]);e.target.value=''});
const drop=$('#drop');['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)handle(f)});
$('#commit').addEventListener('click',commitImport);
function toast(m){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),4200)}

/* ===== Reports: PDF (A4, ≤2 pages) and Excel ===== */
const REP={
 overview:{lo:'ພາບລວມ',en:'overview',d:'ສະຫຼຸບທຸລະກິດ, ແຜນ VS ຕົວຈິງ',pages:[
   [[{id:'flow',plain:1}],[{t:'ແຜນ VS ຕົວຈິງ',id:'pva',leg:1,w:3},{t:'ຈຸດສຳຄັນ',notes:1,w:2}],[{t:'ປຽບທຽບທັງ 2 ໂຮງງານ',id:'cmp',w:3},{t:'ກຳໄລ/ຂາດທຶນ ແຍກໂຮງງານ (ລ້ານ ຢວນ)',id:'tPLf',w:2}]],
   [[{t:'ເກັບຊື້ມັນຕົ້ນ ລາຍເດືອນ (ໂຕນ)',id:'chMonthlyProc'},{t:'ຜະລິດແປ້ງ ລາຍເດືອນ (ໂຕນ)',id:'chMonthlyProd'},{t:'ສົ່ງອອກແປ້ງ ລາຍເດືອນ (ໂຕນ)',id:'chMonthlyExp'}],[{t:'ກຳໄລ/ຂາດທຶນ ສຸດທິ ລາຍເດືອນ (ລ້ານ ຢວນ)',id:'chNet'},{t:'ຕົ້ນທຶນ ຕໍ່ ແປ້ງ 1 ໂຕນ (ຢວນ/ໂຕນ, ຊະນະຄາມ)',id:'tUnit'}]]]},
 procure:{lo:'ເກັບຊື້ມັນຕົ້ນ',en:'procurement',d:'ປະລິມານ, ລາຄາ, ຜູ້ສົ່ງ',pages:[
   [[{id:'kProc',plain:1}],[{id:'pkProc',plain:1}],[{t:'ແຜນ VS ຕົວຈິງ ລາຍເດືອນ (ໂຕນ)',id:'pcProc',w:3},{t:'ລາຍເດືອນ ແລະ ໝົດປີ (ໂຕນ)',id:'ptProc',w:2}]],
   [[{t:'ເກັບຊື້ ຕໍ່ມື້ (ໂຕນ)',id:'chProcDay'},{t:'ລາຄາເກັບຊື້ ຕໍ່ມື້ (ກີບ/kg)',id:'chPrice'}],[{t:'ສະຫຼຸບລາຍເດືອນ',id:'tProcM'},{t:'ຜູ້ສົ່ງມັນ ລາຍໃຫຍ່',id:'tSup'}]]]},
 produce:{lo:'ຜະລິດ',en:'production',d:'ຜົນຜະລິດ, ອັດຕາແປງ',pages:[
   [[{id:'kProd',plain:1}],[{id:'pkProd',plain:1}],[{t:'ແຜນ VS ຕົວຈິງ ລາຍເດືອນ (ໂຕນ)',id:'pcProd',w:3},{t:'ລາຍເດືອນ ແລະ ໝົດປີ (ໂຕນ)',id:'ptProd',w:2}]],
   [[{stack:[{t:'ແປ້ງໄດ້ ຕໍ່ມື້ (ໂຕນ)',id:'chDaily'},{t:'ອັດຕາສ່ວນແປ້ງມັນຕົ້ນ',id:'chConv'}],w:2},{t:'ບັນທຶກການຜະລິດ',id:'tProd',w:3}]]]},
 sales:{lo:'ສົ່ງອອກ',en:'export',d:'ສົ່ງອອກ, ລາຄາ, ຕະຫຼາດ, ສັນຍາ',pages:[
   [[{id:'kSales',plain:1}],[{t:'ແຜນ VS ຕົວຈິງ ລາຍເດືອນ (ໂຕນ)',id:'pcExp',w:3},{t:'ລາຍເດືອນ ແລະ ໝົດປີ (ໂຕນ)',id:'ptExp',w:2}],[{t:'ລາຄາສົ່ງອອກ ຕາມມື້ຂົນສົ່ງ (ຢວນ/ໂຕນ)',id:'chExpPrice',w:3},{t:'ຕະຫຼາດສົ່ງອອກ (ໂຕນ)',id:'mkt',leg:1,w:2}]],
   [[{t:'ສັນຍາຊື້-ຂາຍແປ້ງມັນຕົ້ນ (ຢວນ)',id:'tCon'}],[{t:'ເງິນມັດຈຳສັນຍາ (ຢວນ)',id:'tDep'}],[{t:'ການສົ່ງອອກ ຕາມໃບແຈ້ງໜີ້ (ຢວນ)',id:'tShip'}]]]},
 cost:{lo:'ຕົ້ນທຶນ & ກຳໄລ',en:'cost-profit',d:'ງົບກຳໄລ-ຂາດທຶນ ທຽບແຜນ',pages:[
   [[{id:'kCost',plain:1}],[{t:'ກຳໄລ/ຂາດທຶນ ສຸດທິ ລາຍເດືອນ (ລ້ານ ຢວນ)',id:'chNet',w:3},{t:'ແຍກໂຮງງານ (ລ້ານ ຢວນ)',id:'tPLf',w:2}],[{t:'ຕົ້ນທຶນ ຕໍ່ ແປ້ງ 1 ໂຕນ (ຢວນ/ໂຕນ, ຊະນະຄາມ)',id:'tUnit',w:3},{t:'ຈຸດສຳຄັນ',notes:1,w:2}]],
   [[{t:'ງົບກຳໄລ-ຂາດທຶນ ແຜນ VS ຕົວຈິງ (ຢວນ)',id:'tPL'}]]]},
 stock:{lo:'ສາງ',en:'stock',d:'ຍອດແປ້ງ, ກາກມັນ, ມັນຕົ້ນ',pages:[
   [[{id:'kStock',plain:1}],[{t:'ການເຄື່ອນໄຫວສາງແປ້ງ (ໂຕນ)',id:'tStock'},{t:'ມູນຄ່າແປ້ງໃນສາງ',id:'tStockVal'}]]]},
 debt:{lo:'ພັນທະໜີ້ສິນ',en:'debt',d:'ເງິນກູ້, ຍອດເຫຼືອ, ການເບີກ-ຊຳລະ',pages:[
   [[{id:'kDebt',plain:1}],[{t:'ເງິນກູ້ທະນາຄານ',id:'tDebt'}],[{t:'ການນຳໃຊ້ເງິນກູ້ ແລະ ຍອດໜີ້',id:'chBal',w:2},{t:'ປະຫວັດການເບີກ ແລະ ຊຳລະ',id:'tTx',w:3}]]]}};
const rs={sel:['overview'],fmt:'pdf'};
const loadScript=src=>new Promise((ok,no)=>{if(document.querySelector(`script[src="${src}"]`))return ok();const e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=()=>no(new Error('load'));document.head.appendChild(e)});
function scopeText(){return `${st.f==='all'?'ພາບລວມ 2 ໂຮງງານ':'ໂຮງງານ '+FN[st.f]} · ${pname()}`}
function openRep(){const h=location.hash.slice(1);rs.sel=[REP[h]?h:'overview'];$('#repScope').textContent='ໃຊ້ຕົວກອງທີ່ເລືອກຢູ່: '+scopeText();drawTypes();$('#repStatus').textContent='';$('#repModal').hidden=false;$('#repGo').focus()}
function drawTypes(){$('#repTypes').innerHTML=Object.entries(REP).map(([k,r])=>`<button type="button" class="rep-t" data-t="${k}" aria-pressed="${rs.sel.includes(k)}"><b>${r.lo}</b><span>${r.d}</span></button>`).join('')+`<button type="button" class="rep-t rep-all" data-t="all" aria-pressed="${rs.sel.length===REP_ORDER.length}"><b>ລວມທຸກ Report</b><span>ທຸກໜ້າ ຕໍ່ກັນ ເປັນໄຟລ໌ດຽວ</span></button>`}
$('#repOpen').addEventListener('click',openRep);
$('#repClose').addEventListener('click',()=>$('#repModal').hidden=true);
$('#repModal').addEventListener('click',e=>{if(e.target.id==='repModal')$('#repModal').hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#repModal').hidden=true});
$('#repTypes').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;if(t==='all')rs.sel=rs.sel.length===REP_ORDER.length?[]:REP_ORDER.slice();else rs.sel=rs.sel.includes(t)?rs.sel.filter(x=>x!==t):REP_ORDER.filter(x=>x===t||rs.sel.includes(x));drawTypes()});
document.querySelectorAll('.rep-f').forEach(b=>b.addEventListener('click',()=>{rs.fmt=b.dataset.fmt;document.querySelectorAll('.rep-f').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
function notesHTML(){
 const fs=facs(),ix=idxs();const P=k=>planTD(k,fs,ix),A=k=>sumA(k,fs,ix);
 const pr=A('proc'),pd=A('prod'),ex=A('exp');const conv=pd?pr/pd:null;
 const ixPL=ix.filter(i=>cmOf(fs).includes(i));const net=w=>ixPL.reduce((t,i)=>{const g=k=>fs.reduce((a,f)=>a+PL[f][k][w][i],0);return t+g('rexp')+g('rpulp')-['raw','oth','mkt','salL','salF','admin','maint','support','asset','othI','int'].reduce((a,k)=>a+g(k),0)},0);
 const nA=net('a'),nP=net('p');
 const it=[
  ['ເກັບຊື້ມັນຕົ້ນ',P('proc')?pr/P('proc'):null,`${fmt(pr)} / ${fmt(P('proc'))} ໂຕນ`,'ທຽບແຜນເຖິງມື້ນີ້'],
  ['ຜະລິດແປ້ງ',P('prod')?pd/P('prod'):null,`${fmt(pd,1)} / ${fmt(P('prod'))} ໂຕນ`,`ອັດຕາແປງ ${conv?fmt(conv,2):'—'} : 1 · ແຜນ ${planConv(fs)?fmt(planConv(fs),2):'—'}`],
  ['ສົ່ງອອກແປ້ງ',P('exp')?ex/P('exp'):null,`${fmt(ex)} / ${fmt(P('exp'))} ໂຕນ`,owe(fs)],
  ['ກຳໄລ/ຂາດທຶນ ສຸດທິ',ixPL.length?ach(nA,nP):null,ixPL.length?`${mcny(nA)} / ${mcny(nP)} ລ້ານ ຢວນ`:'ຍັງບໍ່ມີຂໍ້ມູນ','ຕົວຈິງ / ແຜນ'],
  (()=>{const e=fs.reduce((t,f)=>t+PU[f].exp,0),pp=e?fs.reduce((t,f)=>t+PU[f].rexp,0)/e:0,ap=sumA('invT',fs,ix)?sumA('inv',fs,ix)/sumA('invT',fs,ix):null;return ['ລາຄາຂາຍແປ້ງ',ap?ap/pp:null,ap?`${fmt(ap)} / ${fmt(pp)} ຢວນ/ໂຕນ`:'ຍັງບໍ່ມີການສົ່ງອອກ','ສະເລ່ຍ ຕາມມື້ສົ່ງອອກ']})()];
 return `<div class="rn">${it.map(([t,r,v,d])=>{const c=r==null?'mute':r>=1?'good':r>=.9?'warn':'crit';const ic=c==='good'?'✓':c==='warn'?'!':c==='crit'?'✕':'–';
  return `<div class="rn-i ${c}"><span class="rn-ic">${ic}</span><div class="rn-b"><div class="rn-h"><b>${t}</b><span class="rn-v">${r==null?'—':pct(r)}</span></div><div class="rn-bar"><i style="width:${r==null?0:Math.max(0,Math.min(1,r))*100}%"></i></div><div class="rn-d"><span>${v}</span><span>${d}</span></div></div></div>`}).join('')}</div>`}
function cloneBlock(b){
 if(b.notes)return notesHTML();
 const src=document.getElementById(b.id);if(!src)return '';
 const c=src.cloneNode(true);c.removeAttribute('id');c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
 let html=c.outerHTML;
 if(src.tagName==='TABLE')html=`<div class="tbl">${html}</div>`;
 if(b.leg){const lg=src.parentElement.querySelector('.legend');if(lg)html+=lg.outerHTML}
 return html}
function inlineSvg(root){root.querySelectorAll('svg, svg *').forEach(el=>{const cs=getComputedStyle(el);['fill','stroke','stroke-width','stroke-dasharray','font-size','font-family','opacity'].forEach(p=>{const v=cs.getPropertyValue(p);if(v)el.style.setProperty(p,v)})});root.querySelectorAll('.hit').forEach(h=>h.remove())}
function cardHTML(b){if(b.stack)return `<div class="rp-stack">${b.stack.map(cardHTML).join('')}</div>`;return b.plain?`<div class="rp-plain">${cloneBlock(b)}</div>`:`<div class="rp-card">${b.t?`<h3>${b.t}</h3>`:''}${cloneBlock(b)}</div>`}
const REP_ORDER=['overview','procure','produce','sales','cost','stock','debt'];
function buildPages(type,start=0,total=null){
 const r=REP[type],stage=$('#repStage');const logo=document.querySelector('.brand img').src;const today=dfmt(new Date());
 const n=total||r.pages.length;
 stage.innerHTML=r.pages.map((rows,pi)=>`<div class="rp-page"><div class="rp-head"><img src="${logo}" alt=""><div><div class="co">LS 农业集团 · LS Trading Export-Import</div><h1>Report ${r.lo}</h1></div>
  <div class="rp-meta"><b>${st.f==='all'?'ພາບລວມ 2 ໂຮງງານ':'ໂຮງງານ '+FN[st.f]}</b><br>${pname()}<br>ອອກ Report: ${today}</div></div>
  <div class="rp-body"><div class="rp-inner">${rows.map(row=>`<div class="rp-row" style="grid-template-columns:${row.map(b=>`minmax(0,${b.w||1}fr)`).join(' ')}">${row.map(b=>cardHTML(b)).join('')}</div>`).join('')}</div></div>
  <div class="rp-foot"><span>ອັບເດດຂໍ້ມູນລ່າສຸດ: <b>${dfmt(lastData())}</b> · ${asOfTxt()}</span><span>ໜ້າ ${start+pi+1} / ${n}</span></div></div>`).join('');
 stage.querySelectorAll('.rp-page').forEach(pg=>{inlineSvg(pg);pg.querySelectorAll('.rp-card .tbl').forEach(w=>{const t=w.querySelector('table');let f=10.5;while(t&&t.scrollWidth>w.clientWidth+1&&f>7.5){f-=.5;t.style.fontSize=f+'px';t.querySelectorAll('td,th').forEach(c=>c.style.padding='3px 4px')}});const body=pg.querySelector('.rp-body'),inner=pg.querySelector('.rp-inner');const H=body.clientHeight,W=body.clientWidth,h=inner.scrollHeight;
  if(h>H){const k=H/h;inner.style.transform=`scale(${k})`;inner.style.width=(W/k)+'px'}
  pg.querySelectorAll('*').forEach(el=>{const cs=getComputedStyle(el);if(cs.backgroundImage!=='none'){const r=el.getBoundingClientRect();if(r.width<4||r.height<4){el.style.backgroundImage='none';el.style.backgroundColor=cs.backgroundColor==='rgba(0, 0, 0, 0)'?'#1e8a45':cs.backgroundColor}}})});
 return [...stage.querySelectorAll('.rp-page')]}
async function makePDF(type){
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
 if(document.fonts&&document.fonts.ready)await document.fonts.ready;
 const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'landscape',compress:true});
 const types=Array.isArray(type)?type:type==='all'?REP_ORDER:[type];const total=types.reduce((t,k)=>t+REP[k].pages.length,0);let start=0,first=true;
 for(const t of types){const pages=buildPages(t,start,total);start+=pages.length;
  for(let i=0;i<pages.length;i++){if(types.length>1)$('#repStatus').textContent=`ກຳລັງສ້າງ PDF … ໜ້າ ${start-pages.length+i+1} / ${total}`;
   const cv=await window.html2canvas(pages[i],{scale:types.length>1?3:3.5,backgroundColor:'#ffffff',useCORS:true,logging:false});if(!first)pdf.addPage();first=false;pdf.addImage(cv.toDataURL('image/png'),'PNG',0,0,297,210,undefined,'FAST')}}
 $('#repStage').innerHTML='';return pdf.output('arraybuffer')}
function makeXLSX(type){
 if(Array.isArray(type))return makeXLSXAll(type);if(type==='all')return makeXLSXAll();
 const r=REP[type],wb=XLSX.utils.book_new();const used=new Set();
 const info=[['Report',r.lo],['ບໍລິສັດ','LS Trading Export-Import Co., Ltd'],['ໂຮງງານ',st.f==='all'?'ພາບລວມ 2 ໂຮງງານ':FN[st.f]],['ໄລຍະ',pname()],['ອອກ Report',dfmt(new Date())],['ແຜນ','ແຜນລະດູ '+SEASON],['ຕົວຈິງ','Summary Monthly Report 2026-2027'],[]];
 r.pages.flat(2).forEach(b=>{const el=b.id&&document.getElementById(b.id);if(!el)return;el.querySelectorAll('.kpi').forEach(k=>info.push([k.querySelector('.lbl')?.textContent.trim(),k.querySelector('.v')?.textContent.trim(),k.querySelector('.d')?.textContent.trim()]));
  el.querySelectorAll('.step').forEach(k=>info.push([k.querySelector('.lbl')?.textContent.trim(),k.querySelector('.big')?.textContent.trim(),k.querySelector('.sub')?.textContent.trim()]))});
 const ws0=XLSX.utils.aoa_to_sheet(info);ws0['!cols']=[{wch:28},{wch:22},{wch:48}];XLSX.utils.book_append_sheet(wb,ws0,'ສະຫຼຸບ');
 r.pages.flat(2).forEach(b=>{if(!b.id||!b.t)return;const el=document.getElementById(b.id);const tb=el&&(el.tagName==='TABLE'?el:null);if(!tb)return;
  let name=b.t.replace(/[\\\/\?\*\[\]:]/g,' ').slice(0,30).trim();while(used.has(name))name=name.slice(0,28)+'_2';used.add(name);
  const ws=XLSX.utils.table_to_sheet(tb,{raw:false});XLSX.utils.book_append_sheet(wb,ws,name)});
 // monthly plan vs actual data
 const fs=facs();const rows=[['ເດືອນ','ແຜນ ເກັບຊື້ (ໂຕນ)','ຕົວຈິງ ເກັບຊື້ (ໂຕນ)','ແຜນ ຜະລິດ (ໂຕນ)','ຕົວຈິງ ຜະລິດ (ໂຕນ)','ແຜນ ສົ່ງອອກ (ໂຕນ)','ຕົວຈິງ ສົ່ງອອກ (ໂຕນ)']];
 M.forEach((m,i)=>rows.push([m,...['proc','prod','exp'].flatMap(k=>[+fs.reduce((t,f)=>t+plan[f][k][i],0).toFixed(1),i<NOWI?+fs.reduce((t,f)=>t+act[f][k][i],0).toFixed(1):null])]));
 if(['overview','procure','produce','sales'].includes(type))XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'ແຜນ VS ຕົວຈິງ ລາຍເດືອນ');
 return XLSX.write(wb,{bookType:'xlsx',type:'array'})}
function makeXLSXAll(LIST=REP_ORDER){
 const wb=XLSX.utils.book_new();const used=new Set();
 const info=[['Report',LIST.length===REP_ORDER.length?'ລວມທຸກ Report':LIST.map(t=>REP[t].lo).join(' + ')],['ບໍລິສັດ','LS Trading Export-Import Co., Ltd'],['ໂຮງງານ',st.f==='all'?'ພາບລວມ 2 ໂຮງງານ':FN[st.f]],['ໄລຍະ',pname()],['ອອກ Report',dfmt(new Date())],[]];
 LIST.forEach(t=>{const r=REP[t];info.push([`— ${r.lo} —`]);r.pages.flat(2).flatMap(b=>b.stack?b.stack:[b]).forEach(b=>{const el=b.id&&document.getElementById(b.id);if(!el)return;
  el.querySelectorAll('.kpi').forEach(k=>info.push([k.querySelector('.lbl')?.textContent.trim(),k.querySelector('.v')?.textContent.trim(),k.querySelector('.d')?.textContent.trim()]));
  el.querySelectorAll('.step').forEach(k=>info.push([k.querySelector('.lbl')?.textContent.trim(),k.querySelector('.big')?.textContent.trim(),k.querySelector('.sub')?.textContent.trim()]))});info.push([])});
 const ws0=XLSX.utils.aoa_to_sheet(info);ws0['!cols']=[{wch:30},{wch:22},{wch:52}];XLSX.utils.book_append_sheet(wb,ws0,'ສະຫຼຸບ');used.add('ສະຫຼຸບ');
 const SH={overview:'ພາບລວມ',procure:'ເກັບຊື້',produce:'ຜະລິດ',sales:'ສົ່ງອອກ',cost:'ຕົ້ນທຶນ',stock:'ສາງ',debt:'ໜີ້ສິນ'};const seen=new Set();
 LIST.forEach(t=>REP[t].pages.flat(2).flatMap(b=>b.stack?b.stack:[b]).forEach(b=>{if(!b.id||!b.t||seen.has(b.id))return;const el=document.getElementById(b.id);if(!el||el.tagName!=='TABLE')return;seen.add(b.id);
  let name=(SH[t]+' · '+b.t).replace(/[\\\/\?\*\[\]:]/g,' ').slice(0,31).trim();let k=2;while(used.has(name)){name=name.slice(0,28)+'_'+k++}used.add(name);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.table_to_sheet(el,{raw:false}),name)}));
 const fs=facs();const rows=[['ເດືອນ','ແຜນ ເກັບຊື້ (ໂຕນ)','ຕົວຈິງ ເກັບຊື້ (ໂຕນ)','ແຜນ ຜະລິດ (ໂຕນ)','ຕົວຈິງ ຜະລິດ (ໂຕນ)','ແຜນ ສົ່ງອອກ (ໂຕນ)','ຕົວຈິງ ສົ່ງອອກ (ໂຕນ)']];
 M.forEach((m,i)=>rows.push([m,...['proc','prod','exp'].flatMap(k=>[+fs.reduce((t,f)=>t+plan[f][k][i],0).toFixed(1),i<NOWI?+fs.reduce((t,f)=>t+act[f][k][i],0).toFixed(1):null])]));
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'ແຜນ VS ຕົວຈິງ ລາຍເດືອນ');
 return XLSX.write(wb,{bookType:'xlsx',type:'array'})}
window.__lsReport={makePDF,makeXLSX,REP};
$('#repGo').addEventListener('click',async()=>{
 const go=$('#repGo'),stt=$('#repStatus');go.disabled=true;stt.textContent=rs.fmt==='pdf'?'ກຳລັງສ້າງ PDF …':'ກຳລັງສ້າງ Excel …';
 try{
  if(rs.fmt==='xlsx'&&!window.XLSX)throw new Error('xlsx');
  if(!rs.sel.length){stt.textContent='ເລືອກ Report ຢ່າງໜ້ອຍ 1 ອັນ';return}
  const RT=rs.sel.length===1?rs.sel[0]:rs.sel;const data=rs.fmt==='pdf'?await makePDF(RT):makeXLSX(RT);
  const fname=`LS_Report_${rs.sel.length===REP_ORDER.length?'all-reports':rs.sel.map(t=>REP[t].en).join('+')}_${st.f==='all'?'all':st.f==='xan'?'SNK':'MN'}_${isoOf(new Date())}.${rs.fmt}`;
  const url=URL.createObjectURL(new Blob([data],{type:rs.fmt==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download=fname;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);stt.textContent='ດາວໂຫຼດແລ້ວ: '+fname;
 }catch(err){console.error(err);const c=err&&err.code;stt.textContent=c==='declined'?'ຍົກເລີກການບັນທຶກ.':c==='rate_limited'?'ມີໜ້າຕ່າງບັນທຶກເປີດຢູ່ແລ້ວ. ລໍຖ້າແລ້ວລອງໃໝ່.':(err&&err.message==='load')?'ໂຫຼດເຄື່ອງມືສ້າງ PDF ບໍ່ສຳເລັດ. ກວດອິນເຕີເນັດ ແລ້ວລອງໃໝ່.':'ສ້າງ Report ບໍ່ສຳເລັດ. ລອງໃໝ່ອີກຄັ້ງ.'}
 finally{go.disabled=false}});

/* ===== Debt obligations (Supabase) ===== */
const TXL={draw:'ເບີກເງິນກູ້',repay:'ຊຳລະຕົ້ນທຶນ',int:'ຊຳລະດອກເບ້ຍ',adj:'ປັບຍອດ'};
const PUR={fix:'ທຶນຄົງທີ່',wc:'ທຶນໝູນວຽນ'};
const isoD=s=>{if(!s)return '—';const [y,m,d]=String(s).slice(0,10).split('-');return `${d}/${m}/${y}`};
const toK=(v,cur)=>cur==='CNY'?v*FX:v;
const bigK=v=>{const a=Math.abs(v);return a>=1e9?fmt(v/1e9,2)+' ຕື້':a>=1e6?fmt(v/1e6,2)+' ລ້ານ':fmt(v)};
const LN=l=>({no:l.loan_no,cur:l.currency,limit:+l.limit_amt||0,bal:+l.balance||0,rate:+l.rate||0,avail:+l.available||0,intDue:+l.interest_due||0,purpose:l.purpose,mat:l.maturity,period:l.interest_period});
function renderDebt(){
 const L=LOANS.map(LN);if(!L.length){$('#tDebt').innerHTML='<tbody><tr><td class="src">ຍັງບໍ່ມີຂໍ້ມູນເງິນກູ້ (ແລ່ນ seed.sql ກ່ອນ)</td></tr></tbody>';return}
 const sum=f=>L.reduce((t,l)=>t+toK(f(l),l.cur),0);
 const lim=sum(l=>l.limit),bal=sum(l=>l.bal),av=sum(l=>l.avail),idue=sum(l=>l.intDue);
 const wc=L.filter(l=>l.purpose==='wc');const wcLim=wc.reduce((t,l)=>t+toK(l.limit,l.cur),0);
 const SS=isoOf(S0);const sx=LTX.filter(t=>t.date>=SS);const lc=no=>(L.find(l=>l.no===no)||{cur:'LAK'}).cur;
 const sDraw=sx.filter(t=>t.type==='draw');const dK=sDraw.reduce((a,t)=>a+toK(+t.amount,lc(t.loan_no)),0);
 $('#kDebt').innerHTML=kpi('ວົງເງິນອະນຸມັດ',bigK(lim),'ກີບ',`${L.length} ບັນຊີ · ທຶນຄົງທີ່ ${bigK(lim-wcLim)} · ທຶນໝູນວຽນ ${bigK(wcLim)}`)+
  kpi('ຍອດເຫຼືອໜີ້',bigK(bal),'ກີບ',`${pct(bal/lim)} ຂອງວົງເງິນອະນຸມັດ`)+
  kpi('ວົງເງິນ ທີ່ຍັງສາມາດນຳໃຊ້ໄດ້',bigK(av),'ກີບ',`${pct(av/lim)} ຂອງວົງເງິນອະນຸມັດ`)+
  kpi('ວົງເງິນ ທີ່ນຳໃຊ້ໃນລະດູນີ້',bigK(dK),'ກີບ',`ເບີກ ${sDraw.length} ຄັ້ງ ແຕ່ ${isoD(SS)}`);
 const fx=SET.fx||{};$('#debtNote').textContent=`${L.length} ບັນຊີ · ອັດຕາ ${fmt(FX)} ກີບ/ຢວນ (${fx.source||''} ${isoD(fx.date)})`;
 $('#fxRate').value=FX;$('#fxDate').value=fx.date||'';$('#fxInfo').textContent=`ໃຊ້ຢູ່: ${fmt(FX)} · ${isoD(fx.date)}`;
 const now=new Date();const per=L.find(l=>l.period)?.period;
 $('#tDebt').innerHTML=`<thead><tr><th>ລ/ດ</th><th>ເລກບັນຊີເງິນກູ້</th><th>ສະກຸນ</th><th class="n">ວົງເງິນອະນຸມັດ</th><th class="n">ຍອດເຫຼືອໜີ້</th><th>ໃຊ້ວົງເງິນ</th><th class="n">ອັດຕາ</th><th class="n">ຍັງເບີກໄດ້</th><th class="n">ດອກເບ້ຍຄ້າງຊຳລະ${per?`<br><span class="src">ເດືອນ ${esc(per)}</span>`:''}</th><th>ເປົ້າໝາຍ</th><th>ຄົບກຳນົດ</th></tr></thead><tbody>`+
  L.map((l,i)=>{const u=l.limit?l.bal/l.limit:0;const md=toDate(l.mat);
   return `<tr><td>${i+1}</td><td class="mono">${l.no}</td><td>${l.cur}</td><td class="n">${fmt(l.limit)}</td><td class="n"><b>${fmt(l.bal)}</b></td><td><span class="use"><span class="ab-t"><i style="width:${Math.min(1,u)*100}%"></i></span>${pct(u)}</span></td><td class="n">${fmt(l.rate,2)}%</td><td class="n">${l.avail?fmt(l.avail):'0'}</td><td class="n">${l.intDue?`<span class="pill warn">${fmt(l.intDue)}</span>`:'—'}</td><td><span class="tag ${l.purpose}">${PUR[l.purpose]||''}</span></td><td>${isoD(l.mat)}<div class="src">${(()=>{if(!md)return '';if(md<=now)return 'ຄົບແລ້ວ';let m=(md.getFullYear()-now.getFullYear())*12+md.getMonth()-now.getMonth()-(md.getDate()<now.getDate()?1:0);const y=Math.floor(m/12);m%=12;return 'ເຫຼືອ '+(y?y+' ປີ ':'')+(m?m+' ເດືອນ':'')})()}</div></td></tr>`}).join('')+
  `<tr class="total"><td colspan="3">ລວມ ທຽບເທົ່າກີບ</td><td class="n">${fmt(lim)}</td><td class="n">${fmt(bal)}</td><td>${pct(bal/lim)}</td><td></td><td class="n">${fmt(av)}</td><td class="n">${fmt(idue)}</td><td colspan="2"></td></tr></tbody>`;
 const opts=L.map(l=>`<option value="${l.no}">${l.no} (${l.cur} · ${PUR[l.purpose]||''})</option>`).join('');
 const wcNo=(L.find(l=>l.purpose==='wc'&&l.cur==='CNY')||L[0]).no;
 const keep=$('#txLoan').value||wcNo;$('#txLoan').innerHTML=opts;$('#txLoan').value=keep;$('#txCur').textContent='('+(L.find(l=>l.no===$('#txLoan').value)||L[0]).cur+')';
 const kb=$('#balLoan').value||wcNo;$('#balLoan').innerHTML=opts;$('#balLoan').value=kb;
 const tx=LTX.slice().sort((a,b)=>b.date.localeCompare(a.date)||(b.id-a.id));
 $('#tTx').innerHTML=`<thead><tr><th>ວັນທີ</th><th>ເງິນກູ້</th><th>ລາຍການ</th><th class="n">ຈຳນວນ</th><th>ສະກຸນ</th><th class="n">ທຽບເທົ່າກີບ</th><th>ໝາຍເຫດ</th></tr></thead><tbody>`+
  (tx.length?tx.map(t=>{const cur=lc(t.loan_no);return `<tr><td>${isoD(t.date)}</td><td class="mono">${t.loan_no}</td><td><span class="tag ${t.type}">${TXL[t.type]}</span></td><td class="n">${t.type==='adj'?'—':(t.type==='draw'?'+':'−')+fmt(t.amount)}</td><td>${cur}</td><td class="n">${t.type==='adj'?'—':fmt(toK(+t.amount,cur))}</td><td>${esc(t.note||'')}</td></tr>`}).join(''):'<tr><td colspan="7" class="src">ຍັງບໍ່ມີລາຍການ</td></tr>')+'</tbody>';
 renderBal();
}
function renderBal(){
 const no=$('#balLoan').value;const l=LOANS.map(LN).find(x=>x.no===no);if(!l)return;
 const tx=LTX.filter(t=>t.loan_no===no&&t.type!=='int').slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
 let b=l.bal;const pts=[];for(let k=tx.length-1;k>=0;k--){const t=tx[k];pts.unshift([isoD(t.date).slice(0,5),b,t]);if(t.type==='draw')b-=+t.amount;else if(t.type==='repay')b+=+t.amount;else if(t.type==='adj'&&t.prev_balance!=null)b=+t.prev_balance}
 pts.unshift(['ກ່ອນ',b,null]);
 const u=l.cur==='CNY'?1e6:1e9,un=l.cur==='CNY'?'ລ້ານ ຢວນ':'ຕື້ ກີບ';
 $('#balNote').textContent=`${l.no} · ${un}`;
 if(pts.length<2){$('#chBal').innerHTML='<p class="issue">ຍັງບໍ່ມີລາຍການເບີກ ຫຼື ຊຳລະ ຂອງເງິນກູ້ນີ້</p>';return}
 const cats=pts.map(p=>p[0]),bal=pts.map(p=>p[1]/u),flow=pts.map(p=>p[2]?(p[2].type==='draw'?+p[2].amount:p[2].type==='repay'?-p[2].amount:0)/u:0);
 const W=560,H=250,Pd={l:52,r:14,t:16,b:30},iw=W-Pd.l-Pd.r,ih=H-Pd.t-Pd.b;
 const mx=Math.max(...bal,...flow,0),mn=Math.min(...flow,0);const st_=niceStep((mx-mn)/5||1);const top=Math.ceil(mx/st_)*st_,bot=Math.floor(mn/st_)*st_;
 const y=v=>Pd.t+ih-(v-bot)/(top-bot||1)*ih,gw=iw/cats.length,x=i=>Pd.l+gw*(i+.5),bw=Math.min(22,gw*.38);
 let g=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="ຍອດໜີ້ ແລະ ການເບີກ-ຊຳລະ">`;
 for(let v=bot;v<=top+1e-9;v+=st_)g+=`<line class="grid" x1="${Pd.l}" x2="${W-Pd.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${Pd.l-6}" y="${y(v)+4}" text-anchor="end">${fmt(v,st_<1?1:0)}</text>`;
 g+=`<line class="base" x1="${Pd.l}" x2="${W-Pd.r}" y1="${y(0)}" y2="${y(0)}"/>`;
 flow.forEach((v,i)=>{if(!v)return;const y0=y(0),yv=y(v);g+=`<rect x="${x(i)-bw/2}" y="${Math.min(y0,yv)}" width="${bw}" height="${Math.max(1,Math.abs(yv-y0))}" rx="3" fill="${v>0?'#e0a33a':'var(--good)'}"/><text x="${x(i)}" y="${v>0?yv-6:yv+14}" text-anchor="middle" style="fill:${v>0?'#a86500':'var(--good)'};font-weight:700">${v>0?'+':''}${fmt(v,2)}</text>`});
 let d='';bal.forEach((v,i)=>d+=(i?'L':'M')+x(i)+','+y(v));g+=`<path d="${d}" fill="none" stroke="var(--forest-2)" stroke-width="2.5"/>`;
 bal.forEach((v,i)=>{const t=pts[i][2];g+=`<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="var(--forest-2)" stroke="var(--surface)" stroke-width="2"/><text x="${x(i)}" y="${y(v)-10}" text-anchor="middle" style="fill:var(--forest);font-weight:700;font-size:11.5px;paint-order:stroke;stroke:var(--surface);stroke-width:3px">${fmt(v,2)}</text>`;
  g+=`<rect class="hit" x="${x(i)-gw/2}" y="${Pd.t}" width="${gw}" height="${ih}" data-tip="${q(`<b>${t?isoD(t.date):'ກ່ອນລາຍການທຳອິດ'}</b>${t?`<br>${TXL[t.type]}: ${fmt(t.amount)} ${l.cur}`:''}<br>ຍອດໜີ້ຫຼັງລາຍການ: ${fmt(pts[i][1])} ${l.cur}`)}"/><text x="${x(i)}" y="${H-10}" text-anchor="middle">${cats[i]}</text>`});
 g+='</svg>';
 const dr=tx.filter(t=>t.type==='draw'),rp=tx.filter(t=>t.type==='repay');const sD=dr.reduce((a,t)=>a+ +t.amount,0),sR=rp.reduce((a,t)=>a+ +t.amount,0);
 const days=dr.length>1?(toDate(dr[dr.length-1].date)-toDate(dr[0].date))/864e5/(dr.length-1):null;
 g+=`<div class="legend" style="margin-top:6px"><span><i class="line" style="background:var(--forest-2);height:3px"></i>ຍອດໜີ້ ຫຼັງລາຍການ</span><span><i style="background:#e0a33a"></i>ເບີກເງິນກູ້</span><span><i style="background:var(--good)"></i>ຊຳລະຕົ້ນທຶນ</span></div>
  <div class="kpis" style="margin-top:12px;grid-template-columns:repeat(4,minmax(0,1fr))">${kpi('ເບີກ',dr.length,'ຄັ້ງ',`ລວມ ${fmt(sD/u,2)} ${un}`)}${kpi('ສະເລ່ຍ ຕໍ່ຄັ້ງ',dr.length?fmt(sD/dr.length/u,2):'—',un,'ຂະໜາດການເບີກ')}${kpi('ຄວາມຖີ່',days?fmt(days,0):'—','ມື້/ຄັ້ງ','ໄລຍະຫ່າງ ລະຫວ່າງການເບີກ')}${kpi('ຊຳລະ',rp.length,'ຄັ້ງ',`ລວມ ${fmt(sR/u,2)} ${un}`)}</div>`;
 $('#chBal').innerHTML=g;
}
$('#balLoan').addEventListener('change',renderBal);
$('#txLoan').addEventListener('change',()=>{const l=LOANS.find(x=>x.loan_no===$('#txLoan').value);if(l)$('#txCur').textContent='('+l.currency+')'});
$('#fxSave').addEventListener('click',async()=>{const v=+$('#fxRate').value;if(!(v>0)){toast('ໃສ່ອັດຕາແລກປ່ຽນໃຫ້ຖືກຕ້ອງ');return}
 const val={rate:v,date:$('#fxDate').value||isoOf(new Date()),source:'ປັບໂດຍ '+USERNAME};const {error}=await sb.from('settings').upsert({key:'fx',value:val,updated_at:new Date().toISOString()});
 if(error){toast('ບັນທຶກບໍ່ສຳເລັດ: '+error.message);return}SET.fx=val;FX=v;render();renderDebt();toast('ອັບເດດອັດຕາແລກປ່ຽນແລ້ວ: '+fmt(v)+' ກີບ/ຢວນ')});
$('#txDate').value=isoOf(new Date());
$('#txForm').addEventListener('submit',async e=>{e.preventDefault();const msg=$('#txMsg');
 const row=LOANS.find(x=>x.loan_no===$('#txLoan').value);if(!row)return;const l=LN(row);const t=$('#txType').value;const amt=+$('#txAmt').value;const d=$('#txDate').value;
 if(!d){msg.textContent='ເລືອກວັນທີ';return}if(!(amt>0)){msg.textContent='ໃສ່ຈຳນວນເງິນ ຫຼາຍກວ່າ 0';return}
 if(t==='draw'&&amt>l.avail){msg.textContent=`ເບີກເກີນວົງເງິນ: ຍັງເບີກໄດ້ ${fmt(l.avail)} ${l.cur}`;return}
 if(t==='repay'&&amt>l.bal){msg.textContent=`ຊຳລະເກີນຍອດໜີ້: ຍອດເຫຼືອ ${fmt(l.bal)} ${l.cur}`;return}
 const upd={};if(t==='draw'){upd.balance=l.bal+amt;upd.available=l.avail-amt}else if(t==='repay'){upd.balance=l.bal-amt;if(l.purpose==='wc')upd.available=l.avail+amt}else{upd.interest_due=Math.max(0,l.intDue-amt)}
 msg.textContent='ກຳລັງບັນທຶກ …';
 const r1=await sb.from('loan_txns').insert({date:d,loan_no:l.no,type:t,amount:amt,prev_balance:l.bal,note:$('#txNote').value.trim()||null});if(r1.error){msg.textContent='ບັນທຶກບໍ່ສຳເລັດ: '+r1.error.message;return}
 const r2=await sb.from('loans').update(upd).eq('loan_no',l.no);if(r2.error){msg.textContent='ອັບເດດຍອດບໍ່ສຳເລັດ: '+r2.error.message;return}
 Object.assign(row,upd);LTX=await fetchAll('loan_txns');renderDebt();$('#txAmt').value='';$('#txNote').value='';msg.textContent=`ບັນທຶກແລ້ວ: ${TXL[t]} ${fmt(amt)} ${l.cur}`;toast(`ບັນທຶກແລ້ວ: ${TXL[t]} ${fmt(amt)} ${l.cur} · ${l.no}`)});

/* page zoom (per viewer) */
const ZS=[.7,.8,.9,1,1.1,1.25,1.4,1.6];let zi=3;
try{const v=+localStorage.getItem('ls-zoom');const k=ZS.indexOf(v);if(k>=0)zi=k}catch(e){}
function applyZoom(){document.documentElement.style.setProperty('--zoom',ZS[zi]);$('#zReset').textContent=Math.round(ZS[zi]*100)+'%';$('#zOut').disabled=zi===0;$('#zIn').disabled=zi===ZS.length-1;try{localStorage.setItem('ls-zoom',ZS[zi])}catch(e){}}
$('#zIn').addEventListener('click',()=>{if(zi<ZS.length-1){zi++;applyZoom()}});
$('#zOut').addEventListener('click',()=>{if(zi>0){zi--;applyZoom()}});
$('#zReset').addEventListener('click',()=>{zi=3;applyZoom()});
applyZoom();

/* ===== Login & startup ===== */
const DOMAIN=CFG.usernameDomain||'ls.local';
function showLogin(msg){$('#app').hidden=true;$('#login').hidden=false;$('#loginMsg').textContent=msg||'';setTimeout(()=>$('#lgUser').focus(),50)}
function buildPeriodOpts(){const sel=$('#period');sel.innerHTML=`<option value="season">ລະດູ ${SEASON} (ເຖິງປັດຈຸບັນ)</option>`+[...Array(NOWI+1).keys()].map(i=>`<option value="${i}">${M[i]}</option>`).join('');
 if(st.p!=='season'&&!(+st.p<=NOWI))st.p='season';sel.value=st.p}
async function refreshAll(){await loadAll();buildPeriodOpts();render();renderDebt()}
async function startApp(session){
 $('#login').hidden=true;$('#app').hidden=false;$('#loading').hidden=false;
 USERNAME=(session.user.email||'').split('@')[0];
 const {data}=await sb.from('user_roles').select('role,username').eq('user_id',session.user.id).maybeSingle();ROLE=data&&data.role==='admin'?'admin':'viewer';
 document.body.classList.toggle('is-admin',ROLE==='admin');
 $('#who').textContent=`${USERNAME} · ${ROLE==='admin'?'ຜູ້ດູແລ':'ຜູ້ເບິ່ງ'}`;
 try{await refreshAll()}catch(e){toast('ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: '+(e.message||e))}
 $('#loading').hidden=true;route();
}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const u=$('#lgUser').value.trim().toLowerCase(),p=$('#lgPass').value;
 if(!u||!p){$('#loginMsg').textContent='ໃສ່ຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ';return}
 $('#loginBtn').disabled=true;$('#loginMsg').textContent='ກຳລັງເຂົ້າລະບົບ …';
 const email=u.includes('@')?u:`${u}@${DOMAIN}`;const {data,error}=await sb.auth.signInWithPassword({email,password:p});$('#loginBtn').disabled=false;
 if(error){$('#loginMsg').textContent='ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ';return}$('#lgPass').value='';startApp(data.session)});
$('#logout').addEventListener('click',async()=>{await sb.auth.signOut();showLogin('ອອກຈາກລະບົບແລ້ວ')});
(async()=>{const {data}=await sb.auth.getSession();if(data.session)startApp(data.session);else showLogin()})();


})();
