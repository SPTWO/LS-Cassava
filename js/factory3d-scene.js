// 3D model of both factories (loaded on first visit to the stock tab). Data comes from app.js via window.LS_3D().

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const NAMES={xan:'ຊະນະຄາມ',nan:'ນານ'};
const EMPTY={s25:0,s850:0,pulp:0,raw:0,proc:0,prod:0,exp:0,conv:null,last:'—',ok:false,status:'—'};
function loadData(){const L=window.LS_3D?window.LS_3D():{};const o={};for(const k of ['xan','nan'])o[k]={...EMPTY,...(L[k]||{}),name:NAMES[k]};return o}
let DATA=loadData();
const fmt=(v,d=0)=>v==null?'—':Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});

const box=document.getElementById('f3d');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.autoUpdate=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.outputColorSpace=THREE.SRGBColorSpace;
box.prepend(renderer.domElement);
const lr=new CSS2DRenderer();lr.domElement.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:1';box.appendChild(lr.domElement);
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xe8efea,520,1100);scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const VIEW=230;const cam=new THREE.OrthographicCamera(-1,1,1,-1,-1000,3000);
const controls=new OrbitControls(cam,renderer.domElement);
Object.assign(controls,{enableDamping:true,maxPolarAngle:Math.PI*.42,minPolarAngle:Math.PI*.12,minZoom:.6,maxZoom:7,autoRotate:true,autoRotateSpeed:.45,screenSpacePanning:true});
scene.add(new THREE.HemisphereLight(0xffffff,0xb9c8bd,1.6));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-120,200,90);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-200,right:200,top:200,bottom:-200,near:10,far:600});sun.shadow.bias=-.0004;sun.shadow.normalBias=.4;sun.shadow.radius=3;scene.add(sun);

const world=new THREE.Group();scene.add(world);
const MC={};const M=(c,o={})=>{const k=c+JSON.stringify(o);return MC[k]||(MC[k]=new THREE.MeshStandardMaterial({color:c,roughness:.75,metalness:0,envMapIntensity:.6,...o}))};
function mesh(g,m,x=0,y=0,z=0,p){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(p||world).add(o);return o}
const B=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),c.isMaterial?c:M(c),x,y+h/2,z,p);
const RB=(w,h,d,r,c,x,y,z,p)=>mesh(new RoundedBoxGeometry(w,h,d,2,r),c.isMaterial?c:M(c),x,y+h/2,z,p);
const C=(rt,rb,h,c,x,y,z,p,seg=24)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg),c.isMaterial?c:M(c),x,y+h/2,z,p);
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
const bagMat=new THREE.MeshStandardMaterial({roughness:.95,map:tex(128,128,g=>{g.fillStyle='#e7e9e3';g.fillRect(0,0,128,128);for(let r=0;r<5;r++)for(let k=0;k<2;k++){const x=k*64+2,y=r*25.6+2;g.fillStyle='#fbfbf7';g.fillRect(x,y,60,22);g.fillStyle='#2f9a4a';g.beginPath();g.arc(x+30,y+10,5,0,7);g.fill();g.fillStyle='#8cc63f';g.fillRect(x,y+18,60,3)}})});
const contTex=c=>tex(64,32,g=>{g.fillStyle=c;g.fillRect(0,0,64,32);g.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<64;i+=4)g.fillRect(i,0,2,32)});
const colMat=new THREE.MeshStandardMaterial({roughness:.6,map:tex(16,64,g=>{g.fillStyle='#f2c200';g.fillRect(0,0,16,64);g.fillStyle='#222';for(let i=0;i<4;i++){g.beginPath();g.moveTo(0,i*16);g.lineTo(16,i*16+8);g.lineTo(16,i*16+16);g.lineTo(0,i*16+8);g.fill()}})});
const LBL=[];function chip(n,text,x,y,z,key,cls=''){const el=document.createElement('div');el.className='chip3 '+cls;el.innerHTML=(n?`<b>${n}</b>`:'')+text;if(key){el.dataset.k=key;el.onclick=e=>{e.stopPropagation();focus(key)}}
 const o=new CSS2DObject(el);o.position.set(x,y,z);world.add(o);LBL.push({o,el,cls});return o}
function curve(pts){return new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],0,p[1])))}
function road(cv,w=8){const N=220,pos=[],idx=[];for(let i=0;i<=N;i++){const t=i/N,p=cv.getPointAt(t),tg=cv.getTangentAt(t);const n=new THREE.Vector3(-tg.z,0,tg.x).multiplyScalar(w/2);pos.push(p.x+n.x,.07,p.z+n.z,p.x-n.x,.07,p.z-n.z);if(i<N){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=mesh(g,M(0xb9c0c7,{side:THREE.DoubleSide,roughness:.9}));m.castShadow=false;
 const L=cv.getLength(),n=Math.floor(L/6),dash=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,.05,.28),M(0xffffff),n),o=new THREE.Object3D();
 for(let i=0;i<n;i++){const t=i/n,p=cv.getPointAt(t),tg=cv.getTangentAt(t);o.position.set(p.x,.12,p.z);o.rotation.y=Math.atan2(-tg.z,tg.x);o.updateMatrix();dash.setMatrixAt(i,o.matrix)}world.add(dash);return cv}
function shapeBlob(rx,rz,seed){const s=new THREE.Shape();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=1+.14*Math.sin(a*3+seed)+.08*Math.cos(a*5+seed*2);const x=Math.cos(a)*rx*r,z=Math.sin(a)*rz*r;i?s.lineTo(x,-z):s.moveTo(x,-z)}return s}
function pond(cx,cz,rx,rz,seed){const r=mesh(new THREE.ShapeGeometry(shapeBlob(rx*1.08,rz*1.12,seed)),M(0xe3d8bf),cx,.05,cz);r.rotation.x=-Math.PI/2;r.castShadow=false;r.userData.key='pond';
 const w=mesh(new THREE.ShapeGeometry(shapeBlob(rx,rz,seed)),M(0x7cc8e0,{roughness:.15,metalness:.1,envMapIntensity:1.2}),cx,.12,cz);w.rotation.x=-Math.PI/2;w.castShadow=false;w.userData.key='pond';return w}
function pad(w,d,c,x,z,y=.04){const m=mesh(new RoundedBoxGeometry(w,.2,d,2,.1),M(c,{roughness:.95}),x,y,z);m.castShadow=false;return m}
function trees(list){const n=list.length,can=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),M(0x8fca7a,{roughness:.9}),n),can2=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),M(0x6fb565,{roughness:.9}),n),tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(.35,.45,1,8),M(0x9a7b5a),n);
 const o=new THREE.Object3D();let a=0,b=0;list.forEach(([x,z,s],i)=>{o.position.set(x,s*1.1,z);o.scale.set(.6,s*2.2,.6);o.rotation.set(0,0,0);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
  o.position.set(x,s*2.6,z);o.scale.setScalar(s*1.6);o.updateMatrix();(i%3?can:can2).setMatrixAt(i%3?a++:b++,o.matrix)});can.count=a;can2.count=b;[can,can2,tr].forEach(m=>{m.castShadow=true;world.add(m)})}
function scatterTrees(rx,rz,n,keep){const L=[];let k=0;while(L.length<n&&k<4000){k++;const a=Math.random()*Math.PI*2,r=1+Math.random()*.55;const x=Math.cos(a)*rx*r,z=Math.sin(a)*rz*r;if(keep&&keep(x,z))continue;L.push([x,z,1.4+Math.random()*1.4])}return L}
function fence(rx,rz){const n=120,posts=new THREE.InstancedMesh(new THREE.BoxGeometry(.25,1.6,.25),M(0x9aa4ab),n),o=new THREE.Object3D();const pts=[];
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2,x=Math.cos(a)*rx,z=Math.sin(a)*rz;pts.push(new THREE.Vector3(x,1.2,z));o.position.set(x,.8,z);o.updateMatrix();posts.setMatrixAt(i,o.matrix)}world.add(posts);
 world.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),240,.08,4,true),M(0xb4bdc3)))}
