import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './vendor/addons/renderers/CSS2DRenderer.js';

function showErr(msg){ const el=document.getElementById('loading'); if(el){ el.style.display='flex'; el.style.color='#ff7b7b'; el.style.fontSize='13px'; el.style.padding='20px'; el.style.whiteSpace='pre-wrap'; el.style.textAlign='center'; el.textContent='运行出错：\n'+msg; } }
window.addEventListener('error', e=>showErr((e.error&&e.error.stack)||e.message||String(e)));
window.addEventListener('unhandledrejection', e=>showErr('Promise: '+(e.reason&&e.reason.stack||e.reason)));

const C = window.CELESTIAL;
const D = C.display;
const AU = D.auToUnit;                 // 1 AU = 7 场景单位
const KM = D.kmToUnitMoon;             // 地月系：1 单位 ≈ 1500 km
const MLY = D.mlyToUnit;               // 本星系群：1 百万光年 = 160 场景单位
const MLY_FAR = D.mlyToUnitFar;        // 近邻宇宙：1 百万光年 = 13 场景单位
const YR_DAYS = 365.25;
const RSUN_KM = 696340;                // 太阳半径，系外恒星显示尺寸基准

// ---------- 速度：由实测轨道/自转参数物理推导（v=2πr/T），不臆造数值 ----------
const AU_KM = 1.495978707e8;
const GALACTIC_ORBIT = 220;   // 太阳邻域本地静止标准绕银心速度 km/s（参考值，非逐星实测）
// 仅收录有可靠公开实测值的自转/旋转速度（km/s）：恒星赤道 v·sin i、星系旋转曲线平坦段
const SPIN_KMS = { vega:236, sirius:16, milkyway:220, m31:250, m33:110, lmc:70 };
function fmtV(v){
  if(v==null || !isFinite(v) || v<=0) return null;
  if(v < 0.01) return (v*1000).toFixed(1)+' m/s';
  if(v < 1)    return v.toFixed(3)+' km/s';
  if(v < 10)   return v.toFixed(2)+' km/s';
  if(v < 100)  return v.toFixed(1)+' km/s';
  return v.toFixed(0)+' km/s';
}
function orbitV(aKm, pDays){ return 2*Math.PI*aKm/(pDays*86400); }
function spinV (rKm, pHours){ return 2*Math.PI*rKm/(pHours*3600); }

function deriveVelocity(o){
  if(!o || typeof o!=='object') return null;
  let orbit=null, spin=null, note='';
  // 公转：按可用实测半长轴与周期计算
  if(o.aAU!=null && o.periodYr!=null)            orbit = fmtV(orbitV(o.aAU*AU_KM, o.periodYr*YR_DAYS));
  else if(o.aAU!=null && o.periodDays!=null)      orbit = fmtV(orbitV(o.aAU*AU_KM, o.periodDays));
  else if(o.orbitKm!=null && o.periodDays!=null)  orbit = fmtV(orbitV(o.orbitKm, o.periodDays));
  else if(o.bin_aAU!=null && o.bin_periodDays!=null) orbit = fmtV(orbitV(o.bin_aAU*AU_KM, o.bin_periodDays));
  else if(o.galacticOrbitKmS!=null)               orbit = '≈ '+o.galacticOrbitKmS+' km/s（绕银心）';
  else if(o.type==='G2V 主序星')                  orbit = '≈ '+GALACTIC_ORBIT+' km/s（绕银心）';
  else if(o.distLy!=null && o.spectral!=null)     orbit = '≈ '+GALACTIC_ORBIT+' km/s（绕银心·邻域参考值）';
  else if(o.isStar)                               orbit = '≈ '+GALACTIC_ORBIT+' km/s（绕银心·邻域参考值）';
  // 自转：按实测半径与自转周期计算
  if(o.radiusKm!=null && o.rotationHours!=null)   spin = fmtV(spinV(o.radiusKm, Math.abs(o.rotationHours)));
  else if(o.radiusKm!=null && o.rotationDays!=null) spin = fmtV(spinV(o.radiusKm, Math.abs(o.rotationDays)*24));
  else if(o.spinKmS!=null)                        spin = '≈ '+o.spinKmS+' km/s';
  else if(o.id && SPIN_KMS[o.id]!=null)           spin = '≈ '+SPIN_KMS[o.id]+' km/s';
  // 无从给出数值时，如实说明原因（不编造）
  if(o.bin_aAU!=null && !spin)
    note = '互绕速度由实测轨道半长轴与周期计算；自转速度暂无可靠实测值。';
  else if(o.diameterLy!=null && !spin)
    note = '星系由无数恒星组成、非刚体自转；在群/团内为引力势中的本动，无稳定开普勒公转轨道，故不标注公转速度。';
  else if((o.isStar || (o.distLy!=null && o.spectral!=null)) && !spin)
    note = '自转速度暂无可靠 v·sin i 实测值；绕银心速度为太阳邻域参考值，非逐星实测。';
  else if(o.aAU!=null && o.periodDays!=null && !spin)
    note = '公转速度由实测半长轴与周期计算；自转周期尚无可靠实测值（近距行星多为潮汐锁定）。';
  return { orbit, spin, note };
}
function shortV(s){
  if(!s) return s;
  if(s.indexOf('邻域参考值')>=0) return s.replace(/（[^）]*）/,'（参考值）');
  if(s.indexOf('绕银心')>=0)     return s.replace(/（[^）]*）/,'（绕银心）');
  return s.replace(/（[^）]*）/g,'').trim();
}
function velSummary(o){
  const v=deriveVelocity(o); if(!v) return '';
  const p=[];
  if(v.orbit) p.push('公转 '+shortV(v.orbit));
  if(v.spin)  p.push('自转 '+shortV(v.spin));
  return p.join(' · ');
}

// 标签指示线：标签浮在天体上方，用细线连回天体中心，文字整体位于连线顶端之上，不遮挡球体
const labelItems = [];
let showVel = true;   // 标签上是否显示速度（信息面板始终显示完整速度）
function attachLabel(parent, text, cls, getR, layer, obj){
  // anchor：CSS2DObject 锚点元素（0 尺寸，居中在连线顶端），内部 box 用 CSS 浮到上方
  const anchor = document.createElement('div');
  anchor.className = 'lbl-anchor';
  const box = document.createElement('div');
  box.className = 'lbl' + (cls ? (' '+cls) : '');
  box.appendChild(document.createTextNode(text));
  let velEl = null;
  if(obj){
    const s = velSummary(obj);
    if(s){
      velEl = document.createElement('div');
      velEl.className = 'vel-line';
      velEl.textContent = s;
      velEl.style.display = showVel ? 'block' : 'none';
      box.appendChild(velEl);
    }
  }
  anchor.appendChild(box);
  const lab = new CSS2DObject(anchor);
  parent.add(lab);
  // 指示线：天体中心(0,0,0) -> 锚点(0,h,0)，让文字与球体之间留出可见间隙
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0, 0,1,0]), 3));
  const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color:0x5fe3ff, transparent:true, opacity:0.35 }));
  parent.add(line);
  const item = { lab, line, getR, layer: layer || 'galaxy', velEl };
  labelItems.push(item);
  return item;
}
// CSS2DRenderer 只检查标签自身的 visible，不检查父级 group 的 visible，
// 因此必须按图层显式显隐，否则三个视图的标签会全部叠在一起显示。
function applyLabelVisibility(){
  const layer = state.layer;
  for(const it of labelItems){
    const on = it.layer === layer;
    it.lab.visible = on;
    it.line.visible = on;
  }
}
function applyLabels(){
  for(const it of labelItems){
    const r = it.getR() || 1;
    const h = Math.max(r + 2.5, 4.5);   // 锚点高度：确保标签根部明显高于天体表面
    it.lab.position.set(0, h, 0);
    const pos = it.line.geometry.attributes.position;
    pos.setXYZ(1, 0, h, 0); pos.needsUpdate = true;
  }
}

