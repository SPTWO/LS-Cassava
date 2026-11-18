// 3D tour of a standard cassava starch line (12 steps). Loaded on first visit to the factory overview tab.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

// ---- the 12 standard steps of a cassava starch line ----
const STEPS=[
 {t:'ຮັບມັນຕົ້ນ',p:'ຊັ່ງນ້ຳໜັກ ແລະ ກວດເປີເຊັນແປ້ງ, ລົດຕັກປ້ອນມັນເຂົ້າຖັງຮັບ',k:'ແປ້ງໃນຫົວມັນ 25–30% · ເຂົ້າຜະລິດພາຍໃນ 48 ຊມ',at:[-116,1.6,6],off:[11,7.5,15]},
 {t:'ຖັງໝູນ ຂັດດິນ-ເປືອກ',p:'ຖັງໝູນຂັດດິນ ຊາຍ ແລະ ເປືອກນອກອອກ ແບບແຫ້ງ',k:'ດິນ ແລະ ເປືອກ ຕົກລົງດ້ານລຸ່ມ',at:[-88,4,0],off:[14,11,24]},
 {t:'ອ່າງລ້າງ',p:'ໃບພາຍໝູນ ດັນມັນໄປໜ້າ ພ້ອມລ້າງດ້ວຍນ້ຳສະອາດ',k:'ນ້ຳລ້າງ ໄຫຼສວນທາງກັບມັນ',at:[-68,2,0],off:[12,10,20]},
 {t:'ສັບ ແລະ ບົດ',p:'ສັບເປັນທ່ອນ ແລ້ວບົດລະອຽດ ໃຫ້ເມັດແປ້ງຫຼຸດອອກຈາກເຊວ',k:'ໄດ້ນ້ຳແປ້ງດິບ (ມີເສັ້ນໄຍປົນ)',at:[-51,3,0],off:[12,9,18]},
 {t:'ແຍກກາກ',p:'ຕະແກງໝູນ 4 ຂັ້ນ ແຍກເສັ້ນໄຍ (ກາກ) ອອກຈາກນ້ຳແປ້ງ',k:'ກາກ → ບີບນ້ຳ → ຂາຍເປັນອາຫານສັດ',at:[-29,5,4],off:[16,14,26]},
 {t:'ແຍກຊາຍ',p:'ໄຊໂຄລນແຍກຊາຍລະອຽດ ແລະ ຕະແກງລະອຽດ ແຍກເສັ້ນໄຍນ້ອຍ',k:'ປ້ອງກັນເຄື່ອງຈັກສຶກ',at:[-5,3,0],off:[12,9,18]},
 {t:'ກັ່ນ ແລະ ລ້າງແປ້ງ',p:'Separator ແລະ Hydrocyclone ຫຼາຍຂັ້ນ ແຍກໂປຣຕີນ ແລະ ນ້ຳຢາງອອກ',k:'ນ້ຳແປ້ງເຂັ້ມຂຶ້ນ ~18–22 °Bé',at:[19,3,0],off:[14,11,22]},
 {t:'ສະເດັດນ້ຳ',p:'ເຄື່ອງປັ່ນສະເດັດນ້ຳ ໄດ້ແປ້ງປຽກເປັນກ້ອນ',k:'ຄວາມຊື້ນ ~35–38%',at:[37,2.5,0],off:[11,8,17]},
 {t:'ອົບແຫ້ງ (Flash Dryer)',p:'ລົມຮ້ອນພັດແປ້ງປຽກຂຶ້ນທໍ່ອົບ ແຫ້ງພາຍໃນບໍ່ເທົ່າໃດວິນາທີ, ໄຊໂຄລນເກັບແປ້ງ',k:'ລົມຮ້ອນ ~150–180 °C',at:[52,12,-2],off:[30,6,46]},
 {t:'ເຮັດເຢັນ ແລະ ຮ່ອນ',p:'ລົມເຢັນ ເຮັດໃຫ້ແປ້ງເຢັນລົງ ແລ້ວຮ່ອນຜ່ານຕະແກງ',k:'ຄວາມຊື້ນ ≤ 13% · ເມັດລະອຽດສະເໝີ',at:[67,4,0],off:[12,9,18]},
 {t:'ບັນຈຸ ແລະ ເຂົ້າສາງ',p:'ຊັ່ງບັນຈຸຖົງ 25 kg ແລະ Jumbo 850 kg, ກວດໂລຫະ, ວາງເທິງພາເລັດ',k:'ພ້ອມສົ່ງອອກ',at:[86,2,-1],off:[14,11,22]},
 {t:'ນ້ຳເສຍ → Biogas',p:'ນ້ຳເສຍເຂົ້າບໍ່ໝັກແບບບໍ່ມີອາກາດ, ອາຍແກັສກັບໄປເປັນເຊື້ອໄຟອົບແປ້ງ',k:'ຫຼຸດກິ່ນ ແລະ ປະຢັດເຊື້ອໄຟ',at:[14,1,-50],off:[44,40,58]}];
const STEP_S=5;

const box=document.getElementById('pf');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
box.prepend(renderer.domElement);
const lr=new CSS2DRenderer();lr.domElement.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:2';box.appendChild(lr.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xdfe8ec,190,460);
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const cam=new THREE.PerspectiveCamera(38,1,.5,1200);
const controls=new OrbitControls(cam,renderer.domElement);Object.assign(controls,{enableDamping:true,maxPolarAngle:Math.PI*.47,minDistance:8,maxDistance:260});
scene.add(new THREE.HemisphereLight(0xffffff,0xa9b7ad,1.25));
const sun=new THREE.DirectionalLight(0xfff6e8,2.4);sun.position.set(-60,120,80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-140,right:140,top:90,bottom:-90,near:10,far:400});sun.shadow.bias=-.0003;sun.shadow.normalBias=.3;scene.add(sun);

// ---- helpers ----
function canv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t}
const CONC=canv(512,512,(g,w,h)=>{g.fillStyle='#b9bdb8';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){const v=150+Math.random()*70|0;g.fillStyle=`rgba(${v},${v+2},${v-2},${.08+Math.random()*.12})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}
 for(let i=0;i<22;i++){const x=Math.random()*w,y=Math.random()*h,r=20+Math.random()*70,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${90+Math.random()*30|0},${85+Math.random()*30|0},70,.16)`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
 g.strokeStyle='rgba(70,72,70,.45)';g.lineWidth=2;for(let x=0;x<=w;x+=128){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<=h;y+=128){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}});
