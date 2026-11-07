import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ---------------------------------------------------------------------------
// 真实数据载荷：NASA Exoplanet Archive（pscomppars）实测系外行星记录
// 由 exodata.js（classic script）注入为 window.EXO_DATA / window.EXO_META
// ---------------------------------------------------------------------------
const DATA = window.EXO_DATA || [];
const META = window.EXO_META || {};
const TWO_PI = Math.PI * 2;

// ---------------------------------------------------------------------------
// 渲染器 / 场景 / 相机 / 控制器
// ---------------------------------------------------------------------------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
app.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03060c);
scene.fog = new THREE.FogExp2(0x03060c, 0.004);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(2, 16, 48);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 240;
controls.target.set(0, 0, 0);

// ---------------------------------------------------------------------------
// 灯光
// ---------------------------------------------------------------------------
scene.add(new THREE.AmbientLight(0x4a5a70, 1.1));
const lCyan = new THREE.PointLight(0x33ccff, 1.4, 400); lCyan.position.set(-34, 22, 30); scene.add(lCyan);
const lMag = new THREE.PointLight(0xff3399, 1.2, 400); lMag.position.set(34, -12, -26); scene.add(lMag);
const lKey = new THREE.DirectionalLight(0xffffff, 0.5); lKey.position.set(0, 40, 20); scene.add(lKey);

// ---------------------------------------------------------------------------
// 星空背景
// ---------------------------------------------------------------------------
(function starfield() {
  const n = 3500, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 300 + Math.random() * 900;
    const th = Math.random() * TWO_PI, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.6;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    const c = new THREE.Color().setHSL(0.58, 0.3, 0.5 + Math.random() * 0.5);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 1.6, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false
  })));
})();

// 地面网格（科幻纵深）
const grid = new THREE.GridHelper(220, 44, 0x1b6fa8, 0x0c2a3a);
grid.position.y = -11;
grid.material.transparent = true; grid.material.opacity = 0.22;
scene.add(grid);

// ---------------------------------------------------------------------------
// 以太网线缆（写实风格化）
// ---------------------------------------------------------------------------
const HALF = 32;            // 线缆半长（场景单位）
const cable = new THREE.Group();
scene.add(cable);

// 外护套
const sheath = new THREE.Mesh(
  new THREE.CylinderGeometry(1.5, 1.5, HALF * 2, 40, 1, true),
  new THREE.MeshStandardMaterial({
    color: 0x0a2230, transparent: true, opacity: 0.16, side: THREE.DoubleSide,
    roughness: 0.4, metalness: 0.2, emissive: 0x06303f, emissiveIntensity: 0.4
  })
);
sheath.rotation.z = Math.PI / 2;
cable.add(sheath);

// 护套线框
const sheathWire = new THREE.Mesh(
  new THREE.CylinderGeometry(1.54, 1.54, HALF * 2, 24, 1, true),
  new THREE.MeshBasicMaterial({ color: 0x1f7fae, wireframe: true, transparent: true, opacity: 0.16 })
);
sheathWire.rotation.z = Math.PI / 2;
cable.add(sheathWire);

// 四对双绞线（螺旋）
const pairColors = [0x33ccff, 0xff3399, 0x33ff99, 0xffcc33];
const pairs = [];
for (let i = 0; i < 4; i++) {
  const phase = i * Math.PI / 2;
  const r = 0.85, twists = 13, pts = [];
  for (let s = 0; s <= 200; s++) {
    const x = -HALF + (s / 200) * (HALF * 2);
    const a = phase + (x / HALF) * twists * Math.PI;
    pts.push(new THREE.Vector3(x, r * Math.cos(a), r * Math.sin(a)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 200, 0.05, 6, false),
    new THREE.MeshBasicMaterial({ color: pairColors[i], transparent: true, opacity: 0.85 })
  );
  cable.add(tube);
  pairs.push(tube);
}

// RJ45 接头
function rj45(x) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x0c1822, roughness: 0.5, metalness: 0.6, emissive: 0x07202c, emissiveIntensity: 0.5 })
  );
  g.add(body);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.12, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x33ccff })
  );
  ring.position.x = x < 0 ? -1.7 : 1.7; ring.rotation.y = Math.PI / 2; g.add(ring);
  const boot = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.7, 2.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x081016, roughness: 0.7 })
  );
  boot.rotation.z = Math.PI / 2; boot.position.x = x < 0 ? -2.7 : 2.7; g.add(boot);
  g.position.x = x;
  return g;
}
cable.add(rj45(-HALF));
cable.add(rj45(HALF));