// ---------- 显示尺寸（仅视觉，不改变轨道真实比例）----------
// 体积模式：'schematic' 示意（放大保证可见，太阳始终最大）；'true' 真实相对体积
const SIZE = { mode: 'schematic' };
// 真实半径比：太阳/木星 ≈ 9.96，木星/地球 ≈ 10.97（NASA Fact Sheet）
function sunRadius(){ return SIZE.mode === 'true' ? 4.98 : 1.9; }
function planetDisplayRadius(rkm){
  if(SIZE.mode === 'true'){
    // 以木星(69911km)=0.5 为基准，按真实半径比例缩放（太阳随之=4.98）
    return Math.max(0.012, rkm * (0.5 / 69911));
  }
  // 示意：温和压缩，保留大小顺序，太阳在 build 中单独放大并始终最大
  const k = 0.00605;
  return Math.min(1.6, Math.max(0.30, k * Math.sqrt(rkm)));
}

// ---------- 基础渲染环境 ----------
const sceneEl = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
sceneEl.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('labels').appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04060c);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 8000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 3000;

// 星空背景（远处球壳星点，纯本地，无网络）
(function starfield(){
  const N = 4000, pos = new Float32Array(N*3), col = new Float32Array(N*3);
  const c = new THREE.Color();
  for(let i=0;i<N;i++){
    const r = 1800 + Math.random()*1200;
    const t = Math.random()*Math.PI*2, p = Math.acos(2*Math.random()-1);
    pos[i*3]   = r*Math.sin(p)*Math.cos(t);
    pos[i*3+1] = r*Math.sin(p)*Math.sin(t);
    pos[i*3+2] = r*Math.cos(p);
    c.setHSL(0.55 + Math.random()*0.12, 0.5, 0.6 + Math.random()*0.4);
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos,3));
  g.setAttribute('color', new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size:2.2, sizeAttenuation:false, vertexColors:true })));
})();

// ================= 层级 1：银河系 =================
const galaxyGroup = new THREE.Group();
scene.add(galaxyGroup);
const systemMarkers = [];
const galaxyObjMap = {};

(function buildGalaxy(){
  // 对数螺旋臂示意星点（非逐颗实测）
  const N = 7000;
  const pos = new Float32Array(N*3), col = new Float32Array(N*3);
  const c = new THREE.Color();
  const arms = 4, armSpread = 0.32;
  for(let i=0;i<N;i++){
    let x,y,z;
    if(i < N*0.18){ // 核球
      const r = Math.pow(Math.random(),1.8)*60;
      const t = Math.random()*Math.PI*2, p = Math.acos(2*Math.random()-1);
      x=r*Math.sin(p)*Math.cos(t); y=r*Math.sin(p)*Math.sin(t); z=r*Math.cos(p)*0.6;
      c.setHSL(0.11, 0.6, 0.7+Math.random()*0.2);
    } else { // 旋臂
      const arm = i % arms;
      const theta = Math.random()*Math.PI*2*2.2;
      const rad = 70 + theta*55 + (Math.random()-0.5)*30;
      const spread = (Math.random()-0.5)*armSpread*rad + (arm-Math.PI)*0; // 沿臂散布
      const ang = theta + arm*(Math.PI*2/arms) + (Math.random()-0.5)*0.5;
      x = Math.cos(ang)*rad + (Math.random()-0.5)*40;
      z = Math.sin(ang)*rad + (Math.random()-0.5)*40;
      y = (Math.random()-0.5)*18*(1 - rad/600); // 盘状厚度向内增厚
      c.setHSL(0.58 + Math.random()*0.12, 0.45, 0.55+Math.random()*0.35);
    }
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos,3));
  g.setAttribute('color', new THREE.BufferAttribute(col,3));
  galaxyGroup.add(new THREE.Points(g, new THREE.PointsMaterial({ size:1.4, sizeAttenuation:false, vertexColors:true, transparent:true, opacity:0.85 })));

  // 可下钻的恒星系标记
  C.galaxy.systems.forEach((s, idx)=>{
    const isSol = s.id === 'sol';
    // 邻近恒星在 10 万光年尺度下几乎重合，无法按真实距离分辨：
    // 半径用实测距离的对数映射做示意散布，方位用黄金角均匀排开（数值仍为实测）
    const r = isSol ? 0 : 70 + 95*Math.log10(s.distLy + 1);
    const ang = isSol ? 0 : idx*2.399963;
    const px = isSol ? 0 : Math.cos(ang)*r;
    const pz = isSol ? 0 : Math.sin(ang)*r;
    const py = isSol ? 0 : (Math.random()-0.5)*22;
    const rr = isSol ? 3.2 : (s.distLy<=20 ? 2.0 : 1.5);
    const geo = new THREE.SphereGeometry(rr, 24, 24);
    const mat = new THREE.MeshBasicMaterial({ color: s.color });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    m.userData = { type:'system', data:s };
    galaxyGroup.add(m);
    // 光晕
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTexture(s.color), transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
    halo.scale.set(14,14,1); m.add(halo);
    // 标签（指示线方式，不遮挡天体）
    attachLabel(m, s.name, 'sys', ()=> rr, 'galaxy', s);
    systemMarkers.push(m);
    galaxyObjMap[s.id] = m;
  });
})();