CONC.colorSpace=THREE.SRGBColorSpace;CONC.repeat.set(214/16,32/16);
const BRUSH=canv(256,256,(g,w,h)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,w,h);for(let i=0;i<1800;i++){const v=110+Math.random()*90|0;g.strokeStyle=`rgba(${v},${v},${v},.35)`;g.lineWidth=.5+Math.random();const y=Math.random()*h;g.beginPath();g.moveTo(0,y);g.lineTo(w,y+(Math.random()-.5)*2);g.stroke()}});
const MC={};const M=(c,o={})=>{const k=c+JSON.stringify(o);return MC[k]||(MC[k]=new THREE.MeshStandardMaterial({color:c,roughness:.7,metalness:0,...o}))};
const SS=M(0xd8dde1,{metalness:.9,roughness:.32,roughnessMap:BRUSH}),SS2=M(0xbcc3c9,{metalness:.85,roughness:.42,roughnessMap:BRUSH}),FR=M(0x2f5fb0,{roughness:.55,metalness:.3}),
 MOT=M(0x2e7d4f,{roughness:.45,metalness:.35}),RAIL=M(0xf2c230,{roughness:.5}),CON=M(0xb8bcb8,{roughness:.95}),DARK=M(0x2a2f33,{roughness:.6,metalness:.4});
function add(o,p){o.castShadow=o.receiveShadow=true;(p||scene).add(o);return o}
function mesh(g,m,x=0,y=0,z=0,p){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return add(o,p)}
const B=(w,h,d,m,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y+h/2,z,p);
const RB=(w,h,d,r,m,x,y,z,p)=>mesh(new RoundedBoxGeometry(w,h,d,3,r),m,x,y+h/2,z,p);
const CY=(r1,r2,h,m,x,y,z,p,s=28)=>mesh(new THREE.CylinderGeometry(r1,r2,h,s),m,x,y,z,p);
function tube(pts,r,m,p){const c=new THREE.CatmullRomCurve3(pts.map(a=>new THREE.Vector3(...a)),false,'catmullrom',.05);return mesh(new THREE.TubeGeometry(c,Math.max(16,pts.length*14),r,12),m,0,0,0,p)}
function legs(x,z,w,d,h,m=FR){[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>B(.25,h,.25,m,x+a*w/2,0,z+b*d/2))}
function platform(x,z,w,d,h){B(w,.18,d,M(0x8b949a,{metalness:.6,roughness:.5}),x,h,z);legs(x,z,w-.4,d-.4,h);
 [[0,d/2],[0,-d/2]].forEach(([a,b])=>{B(w,.08,.08,RAIL,x+a,h+1.1,z+b);for(let i=0;i<=w;i+=1.6)B(.08,1.1,.08,RAIL,x-w/2+i,h,z+b)})}
function motor(x,y,z,p){const g=new THREE.Group();g.position.set(x,y,z);(p||scene).add(g);mesh(new THREE.CylinderGeometry(.45,.45,1.1,20),MOT,0,.5,0,g).rotation.z=Math.PI/2;
 for(let i=0;i<6;i++)mesh(new THREE.BoxGeometry(1,.06,.9),MOT,0,.5,0,g).rotation.x=i*Math.PI/6;const pul=CY(.32,.32,.16,DARK,.65,.5,0,g,16);pul.rotation.z=Math.PI/2;anim.push(t=>pul.rotation.x=t*14);return g}
const anim=[];
// particle stream along a path (cutaway view of what flows inside)
function stream(pts,color,n,speed,size,o={}){const cv=new THREE.CatmullRomCurve3(pts.map(a=>new THREE.Vector3(...a)),!!o.closed,'catmullrom',.05);
 const g=o.geo||new THREE.SphereGeometry(size,8,6);const im=new THREE.InstancedMesh(g,o.mat||M(color,{roughness:.35,emissive:o.glow?color:0x000000,emissiveIntensity:o.glow?.9:0}),n);
 im.castShadow=!o.noShadow;if(o.tint)tintRoot(im,n,.8);scene.add(im);const d=new THREE.Object3D(),jit=[...Array(n)].map(()=>[Math.random()-.5,Math.random()-.5,Math.random()-.5,Math.random()*6.28]);
 anim.push(t=>{for(let i=0;i<n;i++){const u=(t*speed/cv.getLength()+i/n)%1;const p=cv.getPointAt(u);const j=jit[i],s=o.spread||0;d.position.set(p.x+j[0]*s,p.y+j[1]*s*(o.flat??.6),p.z+j[2]*s);if(o.lie)d.rotation.set(j[3]+t*(o.spin||0),j[3]*3,(j[1])*.5);else d.rotation.set(j[3]+t*2*(o.spin||0),j[3],j[3]*.5);
  const k=o.grow?.4+u*1.2:1;d.scale.setScalar(k);d.updateMatrix();im.setMatrixAt(i,d.matrix)}im.instanceMatrix.needsUpdate=true});return im}
const glass=M(0xcfe7f1,{transparent:true,opacity:.28,roughness:.05,metalness:.1,depthWrite:false});
const FLT={};function flowTex(col){if(FLT[col])return FLT[col];const c=new THREE.Color(col);const t=canv(128,8,(g,w,h)=>{for(let x=0;x<w;x++){const k=.82+.18*Math.sin(x/w*Math.PI*6)+.06*Math.sin(x*1.7);g.fillStyle=`rgb(${Math.min(255,c.r*255*k)|0},${Math.min(255,c.g*255*k)|0},${Math.min(255,c.b*255*k)|0})`;g.fillRect(x,0,1,h)}});t.colorSpace=THREE.SRGBColorSpace;return FLT[col]=t}
function fluid(pts,col,speed,r=.17){const cv=new THREE.CatmullRomCurve3(pts.map(a=>new THREE.Vector3(...a)),false,'catmullrom',.05),L=cv.getLength();const tx=flowTex(col).clone();tx.needsUpdate=true;tx.repeat.set(L/1.6,1);
 const m=new THREE.Mesh(new THREE.TubeGeometry(cv,Math.max(24,pts.length*18),r,10),new THREE.MeshStandardMaterial({map:tx,roughness:.35,metalness:0,transparent:true,opacity:.92}));m.castShadow=false;scene.add(m);anim.push(t=>tx.offset.x=-(t*speed/1.6)%1);return m}
