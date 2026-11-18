// Lazy loader: the process tour loads only when the factory overview tab is opened.
let started=false;
function check(){if(started||location.hash!=='#stock'||!document.getElementById('pf'))return;started=true;import('./process3d-scene.js').catch(e=>{console.error(e);const el=document.getElementById('pf');if(el)el.innerHTML='<p style="padding:20px">ໂຫຼດພາບຈຳລອງບໍ່ສຳເລັດ</p>'})}
addEventListener('hashchange',check);addEventListener('ls:data',check);check();