// 数据源 / 接收端 标签
function makeLabel(text, cls) {
  const d = document.createElement('div');
  d.className = 'node-label ' + (cls || '');
  d.textContent = text;
  return new CSS2DObject(d);
}
const srcLabel = makeLabel('◈ 数据源 · NASA Exoplanet Archive', 'src');
srcLabel.position.set(-HALF - 4, 4, 0); scene.add(srcLabel);
const sinkLabel = makeLabel('◈ 接收端 · 本地缓存', 'sink');
sinkLabel.position.set(HALF + 4, 4, 0); scene.add(sinkLabel);

// ---------------------------------------------------------------------------
// 数据包（发光粒子 + 彗尾），沿缆轴心从左向右流动
// ---------------------------------------------------------------------------
function glowTexture(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const col = new THREE.Color(color);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},1)`);
  g.addColorStop(0.25, `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},0.55)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return (h % 360) / 360;
}
function hashHex(str, pairs) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  let s = '';
  for (let i = 0; i < pairs; i++) { s += ((h >> (i * 4)) & 0xff).toString(16).padStart(2, '0').toUpperCase() + (i < pairs - 1 ? ':' : ''); }
  return s;
}

const packets = [];
let idx = 0;
const SPAWN_INTERVAL = 0.45;     // 视觉节奏：每 0.45s 一帧（speed=1）
const TRAVERSE = 4.2;            // 单包穿越线缆耗时（speed=1）
const VX = (HALF * 2) / TRAVERSE;
let spawnTimer = 0;
let playing = true;
let speed = 1;

// 真实以太网帧结构（1000BASE-T / IPv4 / UDP）
const DST_MAC = '33:33:00:00:00:01';   // 多播至档案库
let packetsSent = 0, bytesTotal = 0;

function frameBytes(rec) {
  const payload = JSON.stringify(rec);
  const enc = new TextEncoder().encode(payload).length;
  const overhead = 64; // 前导码8+MAC12+类型2+IPv4 20+UDP 8+FCS 4+帧间隙12（约）
  return { payload: enc, overhead, total: enc + overhead };
}

function spawnPacket() {
  if (!DATA.length) return;
  const rec = DATA[idx % DATA.length]; idx++;
  const hue = hashHue(rec.name);
  const color = new THREE.Color().setHSL(hue, 0.85, 0.6);

  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshBasicMaterial({ color })
  );
  g.add(core);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(color), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.set(4, 4, 1); g.add(halo);
  const trail = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 2.4, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  trail.rotation.z = Math.PI / 2; trail.position.x = -1.4; g.add(trail);

  g.position.set(-HALF, 0, 0);
  scene.add(g);
  packets.push({ group: g, x: -HALF, rec, color });
  showFrame(rec, color);
}

function disposeGroup(g) {
  g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
}

function arrive(p) {
  packetsSent++;
  const fb = frameBytes(p.rec);
  bytesTotal += fb.total;
  scene.remove(p.group);
  disposeGroup(p.group);
  logPacket(p.rec, p.color, fb);
  updateStats();
}

// ---------------------------------------------------------------------------
// HUD：以太网帧结构 / 实时日志 / 统计
// ---------------------------------------------------------------------------
const logEl = document.getElementById('log');
const frameEl = document.getElementById('frame');