function pipe(pts,r=.22){const t=tube(pts,r,glass);t.castShadow=false;return t}

// ---- ground, hall ----
const GR=canv(256,256,(g,w,h)=>{g.fillStyle='#9fb486';g.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=Math.random();g.fillStyle=v<.5?'rgba(120,150,90,.35)':v<.8?'rgba(170,180,120,.3)':'rgba(140,120,80,.25)';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*3)}});GR.colorSpace=THREE.SRGBColorSpace;GR.repeat.set(60,46);
const ground=mesh(new THREE.PlaneGeometry(900,700),M(0xffffff,{map:GR,roughness:1}),0,-.02,0);ground.rotation.x=-Math.PI/2;
B(214,.2,32,M(0xffffff,{map:CONC,roughness:.92}),-6,0,0);
B(214,.03,2.2,M(0x3f8f5c,{roughness:.6}),-6,.2,11.8);
for(let x=-96;x<=96;x+=12)B(.7,13,.7,FR,x,0,-15.5);
B(192,6,.3,M(0xdfe4e2,{roughness:.9}),0,0,-15.8);B(192,2.2,.25,M(0xbfd6e2,{roughness:.1,metalness:.2}),0,6,-15.8);B(192,4.4,.3,M(0xdfe4e2,{roughness:.9}),0,8.2,-15.8);
B(192,.4,.6,FR,0,12.6,-15.5);
// yard outside
B(34,.15,40,M(0xb59b74,{roughness:1}),-124,0,4);
// workers
function worker(x,z,ry=0,c=0x1f6fd1){const g=new THREE.Group();g.position.set(x,.2,z);g.rotation.y=ry;scene.add(g);
 mesh(new THREE.CapsuleGeometry(.32,.9,4,10),M(c),0,1.15,0,g);mesh(new THREE.SphereGeometry(.24,12,10),M(0xc68f62),0,1.95,0,g);mesh(new THREE.SphereGeometry(.27,12,8,0,6.3,0,1.4),M(0xffd400),0,2.02,0,g);
 B(.16,.7,.18,M(0x24313b),-.13,0,0,g);B(.16,.7,.18,M(0x24313b),.13,0,0,g);return g}

// ---- 1 receiving: root pile, loader, hopper, incline belt ----
// ---- realistic cassava roots: spindle shape, tapered tail, slight bend, rough brown bark with ring scars ----
function rnd(a){let x=Math.sin(a*127.1)*43758.5453;return x-Math.floor(x)}
function barkTex(pal,ring){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.fillStyle=pal[0];g.fillRect(0,0,256,256);
 for(let i=0;i<5000;i++){g.globalAlpha=.25+Math.random()*.45;g.fillStyle=pal[1+Math.floor(Math.random()*(pal.length-1))];const w=1+Math.random()*5,h=1+Math.random()*2.5;g.fillRect(Math.random()*256,Math.random()*256,w,h)}
 g.globalAlpha=1;for(let i=0;i<70;i++){g.strokeStyle=ring;g.globalAlpha=.25+Math.random()*.4;g.lineWidth=.6+Math.random()*1.2;const x0=Math.random()*256,y0=Math.random()*256;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+(Math.random()-.5)*3,y0+6+Math.random()*16);g.stroke()}
 for(let k=0;k<16;k++){const y=Math.random()*256;g.strokeStyle=ring;g.globalAlpha=.55+Math.random()*.4;g.lineWidth=.8+Math.random()*1.6;g.beginPath();for(let x=0;x<=256;x+=8){const yy=y+Math.sin(x*.05+k)*1.6;x?g.lineTo(x,yy):g.moveTo(x,yy)}g.stroke()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,2);t.anisotropy=4;return t}
const BARK=barkTex(['#6f4326','#5a341d','#82532f','#4a2a17','#93633b','#6a4a2c'],'#2e1a0d'),PEEL=barkTex(['#b98462','#a8704f','#c99a76','#8f5a3c','#d8b08c','#7a4a2c'],'#5a341d');
function rootGeo(seed,L=.78,R=.085,seg=14,rad=9){const pts=[];const neck=.06;
 for(let i=0;i<=seg;i++){const t=i/seg;let r=R*Math.pow(Math.sin(Math.PI*Math.min(.97,t)),.62)*(1-.45*t)+.012;if(t<neck)r=Math.max(r,R*.38*(1-t/neck)+.012);pts.push(new THREE.Vector2(r,t*L))}
 const g=new THREE.LatheGeometry(pts,rad);const P=g.attributes.position,bend=(rnd(seed)-.3)*.22,twist=(rnd(seed+3)-.5)*.12;
 for(let i=0;i<P.count;i++){const y=P.getY(i),t=y/L;let x=P.getX(i),z=P.getZ(i);const n=1+(rnd(i*.37+seed*11)-.5)*.16;x*=n;z*=n;P.setXYZ(i,x+bend*t*t*L,y-L/2,z+twist*Math.sin(t*3.1)*L)}
 g.computeVertexNormals();g.rotateZ(Math.PI/2);return g}