function hsh(x,z){const s=Math.sin(x*127.1+z*311.7)*43758.5453;return s-Math.floor(s)}
function vn(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf),a=hsh(xi,zi),b=hsh(xi+1,zi),c=hsh(xi,zi+1),d=hsh(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,z){let s=0,a=.5,f=1;for(let i=0;i<5;i++){s+=a*vn(x*f,z*f);f*=2.03;a*=.5}return s}
let TER=null;
function Hgt(x,z){const T=TER;if(!T)return 0;const e=Math.hypot(x/T.rx,z/T.rz);if(e<1)return 0;const k=Math.min(1,(e-1)/T.ramp),sm=k*k*(3-2*k);
 let h=sm*(T.amp*Math.pow(fbm(x*.006+T.seed,z*.006-T.seed),1.6)*2.2+T.amp*.35*fbm(x*.025,z*.025+T.seed));
 if(T.river){const rz=T.river.z+T.river.a*Math.sin(x*.012),dd=Math.abs(z-rz);h*=Math.min(1,Math.max(.04,(dd-T.river.w)/70))}
 if(T.rs&&h>0){let dm=1e9;for(let i=0;i<T.rs.length;i+=2){const dx=x-T.rs[i],dz=z-T.rs[i+1],q=dx*dx+dz*dz;if(q<dm)dm=q}dm=Math.sqrt(dm);const f=Math.min(1,Math.max(0,(dm-16)/55));h*=f*f*(3-2*f)}return h}
function terrain(T){if(T.roads){T.rs=[];T.roads.forEach(pts=>{const cv=curve(pts),n=Math.ceil(cv.getLength()/6);for(let i=0;i<=n;i++){const p=cv.getPointAt(i/n);T.rs.push(p.x,p.z)}})}TER=T;const S=1100,N=110,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=[];
 const cF=new THREE.Color(0xb7dc9c),cG=new THREE.Color(0x86c070),cD=new THREE.Color(0x4f9a57),cR=new THREE.Color(0x9fd18a);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=Hgt(x,z);p.setY(i,h-.12);const n=fbm(x*.03+9,z*.03);
  const c=cF.clone().lerp(cG,Math.min(1,h/(T.amp*.25))).lerp(cD,Math.max(0,Math.min(1,(h-T.amp*.2)/(T.amp*.6))));if(n>.62&&h<T.amp*.35)c.lerp(cR,.6);if(n<.3&&h>2&&h<T.amp*.3)c.lerp(new THREE.Color(0xd8cf9a),.35);col.push(c.r,c.g,c.b)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();const m=mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,envMapIntensity:.3}));m.castShadow=false;
 if(T.river){const pts=[];for(let x=-560;x<=560;x+=20)pts.push([x,T.river.z+T.river.a*Math.sin(x*.012)]);const cv=curve(pts);const N2=200,pos=[],idx=[];for(let i=0;i<=N2;i++){const t=i/N2,q=cv.getPointAt(t),tg=cv.getTangentAt(t),nn=new THREE.Vector3(-tg.z,0,tg.x).multiplyScalar(T.river.w);pos.push(q.x+nn.x,.6,q.z+nn.z,q.x-nn.x,.6,q.z-nn.z);if(i<N2){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setIndex(idx);rg.computeVertexNormals();const rv=mesh(rg,M(0x6fb6c9,{roughness:.2,metalness:.1,side:THREE.DoubleSide}));rv.castShadow=false}
 // forest on slopes
 const L=[];let k=0;while(L.length<T.trees&&k<20000){k++;const x=(Math.random()-.5)*1000,z=(Math.random()-.5)*1000,h=Hgt(x,z);if(h<1.5)continue;if(fbm(x*.02,z*.02+3)<.42)continue;L.push([x,z,1.6+Math.random()*1.8,h])}
 const n=L.length,ga=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),M(0x3f8a48,{roughness:.95}),n),gb=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),M(0x5aa45b,{roughness:.95}),n),o=new THREE.Object3D();let a=0,b=0;
 L.forEach(([x,z,s,h],i)=>{o.position.set(x,h+s*1.6,z);o.scale.set(s*1.5,s*2,s*1.5);o.rotation.y=Math.random()*3;o.updateMatrix();(i%2?ga:gb).setMatrixAt(i%2?a++:b++,o.matrix)});ga.count=a;gb.count=b;ga.castShadow=gb.castShadow=false;ga.receiveShadow=gb.receiveShadow=false;world.add(ga,gb)}
function hills(list){list.forEach(([x,z,rx,rz,h,c])=>{const m=mesh(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2),M(c||0xb7d9a8,{roughness:1}),x,0,z);m.scale.set(rx,h,rz);m.castShadow=false})}

const BLD={};const SHELLM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,envMapIntensity:.5}),ROOFM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.15,side:THREE.DoubleSide});
function building(key,o){const g=new THREE.Group();g.position.set(o.x,0,o.z);if(o.rot)g.rotation.y=o.rot;world.add(g);
 const wm=new THREE.MeshStandardMaterial({color:o.wall||0xf6f7f8,roughness:.7,envMapIntensity:.5,transparent:true,opacity:1});
 B(o.w+.6,.5,o.d+.6,0xc9cfd4,0,0,0,g);
 const walls=mesh(new RoundedBoxGeometry(o.w,o.h,o.d,2,.35),wm,0,o.h/2,0,g);walls.userData.key=key;
 const trim=B(o.w+.2,.5,o.d+.2,o.trim||0x2f9a4a,0,o.h-.6,0,g);trim.material=trim.material.clone();trim.material.transparent=true;trim.userData.key=key;
 const winM=M(0x5d7f9c,{roughness:.2,metalness:.3});const wins=[];if(o.win!==false)[o.d/2+.02,-o.d/2-.02].forEach(z=>wins.push(B(o.w*.86,.9,.1,winM,0,o.h-2.2,z,g)));
 const low=new THREE.Group();g.add(low);const lm=M(o.wall||0xf6f7f8);B(o.w,1.6,.5,lm,0,.4,o.d/2-.25,low);B(o.w,1.6,.5,lm,0,.4,-o.d/2+.25,low);B(.5,1.6,o.d,lm,o.w/2-.25,.4,0,low);B(.5,1.6,o.d,lm,-o.w/2+.25,.4,0,low);low.visible=false;const lowIn=null;
 const roof=new THREE.Group();g.add(roof);const rc=o.rc||0x7fa9d9;
 if(o.roof==='arch'){const n=o.n||1,hw=o.w/n;for(let i=0;i<n;i++){const gg=new THREE.CylinderGeometry(hw/2,hw/2,o.d+.8,36,1,false,-Math.PI/2,Math.PI);gg.rotateX(-Math.PI/2);gg.scale(1,.42,1);mesh(gg,M(rc,{side:THREE.DoubleSide,roughness:.55,metalness:.15}),-o.w/2+hw/2+i*hw,o.h,0,roof)}}
 else{const rh=o.rh||Math.min(4,o.d*.16),sl=Math.hypot(o.d/2+.6,rh),ang=Math.atan2(rh,o.d/2+.6);
  [1,-1].forEach(s=>{const p=mesh(new THREE.BoxGeometry(o.w+1.2,.4,sl),M(rc,{roughness:.55,metalness:.15}),0,o.h+rh/2,s*(o.d/4+.3),roof);p.rotation.x=s*ang});
  B(o.w+1.3,.35,.9,0xe8edf1,0,o.h+rh-.1,0,roof)}
 roof.traverse(m=>m.userData.key=key);
 if(o.docks)for(let i=0;i<o.docks;i++){const x=-o.w/2+o.w/(o.docks+1)*(i+1),s=o.dockSide||1,z=s*(o.d/2+.05);B(4.2,4.6,.3,0x3d474f,x,.3,z,g);B(4.8,.35,.5,o.trim||0x2f9a4a,x,4.9,z,g);B(5.6,.25,2.2,0xdfe4e8,x,5.5,z+s,g)}
 const inside=new THREE.Group();g.add(inside);
 // merge shell (walls+trim+windows) and roof panels: 2 draw calls per building
 const fuse=(meshes,mat)=>{const gs=meshes.map(m=>{m.updateMatrix();const q=nz(m.geometry.clone()).applyMatrix4(m.matrix);for(const n of Object.keys(q.attributes))if(!['position','normal','uv'].includes(n))q.deleteAttribute(n);if(!q.attributes.uv)q.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(q.attributes.position.count*2),2));return tint(q,m.material.color)});meshes.forEach(m=>m.parent.remove(m));const r=new THREE.Mesh(mergeGeometries(gs,false),mat);r.castShadow=r.receiveShadow=true;return r};
 const shell=fuse([walls,trim,...wins],SHELLM);shell.userData.key=key;g.add(shell);
 const rf=fuse([...roof.children],ROOFM);rf.userData.key=key;roof.add(rf);
 [shell,roof,low].forEach(q=>q.userData.dyn=1);BLD[key]={g,walls:shell,wm,trim:shell,roof,inside,o,wins:[],low,lowIn};return BLD[key]}
