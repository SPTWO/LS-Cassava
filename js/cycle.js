// Business-cycle animation for the factory overview tab (option B). GSAP loads only when the tab is first opened.
(()=>{
function init(){
/* ---------- detailed scene art (each scene: 240 x 150 units, own gradient ids) ---------- */
const DEFS=k=>`
 <linearGradient id="sky${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe2f6"/><stop offset="1" stop-color="#f3fbff"/></linearGradient>
 <linearGradient id="grass${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6d98a"/><stop offset="1" stop-color="#78b85f"/></linearGradient>
 <linearGradient id="wall${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8ed"/></linearGradient>
 <linearGradient id="side${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd7de"/><stop offset="1" stop-color="#b8c2ca"/></linearGradient>
 <linearGradient id="roof${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fa2dd"/><stop offset="1" stop-color="#3f73b8"/></linearGradient>
 <linearGradient id="metal${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c3ccd3"/><stop offset=".35" stop-color="#f7f9fa"/><stop offset="1" stop-color="#9eabb5"/></linearGradient>
 <linearGradient id="glass${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f0ff"/><stop offset="1" stop-color="#7fb3df"/></linearGradient>
 <linearGradient id="road${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f99a1"/><stop offset="1" stop-color="#6f7a83"/></linearGradient>
 <linearGradient id="soil${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a5b"/><stop offset="1" stop-color="#94673d"/></linearGradient>
 <linearGradient id="mtn${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb4c8"/><stop offset="1" stop-color="#c9d6e2"/></linearGradient>
 <radialGradient id="root${k}" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#b07a45"/><stop offset="1" stop-color="#6e4520"/></radialGradient>
 <radialGradient id="coin${k}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f2c200"/><stop offset="1" stop-color="#b8890a"/></radialGradient>
 <filter id="sd${k}" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="1" dy="2" stdDeviation="1.4" flood-color="#14301d" flood-opacity=".22"/></filter>
 <filter id="bl${k}"><feGaussianBlur stdDeviation="1.2"/></filter>`;
const SKY=(k,h=150)=>`<rect x="0" y="0" width="240" height="${h}" fill="url(#sky${k})"/>`;
const CLOUD=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><g class="cld"><ellipse cx="0" cy="0" rx="13" ry="5" fill="#fff"/><circle cx="-4" cy="-3" r="6" fill="#fff"/><circle cx="4" cy="-4" r="7.5" fill="#fff"/></g></g>`;
const SHADOW=(x,y,rx,ry=2)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#14301d" opacity=".18"/>`;
/* person: origin at feet; arm = class of the front arm, pivot written to data-o in scene units */
function MAN(x,y,o={}){const s=o.s||1,sh=o.shirt||'#3f6fb5',pa=o.pants||'#2d3640',sk=o.skin||'#e2b48a',flip=o.flip?-1:1;
 const hat=o.hat==='straw'?`<ellipse cx="0" cy="-38.2" rx="9.5" ry="2.2" fill="#e9c46a" stroke="#c9a24a" stroke-width=".6"/><path d="M-5 -38.5 q5 -7 10 0z" fill="#e9c46a" stroke="#c9a24a" stroke-width=".6"/>`
  :o.hat==='cap'?`<path d="M-5.3 -37 a5.3 5.3 0 0 1 10.6 0z" fill="${o.hatc||'#2a3557'}"/><rect x="2" y="-37.4" width="6.5" height="1.6" rx=".8" fill="${o.hatc||'#2a3557'}"/>`
  :o.hat?`<path d="M-6 -36.6 a6 6 0 0 1 12 0z" fill="${o.hat}"/><rect x="-7.6" y="-37.2" width="15.2" height="1.9" rx=".9" fill="${o.hat}"/>`:`<path d="M-5.2 -36 a5.2 5.2 0 0 1 10.4 0 q-5 -2.2 -10.4 0z" fill="#2b2118"/>`;
 const ox=x+5*s*flip,oy=y-28*s;
 return `<g transform="translate(${x} ${y}) scale(${s*flip} ${s})"><g class="${o.cls||''}">${SHADOW(0,.6,8,2)}
  <path d="M-4.6 -16 L-4.9 -1.6 h3.7 L-.9 -16z" fill="${pa}"/><path d="M.9 -16 L1.2 -1.6 h3.7 L4.6 -16z" fill="${pa}"/>
  <rect x="-5.8" y="-2.4" width="5" height="2.6" rx="1.1" fill="#232323"/><rect x=".9" y="-2.4" width="5" height="2.6" rx="1.1" fill="#232323"/>
  <path d="M-5.2 -28 q-3.6 6 -2.8 12" stroke="${sh}" stroke-width="3.8" stroke-linecap="round" fill="none" opacity=".85"/>
  <path d="M-6.6 -30 q6.6 -3 13.2 0 l1 14.4 h-15.2z" fill="${sh}"/><path d="M2.2 -30.6 q2.2 .6 4.4 .6 l1 14.4 h-5z" fill="#000" opacity=".1"/>${o.vest?`<path d="M-6 -27 h12 M-6 -21 h12" stroke="#f2e66b" stroke-width="1.4"/>`:''}
  <rect x="-1.6" y="-32.6" width="3.2" height="3" fill="${sk}"/><circle cy="-35.2" r="5" fill="${sk}"/>${hat}
  <g class="${o.arm||''}" data-o="${ox} ${oy}"><path d="M5 -28 q3.6 6 2.6 12" stroke="${sh}" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="7.6" cy="-15.2" r="2" fill="${sk}"/>${o.hold||''}</g></g></g>`}
/* truck: origin bottom-left, ~66 long */
function TRUCK(o){const cab=o.cab||'#2f9a4a',body=o.body||'#5d7a3b';let cargo='';
 if(o.cargo==='cassava')cargo=`<path d="M3 -9 L5 -24 H42 L43 -9z" fill="${body}"/><path d="M3 -13 H43" stroke="#000" opacity=".15" stroke-width="2"/>${[[9,-25],[16,-27],[24,-26],[32,-27],[39,-25],[13,-29],[22,-30],[30,-29.5],[19,-32]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="5.4" ry="2.6" fill="url(#root${o.k})" transform="rotate(${(i*37)%50-25} ${x} ${y})"/>`).join('')}`;
 else if(o.cargo==='container')cargo=`<rect x="2" y="-31" width="42" height="22" rx="1.2" fill="${body}"/>${[...Array(13)].map((_,i)=>`<rect x="${4+i*3.1}" y="-29.5" width="1.2" height="19" fill="#000" opacity=".13"/>`).join('')}<rect x="2" y="-31" width="42" height="2.4" fill="#fff" opacity=".25"/>`;
 else if(o.cargo==='bags')cargo=`<rect x="2" y="-12" width="42" height="3" fill="#8a6a44"/>${[0,1,2].map(r=>[0,1,2,3].map(c=>`<rect x="${4+c*10}" y="${-19-r*6.6}" width="9" height="6.2" rx="2" fill="#fbfbf6" stroke="#cfd5cf" stroke-width=".5"/><rect x="${4+c*10}" y="${-15.6-r*6.6}" width="9" height="1.2" fill="#2f9a4a"/>`).join('')).join('')}`;
 return `<g class="${o.cls||''}">${SHADOW(34,1.2,33,2.6)}<rect x="1" y="-9.5" width="62" height="4.2" rx="1.5" fill="#2f3438"/>${cargo}
  <path d="M45 -9 V-26 q0 -3 3 -3 h7 q3 0 5 3 l4.2 7.5 V-9z" fill="${cab}"/><path d="M45 -12 H64" stroke="#000" opacity=".15" stroke-width="2"/>
  <path d="M48 -26 h6.6 q1.5 0 2.4 1.5 l3.4 6.2 h-12.4z" fill="url(#glass${o.k})"/><rect x="62.4" y="-14.6" width="2" height="3" rx=".8" fill="#ffe08a"/><rect x="44" y="-10.4" width="21" height="2.2" rx="1" fill="#c7ced3"/>
  ${[[13,5],[23,5],[55,5]].map(([x,r])=>`<circle cx="${x}" cy="-4.4" r="${r}" fill="#1e2225"/><circle cx="${x}" cy="-4.4" r="2.2" fill="#c9d1d6"/><circle cx="${x}" cy="-4.4" r=".8" fill="#6b757d"/>`).join('')}</g>`}
function PLANT(x,y,s,cls='lf'){return `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}"><path d="M0 0 C1 -14 -1.5 -26 .5 -38" stroke="#8a6a46" stroke-width="2.2" fill="none"/><path d="M.3 -24 l-7 -6 M.4 -30 l6 -5" stroke="#8a6a46" stroke-width="1.3"/>
 ${[-75,-45,-18,10,38,66].map((a,i)=>`<path d="M0 0 C3 -5 3 -13 0 -17 C-3 -13 -3 -5 0 0z" fill="${i%2?'#4f9f4b':'#68b85c'}" transform="translate(.5 -38) rotate(${a})"/>`).join('')}
 ${[-60,-25,15,50].map((a,i)=>`<path d="M0 0 C2.4 -4 2.4 -10 0 -13 C-2.4 -10 -2.4 -4 0 0z" fill="${i%2?'#5aad53':'#3f8f45'}" transform="translate(-6.6 -30) rotate(${a})"/>`).join('')}</g></g>`}
function PALLET(x,y,layers=3,cls=''){let b=`<rect x="-1" y="-3.2" width="34" height="3.2" fill="#9c7a52"/><rect x="0" y="-1" width="4" height="1" fill="#6e5236"/><rect x="14" y="-1" width="4" height="1" fill="#6e5236"/><rect x="28" y="-1" width="4" height="1" fill="#6e5236"/>`;
 for(let r=0;r<layers;r++)for(let c=0;c<3;c++)b+=`<rect x="${c*11}" y="${-9.6-r*6.4}" width="10.4" height="6.2" rx="2.2" fill="#fbfbf6" stroke="#cdd4cd" stroke-width=".5"/><rect x="${c*11}" y="${-6.2-r*6.4}" width="10.4" height="1.1" fill="#2f9a4a"/>`;
 return `<g transform="translate(${x} ${y})"><g class="${cls}">${SHADOW(16,.4,18,1.8)}${b}</g></g>`}


(()=>{
const K='m',NS='http://www.w3.org/2000/svg',svg=document.getElementById('road');
const el=(tag,at,p=svg)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);p.appendChild(e);return e};
const G=(html,p=svg)=>{const g=el('g',{},p);g.innerHTML=html;return g};
/* ring centreline: starts at step 1 (bottom-left), runs clockwise */
const PATH='M360,670 A240,240 0 0 1 360,190 L920,190 A240,240 0 0 1 920,670 Z';
svg.innerHTML=`<defs>${DEFS(K)}
 <filter id="rib" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#12301d" flood-opacity=".16"/></filter>
 <linearGradient id="dial" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2fae5c"/><stop offset=".6" stop-color="#f2c200"/><stop offset="1" stop-color="#e0662e"/></linearGradient>
 <radialGradient id="glw"><stop offset="0" stop-color="#fff6c2" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient></defs>`;
const probe=el('path',{d:PATH,fill:'none',stroke:'none'});const TOTAL=probe.getTotalLength();
const at=(L,off=0)=>{L=((L%TOTAL)+TOTAL)%TOTAL;const p=probe.getPointAtLength(L),q=probe.getPointAtLength((L+1)%TOTAL);let tx=q.x-p.x,ty=q.y-p.y;const n=Math.hypot(tx,ty)||1;tx/=n;ty/=n;return {x:p.x+ty*off,y:p.y-tx*off,a:Math.atan2(ty,tx)*180/Math.PI}};
const sub=(a,b)=>{if(b<a)b+=TOTAL;let d='';for(let L=a;L<=b+.01;L+=3){const p=probe.getPointAtLength(((L%TOTAL)+TOTAL)%TOTAL);d+=(d?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)}return d};
const seg=(a,b,attrs)=>[el('path',{d:sub(a,b),fill:'none',...attrs})];

/* ---------- background scenery (outside the ribbon) ---------- */
G(`<g opacity=".9"><path d="M960 250 L1010 150 L1050 210 L1100 110 L1150 190 L1190 140 L1270 260z" fill="url(#mtn${K})"/><path d="M1092 124 l8 -14 8 14 -4 -2 -4 4 -4 -4z M1003 162 l7 -12 7 12 -7 -2z M1185 150 l5 -10 5 10 -5 -2z" fill="#fff"/></g>
 <g fill="#dce7ee">${[[18,600,22,90],[44,580,18,110],[66,620,26,70],[96,640,16,50]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</g>
 ${[[40,230],[70,420],[30,500],[1250,560],[1215,690],[1240,350],[110,140]].map(([x,y],i)=>`<g transform="translate(${x} ${y})"><rect x="-1.5" y="-12" width="3" height="12" fill="#7a5a3a"/><circle cy="-16" r="${8+i%3*2}" fill="${i%2?'#7cbf6a':'#5fae5a'}"/></g>`).join('')}
 ${CLOUD(260,40,1.1)}${CLOUD(660,26,.9)}${CLOUD(1150,60,1)}`);
/* ---------- ribbon with zones ---------- */
el('path',{d:PATH,fill:'none',stroke:'#ffffff',"stroke-width":134,filter:'url(#rib)'});
el('path',{d:PATH,fill:'none',stroke:'#e7efe3',"stroke-width":122});
const Z=[ // zone per step: [start,end,color]
 [2520,300,'#e3eaf1'],[300,820,'#c4e3a8'],[820,1080,'#e1e6ea'],[1080,1340,'#dde3e8'],[1340,2100,'#cfe8c0'],[2100,2320,'#dfe2ec'],[2320,2520,'#e9e3d5']];
Z.forEach(([a,b,c])=>seg(a,b,{stroke:c,"stroke-width":122}));
// soil rows in the farm zone, river inside the right arc
seg(330,800,{stroke:'#b98a5b',"stroke-width":50,opacity:.5});
G(`<path d="M940 268 A162 162 0 0 1 940 592" fill="none" stroke="#7cc8e0" stroke-width="16" stroke-linecap="round"/><path class="rvs" d="M940 268 A162 162 0 0 1 940 592" fill="none" stroke="#e1f5fb" stroke-width="2" stroke-dasharray="4 12"/>`);
/* road + railway */
el('path',{d:PATH,fill:'none',stroke:'#8f99a1',"stroke-width":24});
const dash=el('path',{d:PATH,fill:'none',stroke:'#fff',"stroke-width":2.2,"stroke-dasharray":'12 10'});
seg(1250,2120,{stroke:'#a99c88',"stroke-width":26});seg(1250,2120,{stroke:'#6f6252',"stroke-width":20,"stroke-dasharray":'3 6'});seg(1250,2120,{stroke:'#5b646b',"stroke-width":12});seg(1250,2120,{stroke:'#a99c88',"stroke-width":8});
/* bridge piers on the rail arc */
{let h='';for(let L=1450;L<=1950;L+=62){const p=at(L,-14),q=at(L,-46);h+=`<path d="M${p.x} ${p.y} L${q.x} ${q.y}" stroke="#c4ccd2" stroke-width="7" stroke-linecap="round"/>`}G(h)}
/* zone glow (active step) */
const glow=Z.map(([a,b])=>seg(a,b,{stroke:'#fff7c9',"stroke-width":122,opacity:0}));
const TR0=2420,trail=el('path',{d:sub(TR0,TR0+TOTAL-2),fill:'none',stroke:'#2fae5c',"stroke-width":11,"stroke-linecap":'round',"stroke-dasharray":`0 ${TOTAL}`,opacity:.95});
const halo=el('circle',{r:26,fill:'#2fae5c',opacity:.22});

/* ---------- scenes on the ribbon ---------- */
const Q=sel=>svg.querySelectorAll(sel);
// 1 bank
G(`<g transform="translate(150 640)" filter="url(#sd${K})"><rect x="-4" y="54" width="86" height="8" fill="#cfd6dc"/>${[4,19,34,49,64].map(x=>`<rect x="${x}" y="20" width="8" height="34" fill="url(#metal${K})"/>`).join('')}<rect x="-2" y="14" width="82" height="7" fill="#e4e9ed"/><path d="M-6 14 L39 -6 L84 14z" fill="url(#wall${K})" stroke="#b7c1c9"/><circle cx="39" cy="6" r="6" fill="#b7861a"/><text x="39" y="9.4" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff">¥</text></g>
 <g transform="translate(268 560)" filter="url(#sd${K})"><rect width="38" height="66" rx="7" fill="#1f2a33"/><rect x="3" y="6" width="32" height="54" rx="3" fill="#fff"/><rect x="3" y="6" width="32" height="10" rx="3" fill="#17733d"/><g transform="translate(19 32)"><g class="ok"><circle r="8" fill="#2fae5c"/><path d="M-3.6 0l2.6 2.6L4-3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g><text x="19" y="51" text-anchor="middle" font-size="5.6" font-weight="700" fill="#17733d">ຮັບເງິນແລ້ວ</text></g>
 <g transform="translate(318 616)">${[0,1,2,3].map(i=>`<rect x="${(i%2)*2}" y="${-5-i*4.2}" width="28" height="4.2" rx="1" fill="${i%2?'#46a35a':'#3c9a50'}" stroke="#2a7a3d" stroke-width=".5"/>`).join('')}<rect x="10" y="-22" width="8" height="17" fill="#f2d16b"/></g>
 ${[0,1,2].map(()=>`<g class="coin"><circle cx="300" cy="566" r="4.4" fill="url(#coin${K})" stroke="#b8890a" stroke-width=".6"/></g>`).join('')}`);
// 2 farm
G(`${PLANT(112,236,.62)}${PLANT(134,212,.55)}${PLANT(96,290,.66)}${PLANT(150,252,.6)}${PLANT(124,320,.62)}
 <g class="pull"><g transform="translate(165 290)">${PLANT(0,0,.6,'')}${[[-3,5,-35],[2,7,10],[5,4,40]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="2.3" fill="url(#root${K})" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g></g>
 ${MAN(178,306,{shirt:'#3f6fb5',hat:'straw',arm:'armA',s:.95})}
 <g transform="translate(118 356)"><path d="M0 0 L3 -16 H23 L26 0z" fill="#c9a26b" stroke="#a7804a"/>${[[7,-17],[13,-19],[19,-17.5],[10,-21]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="2.2" fill="url(#root${K})" transform="rotate(${i*30-30} ${x} ${y})"/>`).join('')}</g>
 ${MAN(236,300,{shirt:'#2f9a4a',arm:'armB',flip:-1,s:.95,hold:'<rect x="6" y="-18" width="9" height="5" rx="1" fill="#3f9b52" stroke="#2a7a3d" stroke-width=".6"/>'})}
 <g transform="translate(206 226)"><g class="hs"><path d="M-15 -10 h30 a5 5 0 0 1 5 5 v10 a5 5 0 0 1 -5 5 h-13 l-4 5 -2 -5 h-11 a5 5 0 0 1 -5 -5 v-10 a5 5 0 0 1 5 -5z" fill="#fff" stroke="#d3dbd6"/><path d="M-9 1 l5 -4 4 3 4 -3 5 4 -4 4 -5 -2 -5 2z" fill="#f2c27b" stroke="#c9934d" stroke-width=".8"/></g></g>`);
// 3 factory
G(`<g transform="translate(470 116)" filter="url(#sd${K})"><path d="M0 14 L104 14 L104 62 L0 62z" fill="url(#wall${K})"/><path d="M104 14 L128 5 L128 53 L104 62z" fill="url(#side${K})"/>
  <path d="M0 14 L17 1 L17 14 L34 1 L34 14 L51 1 L51 14 L68 1 L68 14 L85 1 L85 14 L104 1 L104 14z" fill="url(#roof${K})"/><path d="M104 1 L128 -8 L128 5 L104 14z" fill="#355f99"/>${[38,54,70,86].map(x=>`<rect x="${x}" y="26" width="10" height="9" rx="1" fill="url(#glass${K})"/>`).join('')}<rect x="10" y="36" width="20" height="26" fill="#3d474f"/>
  <rect x="110" y="-16" width="8" height="22" fill="url(#metal${K})"/><g transform="translate(-30 0)"><rect y="8" width="14" height="54" rx="7" fill="url(#metal${K})"/><ellipse cx="7" cy="8" rx="7" ry="2.8" fill="#e9eef2"/><rect x="16" y="14" width="14" height="48" rx="7" fill="url(#metal${K})"/><ellipse cx="23" cy="14" rx="7" ry="2.8" fill="#e9eef2"/></g></g>
 <g filter="url(#bl${K})">${[0,1,2,3].map(()=>`<circle class="smk" cx="584" cy="98" r="6" fill="#fff" opacity=".9"/>`).join('')}</g>
 <g transform="translate(476 258)">${['M0 4c0-3 4-7 4-7s4 4 4 7a4 4 0 0 1-8 0z','M4 -4v-2M4 10v2M-3 3h-2M11 3h2M0 3a4 4 0 1 0 8 0a4 4 0 1 0-8 0','M-1 6h10M0 6c0-5 2-8 4-8s4 3 4 8','M0 -2h8v10h-8zM0 2h8'].map((d,i)=>`<g transform="translate(${i*34} 0)"><circle class="pc" cx="4" cy="3" r="11" fill="#fff" stroke="#1f8a8a" stroke-width="1.6" filter="url(#sd${K})"/><path d="${d}" stroke="#1f8a8a" stroke-width="1.5" fill="none" stroke-linecap="round"/>${i<3?`<path d="M19 3h7M24 0l3 3-3 3" stroke="#9fb3a5" stroke-width="1.5" fill="none"/>`:''}</g>`).join('')}</g>
 ${PALLET(606,178,3,'bagout')}`);
// 4 station
G(`<g transform="translate(750 128)" filter="url(#sd${K})"><rect x="0" y="14" width="120" height="34" fill="url(#wall${K})"/><path d="M-8 16 L60 -2 L128 16z" fill="url(#roof${K})"/><rect x="48" y="22" width="24" height="26" fill="url(#glass${K})"/>${[10,26,86,102].map(x=>`<rect x="${x}" y="22" width="10" height="9" rx="1" fill="url(#glass${K})"/>`).join('')}<rect x="30" y="2" width="60" height="11" rx="2" fill="#2f6fd6"/><text x="60" y="10.4" text-anchor="middle" font-size="7.4" font-weight="700" fill="#fff">ສະຖານີ ວຽງຈັນ</text></g>
 <rect x="690" y="222" width="190" height="6" fill="#a7b0b6"/><g transform="translate(700 220)"><path d="M0 4 q0 -4 4 -4 h140 q12 0 18 10 v4 h-162z" fill="#fff" stroke="#b9c3ca"/><rect x="2" y="3" width="140" height="5" rx="1.5" fill="#2a3b55"/><rect y="9" width="162" height="2.4" fill="#d64545"/></g>`);
// 6 customs
G(`<g filter="url(#sd${K})">${[[770,628],[770,700],[838,628],[838,700]].map(([x,y])=>`<rect x="${x-3}" y="${y-40}" width="6" height="40" fill="url(#metal${K})"/>`).join('')}<path d="M752 588 H856 L850 598 H758z" fill="url(#roof${K})"/><rect x="772" y="576" width="64" height="12" rx="2" fill="#3b4a7a"/><text x="804" y="585" text-anchor="middle" font-size="7.6" font-weight="700" fill="#fff">ດ່ານ · CIQ</text></g>
 <g transform="translate(856 682)" filter="url(#sd${K})"><rect width="30" height="30" rx="3" fill="url(#wall${K})"/><rect x="4" y="5" width="22" height="10" rx="2" fill="url(#glass${K})"/><rect x="-2" y="-3" width="34" height="4" fill="#3b4a7a"/></g>
 ${MAN(900,718,{shirt:'#3b4a7a',hat:'cap',hatc:'#22305a',arm:'armC',flip:-1,s:.9,hold:'<rect x="5" y="-20" width="6" height="8" rx="1" fill="#fff" stroke="#9aa6af" stroke-width=".6"/>'})}
 <g transform="translate(760 690)"><rect x="-3" y="-6" width="6" height="12" fill="#3b4a7a"/><g class="barr" data-o="760 688"><rect x="0" y="-38" width="5" height="38" rx="2.5" fill="#fff" stroke="#d64545" stroke-width=".8"/>${[0,1,2,3].map(i=>`<rect x="0" y="${-36+i*9}" width="5" height="4.6" fill="#d64545"/>`).join('')}</g><circle cy="-2" r="3.2" fill="#22305a"/></g>`);
// 7 warehouse
G(`<g transform="translate(510 680)" filter="url(#sd${K})"><path d="M0 14 L100 14 L100 56 L0 56z" fill="url(#wall${K})"/><path d="M100 14 L124 5 L124 47 L100 56z" fill="url(#side${K})"/><path d="M-6 16 L50 -6 L106 16z" fill="url(#roof${K})"/><path d="M106 16 L50 -6 L74 -15 L130 7z" fill="#355f99"/>
  <rect x="18" y="26" width="38" height="30" fill="#2e373e"/>${[0,1,2].map(i=>`<rect x="19" y="${28+i*5}" width="36" height="1.4" fill="#4b565e"/>`).join('')}<rect x="66" y="26" width="20" height="10" rx="1" fill="url(#glass${K})"/><rect x="20" y="0" width="36" height="8" rx="2" fill="#e0662e"/><text x="38" y="6" text-anchor="middle" font-size="5.8" font-weight="700" fill="#fff">ຄັງສິນຄ້າ</text></g>
 ${PALLET(440,650,3,'stk')}${PALLET(476,650,2,'stk')}
 <g class="fk"><g transform="translate(0 652)">${SHADOW(10,.6,14,2)}<rect x="-2" y="-14" width="20" height="10" rx="2" fill="#f2b41c"/><rect x="0" y="-21" width="10" height="8" rx="1" fill="none" stroke="#2a2f33" stroke-width="1.4"/><rect x="18" y="-26" width="2" height="24" fill="#2a2f33"/><circle cx="3" cy="-3" r="3.2" fill="#1e2225"/><circle cx="14" cy="-3" r="3.2" fill="#1e2225"/><g transform="translate(19 -5)"><rect x="0" y="-1.6" width="14" height="1.6" fill="#9c7a52"/>${[0,1].map(r=>[0,1].map(c=>`<rect x="${c*7}" y="${-7-r*5.4}" width="6.6" height="5.2" rx="1.8" fill="#fbfbf6" stroke="#cdd4cd" stroke-width=".4"/><rect x="${c*7}" y="${-4.2-r*5.4}" width="6.6" height="1" fill="#2f9a4a"/>`).join('')).join('')}</g></g></g>
 ${MAN(640,650,{shirt:'#e0662e',hat:'#f2c200',vest:1,arm:'armD',flip:-1,s:.95,hold:'<rect x="5" y="-21" width="7" height="9" rx="1" fill="#fff" stroke="#9aa6af" stroke-width=".6"/>'})}
 <g transform="translate(652 604)"><g class="ok7"><circle r="7" fill="#2fae5c"/><path d="M-3.2 0l2.3 2.5L3.4-2.6" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`);

/* ---------- labels (no boxes) ---------- */
const ST=[
 {n:1,t:'ຮັບເງິນຄ່າສິນຄ້າເຕັມຈຳນວນ',s:'ລູກຄ້າໂອນເງິນ · ທະນາຄານຢືນຢັນ',d:'2–3 ມື້',dmin:2,dmax:3,c:'#b7861a',lab:[40,790,'start'],veh:'coin',from:2420,to:TOTAL+130},
 {n:2,t:'ເກັບຊື້ວັດຖຸດິບ (ມັນຕົ້ນ)',s:'ຊື້ມັນກັບພໍ່ຄ້າຄົນກາງ ແລະ ຊາວກະສິກອນ',d:'1–2 ມື້',dmin:1,dmax:2,c:'#2f9a4a',lab:[40,70,'start'],veh:'coin',from:130,to:560},
 {n:3,t:'ນຳເຂົ້າໂຮງງານເພື່ອຜະລິດ',s:'ລ້າງ, ບົດ, ສະກັດ, ອົບແຫ້ງ, ແພັກກິ້ງ',d:'2–3 ມື້',dmin:2,dmax:3,c:'#1f8a8a',lab:[420,62,'start'],veh:'ctruck',from:560,to:930},
 {n:4,t:'ຂົນສົ່ງໄປສະຖານີລົດໄຟ',s:'ໂຮງງານ → ສະຖານີ ວຽງຈັນ/ບໍ່ເຕັນ',d:'1–2 ມື້',dmin:1,dmax:2,c:'#d08a12',lab:[712,62,'start'],veh:'ktruck',from:930,to:1250},
 {n:5,t:'ຂົນສົ່ງຜ່ານລົດໄຟລາວ-ຈີນ',s:'ຂ້າມຊາຍແດນ ໄປປະເທດຈີນ',d:'5–7 ມື້',dmin:5,dmax:7,c:'#2f6fd6',lab:[1270,62,'end'],veh:'train',from:1250,to:2120},
 {n:6,t:'ພາສີຂາເຂົ້າ + ກວດຄຸນນະພາບ (CIQ)',s:'ຝັ່ງຈີນ',d:'1 ມື້',dmin:1,dmax:1,c:'#5b55c9',lab:[1270,790,'end'],veh:'ktruck',from:2120,to:2250},
 {n:7,t:'ຂົນສົ່ງຮອດຄັງຜູ້ຊື້ + ກວດຮັບສິນຄ້າ',s:'ລູກຄ້າກວດ ແລະ ຮັບສິນຄ້າ',d:'1 ມື້',dmin:1,dmax:1,c:'#e0662e',lab:[560,800,'middle'],veh:'ktruck',from:2250,to:2420}];
const labels=ST.map(s=>{const [x,y,an]=s.lab;const g=el('g',{class:'lab',opacity:.6});
 const tw=s.t.length*8.6;const x0=an==='start'?x:an==='end'?x-tw-30:x-(tw+30)/2;
 el('circle',{cx:x0+11,cy:y-6,r:11,fill:s.c},g);const n=el('text',{x:x0+11,y:y-1.5,"text-anchor":'middle',"font-size":13,"font-weight":800,fill:'#fff'},g);n.textContent=s.n;
 const t=el('text',{x:x0+28,y,"font-size":16.5,"font-weight":800,fill:'#122419'},g);t.textContent=s.t;
 const dd=el('text',{x:x0+28,y:y+20,"font-size":12.5,fill:'#4b5d51'},g);dd.innerHTML=`<tspan font-weight="800" fill="${s.c}">${s.d}</tspan> · ${s.s}`;
 g.style.cursor='pointer';g.addEventListener('click',()=>jump(ST.indexOf(s)));const bb=g.getBBox();const pill=el('rect',{x:bb.x-10,y:bb.y-7,width:bb.width+20,height:bb.height+14,rx:14,fill:'#fff',stroke:s.c,"stroke-width":2.5,opacity:0});g.insertBefore(pill,g.firstChild);g._pill=pill;return g});

/* ---------- pins over the active scene ---------- */
const PIN=[[188,612],[206,206],[540,150],[812,148],[1192,438],[804,560],[570,652]];
const pins=ST.map((s,i)=>{const [x,y]=PIN[i];const g=el('g',{transform:`translate(${x} ${y})`,opacity:0});const b=el('g',{},g);
 el('ellipse',{cx:0,cy:2,rx:7,ry:2.4,fill:'#12301d',opacity:.25},g);el('path',{d:'M0 0 C-14 -18 -16 -24 -16 -32 a16 16 0 0 1 32 0 c0 8 -2 14 -16 32z',fill:s.c,stroke:'#fff',"stroke-width":3},b);el('circle',{cx:0,cy:-32,r:10,fill:'#fff'},b);
 const t=el('text',{x:0,y:-27.5,"text-anchor":'middle',"font-size":13,"font-weight":800,fill:s.c},b);t.textContent=s.n;gsap.to(b,{y:-8,duration:.5,yoyo:true,repeat:-1,ease:'sine.inOut'});return g});
/* ---------- centre ---------- */
el('text',{x:640,y:350,"text-anchor":'middle',"font-size":17,fill:'#4b5d51'}).textContent='ໄລຍະເວລາສະເລ່ຍ ຕໍ່ 1 ຮອບ';
el('text',{x:640,y:410,"text-anchor":'middle',"font-size":58,"font-weight":800,fill:'#0f4a28'}).textContent='13–19 ມື້';
el('text',{x:640,y:440,"text-anchor":'middle',"font-size":14,fill:'#7a8a80'}).textContent='ນັບແຕ່ຮັບເງິນ ຈົນສົ່ງສິນຄ້າຮອດລູກຄ້າ';
el('path',{d:'M520 540 A56 56 0 0 1 632 540',fill:'none',stroke:'url(#dial)',"stroke-width":12,"stroke-linecap":'round'});
const needle=el('line',{x1:576,y1:540,x2:576,y2:496,stroke:'#122419',"stroke-width":3,"stroke-linecap":'round'});el('circle',{cx:576,cy:540,r:5,fill:'#122419'});
const dayT=el('text',{x:576,y:566,"text-anchor":'middle',"font-size":13,"font-weight":800,fill:'#17733d'});
el('rect',{x:654,y:518,width:180,height:12,rx:6,fill:'#e3ece0'});const bar=el('rect',{x:654,y:518,width:0,height:12,rx:6,fill:'url(#dial)'});
el('line',{x1:654+180*13/19,x2:654+180*13/19,y1:512,y2:536,stroke:'#0f4a28',"stroke-width":2,"stroke-dasharray":'3 2'});
el('text',{x:654+180*13/19,y:506,"text-anchor":'middle',"font-size":11.5,fill:'#4b5d51'}).textContent='ໄວສຸດ 13';el('text',{x:834,y:552,"text-anchor":'end',"font-size":11.5,fill:'#4b5d51'}).textContent='ຊ້າສຸດ 19';
const stepT=el('text',{x:640,y:316,"text-anchor":'middle',"font-size":16,"font-weight":800,fill:'#122419'});

/* ---------- moving vehicle (follows the road; wheels always down) ---------- */
const V={coin:G(`<circle r="30" fill="url(#glw)"/><circle r="15" fill="url(#coin${K})" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-size="14" font-weight="800" fill="#7a5a00">¥</text>`),
 ctruck:G(`<g transform="translate(-33 4)">${TRUCK({k:K,cab:'#2f9a4a',body:'#6b7a3a',cargo:'cassava'})}</g>`),
 ktruck:G(`<g transform="translate(-33 4)">${TRUCK({k:K,cab:'#e0a419',body:'#2563a8',cargo:'container'})}</g>`),
 train:[0,1,2].map(i=>G(i===0?`<g transform="translate(-26 3)"><rect x="0" y="-15" width="40" height="14" rx="3" fill="#fbfbfb" stroke="#b9c3ca" stroke-width=".7"/><path d="M40 -15 q12 3 15 14 h-15z" fill="#fbfbfb" stroke="#b9c3ca" stroke-width=".7"/><path d="M42 -13 q8 2 11 8 h-11z" fill="#22344e"/><rect x="0" y="-12" width="40" height="4.4" fill="#22344e"/><rect x="0" y="-6.6" width="55" height="2.2" fill="#d64545"/><rect x="0" y="-4.4" width="55" height="1.4" fill="#2f6fd6"/></g>`
  :`<g transform="translate(-26 3)"><rect x="0" y="-15" width="52" height="14" rx="3" fill="#fbfbfb" stroke="#b9c3ca" stroke-width=".7"/><rect x="0" y="-12" width="52" height="4.4" fill="#22344e"/><rect x="0" y="-6.6" width="52" height="2.2" fill="#d64545"/><rect x="0" y="-4.4" width="52" height="1.4" fill="#2f6fd6"/>${i===1?'<g transform="translate(8 -24)"><rect width="10" height="6.4" fill="#ce1126"/><rect y="1.6" width="10" height="3.2" fill="#002868"/><circle cx="5" cy="3.2" r="1.2" fill="#fff"/></g><g transform="translate(22 -24)"><rect width="10" height="6.4" fill="#de2910"/><circle cx="2.4" cy="2" r="1.1" fill="#ffde00"/></g>':''}</g>`))};
const pose=(g,L,lift=0)=>{const p=at(L,lift),flip=Math.cos(p.a*Math.PI/180)<0;g.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${p.a})${flip?' scale(1 -1)':''}`)};
let curV='';function showV(k){curV=k;['coin','ctruck','ktruck'].forEach(n=>V[n].style.display=n===k?'':'none');V.train.forEach(c=>c.style.display=k==='train'?'':'none')}

/* ---------- ambient loops ---------- */
const R={repeat:-1},O=e=>e.getAttribute('data-o');
Q('.cld').forEach((c,j)=>gsap.to(c,{x:j%2?-14:16,duration:7+j*2,yoyo:true,repeat:-1,ease:'sine.inOut'}));
gsap.timeline(R).fromTo(Q('.ok'),{scale:0,transformOrigin:'50% 50%'},{scale:1,duration:.4,ease:'back.out(3)'}).to({}, {duration:1.6}).to(Q('.ok'),{scale:0,duration:.2});
Q('.coin').forEach((c,j)=>gsap.fromTo(c,{x:0,y:0,opacity:0},{keyframes:[{x:12,y:-16,opacity:1,duration:.45},{x:28,y:30,duration:.6,ease:'power2.in'},{opacity:0,duration:.1}],repeat:-1,repeatDelay:.8,delay:j*.5}));
const aA=Q('.armA')[0];gsap.to(aA,{rotation:-40,transformOrigin:'0% 0%',duration:.7,yoyo:true,repeat:-1,ease:'sine.inOut'});gsap.to(Q('.pull'),{y:-8,duration:.7,yoyo:true,repeat:-1,ease:'sine.inOut'});
const aB=Q('.armB')[0];gsap.to(aB,{rotation:-25,transformOrigin:'0% 0%',duration:.9,yoyo:true,repeat:-1,ease:'sine.inOut'});
gsap.to(Q('.lf'),{rotation:3,transformOrigin:'50% 100%',duration:1.6,yoyo:true,repeat:-1,ease:'sine.inOut',stagger:.2});
gsap.timeline(R).fromTo(Q('.hs'),{scale:0,transformOrigin:'50% 100%'},{scale:1,duration:.4,ease:'back.out(2.5)'}).to({}, {duration:1.6}).to(Q('.hs'),{scale:0,duration:.2}).to({}, {duration:.6});
Q('.smk').forEach((s,j)=>gsap.fromTo(s,{x:0,y:0,scale:.5,opacity:.9,transformOrigin:'50% 50%'},{x:12,y:-30,scale:2.1,opacity:0,duration:2.6,repeat:-1,delay:j*.65,ease:'none'}));
gsap.timeline(R).to(Q('.pc'),{attr:{fill:'#cfeeee'},duration:.25,stagger:.45}).to(Q('.pc'),{attr:{fill:'#fff'},duration:.3,stagger:.1},'+=.4');
gsap.to(Q('.rvs'),{attr:{"stroke-dashoffset":-32},duration:1.6,repeat:-1,ease:'none'});
const aC=Q('.armC')[0];gsap.to(aC,{rotation:-30,transformOrigin:'0% 0%',duration:.8,yoyo:true,repeat:-1,ease:'sine.inOut'});
gsap.timeline(R).fromTo(Q('.fk'),{x:440},{x:520,duration:1.6,ease:'power1.inOut'}).to({}, {duration:.4}).to(Q('.fk'),{x:440,duration:1.6,ease:'power1.inOut'}).to({}, {duration:.4});
const aD=Q('.armD')[0];gsap.to(aD,{rotation:-20,transformOrigin:'0% 0%',duration:.8,yoyo:true,repeat:-1,ease:'sine.inOut'});
gsap.timeline(R).fromTo(Q('.ok7'),{scale:0,transformOrigin:'50% 50%'},{scale:1,duration:.4,ease:'back.out(3)'}).to({}, {duration:1.8}).to(Q('.ok7'),{scale:0,duration:.2}).to({}, {duration:.6});
const barr=Q('.barr')[0];

/* ---------- main cycle ---------- */
const SEC=.8,st={L:2420,day:0};let active=-1;
function place(){let done=((st.L-TR0)%TOTAL+TOTAL)%TOTAL;if(active===6&&done<10)done=TOTAL;trail.setAttribute('stroke-dasharray',`${done} ${TOTAL}`);{const hp=at(curV==='train'?st.L-56:st.L,0);halo.setAttribute('cx',hp.x);halo.setAttribute('cy',hp.y)}
 if(curV==='train')V.train.forEach((c,i)=>pose(c,st.L-i*56,8));else pose(V[curV],st.L,curV==='coin'?0:8);
 bar.setAttribute('width',Math.min(180,180*st.day/19));const a=-90+180*Math.min(1,st.day/19);needle.setAttribute('transform',`rotate(${a} 576 540)`);dayT.textContent=st.day>.05?`ມື້ທີ ${Math.max(1,Math.round(st.day))}`:''}
function activate(i){if(i===active)return;active=i;const s=ST[i];showV(s.veh);
 labels.forEach((g,k)=>{const on=k===i;gsap.to(g,{opacity:on?1:.42,duration:.3});gsap.to(g._pill,{opacity:on?1:0,duration:.3})});
 pins.forEach((p,k)=>gsap.to(p,{opacity:k===i?1:0,duration:.3}));halo.setAttribute('fill',s.c);trail.setAttribute('stroke',s.c);
 glow.forEach((ps,k)=>ps.forEach(p=>{gsap.killTweensOf(p);p.setAttribute('stroke',s.c);gsap.to(p,{opacity:k===i?.32:0,duration:.4});if(k===i)gsap.to(p,{opacity:.18,duration:1.1,yoyo:true,repeat:-1,delay:.4,ease:'sine.inOut'})}));
 stepT.textContent=`ຂັ້ນຕອນທີ ${s.n}: ${s.t}`;stepT.setAttribute('fill',s.c);
 if(i===5){gsap.timeline().set(barr,{rotation:0,svgOrigin:O(barr)}).to(barr,{rotation:-80,svgOrigin:O(barr),duration:.5,delay:.6}).to(barr,{rotation:0,svgOrigin:O(barr),duration:.5,delay:1.2})}}
const tl=gsap.timeline({repeat:-1,onUpdate:place,onRepeat:()=>{active=-1}});let cum=0;
ST.forEach((s,i)=>{const avg=(s.dmin+s.dmax)/2;tl.addLabel('s'+i).call(activate,[i]).set(st,{L:s.from}).to(st,{duration:.5}).to(st,{L:s.to,day:cum+avg,duration:avg*SEC,ease:'sine.inOut'});cum+=avg});
tl.to(st,{duration:.8}).set(st,{day:0});
function jump(i){tl.seek('s'+i,false);active=-1;activate(i);place()}
const bP=document.getElementById('cPlay'),bF=document.getElementById('cFast');let userPaused=false;
bP.onclick=()=>{userPaused=!userPaused;userPaused?gsap.globalTimeline.pause():gsap.globalTimeline.resume();bP.setAttribute('aria-pressed',!userPaused);bP.querySelector('span').textContent=userPaused?'ເລີ່ມ':'ຢຸດ';bP.querySelector('svg').innerHTML=userPaused?'<path d="M7 4v16l13-8z"/>':'<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'};
bF.onclick=()=>{const on=bF.getAttribute('aria-pressed')!=='true';bF.setAttribute('aria-pressed',on);gsap.globalTimeline.timeScale(on?2:1)};
if(matchMedia('(prefers-reduced-motion: reduce)').matches)bP.click();
new IntersectionObserver(e=>{if(userPaused)return;e[0].isIntersecting?gsap.globalTimeline.resume():gsap.globalTimeline.pause()}).observe(document.getElementById('cyc'));
showV('coin');place();window.__flow={tl,jump};
})();

}
let started=false;
function check(){if(started||location.hash!=='#stock'||!document.getElementById('road'))return;started=true;
 if(window.gsap)init();else{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';s.onload=init;s.onerror=()=>{const c=document.getElementById('cyc');if(c)c.innerHTML='<p style="padding:20px">ໂຫຼດ animation ບໍ່ສຳເລັດ</p>'};document.head.appendChild(s)}}
addEventListener('hashchange',check);addEventListener('ls:data',check);check();
})();