const ROOTG=[0,1,2,3].map(k=>rootGeo(k+1,.6+k*.1,.1+k*.01,10,8));
const rootMat=new THREE.MeshStandardMaterial({map:BARK,bumpMap:BARK,bumpScale:3,roughness:.95,metalness:0});
const peelMat=new THREE.MeshStandardMaterial({map:PEEL,bumpMap:PEEL,bumpScale:1.5,roughness:.75,metalness:0});
const rootGeoS=ROOTG[1];
const tintRoot=(im,n,lo=.78)=>{const c=new THREE.Color();for(let i=0;i<n;i++){const k=lo+Math.random()*(1-lo);c.setRGB(k,k*(.95+Math.random()*.06),k*(.9+Math.random()*.1));im.setColorAt(i,c)}};
// heap: soil mound + roots resting on its surface
{const cx=-124,cz=6,RR=5.5,H=2.6;const mound=mesh(new THREE.ConeGeometry(RR,H,40,6),M(0x5e4128,{roughness:1}),cx,H/2+.15,cz);mound.scale.z=.85;
 const soil=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.045,0),M(0x6b4a2f,{roughness:1}),900),d=new THREE.Object3D();
 for(let i=0;i<900;i++){const r=RR*(.92+Math.random()*.22),a=Math.random()*6.28;d.position.set(cx+Math.cos(a)*r,.2,cz+Math.sin(a)*r*.85);d.scale.setScalar(.5+Math.random()*1.5);d.updateMatrix();soil.setMatrixAt(i,d.matrix)}scene.add(soil);
 ROOTG.forEach((g,k)=>{const n=750,im=new THREE.InstancedMesh(g,rootMat,n);for(let i=0;i<n;i++){const r=Math.sqrt(Math.random())*RR*1.02,a=Math.random()*6.28,y=.15+Math.max(0,H*(1-r/RR))+(Math.random()-.6)*.12;
  d.position.set(cx+Math.cos(a)*r,y+.05,cz+Math.sin(a)*r*.85);d.rotation.set((Math.random()-.5)*.9,Math.random()*6.28,(Math.random()-.5)*.9);d.scale.setScalar(.85+Math.random()*.4);d.updateMatrix();im.setMatrixAt(i,d.matrix)}
  tintRoot(im,n);im.castShadow=im.receiveShadow=true;scene.add(im)})}
const hop=new THREE.Group();hop.position.set(-108,0,4);scene.add(hop);
mesh(new THREE.CylinderGeometry(3.4,1.4,3,4,1,true),M(0x6b7a86,{metalness:.5,roughness:.5,side:THREE.DoubleSide}),0,4,0,hop).rotation.y=Math.PI/4;legs(-108,4,3.4,3.4,2.5);
B(17,.25,1.6,DARK,-99.5,1.4,4).rotation.z=.22;tube([[-108,2.6,4],[-91,6.4,4]],.12,FR);
const loader=new THREE.Group();scene.add(loader);
{const Y=M(0xf2b705,{roughness:.42,metalness:.15}),TY=M(0x1c1d1f,{roughness:.9}),GL=M(0x9cc4d8,{roughness:.05,metalness:.2,transparent:true,opacity:.45});
 RB(2.8,1.5,2.1,.25,Y,-1.4,.75,0,loader);B(.1,.9,1.6,DARK,-2.82,.95,0,loader);RB(1.9,1.1,1.7,.2,Y,1,.7,0,loader);B(2.2,.35,2.2,Y,-.1,2.05,0,loader);
 const cab=new THREE.Group();cab.position.set(-.2,2.35,0);loader.add(cab);[[.75,.75],[.75,-.75],[-.75,.75],[-.75,-.75]].forEach(([x,z])=>B(.09,1.6,.09,DARK,x,0,z,cab));B(1.6,1.5,1.6,GL,0,.02,0,cab).castShadow=false;RB(1.9,.16,1.9,.06,Y,0,1.6,0,cab);
 CY(.08,.08,1.4,DARK,-2.3,2.6,.6,loader,8);
 [[-1.5,1.15],[-1.5,-1.15],[1.4,1.15],[1.4,-1.15]].forEach(([x,z])=>{const t=CY(.95,.95,.7,TY,x,.95,z,loader,24);t.rotation.x=Math.PI/2;const r=CY(.5,.5,.72,Y,x,.95,z,loader,16);r.rotation.x=Math.PI/2;
  for(let k=0;k<12;k++){const l=B(.12,.1,.72,TY,0,0,0,loader);const a=k/12*6.28;l.position.set(x+Math.cos(a)*.93,.95+Math.sin(a)*.93,z);l.rotation.z=a}});
 [.8,-.8].forEach(z=>{const arm=B(.28,.32,2.8,Y,1.9,1.6,z,loader);arm.rotation.x=0;arm.rotation.set(0,Math.PI/2,0);arm.rotation.z=0;arm.geometry.rotateY(Math.PI/2);arm.rotation.set(0,0,-.42)});
}
const bucket=new THREE.Group();bucket.position.set(3.4,1,0);loader.add(bucket);{const BK=M(0x3a3b3d,{roughness:.6,metalness:.45});B(.12,1.1,2.6,BK,-.55,0,0,bucket);B(1.2,.12,2.6,BK,0,0,0,bucket);B(1.2,1,.1,BK,0,0,1.3,bucket);B(1.2,1,.1,BK,0,0,-1.3,bucket);B(.1,.08,2.7,M(0x9aa0a6,{metalness:.8,roughness:.3}),.62,0,0,bucket)}
const ldPile=new THREE.InstancedMesh(rootGeoS,rootMat,90);tintRoot(ldPile,90);{const d=new THREE.Object3D();for(let i=0;i<90;i++){d.position.set(3.4+(Math.random()-.5)*.9,1.3+Math.random()*.6,(Math.random()-.5)*2.3);d.rotation.set(Math.random()*.6,Math.random()*6.28,Math.random()*.6);d.updateMatrix();ldPile.setMatrixAt(i,d.matrix)}}bucket.add(ldPile);ldPile.position.set(-3.4,-1,0);
anim.push(t=>{const c=(t%10)/10,k=c<.5?c*2:2-c*2,e=k*k*(3-2*k);loader.position.set(-121+e*8,0,5);loader.rotation.y=Math.PI*0+0;ldPile.visible=c<.55;bucket.position.y=1+(c>.42&&c<.62?1.9:0);bucket.rotation.z=c>.5&&c<.62?.6:0});
stream([[-105,4.6,4],[-99,3.2,4],[-92,4.8,4]],0x8a5a35,90,3,0,{geo:rootGeoS,mat:rootMat,spread:.7,flat:.15,lie:1,tint:1});
worker(-112,12,.6);