function house(key,x,z,w,d,h,rc,rot){return building(key,{x,z,w,d,h,rc,rot,trim:0xffffff})}

let CARGO=null;function cargoGeo(){if(CARGO)return CARGO;const o=new THREE.Object3D(),gs=[];for(let i=0;i<26;i++){o.position.set(-1.3+(Math.random()-.5)*5,2.5+Math.random()*.6,(Math.random()-.5)*2);o.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);o.updateMatrix();gs.push(new THREE.CapsuleGeometry(.22,1.2,3,6).applyMatrix4(o.matrix))}return CARGO=mergeGeometries(gs,false)}
const TRK={};const nz=g=>g.index?g.toNonIndexed():g;
function truckGeo(kind,s){const k=kind+s;if(TRK[k])return TRK[k];const P=[];const add=(g,c,x,y,z,rx)=>{if(rx)g.rotateX(rx);g.translate(x,y,z);P.push(tint(nz(g),c))};
 add(new RoundedBoxGeometry(2.6,2.6,2.6,2,.35),0xf7f8f9,3.7,2.1,0);add(new THREE.BoxGeometry(.12,1.1,2.2),0x34495a,5.02,2.65,0);add(new THREE.BoxGeometry(2.62,.35,2.62),s,3.7,1.575,0);add(new THREE.BoxGeometry(9,.5,2.4),0x3a4248,0,.8,0);
 if(kind==='cassava')add(new THREE.BoxGeometry(5.8,1.4,2.6),0x5d7a3b,-1.3,1.75,0);
 [[3.5,1.2],[3.5,-1.2],[-2.6,1.2],[-2.6,-1.2],[-.9,1.2],[-.9,-1.2]].forEach(([x,z])=>add(new THREE.CylinderGeometry(.55,.55,.45,16),0x1f2326,x,.55,z,Math.PI/2));
 P.forEach(g=>{for(const n of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(n))g.deleteAttribute(n)});return TRK[k]=mergeGeometries(P,false)}
function truck(kind){const g=new THREE.Group();const s=[0x2f9a4a,0x2f6fd6,0xe0662e,0xd8a526][Math.floor(Math.random()*4)];
 const body=new THREE.Mesh(truckGeo(kind,s),VCM);body.castShadow=body.receiveShadow=true;g.add(body);
 let cargo;if(kind==='cassava'){cargo=new THREE.Mesh(cargoGeo(),M(0x8a5a2b));cargo.castShadow=true;g.add(cargo)}
 else{const cm=new THREE.MeshStandardMaterial({map:contTex(['#c0392b','#2563a8','#2f8f46','#e08a1e'][Math.floor(Math.random()*4)]),roughness:.6});cargo=RB(6.2,2.7,2.5,.1,cm,-1.2,1.05,0,g)}
 g.userData.cargo=cargo;g.userData.dyn=1;g.scale.setScalar(1.25);world.add(g);return g}
const VEST=[0x2f9a4a,0x2f6fd6,0xe08a1e,0x2f9a4a,0x1f7a8c];
const VCM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,envMapIntensity:.6}),BODY={};
function tint(g,c){const col=c&&c.isColor?c:new THREE.Color(c),n=g.attributes.position.count,a=new Float32Array(n*3);for(let k=0;k<n;k++){a[k*3]=col.r;a[k*3+1]=col.g;a[k*3+2]=col.b}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g}
function bodyGeo(vest,hat){const k=vest+'_'+hat;if(BODY[k])return BODY[k];const parts=[tint(new THREE.CapsuleGeometry(.32,.6,4,10).translate(0,1.5,0),vest),tint(new THREE.BoxGeometry(.66,.12,.66).translate(0,1.61,0),0xf2f2ea),tint(new THREE.SphereGeometry(.25,14,10).translate(0,2.22,0),0xd9a77a),tint(new THREE.SphereGeometry(.3,14,8,0,Math.PI*2,0,Math.PI/2).translate(0,2.3,0),hat)];
 return BODY[k]=mergeGeometries(parts.map(g=>g.index?g:g),false)}
const LEG=new THREE.BoxGeometry(.22,.9,.24).translate(0,-.45,0);
function worker(i,p){const g=new THREE.Group(),lm=M(0x2d3640);const legs=[.18,-.18].map(z=>{const l=new THREE.Mesh(LEG,lm);l.position.set(0,.9,z);g.add(l);return l});
 g.add(new THREE.Mesh(bodyGeo(VEST[i%VEST.length],i%3?0xf2c200:0xffffff),VCM));g.userData.legs=legs;g.userData.dyn=1;g.scale.setScalar(1.35);(p||world).add(g);return g}
function walkers(paths,per,p){paths.forEach((pts,pi)=>{const cv=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q[0],0,q[1])),true),L=cv.getLength();
 for(let j=0;j<per;j++){const w=worker(pi*3+j,p),off=j/per+Math.random()*.1,sp=(1.6+Math.random()*.6)/L,dir=j%2?1:-1;
  anim.push(t=>{let u=((off+dir*t*sp)%1+1)%1;const a=cv.getPointAt(u),b=cv.getPointAt((u+dir*.002+1)%1);w.position.set(a.x,p?.6:0,a.z);w.lookAt(b.x,w.position.y,b.z);w.rotateY(-Math.PI/2);const s=Math.sin(t*7+j*2)*.55;w.userData.legs[0].rotation.z=s;w.userData.legs[1].rotation.z=-s;w.position.y+=Math.abs(Math.cos(t*7+j*2))*.08})}})}
