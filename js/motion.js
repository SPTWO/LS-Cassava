// Motion (corporate: quick, clean, no bounce). Runs once when a tab opens or its data is re-rendered.
// Uses the Web Animations API, so nothing is left behind in inline styles and report clones show final values.
(()=>{
 const EASE='cubic-bezier(.2,0,0,1)';const RM=matchMedia('(prefers-reduced-motion: reduce)');
 const off=()=>RM.matches||document.documentElement.classList.contains('no-motion');
 let pend=0,counters=[];
 const anim=(el,kf,o)=>{try{return el.animate(kf,{easing:EASE,fill:'backwards',...o})}catch(e){}};
 function finish(){counters.forEach(c=>{cancelAnimationFrame(c.raf);if(c.tn.isConnected||c.tn.parentNode)c.tn.nodeValue=c.txt});counters=[];
  document.getAnimations?.().forEach(a=>{if(a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('.view'))a.finish()})}
 // count a KPI value up from 0 (keeps sign, thousands separators, decimals and the text after the number)
 const NUM=/^([−\-+]?)([\d,]+)(\.\d+)?/;
 function count(el,delay){const tn=el.firstChild;if(!tn||tn.nodeType!==3)return;const txt=tn.nodeValue,t=txt.trim(),m=t.match(NUM);if(!m)return;
  const dec=m[3]?m[3].length-1:0,val=parseFloat(m[2].replace(/,/g,'')+(m[3]||''));if(!isFinite(val)||val===0)return;const rest=t.slice(m[0].length),sign=m[1];
  const c={tn,txt};counters.push(c);const t0=performance.now()+delay,D=600;
  const f=n=>{const p=Math.max(0,Math.min(1,(n-t0)/D)),e=1-Math.pow(1-p,3);tn.nodeValue=sign+(val*e).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})+rest;if(p<1)c.raf=requestAnimationFrame(f);else tn.nodeValue=txt};
  tn.nodeValue=sign+(0).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})+rest;c.raf=requestAnimationFrame(f)}
 function chart(svg){let i=0;const D=k=>Math.min(400,k*30);
  svg.querySelectorAll('rect:not(.hit),path,circle').forEach(el=>{if(el.closest('defs,clipPath'))return;
   const tag=el.tagName.toLowerCase(),fill=el.getAttribute('fill'),d=el.getAttribute('d')||'';
   if(tag==='path'&&fill==='none'&&!el.getAttribute('stroke-dasharray')){let len=0;try{len=el.getTotalLength()}catch(e){}if(!len)return;
    anim(el,[{strokeDasharray:len,strokeDashoffset:len},{strokeDasharray:len,strokeDashoffset:0}],{duration:700,delay:150});return}
   const bar=tag==='rect'||(tag==='path'&&/^M[\d.\-]+,[\d.\-]+V[\d.\-]+Q/.test(d));
   if(bar){let org='center bottom';const mm=d.match(/^M[\d.\-]+,([\d.\-]+)V([\d.\-]+)/);if(mm&&+mm[2]>+mm[1])org='center top';
    el.style.transformBox='fill-box';el.style.transformOrigin=org;anim(el,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:450,delay:D(i++)});return}
   anim(el,[{opacity:0},{opacity:1}],{duration:300,delay:350})})}
 function run(v){if(!v||off())return;finish();
  anim(v,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:250});
  v.querySelectorAll('.kpis').forEach(g=>[...g.children].forEach((k,i)=>{const dl=Math.min(i*50,300);
   anim(k,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:250,delay:dl});
   k.querySelectorAll('.pill').forEach(p=>anim(p,[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'none'}],{duration:300,delay:dl+250}));
   const n=k.querySelector('.v');if(n)count(n,dl)}));
  // overview: business-flow steps and plan-vs-actual rows
  v.querySelectorAll('.flow').forEach(g=>[...g.querySelectorAll('.step')].forEach((k,i)=>{const dl=Math.min(i*60,300);
   anim(k,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:280,delay:dl});
   k.querySelectorAll('.pill,.ratio').forEach(p=>anim(p,[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'none'}],{duration:300,delay:dl+250}));
   const n=k.querySelector('.big');if(n)count(n,dl)}));
  v.querySelectorAll('.pva-row').forEach((r,i)=>{const dl=100+i*70;anim(r,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:250,delay:dl});
   r.querySelectorAll('.track .plan,.track .act').forEach((b,j)=>{b.style.transformOrigin='left center';anim(b,[{transform:'scaleX(0)'},{transform:'none'}],{duration:650,delay:dl+100+j*120})});
   const t=r.querySelector('.track .tick');if(t)anim(t,[{opacity:0},{opacity:1}],{duration:250,delay:dl+600});
   const n=r.querySelector('.val b.num');if(n)count(n,dl)});
  v.querySelectorAll('.flow .bar i').forEach((b,i)=>{b.style.transformOrigin='left center';anim(b,[{transform:'scaleX(0)'},{transform:'none'}],{duration:600,delay:200+i*60})});
  v.querySelectorAll('.ab-t i,.mini i,.use i').forEach((b,i)=>{b.style.transformOrigin='left center';anim(b,[{transform:'scaleX(0)'},{transform:'none'}],{duration:600,delay:150+Math.min(i*30,300)})});
  v.querySelectorAll('svg.chart').forEach(chart);
  v.querySelectorAll('table tbody').forEach(tb=>[...tb.rows].slice(0,14).forEach((r,i)=>anim(r,[{opacity:0,transform:'translateX(-6px)'},{opacity:1,transform:'none'}],{duration:220,delay:120+i*25})))}
 function schedule(){if(pend)return;pend=requestAnimationFrame(()=>{pend=0;run(document.querySelector('.view:not([hidden])'))})}
 // re-run after the app redraws a tab
 ['route','render','renderDebt','renderCash'].forEach(n=>{const f=window[n];if(typeof f!=='function')return;window[n]=function(...a){const r=f.apply(this,a);schedule();return r}});
 // reports: no motion (and finished counters) while the report window is open, so captured pages show final values
 const h=document.documentElement;const syncRep=()=>{const open=[...document.querySelectorAll('.rep-modal')].some(m=>!m.hidden);if(open&&!h.classList.contains('no-motion')){finish();h.classList.add('no-motion')}else if(!open)h.classList.remove('no-motion')};
 new MutationObserver(syncRep).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
 document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#repGo,#repOpen'))finish()},true);
 addEventListener('hashchange',schedule); // the app binds route() to hashchange directly
 window.LSMotion={run:schedule,finish};
})();