// ---- 2 rotary drum (dry cleaning / peeling) ----
const drum=new THREE.Group();drum.position.set(-87,5,4);drum.rotation.z=-.05;scene.add(drum);
const dShell=mesh(new THREE.CylinderGeometry(2.2,2.2,15,32,1,true),M(0x7f8c96,{metalness:.65,roughness:.42,side:THREE.DoubleSide}),0,0,0,drum);dShell.rotation.z=Math.PI/2;
for(let i=-6;i<=6;i+=3){const ring=mesh(new THREE.TorusGeometry(2.25,.14,8,36),SS2,i,0,0,drum);ring.rotation.y=Math.PI/2}
const slots=new THREE.Group();drum.add(slots);for(let a=0;a<12;a++){const s=B(14.6,.1,.12,DARK,0,-.05,0,slots);s.position.set(0,Math.cos(a/12*6.28)*2.21,Math.sin(a/12*6.28)*2.21)}
anim.push(t=>{slots.rotation.x=t*1.3});
[[-6,1],[-6,-1],[6,1],[6,-1]].forEach(([a,b])=>{CY(.4,.4,.5,DARK,-87+a,2.6,4+b*1.6,null,16).rotation.x=Math.PI/2;B(.6,2.4,.6,FR,-87+a,0,4+b*1.6)});
motor(-95.5,2.5,6.8);B(14,.8,3.6,M(0x8f7656,{roughness:1}),-87,0,4);
stream([[-94,3.6,4],[-80,3.2,4]],0x9a6a43,180,2.2,0,{geo:rootGeoS,mat:rootMat,spread:2.4,flat:.25,lie:1,spin:1.5,tint:1});
stream([[-92,3.2,4],[-82,1.1,4]],0x6d4c32,40,1.5,.12,{spread:7,noShadow:1});

// ---- 3 paddle washer ----
const wx=-68;B(16,.25,4,SS2,wx,1.2,4);B(16,2,.15,SS,wx,1.3,6);B(16,2,.15,SS,wx,1.3,2);
const water=B(15.8,.1,3.8,M(0x8fc6d8,{transparent:true,opacity:.6,roughness:.05,metalness:.1}),wx,2.75,4);water.castShadow=false;
legs(wx,4,15,3.4,1.2);const sh=new THREE.Group();sh.position.set(wx,2.7,4);scene.add(sh);
mesh(new THREE.CylinderGeometry(.12,.12,16,10),SS,0,0,0,sh).rotation.z=Math.PI/2;
for(let i=-7;i<=7;i+=.9){const pd=B(.12,1.3,.5,SS2,i,-.65,0,sh);pd.rotation.x=i*1.1}
anim.push(t=>{sh.rotation.x=t*2.4;water.position.y=2.75+Math.sin(t*3)*.04});
motor(wx+9,1.3,4);stream([[wx-8,2.78,4],[wx+8,2.72,4]],0x8a5a35,200,1.6,0,{geo:rootGeoS,mat:peelMat,spread:3.2,flat:.06,lie:1,spin:.8,tint:1});
stream([[wx-7,4.6,4],[wx+7,4.6,4]],0x9fd3ff,60,6,.07,{spread:2.8,noShadow:1,mat:M(0xd7efff,{transparent:true,opacity:.75})});
tube([[wx-8,4.8,4],[wx+8,4.8,4]],.07,SS);worker(wx+2,9,-.4);

// ---- 4 chopper + rasper ----
const rx=-51;platform(rx,4,9,6,2.4);
RB(2.6,2.2,2.2,.15,M(0x3d6fb6,{roughness:.4,metalness:.3}),rx-2.4,2.6,4);RB(3,2.6,2.6,.2,M(0x3d6fb6,{roughness:.4,metalness:.3}),rx+1.8,2.6,4);
mesh(new THREE.CylinderGeometry(1.6,.6,1.6,4,1,true),M(0x6b7a86,{metalness:.5,roughness:.5,side:THREE.DoubleSide}),rx-2.4,5.6,4).rotation.y=Math.PI/4;
const rot=CY(.7,.7,.25,DARK,rx+1.8,4,5.4,null,24);rot.rotation.x=Math.PI/2;anim.push(t=>rot.rotation.y=t*25);
motor(rx+1.8,2.6,7.2);motor(rx-2.4,2.6,1);tube([[-60,3.4,4],[-57,6.5,4],[-54,6.5,4]],.4,M(0x7f8c96,{metalness:.6,roughness:.4}));
stream([[-60,3.6,4],[-57,6.7,4],[-53.6,6.2,4]],0x8a5a35,50,2.2,0,{geo:rootGeoS,mat:peelMat,spread:.35,flat:.2,lie:1,tint:1});
{const cg=new THREE.CylinderGeometry(.07,.075,.14,10);stream([[rx-2.4,5.6,4],[rx-2.4,4.9,4],[rx-.6,5.1,4],[rx+1,5.3,4]],0xe9dfc8,60,1.4,0,{geo:cg,mat:[peelMat,M(0xf6f0e2,{roughness:.6}),M(0xf6f0e2,{roughness:.6})],spread:.45,spin:1,tint:1})}
worker(rx-3,9,.2);

// ---- 5 extraction sieves + pulp ----
const sx=-30;platform(sx,4,18,7,4.2);
const milk=0xf4f1e6;
for(let i=0;i<4;i++){const x=sx-6+i*4;const g=new THREE.Group();g.position.set(x,4.4,4);scene.add(g);
 mesh(new THREE.CylinderGeometry(1.5,1.5,1.4,28),SS,0,1.1,0,g);mesh(new THREE.ConeGeometry(1.5,1.6,28),SS,0,2.6,0,g);mesh(new THREE.ConeGeometry(1.2,1,28,1,true),SS2,0,-.1,0,g).rotation.x=Math.PI;
 const band=B(3.06,.12,.3,DARK,0,1.6,0,g);anim.push(t=>band.parent&&(band.rotation.y=t*6));CY(.12,.12,1,DARK,0,-.9,0,g,8);motor(x+2.1,4.4,6.4)}