function stander(x,z,face,i,p){const w=worker(i,p);w.position.set(x,.6,z);w.rotation.y=face;anim.push(t=>{w.rotation.y=face+Math.sin(t*.8+i)*.35;w.position.y=.6+Math.abs(Math.sin(t*2.2+i))*.06});return w}
function forklift(p){const g=new THREE.Group();RB(2.2,1.3,1.4,.2,0xf2b41c,0,.3,0,g);B(.15,2.6,1.1,0x2a2f33,1.15,.2,0,g);B(1.4,.1,.9,0x555555,1.8,.35,0,g);B(1.4,.12,1.3,0x2a2f33,-.2,2.3,0,g);
 [[-.6,.6],[-.6,-.6],[.7,.6],[.7,-.6]].forEach(([x,z])=>{const w=mesh(new THREE.CylinderGeometry(.35,.35,.3,12),M(0x1f2326),x,.35,z,g);w.rotation.x=Math.PI/2});g.userData.dyn=1;(p||world).add(g);return g}

const anim=[];const STAGE={};
function factoryInterior(b){const {w,d,h}=b.o,g=b.inside;B(w-1,.12,d-1,0xb3bbc1,0,.5,0,g);
 const lane=M(0xf2c200);B(w-6,.03,.4,lane,0,.62,0,g);B(w-6,.03,.4,lane,0,.62,d/2-4,g);
 const x0=-w/2+6,sp=(w-12)/5,X=i=>x0+sp*i+sp/2,zb=-d/4,y0=.6,ST=['ລ້າງ-ປອກເປືອກ','ບົດ (Rasper)','ສະກັດ-ແຍກເສັ້ນໄຍ','Hydrocyclone','Flash Dryer','ບັນຈຸຖົງ'];
 const drum=C(2.2,2.2,7,M(0x8fb3cf,{metalness:.4,roughness:.4}),X(0)-1.5,y0,zb,g,28);drum.rotation.z=Math.PI/2;drum.position.y=y0+3.4;RB(7.5,2,3.4,.2,0x5d6a74,X(0)-1.5,y0,zb,g);drum.userData.dyn=1;anim.push(t=>drum.rotation.x=t*1.4);
 const ras=C(2.2,2.2,1.2,M(0x2f7fd0,{metalness:.3,roughness:.4}),X(0)+3.5,y0,zb+5,g,28);ras.rotation.x=Math.PI/2;ras.position.y=y0+3;RB(3.4,1.8,3,.2,0x4a545c,X(0)+3.5,y0,zb+5,g);ras.userData.dyn=1;anim.push(t=>ras.rotation.y=t*4);
 STAGE.s1=[X(0)-1.5,zb];STAGE.s2=[X(0)+3.5,zb+5];
 for(let i=0;i<4;i++){const cx=X(1)-4.5+i*3;C(1.3,1.3,1.4,M(0xd5dce2,{metalness:.5,roughness:.3}),cx,y0+2.3,zb,g);const cn=mesh(new THREE.ConeGeometry(1.3,2.3,24),M(0xbfc8cf,{metalness:.5,roughness:.3}),cx,y0+1.15,zb,g);cn.rotation.x=Math.PI;cn.userData.dyn=1;anim.push(t=>cn.rotation.y=t*6+i);C(.2,.2,1.2,0x6b757d,cx,y0,zb,g,8)}
 RB(9,1.2,3.6,.2,M(0x9b6b3d),X(1),y0,zb+7,g);STAGE.s3=[X(1),zb];
 B(13,.3,1.4,0x9aa6af,X(2),y0+2.4,zb,g);for(let i=0;i<7;i++){const cx=X(2)-6+i*2;const cn=mesh(new THREE.ConeGeometry(.55,2.6,20),M(0xeef2f5,{metalness:.3}),cx,y0+3.6,zb,g);cn.rotation.x=Math.PI;C(.55,.55,.7,0xeef2f5,cx,y0+4.9,zb,g,20)}
 C(1.8,1.8,5,M(0xf0f3f5,{metalness:.2}),X(2)-2.5,y0,zb+7,g);C(1.8,1.8,5,M(0xf0f3f5,{metalness:.2}),X(2)+2.5,y0,zb+7,g);STAGE.s4=[X(2),zb];
 C(2,2,7,M(0x3f8fe0,{metalness:.2,roughness:.4}),X(3)-3,y0,zb,g);C(2,2,7,M(0xd64545,{metalness:.2,roughness:.4}),X(3)+1.5,y0,zb,g);
 C(1.6,1.6,h+8,M(0xdfe5ea,{metalness:.5,roughness:.3}),X(3)+1,y0,zb+7,g);const cy=mesh(new THREE.ConeGeometry(2,3,24),M(0xdfe5ea,{metalness:.5}),X(3)-3,h-2,zb+7,g);cy.rotation.x=Math.PI;C(2,2,2.4,M(0xdfe5ea,{metalness:.5}),X(3)-3,h-1.2,zb+7,g);
 b.chim=new THREE.Vector3(b.o.x+X(3)+1,h+9,b.o.z+zb+7);STAGE.s5=[X(3),zb];
 const hp=mesh(new THREE.ConeGeometry(2,3,4),M(0xf08a24),X(4)-3,y0+5,zb,g);hp.rotation.x=Math.PI;hp.rotation.y=Math.PI/4;RB(3,3.4,3,.2,0xe6eaed,X(4)-3,y0,zb,g);
 RB(11,1,2.4,.15,0x8b949b,X(4)+1.5,y0,zb+6,g);for(let i=0;i<10;i++){const r=C(.16,.16,2.4,0xc9d0d6,X(4)-3.5+i*1.05,y0+1.05,zb+6,g,8);r.rotation.x=Math.PI/2}
 const arm=new THREE.Group();arm.position.set(X(4)+2.5,y0,zb+1.5);g.add(arm);C(.8,1,1.2,0xf5f5f0,0,0,0,arm);const a1=new THREE.Group();a1.position.y=1.2;arm.add(a1);const u=RB(.7,3.4,.7,.2,0xf5f5f0,0,0,0,a1);u.rotation.z=.35;RB(3.2,.6,.6,.2,0xf5f5f0,1.6,3,0,a1);RB(.9,.9,.9,.2,0xf08a24,3.1,2.4,0,a1);
 arm.userData.dyn=1;anim.push(t=>{arm.rotation.y=Math.sin(t*1.3)*1.2});const cb=[];for(let i=0;i<4;i++)cb.push(RB(1.2,.5,.8,.1,0xfbfbf7,0,y0+1.6,zb+6,g));cb.forEach(c=>c.userData.dyn=1);anim.push(t=>cb.forEach((c,i)=>{c.position.x=X(4)-3.5+((t*1.6+i*2.6)%10.5)}));STAGE.s6=[X(4),zb];
 ['s1','s2','s3','s4','s5','s6'].forEach((s,i)=>{const [x,z]=STAGE[s];stander(x+(i%2?2.5:-2.5),z+4.2,i%2?-Math.PI/2:Math.PI/2,i,g)});stander(X(4)+5,zb+6,Math.PI,7,g);stander(X(1)+1,zb+9.5,0,8,g);
 walkers([[[ -w/2+5,d/2-4],[w/2-5,d/2-4],[w/2-5,d/2-3],[-w/2+5,d/2-3]]],2,g);
 const pm=M(0xb9c2c8,{metalness:.5,roughness:.35});const p=C(.28,.28,X(4)-X(0)-3,pm,(X(0)+3+X(4))/2,0,zb-3.4,g,10);p.rotation.z=Math.PI/2;p.position.y=y0+6.4;
 const flow=new THREE.InstancedMesh(new THREE.SphereGeometry(.34,8,6),M(0xffffff,{emissive:0x335533}),24);g.add(flow);const dd=new THREE.Object3D();
 anim.push(t=>{for(let i=0;i<24;i++){const k=(t*.07+i/24)%1;dd.position.set(X(0)+1.5+k*(X(4)-X(0)-3),y0+6.4,zb-3.4);dd.updateMatrix();flow.setMatrixAt(i,dd.matrix)}flow.instanceMatrix.needsUpdate=true});
 ['s1','s2','s3','s4','s5','s6'].forEach((s,i)=>{const [x,z]=STAGE[s];const l=chip(i+1,ST[i],b.o.x+x,y0+(i%2?12:8),b.o.z+z,null,'stage');l.visible=false})}
