// Lazy loader: three.js and the 3D scene load only when the stock tab is opened.
let started=false;
function check(){if(started||location.hash!=='#stock'||!document.getElementById('f3d'))return;started=true;import('./factory3d-scene.js').catch(e=>{console.error(e);const el=document.getElementById('f3d');if(el)el.innerHTML='<p style="padding:20px">ໂຫຼດແບບຈຳລອງ 3D ບໍ່ສຳເລັດ</p>'})}
addEventListener('hashchange',check);addEventListener('ls:data',check);check();