pipe([[-48,1.4,4],[-46,4,4],[-39,7.2,4],[-24,7.2,4]],.28);fluid([[-48,1.4,4],[-46,4,4],[-39,7.2,4],[-24,7.2,4]],milk,4);
// pulp screw conveyor + press + pile
const pulpC=0xc9b27a;tube([[sx-8,3.4,6.8],[sx+8,3.4,6.8]],.35,M(0x7f8c96,{metalness:.6,roughness:.45}));
stream([[sx-8,3.9,6.8],[sx+9,3.9,6.8],[sx+11,2,10],[sx+12,1.6,16]],pulpC,60,1.8,.22,{spread:.5,noShadow:1});
RB(3,2.6,2.4,.2,M(0x3d6fb6,{roughness:.4,metalness:.3}),sx+11,0,10);
{const n=500,im=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.32,0),M(pulpC,{roughness:1}),n),d=new THREE.Object3D();for(let i=0;i<n;i++){const r=Math.sqrt(Math.random())*4.5,a=Math.random()*6.28;d.position.set(sx+12+Math.cos(a)*r,.2+Math.max(0,2.4*(1-r/4.5))*Math.random()**.4,20+Math.sin(a)*r*.8);d.rotation.set(Math.random()*3,Math.random()*3,0);d.updateMatrix();im.setMatrixAt(i,d.matrix)}im.castShadow=im.receiveShadow=true;scene.add(im)}
pipe([[sx+6,4.6,2],[sx+9,2.2,0],[-12,2.2,0],[-9,4.2,0]],.26);fluid([[sx+6,4.6,2],[sx+9,2.2,0],[-12,2.2,0],[-9,4.2,0]],milk,3.6);
worker(sx-4,9,.1,0xd14b1f);

// ---- 6 desander cyclones + fine sieve ----
const dx=-5;platform(dx,1,8,5,2.6);
for(let i=0;i<3;i++){const x=dx-2.6+i*1.8;CY(.45,.45,1.2,SS,x,4.6,1);mesh(new THREE.ConeGeometry(.45,1.8,20),SS,x,3.1,1).rotation.x=Math.PI;CY(.1,.1,.6,SS2,x,5.4,1,null,8)}
CY(1.4,1.4,2.4,SS,dx+2.4,4,1);mesh(new THREE.ConeGeometry(1.4,1,24),SS,dx+2.4,5.7,1);
const fsv=B(2.6,.9,1.8,SS2,dx+2.4,1.2,5.4);anim.push(t=>fsv.position.x=dx+2.4+Math.sin(t*30)*.03);
pipe([[dx+3.6,3.8,1],[dx+6,2,0],[6,2,0],[8,3,0]],.26);fluid([[dx+3.6,3.8,1],[dx+6,2,0],[6,2,0],[8,3,0]],milk,3.6);
stream([[dx-2.6,2.2,1],[dx-2.6,.4,-6]],0x8b8070,10,1.2,.1,{spread:.2,noShadow:1});

// ---- 7 refining: separators + hydrocyclone bank ----
for(let i=0;i<2;i++){const x=10+i*5;const g=new THREE.Group();g.position.set(x,0,-2);scene.add(g);
 RB(2.4,1.4,2.4,.15,M(0x3d6fb6,{roughness:.4,metalness:.3}),0,0,0,g);CY(1.2,1.4,1.4,SS,0,2.1,0,g);mesh(new THREE.ConeGeometry(1.2,1.2,28),SS,0,3.4,0,g);
 const st=B(2.86,.14,.2,DARK,0,2.4,0,g);anim.push(t=>st.rotation.y=t*9);CY(.15,.15,1,SS2,0,4.3,0,g,10);motor(x+1.9,.2,-2)}
platform(24,1,10,6,3.2);
for(let s=0;s<3;s++){const z=-1+s*1.6;tube([[19.5,6.4,z],[28.5,6.4,z]],.18,SS);for(let i=0;i<10;i++){const x=20+i*.9;CY(.16,.16,.5,SS,x,6.1,z,null,10);mesh(new THREE.ConeGeometry(.16,1.3,10),SS,x,5.2,z).rotation.x=Math.PI}}
pipe([[8,3,0],[10,4,-2],[15,4,-2],[18,5,1],[28.5,6.4,1.6],[31,4,0],[33,2.2,-4]],.24);
fluid([[8,3,0],[10,4,-2],[15,4,-2],[18,5,1],[28.5,6.4,1.6],[31,4,0],[33,2.2,-4]],milk,4);
CY(2,2,4,SS,33,2.2,-5.5);mesh(new THREE.ConeGeometry(2,.8,28),SS,33,4.6,-5.5);
pipe([[24,.4,-2],[24,.35,-14],[24,.3,-20]],.2);fluid([[24,1,-2],[24,.5,-14],[24,.3,-22]],0x7d8a6a,3);
worker(14,5,-.2);

// ---- 8 dewatering centrifuge ----
for(let i=0;i<2;i++){const x=37+i*4.2;RB(3.2,1.2,2.8,.15,M(0x3d6fb6,{roughness:.4,metalness:.3}),x,0,2);
 const hs=CY(1.3,1.3,1.6,SS,x,2.6,2,null,32);hs.rotation.x=Math.PI/2;const bk=mesh(new THREE.CylinderGeometry(1.05,1.05,.1,32),M(0xf7f5ee,{roughness:.9}),x,2.6,2.85);bk.rotation.x=Math.PI/2;
 const sp=B(2,.12,.12,DARK,x,2.55,2.92);anim.push(t=>sp.rotation.z=t*12);motor(x,0.2,4.6)}
pipe([[33,1.6,-4],[35,3.8,0],[41,3.8,0]],.2);fluid([[33,1.6,-4],[35,3.8,0],[41,3.8,0]],milk,3);
tube([[36,1.5,5],[46,1.5,5]],.3,M(0x7f8c96,{metalness:.6,roughness:.45}));
stream([[36,2,5],[46,2,5],[47.5,2.3,2],[48.5,3.5,0]],0xf2efe6,40,1.6,.22,{spread:.25,geo:new THREE.DodecahedronGeometry(.25,0)});