let stockG=null;
function warehouseInterior(b,t25,t850){const {w,d}=b.o,g=b.inside;if(!b.fl){B(w-1,.1,d-1,0x7d868d,0,.5,0,g);const lane=M(0xf2c200);B(w-4,.03,.35,lane,0,.6,d/2-5,g);B(w-4,.03,.35,lane,0,.6,-d/2+3,g);B(.35,.03,d-6,lane,w*.18,.6,0,g);
  for(let i=1;i<Math.floor(w/12);i++)for(const z of[-d/4,d/4])mesh(new THREE.BoxGeometry(.6,b.o.h-.4,.6),colMat,-w/2+i*12,b.o.h/2,z,g);
  const fl=forklift(g);anim.push(t=>{fl.position.set(Math.sin(t*.35)*(w/2.6),.55,d/2-5);fl.rotation.y=Math.cos(t*.35)>0?0:Math.PI});walkers([[[-w/2+4,d/2-8],[w/3,d/2-8],[w/3,d/2-7],[-w/2+4,d/2-7]]],2,g);stander(w*.2-1,-d/2+4,0,4,g);b.fl=1}
 if(stockG)g.remove(stockG);stockG=new THREE.Group();stockG.userData.dyn=1;g.add(stockG);
 const pallets=Math.round(t25),jumbo=Math.round(t850*1000/850),o=new THREE.Object3D();
 const cols=Math.max(1,Math.floor((w*.6-6)/2.8)),rows=Math.max(1,Math.floor((d-10)/2.2)),per=cols*rows;
 const ib=new THREE.InstancedMesh(new RoundedBoxGeometry(2.3,1.65,1.55,1,.08),bagMat,Math.max(1,pallets)),pg=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,.18,1.6),M(0x9c7a52),Math.max(1,pallets));
 for(let p=0;p<pallets;p++){const L=Math.floor(p/per),q=p%per,px=-w/2+4+(q%cols)*2.8,pz=-d/2+5+Math.floor(q/cols)*2.2,py=.6+L*1.9;o.position.set(px,py+.09,pz);o.updateMatrix();pg.setMatrixAt(p,o.matrix);o.position.set(px,py+1.01,pz);o.updateMatrix();ib.setMatrixAt(p,o.matrix)}
 ib.count=pg.count=pallets;ib.castShadow=pg.castShadow=true;stockG.add(ib,pg);
 const jc=Math.max(1,Math.floor((w*.3-4)/1.35)),jr=Math.max(1,Math.floor((d-10)/1.35));
 const ij=new THREE.InstancedMesh(new RoundedBoxGeometry(1.15,1.2,1.15,2,.18),M(0xf6f6f1,{roughness:.95}),Math.max(1,jumbo)),band=new THREE.InstancedMesh(new THREE.BoxGeometry(1.17,.18,1.17),M(0x2f9a4a),Math.max(1,jumbo));
 for(let j=0;j<jumbo;j++){const L=Math.floor(j/(jc*jr)),r=j%(jc*jr);o.position.set(w*.2+1+(r%jc)*1.35,1.2+L*1.22,-d/2+5+Math.floor(r/jc)*1.35);o.updateMatrix();ij.setMatrixAt(j,o.matrix);band.setMatrixAt(j,o.matrix)}
 ij.count=band.count=jumbo;ij.castShadow=true;stockG.add(ij,band)}

let pile=null,trucks=[],conv=[],steam=null;
// merge every static mesh that shares a material into one draw call (no visual change)
function batchStatic(){world.updateMatrixWorld(true);const groups=new Map(),drop=[];
 world.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;let a=o;while(a&&a!==world){if(a.userData.dyn||a.userData.key)return;a=a.parent}
  const m=o.material;if(Array.isArray(m)||m.transparent||m.vertexColors)return;const k=m.uuid+'|'+o.castShadow+o.receiveShadow;let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
  for(const n of Object.keys(g.attributes))if(!['position','normal','uv'].includes(n))g.deleteAttribute(n);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.morphAttributes={};g.applyMatrix4(o.matrixWorld);if(!groups.has(k))groups.set(k,{m,cs:o.castShadow,rs:o.receiveShadow,gs:[]});groups.get(k).gs.push(g);drop.push(o)});
 drop.forEach(o=>o.parent.remove(o));let n=0;groups.forEach(({m,cs,rs,gs})=>{const mg=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());if(!mg)return;const mm=new THREE.Mesh(mg,m);mm.castShadow=cs;mm.receiveShadow=rs;world.add(mm);n++});
 window.__batch={meshes:drop.length,calls:n}}
function cassavaPile(x,z,R){const N=420,im=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.3,1.5,3,6),M(0xffffff,{roughness:.95}),N),o=new THREE.Object3D(),col=new THREE.Color();
 for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*R;const hgt=Math.max(0,(1-r/R))*R*.6;o.position.set(x+Math.cos(a)*r,.3+Math.random()*hgt,z+Math.sin(a)*r*.75);o.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,col.setHSL(.065+Math.random()*.02,.6,.16+Math.random()*.1))}
 im.castShadow=true;im.userData.key='yard';world.add(im);pile={im,N,level:.7};im.count=Math.floor(N*pile.level)}
function conveyor(a,b,itemMat,size){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va),len=v.length();
 const belt=mesh(new THREE.BoxGeometry(len,.35,1.8),M(0x5f676d),...va.clone().add(vb).multiplyScalar(.5).toArray());belt.lookAt(vb);belt.rotateY(Math.PI/2);
 for(let i=0;i<=4;i++){const t=i/4,p=va.clone().addScaledVector(v,t);C(.18,.18,Math.max(.1,p.y),0x9aa4ab,p.x,0,p.z,world,8)}
 const N=Math.floor(len/2.4),im=new THREE.InstancedMesh(new THREE.BoxGeometry(...size),itemMat,N);im.castShadow=true;world.add(im);conv.push({va,v,N,im})}
function addTrucks(cv,stops,n,kind){for(let i=0;i<n;i++)trucks.push({g:truck(kind),u:i/n,wait:0,cv,stops,done:{}})}