function showFrame(rec, color) {
  const fb = frameBytes(rec);
  const c = '#' + new THREE.Color(color).getHexString();
  const srcMac = '02:' + hashHex(rec.name, 5);
  const srcIP = '198.51.100.' + ((hashHue(rec.name) * 253 | 0) + 1);
  const dstIP = '203.0.113.10';
  const rows = [
    ['前导码 + SFD', '8 B', '10101010… 帧同步'],
    ['目的 MAC', '6 B', DST_MAC],
    ['源 MAC', '6 B', srcMac],
    ['EtherType', '2 B', '0x0800 (IPv4)'],
    ['IPv4 头', '20 B', `${srcIP} → ${dstIP}`],
    ['UDP 头', '8 B', 'dport 443'],
    ['载荷（实测数据）', fb.payload + ' B', JSON.stringify(rec)],
    ['FCS', '4 B', 'CRC-32'],
    ['帧间隙 IFG', '12 B', '—'],
  ];
  let html = `<div class="frame-head" style="border-color:${c}">以太网帧 · 实时载荷 <span style="color:${c}">${rec.name}</span></div>`;
  html += '<table>';
  for (const [k, b, v] of rows) {
    html += `<tr><td class="fk">${k}</td><td class="fb">${b}</td><td class="fv">${v}</td></tr>`;
  }
  html += `<tr class="total"><td>合计</td><td>${fb.total} B</td><td>${fb.total * 8} bit</td></tr>`;
  html += '</table>';
  frameEl.innerHTML = html;
}

function logPacket(rec, color, fb) {
  const c = '#' + new THREE.Color(color).getHexString();
  const row = document.createElement('div');
  row.className = 'log-row';
  row.innerHTML =
    `<span class="dot" style="background:${c}"></span>` +
    `<b>${rec.name}</b> <span class="muted">· ${rec.host}</span><br>` +
    `<span class="kv">P ${rec.period ?? '—'}d</span> ` +
    `<span class="kv">R ${rec.radius}R⊕</span> ` +
    `<span class="kv">M ${rec.mass ?? '—'}M⊕</span> ` +
    `<span class="kv">d ${rec.dist_ly ?? '—'}ly</span> ` +
    `<span class="kv">${fb.total}B</span>`;
  logEl.prepend(row);
  while (logEl.children.length > 14) logEl.removeChild(logEl.lastChild);
}

function updateStats() {
  const mb = (bytesTotal / 1e6).toFixed(2);
  const avg = packetsSent ? bytesTotal / packetsSent : 244;
  const visualFps = speed / SPAWN_INTERVAL;
  const physFps = 1e9 / (avg * 8);           // 真实 1 Gbps 下单帧速率
  const accel = Math.round(physFps / visualFps);
  document.getElementById('stat-packets').textContent = packetsSent;
  document.getElementById('stat-bytes').textContent = mb + ' MB';
  document.getElementById('stat-fps').textContent = visualFps.toFixed(1) + ' 帧/秒';
  document.getElementById('stat-accel').textContent = '≈ 1:' + accel.toLocaleString();
}

// ---------------------------------------------------------------------------
// 控制条
// ---------------------------------------------------------------------------
const playBtn = document.getElementById('playBtn');
playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? '暂停' : '继续';
});
const speedEl = document.getElementById('speed');
const speedVal = document.getElementById('speedVal');
speedEl.addEventListener('input', () => {
  speed = parseFloat(speedEl.value);
  speedVal.textContent = speed.toFixed(1) + '×';
  updateStats();
});

// ---------------------------------------------------------------------------
// 主循环
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (playing) {
    spawnTimer -= dt * speed;
    if (spawnTimer <= 0) { spawnPacket(); spawnTimer = SPAWN_INTERVAL; }
    for (const p of packets) {
      p.x += VX * dt * speed;
      p.group.position.x = p.x;
      p.group.position.y = Math.sin(p.x * 0.12) * 0.12;
      p.group.rotation.y += dt * 2;
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      if (packets[i].x > HALF) { arrive(packets[i]); packets.splice(i, 1); }
    }
  }
  const t = clock.elapsedTime;
  pairs.forEach((tub, i) => { tub.material.opacity = 0.6 + 0.4 * Math.sin(t * 2 + i); });
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

// 初始提示
if (META.source) {
  document.getElementById('src-line').textContent = '数据源：' + META.source + ' · 拉取 ' + META.retrieved + ' · ' + META.count + ' 条实测记录';
}

// ---------------------------------------------------------------------------
// 自适应
// ---------------------------------------------------------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