function glowTexture(hex){
  const cv = document.createElement('canvas'); cv.width=cv.height=64;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(32,32,0,32,32,32);
  const c = new THREE.Color(hex);
  g.addColorStop(0, `rgba(${c.r*255|0},${c.g*255|0},${c.b*255|0},0.9)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
  const t = new THREE.CanvasTexture(cv); return t;
}

// ================= 层级 -1：近邻宇宙（与银河系平级的大星系）=================
// 距离按实测 distMly 线性映射（真实比例），方位由 J2000 赤经/赤纬换算
const nearbyGroup = new THREE.Group(); nearbyGroup.visible = false; scene.add(nearbyGroup);
// 星系本体补光：斜向主光 + 环境光 + 半球光，保证任意视角都呈现球面明暗（立体球）
const nbKey = new THREE.DirectionalLight(0xfff2d8, 1.6); nbKey.position.set(1,0.9,1); nearbyGroup.add(nbKey);
nearbyGroup.add(new THREE.AmbientLight(0x3a4a5c, 0.6));
nearbyGroup.add(new THREE.HemisphereLight(0xa8c4ff, 0x202830, 0.55));
const nearbyMarkers = [];
const nearbyObjMap = {};   // id → 3D 对象（用于导航器点击定位）
(function buildNearbyUniverse(){
  // 本星系群范围示意圈（直径约 1000 万光年 → 半径 5 Mly）
  const ringR = 5*MLY_FAR, rp=[];
  for(let k=0;k<=128;k++){ const t=k/128*Math.PI*2; rp.push(new THREE.Vector3(Math.cos(t)*ringR,0,Math.sin(t)*ringR)); }
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rp),
    new THREE.LineDashedMaterial({color:0x3a5678,dashSize:7,gapSize:9,transparent:true,opacity:0.35}));
  ring.computeLineDistances(); nearbyGroup.add(ring);

  C.nearbyUniverse.galaxies.forEach(g=>{
    const ra=(g.ra||0)*Math.PI/12, dec=THREE.MathUtils.degToRad(g.dec||0);
    const d=g.distMly*MLY_FAR;
    const x=d*Math.cos(dec)*Math.cos(ra), y=d*Math.sin(dec), z=d*Math.cos(dec)*Math.sin(ra);
    const holder=new THREE.Group(); holder.position.set(x,y,z); nearbyGroup.add(holder);
    const isLG = g.id==='localgroup';
    const rr = isLG ? 4.0 : 2.6 + 2.2*Math.log10(1 + g.diameterLy/20000);
    const body = new THREE.Mesh(new THREE.SphereGeometry(rr,40,32),
      new THREE.MeshStandardMaterial({color:g.color,emissive:new THREE.Color(g.color).multiplyScalar(0.18),roughness:0.85}));
    holder.add(body);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(g.color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.scale.set(rr*(isLG?12:6), rr*(isLG?12:6), 1); holder.add(halo);
    attachLabel(holder, g.name, 'sys', ()=>rr, 'nearby', g);
    // 透明点击代理（远景下本体仅几像素）
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(rr*2.4,9),16,16),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hit.userData = { type:'nearbygalaxy', data:g }; holder.add(hit); nearbyMarkers.push(hit);
    nearbyObjMap[g.id] = hit;
    if(!isLG){
      const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(x,y,z)]);
      const ll = new THREE.Line(lg, new THREE.LineDashedMaterial({color:0x26405e,dashSize:9,gapSize:12,transparent:true,opacity:0.28}));
      ll.computeLineDistances(); nearbyGroup.add(ll);
    }
  });
})();

// ================= 层级 0：本星系群（真正的「其他星系」）=================
// 距离按实测 distMly 线性映射；方位由 J2000 赤经/赤纬换算为真实天球方向
const lgGroup = new THREE.Group(); lgGroup.visible = false; scene.add(lgGroup);
// 与近邻宇宙层同样补光，避免无光照时球面失去明暗而像一张平片
const lgKey = new THREE.DirectionalLight(0xfff2d8, 1.6); lgKey.position.set(1,0.9,1); lgGroup.add(lgKey);
lgGroup.add(new THREE.AmbientLight(0x3a4a5c, 0.6));
lgGroup.add(new THREE.HemisphereLight(0xa8c4ff, 0x202830, 0.55));
const lgMarkers = [];
const lgObjMap = {};
(function buildLocalGroup(){
  const mw = C.localGroup.galaxies.find(g=>g.id==='milkyway');
  // 银河系本体（原点）：示意旋涡盘
  const disc = new THREE.Group(); lgGroup.add(disc);
  const N = 1400, pos = new Float32Array(N*3), col = new Float32Array(N*3), c = new THREE.Color();
  for(let i=0;i<N;i++){
    const arm = i%4, t = Math.random()*Math.PI*2.1;
    const rad = 1.2 + t*2.4 + (Math.random()-0.5)*0.7;
    const ang = t + arm*Math.PI/2 + (Math.random()-0.5)*0.35;
    pos[i*3]=Math.cos(ang)*rad; pos[i*3+1]=(Math.random()-0.5)*0.35; pos[i*3+2]=Math.sin(ang)*rad;
    c.setHSL(0.10+Math.random()*0.06, 0.65, 0.62+Math.random()*0.3);
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos,3));
  dg.setAttribute('color', new THREE.BufferAttribute(col,3));
  disc.add(new THREE.Points(dg, new THREE.PointsMaterial({size:1.5,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0.9})));
  const mwHalo = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(mw.color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  mwHalo.scale.set(48,48,1); disc.add(mwHalo);
  const mwMark = new THREE.Mesh(new THREE.SphereGeometry(1.0,32,32),
    new THREE.MeshStandardMaterial({color:mw.color, emissive:new THREE.Color(mw.color).multiplyScalar(0.45), roughness:0.85}));
  disc.add(mwMark);
  attachLabel(disc, mw.name, 'sys', ()=>1.2, 'localgroup', mw);
  // 透明点击代理：默认远景下本体仅几像素，放大命中区域便于下钻
  const mwHit = new THREE.Mesh(new THREE.SphereGeometry(14,16,16),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  mwHit.userData = { type:'galaxy', data:mw }; disc.add(mwHit); lgMarkers.push(mwHit);
  lgObjMap[mw.id] = mwHit;

  C.localGroup.galaxies.forEach(g=>{
    if(g.id==='milkyway') return;
    const ra  = (g.ra||0) * Math.PI/12;                 // 小时 → 弧度（24h = 2π）
    const dec = THREE.MathUtils.degToRad(g.dec||0);
    const d = g.distMly * MLY;
    const x=d*Math.cos(dec)*Math.cos(ra), y=d*Math.sin(dec), z=d*Math.cos(dec)*Math.sin(ra);
    const holder = new THREE.Group(); holder.position.set(x,y,z); lgGroup.add(holder);
    const rr = 2.2 + 2.6*Math.log10(1 + g.diameterLy/1000);   // 直径对数映射（示意）
    const body = new THREE.Mesh(new THREE.SphereGeometry(rr,40,32),
      new THREE.MeshStandardMaterial({color:g.color, emissive:new THREE.Color(g.color).multiplyScalar(0.18), roughness:0.85}));
    body.userData = { type:'galaxy', data:g };
    holder.add(body);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(g.color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.scale.set(rr*6,rr*6,1); holder.add(halo);
    attachLabel(holder, g.name, 'sys', ()=>rr, 'localgroup', g);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(rr*2.2,6),16,16),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hit.userData = { type:'galaxy', data:g }; holder.add(hit); lgMarkers.push(hit);
    lgObjMap[g.id] = hit;
    // 到银河系的真实距离指示线
    const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(x,y,z)]);
    const ll = new THREE.Line(lg, new THREE.LineDashedMaterial({color:0x2a4668,dashSize:9,gapSize:11,transparent:true,opacity:0.32}));
    ll.computeLineDistances(); lgGroup.add(ll);
  });
})();

// ================= 层级 2：太阳系 =================
const solarGroup = new THREE.Group(); solarGroup.visible = false; scene.add(solarGroup);
const orbitLines = [];
const planetRecords = []; // {pivot, mesh, periodYr, rotH, initAngle}
const solarObjMap = {};

// ---------- 共享单位球：用 mesh.scale 控制显示尺寸，便于切换体积模式 ----------
const UNIT_SPHERE = new THREE.SphereGeometry(1, 48, 48);

// 太阳系补光：环境光 + 半球光，保证球体始终呈现立体球感（消除“方块/黑块”观感）
solarGroup.add(new THREE.AmbientLight(0x33424f, 0.55));
solarGroup.add(new THREE.HemisphereLight(0x9ab8ff, 0x202830, 0.45));

const sun = C.solarSystem.sun;
const sunMesh = new THREE.Mesh(UNIT_SPHERE, new THREE.MeshStandardMaterial({
  color: sun.color, emissive: 0xffb733, emissiveIntensity: 0.95, roughness: 0.9, metalness: 0.0 }));
sunMesh.userData = { type:'sun', data:sun };
solarGroup.add(sunMesh);
solarObjMap.sun = sunMesh;
attachLabel(solarGroup, sun.name, '', ()=> sunRadius(), 'solar', sun);
// 太阳光晕（独立于太阳缩放，固定在原点）
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTexture(0xffd27f), transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
sunGlow.scale.set(10,10,1); solarGroup.add(sunGlow);
const sunLight = new THREE.PointLight(0xfff2d0, 3.0, 0, 0.0); solarGroup.add(sunLight);

C.solarSystem.planets.forEach((p, i)=>{
  const r = p.aAU * AU;
  // 轨道倾角平面（真实轨道相对黄道倾角，绕 X 轴倾斜）
  const incl = new THREE.Group(); incl.rotation.x = THREE.MathUtils.degToRad(p.inclDeg||0); solarGroup.add(incl);
  // 轨道线
  const seg = 160, op = new Float32Array((seg+1)*3);
  for(let k=0;k<=seg;k++){ const a=k/seg*Math.PI*2; op[k*3]=Math.cos(a)*r; op[k*3+1]=0; op[k*3+2]=Math.sin(a)*r; }
  const og = new THREE.BufferGeometry(); og.setAttribute('position', new THREE.BufferAttribute(op,3));
  const ol = new THREE.Line(og, new THREE.LineBasicMaterial({ color:0x335577, transparent:true, opacity:0.55 }));
  incl.add(ol); orbitLines.push(ol);

  // 轨道位置(平移) → 轴倾角(仅影响自转轴) → 行星(自转)，整体置于真实倾角平面内
  const pivot = new THREE.Group(); incl.add(pivot);
  const orbitPos = new THREE.Group(); orbitPos.position.x = r; pivot.add(orbitPos);
  const tilt = new THREE.Group(); tilt.rotation.z = THREE.MathUtils.degToRad(p.tiltDeg||0); orbitPos.add(tilt);
  const mesh = new THREE.Mesh(UNIT_SPHERE,
    new THREE.MeshStandardMaterial({ color:p.color, emissive:new THREE.Color(p.color).multiplyScalar(0.06), roughness:0.85, metalness:0.05 }));
  mesh.userData = { type:'planet', data:p };
  tilt.add(mesh);

  if(p.ring){ // 土星环（以单位球为基准的相对比例，随行星缩放）
    const inner = p.ring.innerKm / p.radiusKm, outer = p.ring.outerKm / p.radiusKm;
    const rg = new THREE.RingGeometry(inner, outer, 64);
    const rm = new THREE.MeshBasicMaterial({ color:0xd8c79a, side:THREE.DoubleSide, transparent:true, opacity:0.55 });
    const ring = new THREE.Mesh(rg, rm); ring.rotation.x = Math.PI/2; mesh.add(ring);
  }

  attachLabel(orbitPos, p.name, '', ()=>planetDisplayRadius(p.radiusKm), 'solar', p);

  // 注：太阳系总览尺度下月球紧贴地球、肉眼不可见；为保持真实比例，不在此视图
  // 绘制失真的“放大版月球”。月球仅在专属的「地月系」视图中按其真实相对比例呈现。
  solarObjMap[p.id] = mesh;
  planetRecords.push({ pivot, mesh, radiusKm:p.radiusKm, periodYr:p.periodYr, rotH:p.rotationHours, initAngle:i*0.9 });
});

// 根据当前体积模式统一设置显示尺寸（太阳始终最大）
function applySizes(){
  sunMesh.scale.setScalar(sunRadius());
  planetRecords.forEach(rec=>{ rec.mesh.scale.setScalar(planetDisplayRadius(rec.radiusKm)); });
  applyLabels(); // 统一更新所有标签高度与指示线
}
applySizes();

// ================= 层级 2b：系外恒星系（数据驱动）=================
// 系统内轨道按真实半长轴相对比例绘制；名字全部放到左侧信息面板，
// 不在 3D 场景里叠 CSS2D 标签（避免遮挡/串层/重叠）
const exoGroup = new THREE.Group(); exoGroup.visible = false; scene.add(exoGroup);
let exoRecords = [];      // {pivot, mesh, periodDays, initAngle}
let exoStarRecs = [];     // 双星伴星
let exoClickables = [];
let exoUnit = 1;          // 场景单位 / AU（按当前系统最外轨道归一化）
let exoCurrent = null;
let exoObjMap = {};
let exoOrbitLines = [];
let orbitsOn = true;
const EXO_R = D.exoOrbitTarget;

function exoStarRadius(rkm){ return Math.max(1.0, 4.0*Math.pow(rkm/RSUN_KM, 0.35)); }
function exoPlanetRadius(re){ return Math.max(0.9, 1.2*Math.pow(Math.max(re,0.2), 0.42)); }
function addExoOrbit(r){
  const seg=140, a=[];
  for(let k=0;k<=seg;k++){ const t=k/seg*Math.PI*2; a.push(Math.cos(t)*r,0,Math.sin(t)*r); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a,3));
  const line=new THREE.Line(g, new THREE.LineBasicMaterial({color:0x335577,transparent:true,opacity:0.5}));
  line.visible=orbitsOn; exoGroup.add(line); exoOrbitLines.push(line);
}
function buildExoSystem(sys){
  exoGroup.clear();
  exoRecords=[]; exoStarRecs=[]; exoClickables=[]; exoOrbitLines=[]; exoObjMap={}; exoCurrent=sys;
  const s = sys.system || { stars:[{name:sys.name, radiusKm:RSUN_KM, color:sys.color}], planets:[] };
  const star = s.stars[0];
  const allA = (s.planets||[]).map(p=>p.aAU);
  if(s.binary) allA.push(s.binary.aAU);
  const maxA = allA.length ? Math.max(0.05, ...allA) : 1;
  exoUnit = EXO_R / maxA;

  exoGroup.add(new THREE.AmbientLight(0x33424f, 0.6));
  exoGroup.add(new THREE.HemisphereLight(0x9ab8ff, 0x202830, 0.5));

  const sr = exoStarRadius(star.radiusKm);
  const starMesh = new THREE.Mesh(new THREE.SphereGeometry(sr,40,40),
    new THREE.MeshStandardMaterial({color:star.color, emissive:new THREE.Color(star.color).multiplyScalar(0.9), roughness:0.9}));
  starMesh.userData = { type:'exostar', data:{ name:star.name, isStar:true, radiusKm:star.radiusKm,
    facts:[ `半径 ≈ ${(star.radiusKm/RSUN_KM).toFixed(3)} R☉`, `直径 ≈ ${(star.radiusKm*2).toLocaleString('zh-CN')} km`,
    `光谱型 ${sys.spectral}`] } };
  exoGroup.add(starMesh); exoClickables.push(starMesh); exoObjMap[star.name]=starMesh;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(star.color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  glow.scale.set(sr*7,sr*7,1); exoGroup.add(glow);
  exoGroup.add(new THREE.PointLight(0xfff0d8, 2.6, 0, 0));

  if(s.binary && s.stars[1]){
    const b=s.stars[1], br=exoStarRadius(b.radiusKm);
    const bp=new THREE.Group(); exoGroup.add(bp);
    const bm=new THREE.Mesh(new THREE.SphereGeometry(br,32,32),
      new THREE.MeshStandardMaterial({color:b.color, emissive:new THREE.Color(b.color).multiplyScalar(0.6), roughness:0.9}));
    bm.position.x = s.binary.aAU*exoUnit;
    bm.userData = { type:'exostar', data:{ name:b.name, isStar:true, radiusKm:b.radiusKm,
      bin_aAU:s.binary.aAU, bin_periodDays:s.binary.periodDays, facts:[
      `半径 ≈ ${(b.radiusKm/RSUN_KM).toFixed(4)} R☉`, `与主星间距 ≈ ${s.binary.aAU} AU`,
      `互绕周期 ≈ ${(s.binary.periodDays/YR_DAYS).toFixed(1)} 年`] } };
    bp.add(bm); exoClickables.push(bm); exoObjMap[b.name]=bm;
    addExoOrbit(s.binary.aAU*exoUnit);
    exoStarRecs.push({ pivot:bp, periodDays:s.binary.periodDays });
  }

  (s.planets||[]).forEach((p,i)=>{
    const r=p.aAU*exoUnit;
    addExoOrbit(r);
    const pivot=new THREE.Group(); exoGroup.add(pivot);
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(exoPlanetRadius(p.radiusRe),32,32),
      new THREE.MeshStandardMaterial({color:p.color, roughness:0.85}));
    mesh.position.x=r;
    mesh.userData = { type:'exoplanet', data:{ name:p.name, aAU:p.aAU, periodDays:p.periodDays, facts:[
      `轨道半长轴 ${p.aAU} AU`, `公转周期 ${p.periodDays} 天`,
      `估算半径 ≈ ${p.radiusRe} R⊕`, `距主星 ≈ ${(p.aAU*1.496e8).toExponential(2)} km`] } };
    pivot.add(mesh); exoClickables.push(mesh); exoObjMap[p.name]=mesh;
    exoRecords.push({ pivot, mesh, periodDays:p.periodDays, initAngle:i*0.8 });
  });
}

// ================= 层级 3：地月系 =================
const emGroup = new THREE.Group(); emGroup.visible = false; scene.add(emGroup);
const earth = C.solarSystem.planets.find(p=>p.id==='earth');
const moon = earth.moons[0];

const emSun = new THREE.DirectionalLight(0xfff4e0, 2.4); emSun.position.set(-1,0.3,0); emGroup.add(emSun);
emGroup.add(new THREE.AmbientLight(0x223344, 0.6));
emGroup.add(new THREE.HemisphereLight(0xbfd4ff, 0x182030, 0.5));

const earthTilt = new THREE.Group(); earthTilt.rotation.z = THREE.MathUtils.degToRad(earth.tiltDeg); emGroup.add(earthTilt);
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(earth.radiusKm*KM, 48, 48),
  new THREE.MeshStandardMaterial({ color:earth.color, roughness:0.8, metalness:0.05, emissive:0x0a1a2a, emissiveIntensity:0.4 }));
earthMesh.userData = { type:'earth', data:earth }; earthTilt.add(earthMesh);
// 简易海陆纹理（程序生成，示意）
(function earthTex(){ const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d');
  x.fillStyle='#1f5fa8'; x.fillRect(0,0,128,128); x.fillStyle='#2e7d32';
  for(let i=0;i<14;i++){ x.beginPath(); x.arc(Math.random()*128,Math.random()*128,4+Math.random()*14,0,7); x.fill(); }
  const t=new THREE.CanvasTexture(cv); earthMesh.material.map=t; earthMesh.material.needsUpdate=true; })();
attachLabel(earthTilt, earth.name, '', ()=> earth.radiusKm*KM, 'earthmoon', earth);

const moonPivot = new THREE.Group(); moonPivot.rotation.x = THREE.MathUtils.degToRad(moon.inclDeg||5.14); emGroup.add(moonPivot);
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(moon.radiusKm*KM, 32, 32),
  new THREE.MeshStandardMaterial({ color:moon.color, roughness:0.95 }));
moonMesh.position.x = moon.orbitKm*KM; moonMesh.userData={ type:'moon', data:moon };
moonPivot.add(moonMesh);
// 月球标签（指示线方式，挂在不自转的节点上避免被月球翻面影响）
const moonLabelNode = new THREE.Group(); moonLabelNode.position.x = moon.orbitKm*KM; moonPivot.add(moonLabelNode);
attachLabel(moonLabelNode, moon.name, 'moon', ()=> moon.radiusKm*KM, 'earthmoon', moon);
const emOrbit = new THREE.Line(
  (function(){ const s=160,a=[]; for(let k=0;k<=s;k++){const t=k/s*Math.PI*2;a.push(Math.cos(t)*moon.orbitKm*KM,0,Math.sin(t)*moon.orbitKm*KM);} const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(a,3)); return g;})(),
  new THREE.LineBasicMaterial({ color:0x4466aa, transparent:true, opacity:0.6 }));
emGroup.add(emOrbit); orbitLines.push(emOrbit);
// 地-月连线：直观表明月球始终绕地球运转（而非绕太阳）
const emLinkGeo = new THREE.BufferGeometry();
emLinkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
const emLink = new THREE.Line(emLinkGeo, new THREE.LineDashedMaterial({ color:0x88aaff, dashSize:8, gapSize:5, transparent:true, opacity:0.55 }));
emGroup.add(emLink);
const emObjMap = { earth:earthMesh, moon:moonMesh };
const moonInitAngle = 0;

// ================= 状态与导航 =================
const state = { layer:'nearby', exoId:null };
const views = {
  nearby:   { pos:new THREE.Vector3(0,480,1650), tar:new THREE.Vector3(0,0,0) },
  localgroup:{ pos:new THREE.Vector3(0,380,1100), tar:new THREE.Vector3(0,0,0) },
  galaxy:   { pos:new THREE.Vector3(0,140,780), tar:new THREE.Vector3(0,0,0) },
  solar:    { pos:new THREE.Vector3(0,150,360), tar:new THREE.Vector3(0,0,0) },
  exo:      { pos:new THREE.Vector3(0,78,165), tar:new THREE.Vector3(0,0,0) },
  earthmoon:{ pos:new THREE.Vector3(140,100,320), tar:new THREE.Vector3(0,0,0) }
};
let camAnim = null;
function flyTo(layer){
  const v = views[layer];
  camAnim = { t:0, dur:1.1, fromPos:camera.position.clone(), toPos:v.pos.clone(), fromTar:controls.target.clone(), toTar:v.tar.clone() };
}
function easeIO(k){ return k<0.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2; }

function setLayer(layer, exoId){
  state.layer = layer;
  if(exoId) state.exoId = exoId;
  nearbyGroup.visible = layer==='nearby';
  lgGroup.visible     = layer==='localgroup';
  galaxyGroup.visible = layer==='galaxy';
  solarGroup.visible  = layer==='solar';
  exoGroup.visible    = layer==='exo';
  emGroup.visible     = layer==='earthmoon';
  applyLabelVisibility();  // CSS2D 标签不会随父级 group 隐藏，需按图层显式显隐
  if(layer==='nearby') showNearbyInfo();
  else if(layer==='localgroup') showLocalGroupInfo();
  else if(layer==='galaxy') showGalaxyInfo();
  nav.override=null; nav.selected=null;
  flyTo(layer);
  renderNavigator();
}

// ================= 右上角层级导航器 =================
const NAV_PARENT = { nearby:null, localgroup:'nearby', galaxy:'localgroup', solar:'galaxy', exo:'galaxy', earthmoon:'solar' };
const NAV_LABEL  = { nearby:'近邻宇宙', localgroup:'本星系群', galaxy:'银河系', solar:'太阳系', earthmoon:'地月系' };
const nav = { override:null, selected:null };  // override：点击叶子后临时显示的天体名

function navTitle(layer){
  if(layer==='exo'){
    const s=C.galaxy.systems.find(x=>x.id===state.exoId);
    return s ? s.name : '恒星系';
  }
  return NAV_LABEL[layer] || layer;
}
function navPath(layer){
  const chain=[]; let L=layer;
  while(L){ chain.unshift(NAV_LABEL[L] || (L==='exo' ? navTitle('exo') : L)); L=NAV_PARENT[L]; }
  return chain.join('  ›  ');
}
// 当前节点的子级清单（可下钻的带 drill，叶子带 3D 对象用于定位）
function navChildren(layer){
  const out=[];
  if(layer==='nearby'){
    C.nearbyUniverse.galaxies.forEach(g=>out.push({
      id:g.id, name:g.name, sub:g.distMly ? g.distMly+' Mly' : '本群',
      drill:g.drill==='localgroup' ? 'localgroup' : null,
      obj:nearbyObjMap[g.id], data:g, r:8 }));
  } else if(layer==='localgroup'){
    C.localGroup.galaxies.forEach(g=>out.push({
      id:g.id, name:g.name, sub:g.distMly ? g.distMly+' Mly' : '中心',
      drill:g.drill==='galaxy' ? 'galaxy' : null,
      obj:lgObjMap[g.id], data:g, r:8 }));
  } else if(layer==='galaxy'){
    C.galaxy.systems.forEach(s=>out.push({
      id:s.id, name:s.name, sub:s.distLy ? s.distLy+' ly' : '我们在这',
      drill:s.drill==='solar' ? 'solar' : (s.drill==='exo' ? 'exo:'+s.id : null),
      obj:galaxyObjMap[s.id], data:s, r:6 }));
  } else if(layer==='solar'){
    out.push({ id:'sun', name:C.solarSystem.sun.name, sub:'G2V', drill:null,
      obj:solarObjMap.sun, data:C.solarSystem.sun, r:10 });
    C.solarSystem.planets.forEach(p=>out.push({
      id:p.id, name:p.name, sub:p.aAU+' AU', drill:p.id==='earth' ? 'earthmoon' : null,
      obj:solarObjMap[p.id], data:p, r:5 }));
  } else if(layer==='exo'){
    const sys=C.galaxy.systems.find(x=>x.id===state.exoId);
    const sd=sys && sys.system;
    const stars=sd ? sd.stars : [{name:sys?sys.name:'恒星'}];
    stars.forEach(st=>out.push({ id:'st:'+st.name, name:st.name, sub:sd&&sd.binary?'双星成员':'恒星',
      drill:null, obj:exoObjMap[st.name], data:null, r:8 }));
    ((sd && sd.planets)||[]).forEach(p=>out.push({ id:'pl:'+p.name, name:p.name, sub:p.aAU+' AU',
      drill:null, obj:exoObjMap[p.name], data:null, r:3 }));
  } else if(layer==='earthmoon'){
    out.push({ id:'earth', name:earth.name, sub:'6,371 km', drill:null, obj:emObjMap.earth, data:earth, r:9 });
    out.push({ id:'moon', name:moon.name, sub:'38.44 万 km', drill:null, obj:emObjMap.moon, data:moon, r:4 });
  }
  return out;
}
function renderNavigator(){
  const layer=state.layer;
  document.getElementById('nav-title').textContent = nav.override || navTitle(layer);
  document.getElementById('nav-path').textContent = navPath(layer) + (nav.override ? '  ›  '+nav.override : '');
  document.getElementById('nav-up').disabled = !nav.override && !NAV_PARENT[layer];
  const list=document.getElementById('nav-list'); list.innerHTML='';
  const items=navChildren(layer);
  if(!items.length){
    const d=document.createElement('div'); d.className='nav-empty';
    d.textContent='该层级没有可展开的下级结构。'; list.appendChild(d); return;
  }
  items.forEach(it=>{
    const row=document.createElement('div');
    row.className='nav-item'+(nav.selected===it.id?' sel':'');
    const nm=document.createElement('span'); nm.className='nm'; nm.textContent=it.name;
    const sb=document.createElement('span'); sb.className='sb'; sb.textContent=it.sub||'';
    row.appendChild(nm); row.appendChild(sb);
    if(it.drill){ const go=document.createElement('span'); go.className='go'; go.textContent='›'; row.appendChild(go); }
    row.title = it.drill ? '进入下一级' : '定位到该天体';
    row.onclick=()=>navSelect(it);
    list.appendChild(row);
  });
}
function focusObject(obj, r){
  if(!obj) return;
  const p=new THREE.Vector3(); obj.getWorldPosition(p);
  const dir=camera.position.clone().sub(controls.target).normalize();
  if(dir.lengthSq()<1e-6) dir.set(0,0.4,1).normalize();
  const d=Math.max(r*7, 22);
  camAnim={ t:0, dur:1.0, fromPos:camera.position.clone(), toPos:p.clone().add(dir.multiplyScalar(d)),
            fromTar:controls.target.clone(), toTar:p.clone() };
}
function navSelect(it){
  if(it.drill){
    nav.override=null; nav.selected=null;
    if(it.drill.indexOf('exo:')===0) openExo(it.drill.slice(4));
    else setLayer(it.drill);
    return;
  }
  // 叶子节点：相机定位 + 标题显示该天体名，清单保留以便继续选同级
  nav.override=it.name; nav.selected=it.id;
  focusObject(it.obj, it.r||5);
  const d=it.data || (it.obj && it.obj.userData && it.obj.userData.data);
  if(d) showInfo(d, '已从层级清单定位；点「‹ 上一级」返回当前层级。');
  renderNavigator();
}
function navUp(){
  if(nav.override){          // 先退出叶子选中，回到当前层级
    nav.override=null; nav.selected=null; renderNavigator();
  } else {                   // 否则切到父层级
    const p=NAV_PARENT[state.layer];
    if(p) setLayer(p);
  }
}
document.getElementById('nav-up').onclick=navUp;

// ================= 信息面板 =================
function showInfo(obj, hint){
  document.getElementById('info-title').textContent = obj.name;
  document.getElementById('info-sub').textContent = obj.type || (obj.facts? '' : '');
  const body = document.getElementById('info-body'); body.innerHTML='';
  (obj.facts||[]).forEach(f=>{ const li=document.createElement('li'); li.textContent=f; body.appendChild(li); });
  // 公转 / 自转速度：只显示有依据的项，不适用或无实测值时如实说明
  const v = deriveVelocity(obj);
  if(v && (v.orbit || v.spin || v.note)){
    const sep=document.createElement('li'); sep.className='vel-sep'; sep.textContent='运行速度'; body.appendChild(sep);
    if(v.orbit){ const li=document.createElement('li'); li.className='vel'; li.textContent='公转速度  '+v.orbit; body.appendChild(li); }
    if(v.spin){ const li=document.createElement('li'); li.className='vel'; li.textContent='自转速度  '+v.spin; body.appendChild(li); }
    if(v.note){ const li=document.createElement('li'); li.className='velnote'; li.textContent=v.note; body.appendChild(li); }
  }
  document.getElementById('info-hint').textContent = hint || '';
}
function solarInfo(p){
  showInfo(p, p.moons ? '点击地球可下钻至地月系，观察月球公转与地球自转。' : '该行星暂无下钻建模，以上为真实轨道/物理参数。');
}
function showNearbyInfo(){
  const gs = C.nearbyUniverse.galaxies;
  showInfo({ name:'近邻宇宙 · 与银河系平级的大星系', type:'视野半径 ≈ 5400 万光年',
    facts:[ `本图绘制 ${gs.length-1} 个同量级大星系 + 本星系群`,
      '距离与天球方位（J2000 赤经/赤纬）按实测值换算',
      '星系本体为球状示意标记（真实旋涡星系是扁平盘状，球体非真实形态）',
      '虚线为到本星系群的距离；虚线圆为本星系群范围（直径 ≈ 1000 万光年）',
      '直径对比：M101 ≈ 17 万 ly、NGC 6744 ≈ 17.5 万 ly、银河系 ≈ 10 万 ly',
      '最远：室女座星系团 M87 / M49 / M86（≈ 5300 万光年）',
      '成员：NGC 253、M81、半人马 A、M83、M64、M101、M51、NGC 6744、M104、M87、M49、M86' ] },
    '与银河系同量级的大星系都在此层；点「本星系群」下钻，或点任一星系查看实测参数。');
}
function showLocalGroupInfo(){
  const gs = C.localGroup.galaxies;
  showInfo({ name:'本星系群 Local Group', type:'跨越约 1000 万光年的星系群',
    facts:[ `本图绘制 ${gs.length} 个成员星系（含银河系）`,
      '距离与天球方位（J2000 赤经/赤纬）按实测值换算',
      '星系本体为球状示意标记（真实旋涡星系是扁平盘状）',
      '虚线为各星系到银河系的距离',
      '最大成员：仙女座 M31（≈ 254 万光年）、银河系',
      '第三大：三角座 M33（≈ 273 万光年）' ] },
    '银河系之外真正的「其他星系」都在此层；点「银河系」下钻，或点任一小星系查看参数。');
}
function showGalaxyInfo(){
  const ss = C.galaxy.systems;
  showInfo({ name:'银河系 Milky Way', type:'SBbc 棒旋星系 · 直径 ≈ 10 万光年',
    facts:[ `标注 ${ss.length} 个邻近恒星系（含太阳系）`,
      '距离 / 光谱型 / 已确认行星数为实测值',
      '标记位置为示意散布：邻近恒星在该尺度下几乎重合',
      '螺旋臂点云为程序生成示意，非逐颗实测',
      C.galaxy.core.facts[0], C.galaxy.core.facts[1] ] },
    '点任意恒星系即可下钻查看其恒星与行星系统；点「太阳系」可继续下钻到地月系。');
}
function openExo(id){
  const sys = C.galaxy.systems.find(s=>s.id===id);
  if(!sys) return;
  buildExoSystem(sys);
  showExoInfo(sys);
  setLayer('exo', id);
}
function showExoInfo(sys){
  const s = sys.system;
  const facts = [
    `距地球 ${sys.distLy} 光年`,
    `光谱型 ${sys.spectral}`,
    `已确认行星 ${sys.planets===null ? '存疑（历史报告多被证伪）' : sys.planets+' 颗'}`
  ];
  if(s){
    facts.push(`恒星成员：${s.stars.map(x=>x.name).join('、')}`);
    (s.planets||[]).forEach(p=>facts.push(`${p.name} — ${p.aAU} AU / ${p.periodDays} 天`));
    if(s.binary) facts.push(`双星：间距 ${s.binary.aAU} AU，周期 ${(s.binary.periodDays/YR_DAYS).toFixed(1)} 年`);
    if(!s.planets || !s.planets.length) facts.push('目前无已确认行星（NASA Exoplanet Archive）');
  } else {
    sys.facts.forEach(f=>facts.push(f));
    facts.push('该系统暂无可靠的已确认行星轨道参数，故仅呈现恒星本体。');
  }
  showInfo({ name:sys.name, type:`${sys.spectral} · 距地球 ${sys.distLy} 光年`, facts },
    s && s.note ? s.note : '轨道按系统内真实相对比例绘制；点击任一天体查看实测参数。');
}

// ================= 交互：点击下钻 / 查看 =================
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downXY = null;
renderer.domElement.addEventListener('pointerdown', e=>{ downXY=[e.clientX,e.clientY]; });
renderer.domElement.addEventListener('pointerup', e=>{
  if(!downXY) return;
  const moved = Math.hypot(e.clientX-downXY[0], e.clientY-downXY[1]);
  downXY=null; if(moved>5) return; // 拖拽不算点击
  ndc.x = (e.clientX/innerWidth)*2-1; ndc.y = -(e.clientY/innerHeight)*2+1;
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(collectClickable(state.layer), false);
  if(hits.length){
    const ud = hits[0].object.userData;
    if(ud.type==='nearbygalaxy'){
      if(ud.data.drill==='localgroup') setLayer('localgroup');
      else showInfo(ud.data, '与银河系同量级的近邻大星系；点面包屑可返回。');
    } else if(ud.type==='galaxy'){
      if(ud.data.drill==='galaxy') setLayer('galaxy');
      else showInfo(ud.data, '本星系群成员；点面包屑「银河系」可回到银河系视图。');
    } else if(ud.type==='system'){
      if(ud.data.drill==='solar') setLayer('solar');
      else if(ud.data.drill==='exo') openExo(ud.data.id);
      else showInfo(ud.data, '');
    } else if(ud.type==='exostar' || ud.type==='exoplanet'){
      showInfo(ud.data, '数值取自 NASA Exoplanet Archive / 公开汇编；点击面包屑可返回。');
    } else if(ud.type==='sun'){
      showInfo(ud.data, '太阳系中心恒星。点击面包屑「银河系」可返回。');
    } else if(ud.type==='planet'){
      if(ud.data.id==='earth') setLayer('earthmoon');
      else solarInfo(ud.data);
    } else if(ud.type==='earth'){
      showInfo(ud.data, '点击月球查看其参数；拖拽可旋转观察自转。');
    } else if(ud.type==='moon'){
      showInfo(ud.data, '月球绕地球公转并与地球同步自转（潮汐锁定），始终以同一面朝向地球。');
    }
  }
});
function collectClickable(layer){
  if(layer==='nearby') return nearbyMarkers;
  if(layer==='localgroup') return lgMarkers;
  if(layer==='galaxy') return systemMarkers;
  if(layer==='solar') return [sunMesh, ...planetRecords.map(r=>r.mesh)];
  if(layer==='exo') return exoClickables;
  return [earthMesh, moonMesh];
}

// ================= UI 控件 =================
let paused=false, speedMul=1, simDays=0;
const elPause=document.getElementById('btn-pause');
const elSpeed=document.getElementById('speed'), elSpeedVal=document.getElementById('speed-val');
const elOrbits=document.getElementById('btn-orbits'), elLabels=document.getElementById('btn-labels');
const elReset=document.getElementById('btn-reset');
const elReadout=document.getElementById('time-readout');
const labelsEl=document.getElementById('labels');
const elSize=document.getElementById('btn-size'), elSizeNote=document.getElementById('size-note');
const elVel=document.getElementById('btn-vel');

// 比例尺（左下角，随缩放动态更新，反映真实距离比例）
const elSbBar=document.getElementById('sb-bar');
const elSbLabel=document.getElementById('sb-label');
function niceStep(raw){
  if(!isFinite(raw) || raw<=0) return 1;
  const pow=Math.pow(10, Math.floor(Math.log10(raw)));
  const n=raw/pow;
  let m; if(n<1.5)m=1; else if(n<3.5)m=2; else if(n<7.5)m=5; else m=10;
  return m*pow;
}
function updateScaleBar(){
  const layer=state.layer;
  if(layer==='galaxy'){
    elSbBar.style.display='none';
    elSbLabel.textContent='结构示意（非真实比例）';
    return;
  }
  elSbBar.style.display='block';
  // 相机到目标点的距离，换算“世界单位 / 屏幕像素”
  const d=camera.position.distanceTo(controls.target);
  const worldPerPx=(2*d*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))/renderer.domElement.clientHeight;
  if(layer==='localgroup' || layer==='nearby'){
    // 两层距离均按实测 distMly 线性映射，比例尺为真实值（仅单位换算不同）
    const u = layer==='nearby' ? MLY_FAR : MLY;
    const targetMly=niceStep(150*worldPerPx/u);
    const px=targetMly*u/worldPerPx;
    elSbBar.style.width=px.toFixed(1)+'px';
    elSbLabel.textContent=(targetMly<1?targetMly.toFixed(2):targetMly<10?targetMly.toFixed(1):targetMly.toFixed(0))+' 百万光年';
  } else if(layer==='solar' || layer==='exo'){
    // 太阳系 1 AU = 7 单位；系外系统按各自最外轨道归一化（系统内比例真实）
    const u = layer==='solar' ? AU : exoUnit;
    const targetAU=niceStep(150*worldPerPx/u);
    const px=targetAU*u/worldPerPx;
    elSbBar.style.width=px.toFixed(1)+'px';
    elSbLabel.textContent=(targetAU>=10?targetAU.toFixed(0):targetAU.toFixed(targetAU<1?3:2))+' AU';
  } else {
    // 地月系：1 场景单位 = 1/KM km（约 1500 km）；地月距为真实 38.44 万 km
    const kmPerWorld=1/KM;
    const targetKm=niceStep(150*worldPerPx*kmPerWorld);
    const px=targetKm/KM/worldPerPx;
    elSbBar.style.width=px.toFixed(1)+'px';
    elSbLabel.textContent = targetKm>=1e4 ? (targetKm/1e4).toLocaleString('zh-CN')+' 万 km'
                                         : targetKm.toLocaleString('zh-CN')+' km';
  }
}

// 标签避让：同层标签投影到屏幕后，重叠的淡出，避免文字互相压盖
const _dv = new THREE.Vector3();
function declutterLabels(){
  const boxes=[];
  for(const it of labelItems){
    const el=it.lab.element;
    if(!el) continue;
    if(!it.lab.visible){ el.style.opacity='0'; continue; }
    it.lab.getWorldPosition(_dv); _dv.project(camera);
    if(_dv.z < -1 || _dv.z > 1){ el.style.opacity='0'; continue; }
    boxes.push({ el, x:(_dv.x*0.5+0.5)*innerWidth, y:(-_dv.y*0.5+0.5)*innerHeight });
  }
  boxes.sort((a,b)=>a.y-b.y);
  const kept=[];
  for(const b of boxes){
    let clash=false;
    for(const k of kept){ if(Math.abs(b.x-k.x)<168 && Math.abs(b.y-k.y)<32){ clash=true; break; } }
    b.el.style.opacity = clash ? '0' : '1';
    if(!clash) kept.push(b);
  }
}

elPause.onclick=()=>{ paused=!paused; elPause.textContent= paused?'▶ 继续':'⏸ 暂停'; elPause.classList.toggle('on',paused); };
elSpeed.oninput=()=>{ speedMul=parseFloat(elSpeed.value); elSpeedVal.textContent=speedMul.toFixed(1)+'×'; };
elOrbits.onclick=()=>{ orbitsOn=elOrbits.classList.toggle('on');
  orbitLines.forEach(o=>o.visible=orbitsOn); exoOrbitLines.forEach(o=>o.visible=orbitsOn); };
elLabels.onclick=()=>{ const on=elLabels.classList.toggle('on'); labelsEl.style.display=on?'block':'none'; };
elSize.onclick=()=>{
  SIZE.mode = SIZE.mode==='schematic' ? 'true' : 'schematic';
  applySizes();
  const t = SIZE.mode==='true';
  elSize.textContent = t ? '体积：真实' : '体积：示意';
  elSize.classList.toggle('on', t);
  elSizeNote.textContent = t
    ? '当前：真实比例（行星按真实相对体积，太阳系中它们本就是微小光点；太阳/木星半径≈9.96:1）。'
    : '当前：示意模式（行星已放大以保证可见；太阳为系统中最大天体）。';
};
elVel.onclick=()=>{
  showVel = elVel.classList.toggle('on');
  labelItems.forEach(it=>{ if(it.velEl) it.velEl.style.display = showVel ? 'block' : 'none'; });
};
elReset.onclick=()=>flyTo(state.layer);

// ================= 动画循环 =================
const clock = new THREE.Clock();
function tick(){
  const dt = Math.min(clock.getDelta(), 0.05);
  const layer = state.layer;
  const dps = (layer==='galaxy'||layer==='localgroup'||layer==='nearby') ? 0 : (D.defaultDaysPerSec[layer]||1);
  if(!paused) simDays += dt * dps * speedMul;

  // 太阳系公转 / 自转
  planetRecords.forEach(r=>{
    r.pivot.rotation.y = r.initAngle + (simDays / (r.periodYr*YR_DAYS)) * Math.PI*2;
    r.mesh.rotation.y = (simDays*24 / r.rotH) * Math.PI*2;
  });
  // 系外恒星系：行星公转 + 双星互绕（周期均为实测值）
  exoRecords.forEach(r=>{ r.pivot.rotation.y = r.initAngle + (simDays/r.periodDays)*Math.PI*2; });
  exoStarRecs.forEach(r=>{ r.pivot.rotation.y = (simDays/r.periodDays)*Math.PI*2; });
  // 地月系
  earthMesh.rotation.y = (simDays*24 / earth.rotationHours) * Math.PI*2;
  moonPivot.rotation.y = moonInitAngle + (simDays / moon.periodDays) * Math.PI*2;
  moonMesh.lookAt(0,0,0); // 潮汐锁定：始终同一面朝向地球
  // 地-月指示连线（随月球走，直观表明月球绕地球）
  if(state.layer==='earthmoon'){
    moonMesh.updateWorldMatrix(true, false);
    const mp = new THREE.Vector3(); moonMesh.getWorldPosition(mp);
    const lp = emLinkGeo.attributes.position;
    lp.setXYZ(0, 0, 0, 0); lp.setXYZ(1, mp.x, mp.y, mp.z); lp.needsUpdate = true;
    emLink.computeLineDistances();
  }

  if(!paused && layer==='galaxy') galaxyGroup.rotation.y += dt*0.01;

  if(camAnim){
    camAnim.t += dt/camAnim.dur;
    const k = camAnim.t>=1 ? 1 : easeIO(camAnim.t);
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, k);
    controls.target.lerpVectors(camAnim.fromTar, camAnim.toTar, k);
    if(camAnim.t>=1) camAnim=null;
  }
  controls.update();
  updateScaleBar();
  declutterLabels();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  const yrs = simDays/YR_DAYS;
  elReadout.textContent = yrs>=1 ? `已运行 ${yrs.toFixed(2)} 年` : `已运行 ${simDays.toFixed(1)} 天`;
  requestAnimationFrame(tick);
}

addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); labelRenderer.setSize(innerWidth, innerHeight);
});

// 启动
applyLabels(); // 确保所有层级（含地月系）标签高度与指示线就绪
setLayer('nearby');
document.getElementById('loading').style.display='none';
tick();