const SITES={
 xan:{prov:'ແຂວງ ວຽງຈັນ',home:{pos:[170,170,190],tgt:[0,0,0],zoom:1},
  locs:[['gate','ປະຕູທາງເຂົ້າ',''],['weigh','ຕາຊັ່ງ','ຊັ່ງ ແລະ ກວດຄຸນນະພາບ'],['yard','ລານມັນ','ມັນຕົ້ນລໍຖ້າເຂົ້າຜະລິດ'],['factory','ໂຮງງານ ຜະລິດ','ລ້າງ → ບົດ → ສະກັດ → ອົບແຫ້ງ → ບັນຈຸ'],['factory2','ໂຮງງານ (ຫຼັງທີ 2)',''],['warehouse','ສາງຈັດເກັບ','ແປ້ງລໍຖ້າສົ່ງອອກ'],['dock','ບ່ອນຂຶ້ນສິນຄ້າ','ຂົນສົ່ງອອກ'],['office','ຫ້ອງການ',''],['canteen','ໂຮງອາຫານ',''],['camp','ແຄ້ມພະນັກງານ',''],['pond','ໜອງນ້ຳ','']],
  build(){const RI=[[-560,-300],[-320,-190],[-170,-118],[-96,-84],[-76,-50],[-62,-26],[-44,-12],[-30,-6],[-50,6],[-80,-6],[-94,-40],[-104,-86],[-180,-132],[-320,-205],[-560,-320]],RO=[[34,78],[64,80],[98,58],[132,24],[210,14],[330,26],[560,40]];
   terrain({rx:178,rz:142,ramp:.9,amp:30,seed:2.3,trees:800,roads:[RI,RO]});
   pad(330,260,0xdcefd2,0,0,-.05);fence(158,125);
   pad(64,44,0xe4dcc8,-38,-6);pad(26,20,0xd9dde0,-64,-40);pad(54,20,0xd9dde0,30,74);
   pond(22,-46,26,15,2);
   const inC=road(curve(RI));
   const outC=road(curve(RO));road(curve([[-96,-84],[-56,-72],[-20,-82],[30,-90],[70,-80]]),6);
   building('factory',{x:-14,z:22,w:64,d:24,h:12,rc:0x7fa9d9});building('factory2',{x:46,z:4,w:34,d:26,h:10,rc:0x86aedc});C(2.4,2.4,26,M(0xdfe6ec,{metalness:.5,roughness:.3}),54,.5,-4);
   C(3,3,12,M(0xf3f5f6),24,.5,-8);C(3,3,12,M(0xf3f5f6),31,.5,-8);
   building('warehouse',{x:-10,z:56,w:84,d:26,h:10,rc:0x6f9ed6,docks:5,dockSide:1});
   building('weigh',{x:-64,z:-40,w:8,d:6,h:4,rc:0x2f9a4a,trim:0xffffff});B(18,.4,4.4,0x7b8288,-64,0,-31);
   house('office',-30,-64,16,10,5,0xd65a3f);house('canteen',-12,-80,18,10,5,0xd65a3f);house('camp',44,-92,36,8,4,0xd65a3f);house('camp2',80,-72,30,8,4,0xd65a3f,Math.PI/2);
   building('gate',{x:-96,z:-84,w:4,d:4,h:3.5,rc:0x2f9a4a,win:false});B(.4,3,.4,0x9aa4ab,-96,0,-77);B(9,.3,.3,0xd94141,-96,2.6,-78);
   cassavaPile(-46,-10,13);conveyor([-30,1.2,-2],[-24,10,9.5],M(0x8b5a2b),[1.2,.6,1.1]);conveyor([14,7,33],[14,5,43],M(0xfbfbf7),[1.2,.45,.8]);
   trees(scatterTrees(150,118,30,(x,z)=>Math.abs(x+80)<30&&z<-60).concat([[-10,-104,2.2],[10,-102,2],[60,-56,2.2],[-60,-70,1.8],[90,-40,2.3],[-120,30,2.4],[-118,60,2],[100,96,2]]));
   walkers([[[-64,-22],[-28,-22],[-24,6],[-64,4]],[[-30,-56],[-20,-40],[-6,-20],[-10,6],[-24,-12],[-36,-42]],[[-50,73],[30,73],[30,76],[-50,76]],[[-12,-72],[10,-86],[40,-84],[10,-74]],[[60,-10],[82,-30],[64,-42],[50,-22]]],2);
   addTrucks(inC,[{u:.25,s:2,a:'weigh'},{u:.47,s:3,a:'dump'}],4,'cassava');addTrucks(outC,[{u:0,s:3.5,a:'load'}],2,'export');
   return {chips:{gate:[-96,8,-84],weigh:[-64,9,-38],yard:[-40,9,-8],factory:[-14,22,22],factory2:[46,18,4],warehouse:[-24,18,56],dock:[34,7,80],office:[-30,12,-64],canteen:[-12,12,-80],camp:[44,11,-92],pond:[22,5,-46]}}}},
 nan:{prov:'ແຂວງ ຫຼວງພະບາງ',home:{pos:[180,180,200],tgt:[0,0,0],zoom:.85},
  locs:[['gate','ປະຕູທາງເຂົ້າ',''],['weigh','ຕາຊັ່ງ','ຊັ່ງ ແລະ ກວດຄຸນນະພາບ'],['yard','ລານມັນ','ມັນຕົ້ນລໍຖ້າເຂົ້າຜະລິດ'],['factory','ໂຮງງານ ຜະລິດ','ລ້າງ → ບົດ → ສະກັດ → ອົບແຫ້ງ → ບັນຈຸ'],['warehouse','ສາງຈັດເກັບ','ແປ້ງລໍຖ້າສົ່ງອອກ'],['dock','ບ່ອນຈອດລົດຂົນສິນຄ້າ','ຂົນສົ່ງອອກ'],['biogas','Bio Gas','ບໍ່ໝັກກ໊າຊຊີວະພາບ'],['wwt','ອ່າງບຳບັດນ້ຳເສຍ',''],['pond','ໜອງນ້ຳ',''],['canteen','ໂຮງອາຫານ',''],['camp','ແຄ້ມພະນັກງານ','']],
  build(){const RI=[[560,-150],[340,-110],[210,-78],[136,-46],[104,0],[64,46],[10,64],[-36,58],[-62,48],[-46,74],[16,84],[72,66],[114,12],[154,-50],[236,-86],[340,-120],[560,-165]],RO=[[74,26],[100,12],[128,-32],[206,-66],[340,-92],[560,-130]];
   terrain({rx:200,rz:158,ramp:.8,amp:48,seed:6.1,trees:900,river:{z:-430,a:40,w:16},roads:[RI,RO]});
   pad(380,300,0xdcefd2,0,0,-.05);fence(182,140);
   pad(46,40,0xe4dcc8,-66,54);pad(44,32,0xd9dde0,84,26);pond(4,-62,46,15,5);
   [[-140,36],[-96,36]].forEach(([x,z])=>{pad(42,48,0xe3d8bf,x,z,.02);const m=mesh(new THREE.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI/2),M(0x272d33,{roughness:.35,metalness:.2}),x,.2,z);m.scale.set(19,2.2,22);m.userData.key='biogas'});
   [[-136,-54,26,18,0x8fd1c4],[-110,-54,16,18,0x9ed9a8],[-92,-54,14,18,0x8fd1c4]].forEach(([x,z,w,d,c])=>{B(w+2,.6,d+2,0xd9d2bf,x,0,z);const m=B(w,.62,d,M(c,{roughness:.2}),x,.02,z);m.userData.key='wwt'});C(5,5,1.4,0xd9d2bf,-150,0,-28);C(4.4,4.4,1.45,M(0x8fd1c4,{roughness:.2}),-150,.02,-28);
   const inC=road(curve(RI));
   const outC=road(curve(RO));
   building('factory',{x:-30,z:0,w:48,d:42,h:11,roof:'arch',n:3,rc:0xe6ebef});building('warehouse',{x:34,z:0,w:72,d:42,h:11,roof:'arch',n:5,rc:0xeef2f5,docks:4,dockSide:1});
   C(1.6,1.6,26,M(0xdfe6ec,{metalness:.5,roughness:.3}),-12,.5,-6);
   building('weigh',{x:-8,z:52,w:8,d:6,h:4,rc:0x2f9a4a,trim:0xffffff});B(18,.4,4.4,0x7b8288,-8,0,60);
   house('canteen',112,-26,18,10,5,0xd65a3f);house('camp',60,-64,30,8,4,0xd65a3f);house('camp2',122,62,22,8,4,0xd65a3f);
   for(let i=0;i<4;i++)house('dorm'+i,-6,118+i*11,40,7,3.6,0xd65a3f);
   building('gate',{x:150,z:-58,w:4,d:4,h:3.5,rc:0x2f9a4a,win:false});
   cassavaPile(-70,58,12);conveyor([-56,1.2,42],[-46,10,21],M(0x8b5a2b),[1.2,.6,1.1]);
   trees(scatterTrees(175,135,30,(x,z)=>x<-80&&z>0&&z<80));
   walkers([[[-86,44],[-50,44],[-50,72],[-86,72]],[[-20,30],[10,40],[60,32],[20,26]],[[0,25],[60,25],[60,28],[0,28]],[[100,-30],[80,-50],[60,-56],[85,-36]],[[-60,-20],[-20,-30],[10,-40],[-40,-34]]],2);
   addTrucks(inC,[{u:.34,s:2,a:'weigh'},{u:.46,s:3,a:'dump'}],4,'cassava');addTrucks(outC,[{u:0,s:3.5,a:'load'}],2,'export');
   return {chips:{gate:[150,8,-58],weigh:[-8,9,54],yard:[-66,9,56],factory:[-30,22,0],warehouse:[34,22,0],dock:[84,6,28],biogas:[-118,8,36],wwt:[-118,6,-54],pond:[4,5,-62],canteen:[112,12,-26],camp:[60,11,-64]}}}}};