// ---- 9 flash dryer: furnace/heater, column, cyclones ----
const furn=RB(5,4,4,.2,M(0x7b6f66,{roughness:.8}),46,0,-8);
const fl=new THREE.PointLight(0xff7a2a,30,18,1.8);fl.position.set(46,2,-5.8);scene.add(fl);const fw=B(1.6,1.2,.1,M(0xff8a3d,{emissive:0xff6a1a,emissiveIntensity:2.2}),46,1.2,-5.95);
anim.push(t=>{fl.intensity=26+Math.sin(t*13)*5+Math.sin(t*7.3)*4;fw.material.emissiveIntensity=1.8+Math.sin(t*11)*.5});
CY(.6,.6,3,M(0x7b6f66),46,5.5,-8,null,16);RB(3,3,3,.15,SS2,50.5,0,-8);
tube([[49,1.5,-8],[50.5,1.5,-6],[50.5,1.5,-2],[51,2,0]],.6,SS2);
const colH=24;CY(.85,.85,colH,SS,51,colH/2+2,0,null,24);tube([[51,colH+2,0],[51,colH+3.4,0],[53,colH+3.6,0],[55,colH+3,0]],.75,SS);
platform(57,0,8,6,16);
for(let i=0;i<2;i++){const x=55.5+i*3.2;CY(1.2,1.2,2.6,SS,x,colH+1.4,0);mesh(new THREE.ConeGeometry(1.2,3.2,28),SS,x,colH-1.5,0).rotation.x=Math.PI;
 const rv=CY(.35,.35,.6,DARK,x,colH-3.4,0,null,12);rv.rotation.x=Math.PI/2;anim.push(t=>rv.rotation.y=t*3)}
tube([[55.5,colH+2.8,0],[57,colH+4.6,0],[58.7,colH+2.8,0]],.5,SS);tube([[58.7,colH+3,0],[60,colH+5.2,-1],[62,colH+4.5,-3],[62,2,-3]],.55,SS2);
const fan=CY(1.4,1.4,1,M(0x3d6fb6,{roughness:.4,metalness:.3}),62,2,-3,null,28);fan.rotation.x=Math.PI/2;
// hot air + powder inside the dryer column (cutaway)
stream([[47,2.2,-5.6],[50.5,1.6,-3.5],[51,3,0],[51,colH,0]],0xff8a3d,120,9,.12,{spread:.5,noShadow:1,glow:1});
stream([[49,3.5,0],[51,6,0],[51,colH+2,0],[53,colH+3.6,0],[55.5,colH+2.5,0],[55.5,colH-2.8,0]],0xffffff,200,8,.1,{spread:.9,noShadow:1});
pipe([[55.5,colH-3.8,0],[58,16.4,2],[64,10,2],[67,7.2,0]],.32);stream([[55.5,colH-3.8,0],[58,16.4,2],[64,10,2],[67,7.2,0]],0xffffff,60,6,.1,{spread:.2,noShadow:1});
worker(56,3,0.3);worker(55,0,-2,0xd14b1f);

// ---- 10 cooling cyclone + sifter ----
CY(1,1,2,SS,67,7.2,0);mesh(new THREE.ConeGeometry(1,2.4,24),SS,67,5,0).rotation.x=Math.PI;legs(67,0,1.6,1.6,6);
const sift=new THREE.Group();sift.position.set(67,2.2,4);scene.add(sift);RB(3.4,1,2.4,.15,SS,0,0,0,sift);RB(3.6,.25,2.6,.08,DARK,0,1,0,sift);legs(67,4,2.6,1.8,2.2);
anim.push(t=>{sift.position.x=67+Math.sin(t*28)*.05;sift.position.z=4+Math.cos(t*28)*.05});
stream([[67,3.8,0],[67,3.4,4],[70,3,4],[76,6,2],[78,6.4,1]],0xffffff,40,3.4,.11,{spread:.2,noShadow:1});pipe([[67,3.8,0],[67,3.4,4],[70,3,4],[76,6,2],[78,6.4,1]],.24);

// ---- 11 packing: 25 kg bags + jumbo + pallets ----
CY(1.6,.5,2.4,SS,78,5.6,1);legs(78,1,2.2,2.2,4.4);B(1.4,.8,1.2,DARK,78,3.4,1);
B(16,.25,1.6,DARK,86,1,1);legs(86,1,15,1.2,1);
const bagGeo=new RoundedBoxGeometry(1.1,.4,.7,3,.14),bagMat=M(0xf7f7f2,{roughness:.85});const bags=new THREE.InstancedMesh(bagGeo,bagMat,9);bags.castShadow=true;scene.add(bags);
{const d=new THREE.Object3D();anim.push(t=>{for(let i=0;i<9;i++){const u=(t*.12+i/9)%1;d.position.set(78.5+u*15,1.5,1);d.rotation.set(0,0,0);d.updateMatrix();bags.setMatrixAt(i,d.matrix)}bags.instanceMatrix.needsUpdate=true})}
B(1.6,1.4,1.8,M(0x9aa4ab,{metalness:.5,roughness:.4}),84,1.25,1);
function pallet(x,z,layers){B(1.3,.15,1.3,M(0xa77b4c),x,.2,z);const g=new THREE.InstancedMesh(bagGeo,bagMat,layers*4),d=new THREE.Object3D();let k=0;
 for(let l=0;l<layers;l++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){d.position.set(x-.28+a*.56,.6+l*.41,z-.2+b*.4);d.rotation.y=l%2?Math.PI/2:0;d.scale.set(.5,1,.55);d.updateMatrix();g.setMatrixAt(k++,d.matrix)}g.castShadow=true;scene.add(g)}
for(let i=0;i<4;i++)for(let j=0;j<2;j++)pallet(90+i*1.8,5+j*1.8,6+((i+j)%3)*2);
const jf=new THREE.Group();jf.position.set(84,0,-6);scene.add(jf);[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([a,b])=>B(.18,5,.18,FR,a,0,b,jf));B(3,.2,3,FR,0,5,0,jf);
const jb=mesh(new RoundedBoxGeometry(2,2,2,4,.45),M(0xf2f2ec,{roughness:.9}),0,1.2,0,jf);anim.push(t=>{const k=(t%8)/8;jb.scale.set(1,.25+k*.9,1);jb.position.y=.3+(.25+k*.9)})
CY(.2,.2,2.4,SS,0,3.9,0,jf,10);
for(let i=0;i<3;i++){const g=mesh(new RoundedBoxGeometry(1.9,2,1.9,4,.45),M(0xf2f2ec,{roughness:.9}),92+i*2.4,1.2,-6)}
const fk=new THREE.Group();scene.add(fk);RB(2.4,1.4,1.4,.2,M(0xe8501c,{roughness:.5}),0,.3,0,fk);B(.1,2.8,1.2,DARK,1.3,.2,0,fk);B(1.2,.08,1,DARK,1.9,.4,0,fk);
anim.push(t=>{const c=(t%9)/9,k=c<.5?c*2:2-c*2;fk.position.set(88+k*8,0,9.5)});
worker(82,4,.4);