let cur='xan',SITE=null,simT=null;
function clear(){world.traverse(o=>o.geometry&&o.geometry.dispose());[...world.children].forEach(c=>world.remove(c));LBL.forEach(l=>l.el.remove());LBL.length=0;for(const k in BLD)delete BLD[k];anim.length=0;trucks=[];conv=[];pile=null;stockG=null}
function build(site){clear();cur=site;const S=SITES[site];SITE=S.build();const D=DATA[site];
 S.locs.forEach(([k,n],i)=>{const p=SITE.chips[k];if(p)chip(i+1,n,...p,k)});
 factoryInterior(BLD.factory);warehouseInterior(BLD.warehouse,D.s25,D.s850);
 const sp=new THREE.BufferGeometry(),N=70;sp.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));
 steam={pts:new THREE.Points(sp,new THREE.PointsMaterial({color:0xffffff,size:5,sizeAttenuation:false,transparent:true,opacity:.6,depthWrite:false})),N,age:Float32Array.from({length:N},()=>Math.random())};world.add(steam.pts);
 document.getElementById('siteProv').textContent=S.prov;const st=document.getElementById('siteStatus');st.textContent=D.status;st.className='pill3 '+(D.ok?'ok':'wait');
 document.getElementById('kpis').innerHTML=`<div><small>ມັນຕົ້ນຄ້າງລານ</small><strong>${fmt(D.raw,1)}</strong><em>ໂຕນ</em></div><div><small>ຜະລິດແປ້ງ ລະດູນີ້</small><strong>${fmt(D.prod,1)}</strong><em>ໂຕນ</em></div><div><small>ແປ້ງໃນສາງ</small><strong>${fmt(D.s25+D.s850,1)}</strong><em>ໂຕນ</em></div>`;
 document.getElementById('locs').innerHTML=S.locs.map(([k,n,s],i)=>`<button class="loc" data-k="${k}"><b>${i+1}</b><span>${n}${s?`<small>${s}</small>`:''}</span></button>`).join('');
 document.querySelectorAll('.loc').forEach(b=>b.onclick=()=>focus(b.dataset.k));
 batchStatic();home(true)}
const fly={p:null,t:null,z:null};function flyTo(p,t,z){fly.p=new THREE.Vector3(...p);fly.t=new THREE.Vector3(...t);fly.z=z}
function setOpen(k){for(const key in BLD){const b=BLD[key],on=key===k&&(key==='factory'||key==='warehouse');b.roof.visible=!on;b.walls.visible=!on;b.trim.visible=!on;b.wins.forEach(w=>w.visible=!on);b.low.visible=on}
 LBL.forEach(l=>{if(l.cls==='stage')l.o.visible=k==='factory';else{l.el.classList.toggle('on',l.el.dataset.k===k);l.o.visible=k!=='factory'}});document.querySelectorAll('.loc').forEach(b=>b.classList.toggle('on',b.dataset.k===k))}
function det(h){document.getElementById('det').innerHTML=h}
function home(instant){FK=null;setOpen(null);const h=SITES[cur].home;flyTo(h.pos,h.tgt,h.zoom);if(instant){cam.position.set(...h.pos);controls.target.set(...h.tgt);cam.zoom=h.zoom;cam.updateProjectionMatrix()}
 homeDet()}
function homeDet(){const D=DATA[cur];det(`<h3>ໂຮງງານ ຜະລິດແປ້ງມັນຕົ້ນ ເມືອງ${D.name}</h3><p>ກົດຈຸດໃນລາຍການ ຫຼື ໃນແບບຈຳລອງ ເພື່ອເຂົ້າໄປເບິ່ງ.</p><div class="kv"><span>ເກັບຊື້ ລະດູນີ້</span><b>${fmt(D.proc)} ໂຕນ</b><span>ຜະລິດແປ້ງ</span><b>${fmt(D.prod,1)} ໂຕນ</b><span>ສົ່ງອອກ</span><b>${fmt(D.exp)} ໂຕນ</b><span>ອັບເດດ</span><b>${D.last}</b></div>`)}
const K=rows=>`<div class="kv">${rows.map(([a,v])=>`<span>${a}</span><b>${v}</b>`).join('')}</div>`;
let FK=null;function focus(k){FK=k;const D=DATA[cur],S=SITES[cur],loc=S.locs.find(l=>l[0]===k)||[k,k,''];controls.autoRotate=false;bRot.setAttribute('aria-pressed','false');setOpen(k);
 const b=BLD[k],c=SITE.chips[k]||[0,0,0],at=k==='warehouse'?[b.o.x+b.o.w*.12,1,b.o.z-2]:b?[b.o.x,1,b.o.z]:[c[0],0,c[2]];
 const z=k==='factory'?4.2:k==='warehouse'?3.9:['yard','weigh','dock','gate'].includes(k)?3.2:2.4;
 const VD={factory:[.5,.9,-.8],warehouse:[.3,.9,1],yard:[-.5,.8,.9],weigh:[-.6,.8,.8]};const dir=VD[k]?new THREE.Vector3(...VD[k]).normalize():new THREE.Vector3().subVectors(cam.position,controls.target).normalize();
 const off=dir.clone().multiplyScalar(260);const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),dir).normalize();const panelPx=box.clientWidth>860&&!box.classList.contains('min')?150:0;const wpp=VIEW/z/box.clientHeight;
 const tg=new THREE.Vector3(...at).addScaledVector(right,-panelPx*wpp);flyTo([tg.x+off.x,tg.y+off.y,tg.z+off.z],tg.toArray(),z);
 if(k==='warehouse'){const t=simT??(D.s25+D.s850);det(`<h3>${loc[1]}</h3><p>ກອງແປ້ງໃນສາງ ອີງຕາມຂໍ້ມູນໃນລະບົບ: ຖົງ 25 kg ເທິງພາເລັດ (1 ພາເລັດ = 1 ໂຕນ) ແລະ ຖົງ Jumbo 850 kg.</p>${K([['ແປ້ງ ຖົງ 25 kg',fmt(D.s25,1)+' ໂຕນ'],['ແປ້ງ ຖົງ 850 kg',fmt(D.s850,1)+' ໂຕນ · '+Math.round(D.s850*1000/850)+' ຖົງ'],['ກາກມັນ',fmt(D.pulp,2)+' ໂຕນ'],['ອັບເດດ',D.last]])}
  <div class="sim"><label><span>ຈຳລອງປະລິມານ (ສະແດງເທົ່ານັ້ນ)</span><b id="simV">${fmt(t)} ໂຕນ</b></label><input type="range" id="sim" min="0" max="800" step="10" value="${t}"></div>`);
  document.getElementById('sim').oninput=e=>{simT=+e.target.value;document.getElementById('simV').textContent=fmt(simT)+' ໂຕນ';warehouseInterior(BLD.warehouse,simT*.8,simT*.2)};return}
 if(k==='factory')return det(`<h3>${loc[1]}</h3><p>ຂະບວນການຜະລິດພາຍໃນ: ລ້າງ-ປອກເປືອກ → ບົດ → ສະກັດ-ແຍກເສັ້ນໄຍ → Hydrocyclone → Flash Dryer → ບັນຈຸຖົງ.</p>${K([['ມັນຕົ້ນເຂົ້າຜະລິດ',fmt(D.proc)+' ໂຕນ'],['ຜະລິດແປ້ງ',fmt(D.prod,1)+' ໂຕນ'],['ອັດຕາແປງ',D.conv?fmt(D.conv,2)+' : 1':'—']])}`);
 if(k==='yard')return det(`<h3>${loc[1]}</h3><p>${loc[2]}.</p>${K([['ມັນຕົ້ນຄ້າງລານ',fmt(D.raw,1)+' ໂຕນ'],['ເກັບຊື້ ລະດູນີ້',fmt(D.proc)+' ໂຕນ'],['ອັບເດດ',D.last]])}`);
 if(k==='weigh')return det(`<h3>${loc[1]}</h3><p>ລົດມັນຕົ້ນຊັ່ງນ້ຳໜັກ ແລະ ກວດຄຸນນະພາບ ກ່ອນເຂົ້າລານມັນ.</p>${K([['ເກັບຊື້ ລະດູນີ້',fmt(D.proc)+' ໂຕນ']])}`);
 if(k==='dock')return det(`<h3>${loc[1]}</h3><p>ຂຶ້ນສິນຄ້າໃສ່ລົດ ແລະ ຂົນສົ່ງອອກໄປປະເທດຈີນ.</p>${K([['ສົ່ງອອກ ລະດູນີ້',fmt(D.exp)+' ໂຕນ']])}`);
 det(`<h3>${loc[1]}</h3>${loc[2]?`<p>${loc[2]}.</p>`:''}`)}