// ---- 12 wastewater → biogas → fuel for dryer ----
const lag=new THREE.Group();lag.position.set(14,0,-52);scene.add(lag);
mesh(new THREE.CylinderGeometry(24,22,1.2,48),M(0x9b8a6a,{roughness:1}),0,.3,0,lag);
const dome=mesh(new THREE.SphereGeometry(20,48,24,0,Math.PI*2,0,Math.PI/2),M(0x1b1f22,{roughness:.35,metalness:.2}),0,.6,0,lag);dome.scale.set(1.25,.2,.85);
anim.push(t=>dome.scale.y=.2+Math.sin(t*.8)*.012);
mesh(new THREE.CylinderGeometry(16,15,1,40),M(0x6c7a5a,{roughness:.2,metalness:.1}),-44,.2,-6,lag);
B(2,.5,36,M(0x8f9590,{roughness:.9}),24,0,-16);
fluid([[24,.6,-16],[24,.6,-30],[20,1,-34]],0x7d8a6a,4);
tube([[14,5.4,-52],[14,6.5,-36],[30,6.5,-26],[44,6.5,-14],[46,4,-10]],.25,M(0xe0c11a,{roughness:.4,metalness:.4}));
stream([[14,6,-52],[14,7,-36],[30,7,-26],[44,7,-14],[46,4.5,-10]],0x9fd3ff,60,8,.16,{noShadow:1,glow:1});
CY(.3,.3,8,DARK,-2,4,-40,null,10);

// ---- labels for the active step ----
const lbls=STEPS.map((s,i)=>{const el=document.createElement('div');el.className='lbl3';el.innerHTML=`<b>${i+1}</b>${s.t}`;const o=new CSS2DObject(el);o.position.set(s.at[0],s.at[1]+(i===8?16:i===11?9:5),s.at[2]);o.visible=false;scene.add(o);return o});

// ---- tour ----
const tl=document.getElementById('pTl');tl.innerHTML=STEPS.map((s,i)=>`<button data-i="${i}" title="${i+1}. ${s.t}"><i><b></b></i><span>${i+1}. ${s.t}</span></button>`).join('');
const tlB=[...tl.querySelectorAll('button')],bars=tlB.map(b=>b.querySelector('b'));
let playing=true,T=0,cur=-1,touring=true;
const bPlay=document.getElementById('pPlay');
function setPlay(v){playing=v;bPlay.setAttribute('aria-pressed',v);bPlay.querySelector('span').textContent=v?'ຢຸດ':'ຫຼິ້ນ';bPlay.querySelector('path').setAttribute('d',v?'M6 4h4v16H6zM14 4h4v16h-4z':'M7 4l13 8-13 8z')}
bPlay.onclick=()=>{if(!playing)touring=true;setPlay(!playing)};
document.getElementById('pRe').onclick=()=>{T=0;touring=true;setPlay(true)};
tlB.forEach(b=>b.onclick=()=>{T=+b.dataset.i*STEP_S+.001;touring=true;setPlay(true)});
renderer.domElement.addEventListener('pointerdown',()=>{touring=false});
renderer.domElement.addEventListener('wheel',()=>{touring=false},{passive:true});
function show(i){if(i===cur)return;cur=i;const s=STEPS[i];document.getElementById('pN').textContent=`ຂັ້ນຕອນ ${i+1} / ${STEPS.length}`;document.getElementById('pT').textContent=s.t;document.getElementById('pP').textContent=s.p;document.getElementById('pK').textContent=s.k;
 lbls.forEach((l,j)=>l.visible=j===i);tlB.forEach((b,j)=>b.classList.toggle('on',j===i))}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
const vA=new THREE.Vector3(),vB=new THREE.Vector3(),tA=new THREE.Vector3(),tB=new THREE.Vector3();
function camAt(i,drift,outP,outT){const s=STEPS[i];const a=drift*.35;const c=Math.cos(a),sn=Math.sin(a);const o=s.off;outT.set(...s.at);outP.set(s.at[0]+o[0]*c-o[2]*sn,s.at[1]+o[1],s.at[2]+o[0]*sn+o[2]*c)}
function tour(){const N=STEPS.length,tt=T%(N*STEP_S),i=Math.floor(tt/STEP_S),f=(tt-i*STEP_S)/STEP_S;show(i);
 bars.forEach((b,j)=>b.style.width=(j<i?100:j===i?f*100:0)+'%');
 if(!touring)return;const mv=Math.min(1,f/.32),k=ease(mv);const prev=(i+N-1)%N;
 camAt(prev,1,vA,tA);camAt(i,f,vB,tB);if(T<STEP_S){vA.copy(vB);tA.copy(tB)}
 cam.position.lerpVectors(vA,vB,k);controls.target.lerpVectors(tA,tB,k)}

function resize(){const w=box.clientWidth,h=box.clientHeight;renderer.setSize(w,h);lr.setSize(w,h);cam.aspect=w/h;cam.fov=w<700?52:38;cam.updateProjectionMatrix()}
new ResizeObserver(resize).observe(box);resize();
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)setPlay(false);
const clock=new THREE.Clock();let A=0,visible=true;new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(box);
camAt(0,0,cam.position,controls.target);show(0);
function loop(){const dt=Math.min(.05,clock.getDelta());if(playing&&visible){T+=dt;A+=dt;anim.forEach(f=>f(A))}if(visible){tour();controls.update();renderer.render(scene,cam);lr.render(scene,cam)}requestAnimationFrame(loop)}
anim.forEach(f=>f(0));loop();
window.__pf={go:i=>{T=i*STEP_S+STEP_S*.6;touring=true},setT:v=>{T=v}};