document.querySelectorAll('#siteSeg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#siteSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));simT=null;build(b.dataset.s)});
const bRot=document.getElementById('bRot');bRot.onclick=()=>{controls.autoRotate=!controls.autoRotate;bRot.setAttribute('aria-pressed',controls.autoRotate)};
let playing=true;const bPlay=document.getElementById('bPlay');bPlay.onclick=()=>{playing=!playing;bPlay.setAttribute('aria-pressed',playing)};
document.getElementById('bHome').onclick=()=>home(false);
document.getElementById('bMin').onclick=()=>box.classList.add('min');document.getElementById('bOpen').onclick=()=>box.classList.remove('min');
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];fly.p=null});
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,cam);
 for(const h of ray.intersectObjects(world.children,true)){let o=h.object;while(o&&!o.userData.key)o=o.parent;if(o&&SITES[cur].locs.some(l=>l[0]===o.userData.key)){focus(o.userData.key);break}}});
function resize(){const w=box.clientWidth,h=box.clientHeight,a=w/h;renderer.setSize(w,h);lr.setSize(w,h);cam.left=-VIEW*a/2;cam.right=VIEW*a/2;cam.top=VIEW/2;cam.bottom=-VIEW/2;cam.updateProjectionMatrix()}
new ResizeObserver(resize).observe(box);resize();

const clock=new THREE.Clock();let T=0;const tmp=new THREE.Object3D();
function stepTrucks(dt){trucks.forEach(tr=>{if(tr.wait>0){tr.wait-=dt;return}const prev=tr.u;tr.u=(tr.u+dt*.016)%1;const wrapped=tr.u<prev;if(wrapped){tr.done={};tr.g.userData.cargo.visible=true}
 for(const s of tr.stops){const hit=s.u===0?wrapped:(prev<s.u&&tr.u>=s.u);if(hit&&!tr.done[s.u]){tr.done[s.u]=1;tr.wait=s.s;if(s.a==='dump'){tr.g.userData.cargo.visible=false;if(pile)pile.level=Math.min(1,pile.level+.1)}if(s.a==='load')tr.g.userData.cargo.visible=true}}
 const p=tr.cv.getPointAt(tr.u),q=tr.cv.getPointAt(Math.min(.9999,tr.u+.002));tr.g.position.set(p.x,0,p.z);tr.g.lookAt(q.x,0,q.z);tr.g.rotateY(-Math.PI/2)})}
function loop(){const dt=Math.min(.05,clock.getDelta());
 if(playing){T+=dt;anim.forEach(f=>f(T));stepTrucks(dt);
  conv.forEach(c=>{for(let i=0;i<c.N;i++){const u=(T*.05+i/c.N)%1;tmp.position.copy(c.va).addScaledVector(c.v,u);tmp.position.y+=.6;tmp.updateMatrix();c.im.setMatrixAt(i,tmp.matrix)}c.im.instanceMatrix.needsUpdate=true});
  if(pile){pile.level=Math.max(.35,pile.level-dt*.004);pile.im.count=Math.floor(pile.N*pile.level)}
  const ch=BLD.factory&&BLD.factory.chim;if(steam&&ch){const a=steam.pts.geometry.attributes.position;for(let i=0;i<steam.N;i++){steam.age[i]+=dt*.22;if(steam.age[i]>1)steam.age[i]=0;const k=steam.age[i];a.setXYZ(i,ch.x+Math.sin(i*12.9)*k*4+k*8,ch.y+k*22,ch.z+Math.cos(i*7.1)*k*4)}a.needsUpdate=true}}
 if(fly.p){cam.position.lerp(fly.p,.06);controls.target.lerp(fly.t,.06);cam.zoom+=(fly.z-cam.zoom)*.06;cam.updateProjectionMatrix();if(cam.position.distanceTo(fly.p)<.5&&Math.abs(cam.zoom-fly.z)<.01)fly.p=null}
 controls.update();FR++;if(FR%3===0)renderer.shadowMap.needsUpdate=true;if(visible){renderer.render(scene,cam);lr.render(scene,cam)}requestAnimationFrame(loop)}
let FR=0,visible=true;new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(box);document.addEventListener('visibilitychange',()=>{visible=!document.hidden});
function refreshData(){DATA=loadData();const D=DATA[cur];const st=document.getElementById('siteStatus');st.textContent=D.status;st.className='pill3 '+(D.ok?'ok':'wait');
 document.getElementById('kpis').innerHTML=`<div><small>ມັນຕົ້ນຄ້າງລານ</small><strong>${fmt(D.raw,1)}</strong><em>ໂຕນ</em></div><div><small>ຜະລິດແປ້ງ ລະດູນີ້</small><strong>${fmt(D.prod,1)}</strong><em>ໂຕນ</em></div><div><small>ແປ້ງໃນສາງ</small><strong>${fmt(D.s25+D.s850,1)}</strong><em>ໂຕນ</em></div>`;
 if(simT==null&&BLD.warehouse)warehouseInterior(BLD.warehouse,D.s25,D.s850);if(FK){const k=FK,c=cam.position.clone(),t=controls.target.clone(),z=cam.zoom;focus(k);fly.p=null;cam.position.copy(c);controls.target.copy(t);cam.zoom=z;cam.updateProjectionMatrix()}else homeDet()}
window.addEventListener('ls:data',refreshData);
build('xan');loop();window.__f3d={focus,build,home,r:renderer,BLD,world};
