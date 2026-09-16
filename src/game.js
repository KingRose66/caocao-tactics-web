import { COLS, ROWS, TERRAIN, cloneChapter } from './data.js';

const MAP = { parts:15, len:44192, last:2192, w:1120, h:800, base:'assets/hd11v2/map-' };
const $ = s => document.querySelector(s);
const el = (tag, cls, html='') => { const n=document.createElement(tag); if(cls)n.className=cls; if(html)n.innerHTML=html; return n; };
const key=(x,y)=>`${x},${y}`;
const manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

const state = {
  ch: cloneChapter(),
  turn: 1,
  phase: 'ally',
  selected: null,
  mode: 'move',
  moveCells: new Map(),
  targetCells: new Set(),
  over: false,
  logs: [],
};

const ui = {};

async function loadMap(){
  const status=$('#mapStatus'), image=$('#mapImage');
  const texts=await Promise.all(Array.from({length:MAP.parts},async(_,i)=>{
    const r=await fetch(`${MAP.base}${i}.b64?v=12`,{cache:'no-store'});
    if(!r.ok) throw new Error(`地图分片 ${i} HTTP ${r.status}`);
    const t=(await r.text()).trim();
    const expected=i===MAP.parts-1?MAP.last:3000;
    if(t.length!==expected) throw new Error(`地图分片 ${i} 长度 ${t.length}/${expected}`);
    return t;
  }));
  const b64=texts.join('');
  if(b64.length!==MAP.len || !b64.startsWith('/9j/')) throw new Error('地图完整性校验失败');
  const raw=atob(b64), bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
  await new Promise((resolve,reject)=>{ image.onload=resolve; image.onerror=reject; image.src=url; });
  if(image.naturalWidth!==MAP.w||image.naturalHeight!==MAP.h) throw new Error('地图尺寸校验失败');
  status.textContent='地图 1120×800 已锁定 · 隐藏棋盘与兵将层已启用';
}

function setup(){
  ui.board=$('#battlefield'); ui.grid=$('#logicGrid'); ui.range=$('#rangeLayer'); ui.units=$('#unitLayer');
  ui.fx=$('#fxLayer'); ui.info=$('#unitInfo'); ui.terrain=$('#terrainInfo'); ui.log=$('#battleLog');
  ui.turn=$('#turnText'); ui.phase=$('#phaseText'); ui.goal=$('#goalText'); ui.score=$('#scoreText'); ui.command=$('#commandText');
  ui.attack=$('#btnAttack'); ui.skill=$('#btnSkill'); ui.wait=$('#btnWait'); ui.cancel=$('#btnCancel'); ui.end=$('#btnEnd');
  buildGrid(); bindCommands();
  const cao=state.ch.units.find(u=>u.id==='cao'); $('#dialogPortrait').innerHTML=spriteSVG(cao);
  addLog('战斗开始：击破张宝。曹操阵亡则失败。');
  render();
}

function buildGrid(){
  ui.grid.innerHTML='';
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    const b=el('button','logic-cell'); b.type='button'; b.dataset.x=x; b.dataset.y=y;
    b.setAttribute('aria-label',`${x+1},${y+1}`);
    b.addEventListener('mouseenter',()=>showTerrain(x,y));
    b.addEventListener('focus',()=>showTerrain(x,y));
    b.addEventListener('click',()=>handleCell(x,y));
    ui.grid.appendChild(b);
  }
}

function bindCommands(){
  ui.attack.onclick=()=>setMode('attack');
  ui.skill.onclick=()=>setMode('skill');
  ui.wait.onclick=()=>finishUnit('待机');
  ui.cancel.onclick=()=>cancelAction();
  ui.end.onclick=()=>{ if(state.phase==='ally'&&!state.over) enemyPhase(); };
  $('#btnRestart').onclick=restart;
}

function living(side){ return state.ch.units.filter(u=>u.side===side&&!u.dead); }
function unitAt(x,y){ return state.ch.units.find(u=>!u.dead&&u.x===x&&u.y===y); }
function selected(){ return state.ch.units.find(u=>u.id===state.selected&&!u.dead); }
function terrainAt(x,y){ return TERRAIN[state.ch.terrain[y]?.[x]||'p']; }
function inside(x,y){ return x>=0&&x<COLS&&y>=0&&y<ROWS; }

function showTerrain(x,y){
  const t=terrainAt(x,y), u=unitAt(x,y);
  ui.terrain.innerHTML=`<div class="panel-title">地形 <span>${t.name}</span></div><div class="terrain-body"><b>${t.name}</b><small>防御 +${t.def}% · 回避 +${t.evade}% · 移动 ${t.passable?t.cost:'不可通行'}</small>${u?`<em>${u.name} 位于此处</em>`:''}</div>`;
}

function movement(unit){
  const dist=new Map([[key(unit.x,unit.y),0]]), q=[{x:unit.x,y:unit.y}];
  while(q.length){
    const cur=q.shift(), d=dist.get(key(cur.x,cur.y));
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=cur.x+dx,y=cur.y+dy; if(!inside(x,y))continue;
      const terr=terrainAt(x,y); if(!terr.passable)continue;
      const occ=unitAt(x,y); if(occ&&occ.id!==unit.id)continue;
      const nd=d+terr.cost; if(nd>unit.mov)continue;
      const k=key(x,y); if(!dist.has(k)||nd<dist.get(k)){dist.set(k,nd);q.push({x,y});}
    }
  }
  return dist;
}

function targetSet(unit, minR=unit.minR, maxR=unit.maxR){
  const set=new Set();
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const d=Math.abs(x-unit.x)+Math.abs(y-unit.y); if(d>=minR&&d<=maxR)set.add(key(x,y));
  }
  return set;
}

function selectUnit(unit){
  if(state.over||state.phase!=='ally'||unit.side!=='ally'||unit.acted)return;
  state.selected=unit.id; state.mode='move'; state.moveCells=unit.moved?new Map([[key(unit.x,unit.y),0]]):movement(unit); state.targetCells.clear();
  render();
}

function handleCell(x,y){
  if(state.over||state.phase!=='ally')return;
  const hit=unitAt(x,y), u=selected();
  if(!u){ if(hit?.side==='ally')selectUnit(hit); return; }

  if(state.mode==='move'){
    if(hit?.side==='ally'){ selectUnit(hit); return; }
    const k=key(x,y); if(state.moveCells.has(k)&&!hit){
      u.x=x;u.y=y;u.moved=true;state.moveCells=new Map([[k,0]]); addLog(`${u.name} 移动。`); render(); return;
    }
  }
  if((state.mode==='attack'||state.mode==='skill')&&hit?.side==='enemy'&&state.targetCells.has(key(x,y))){
    resolveAttack(u,hit,state.mode==='skill'); return;
  }
}

function setMode(mode){
  const u=selected(); if(!u||u.acted||state.phase!=='ally')return;
  if(mode==='skill'){
    if(!u.skill){addLog(`${u.name} 没有可用技能。`);return;}
    if(u.skill.cd>0){addLog(`${u.skill.name} 还需 ${u.skill.cd} 回合冷却。`);return;}
    if(u.mp<u.skill.mp){addLog('MP不足。');return;}
    state.targetCells=targetSet(u,1,u.skill.range);
  } else state.targetCells=targetSet(u,u.minR,u.maxR);
  state.mode=mode; render();
}

function cancelAction(){
  const u=selected(); if(!u)return;
  state.mode='move'; state.targetCells.clear(); state.moveCells=u.moved?new Map([[key(u.x,u.y),0]]):movement(u); render();
}

function matchup(a,d){
  const table={cavalry:{infantry:1.15,archer:0.9,spear:0.82},infantry:{archer:1.12,spear:1.08},archer:{cavalry:1.18},spear:{cavalry:1.22}};
  return table[a.cls]?.[d.cls]||1;
}
function damage(a,d,power=1){
  const terr=terrainAt(d.x,d.y); const base=Math.max(6,a.atk*power*matchup(a,d)-d.def*.62);
  const reduced=base*(1-terr.def/100); return Math.max(5,Math.round(reduced*(.9+Math.random()*.2)));
}

function resolveAttack(a,d,isSkill){
  const sk=isSkill?a.skill:null; const dmg=damage(a,d,sk?.power||1); d.hp=Math.max(0,d.hp-dmg);
  if(sk){a.mp-=sk.mp;sk.cd=sk.cdMax; addLog(`${a.name} 施展「${sk.name}」，对 ${d.name} 造成 ${dmg} 点伤害。`);}
  else addLog(`${a.name} 攻击 ${d.name}，造成 ${dmg} 点伤害。`);
  fx(d.x,d.y,isSkill?'skill':'hit',dmg);
  if(d.hp<=0){d.dead=true; addLog(`${d.name} 被击破！`);}
  a.acted=true; state.selected=null; state.mode='move'; state.targetCells.clear(); state.moveCells.clear();
  checkEnd(); render();
  if(!state.over && living('ally').every(x=>x.acted)) setTimeout(enemyPhase,450);
}

function finishUnit(reason){
  const u=selected(); if(!u||u.acted)return; u.acted=true; addLog(`${u.name} ${reason}。`);
  state.selected=null;state.mode='move';state.targetCells.clear();state.moveCells.clear();render();
  if(living('ally').every(x=>x.acted)) setTimeout(enemyPhase,350);
}

async function enemyPhase(){
  if(state.phase!=='ally'||state.over)return; state.phase='enemy';state.selected=null;state.targetCells.clear();state.moveCells.clear();render();addLog('敌军阶段。');
  for(const e of living('enemy')){
    if(state.over)break; await sleep(260);
    const targets=living('ally'); if(!targets.length)break;
    let t=targets.sort((a,b)=>manhattan(e,a)-manhattan(e,b))[0];
    if(!inRange(e,t)) moveEnemy(e,t);
    t=living('ally').sort((a,b)=>manhattan(e,a)-manhattan(e,b))[0];
    if(t&&inRange(e,t)){
      const useSkill=e.skill&&e.skill.cd===0&&manhattan(e,t)<=e.skill.range;
      const dmg=damage(e,t,useSkill?e.skill.power:1);t.hp=Math.max(0,t.hp-dmg);
      if(useSkill){e.skill.cd=e.skill.cdMax;addLog(`${e.name} 施展「${e.skill.name}」，${t.name} 受到 ${dmg} 点伤害。`);} else addLog(`${e.name} 攻击 ${t.name}，造成 ${dmg} 点伤害。`);
      fx(t.x,t.y,useSkill?'skill':'hit',dmg); if(t.hp<=0){t.dead=true;addLog(`${t.name} 阵亡！`);} render();checkEnd();
    }
  }
  if(state.over)return;
  state.turn++; if(state.turn>state.ch.turnLimit){endBattle(false,'超过回合限制，曹军撤退。');return;}
  for(const u of state.ch.units.filter(u=>!u.dead)) if(u.skill&&u.skill.cd>0)u.skill.cd--;
  for(const a of living('ally')){a.acted=false;a.moved=false;const tr=terrainAt(a.x,a.y);if(tr.heal)a.hp=Math.min(a.maxHp,a.hp+tr.heal);}
  state.phase='ally'; addLog(`第 ${state.turn} 回合，我军阶段。`); render();
}

function inRange(a,b){const d=manhattan(a,b);return d>=a.minR&&d<=a.maxR;}
function moveEnemy(e,target){
  const dist=movement(e); let best={x:e.x,y:e.y,d:manhattan(e,target),cost:0};
  for(const [k,cost] of dist){ const [x,y]=k.split(',').map(Number); const d=Math.abs(x-target.x)+Math.abs(y-target.y); if(d<best.d||(d===best.d&&cost<best.cost)){best={x,y,d,cost};}}
  e.x=best.x;e.y=best.y; render();
}

function checkEnd(){
  const cao=state.ch.units.find(u=>u.id==='cao'); const boss=state.ch.units.find(u=>u.id==='zhangbao');
  if(cao.dead) endBattle(false,'曹操阵亡，战斗失败。');
  else if(boss.dead) endBattle(true,'张宝败退，颍川之战胜利！');
  else if(living('enemy').length===0) endBattle(true,'黄巾军溃散，颍川之战胜利！');
}
function endBattle(win,msg){state.over=true;state.phase='over';addLog(msg);render();$('#resultModal').classList.add('show');$('#resultTitle').textContent=win?'胜利':'失败';$('#resultText').textContent=msg;}
function restart(){state.ch=cloneChapter();state.turn=1;state.phase='ally';state.selected=null;state.mode='move';state.moveCells.clear();state.targetCells.clear();state.over=false;state.logs=[];$('#resultModal').classList.remove('show');addLog('战斗重新开始。');render();}

function fx(x,y,type,num){
  const d=el('div',`fx ${type}`,`-${num}`);d.style.left=`${(x+.5)/COLS*100}%`;d.style.top=`${(y+.42)/ROWS*100}%`;ui.fx.appendChild(d);setTimeout(()=>d.remove(),700);
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function addLog(s){state.logs.unshift(s);state.logs=state.logs.slice(0,8);if(ui.log)ui.log.innerHTML=state.logs.map(x=>`<li>${x}</li>`).join('');}

function spriteSVG(u){
  const ally=u.side==='ally', main=ally?'#1763a5':'#8c2d22', trim=ally?'#e4c568':'#e5c06a', skin='#d4a36d', dark='#1a1714';
  const weapon=u.cls==='archer'?'<path d="M35 18q10 10 0 22" fill="none" stroke="#d7c79e" stroke-width="2"/><path d="M34 18v22" stroke="#d7c79e"/>':u.cls==='spear'?'<path d="M36 8v39" stroke="#d8d0b5" stroke-width="2"/><path d="m36 5-4 7h8z" fill="#e8e2d1"/>':'<path d="M35 20v25" stroke="#ddd4bd" stroke-width="2"/><path d="m35 18-3 6h6z" fill="#eee"/>';
  const horse=u.cls==='cavalry'?'<ellipse cx="22" cy="43" rx="15" ry="7" fill="#513923"/><path d="M10 43v10M18 46v9M29 46v9M35 42v11" stroke="#2b2117" stroke-width="3"/><path d="M31 38l6-9 5 3-3 11" fill="#5e4327"/>':'';
  const robe=u.cls==='boss'?'#6d2d72':main;
  return `<svg viewBox="0 0 44 58" aria-hidden="true">${horse}<ellipse cx="22" cy="54" rx="15" ry="3" fill="#000" opacity=".45"/><path d="M12 23h20l4 24H8z" fill="${robe}" stroke="${dark}" stroke-width="2"/><path d="M14 27h16v14H14z" fill="${main}" opacity=".88"/><path d="M16 23V13h12v10" fill="${skin}" stroke="${dark}" stroke-width="2"/><path d="M14 14h16l-3-7H17z" fill="${dark}"/><path d="M18 9h8l-4-6z" fill="${trim}"/><circle cx="19" cy="17" r="1"/><circle cx="25" cy="17" r="1"/>${weapon}<path d="M9 27l-5 13M35 28l5 12" stroke="${skin}" stroke-width="3" stroke-linecap="round"/><path d="M13 47l-2 8M30 47l2 8" stroke="${dark}" stroke-width="4" stroke-linecap="round"/></svg>`;
}

function renderUnits(){
  ui.units.innerHTML='';
  for(const u of state.ch.units.filter(u=>!u.dead)){
    const n=el('button',`unit ${u.side} ${u.cls}${u.id===state.selected?' selected':''}${u.acted?' acted':''}`);n.type='button';n.style.left=`${(u.x+.5)/COLS*100}%`;n.style.top=`${(u.y+.55)/ROWS*100}%`;n.dataset.id=u.id;
    n.innerHTML=`<span class="unit-sprite">${spriteSVG(u)}</span><span class="unit-name">${u.name}</span><span class="hpbar"><i style="width:${u.hp/u.maxHp*100}%"></i></span>`;
    n.onclick=e=>{e.stopPropagation();if(u.side==='ally')selectUnit(u);else if(selected()&&(state.mode==='attack'||state.mode==='skill')&&state.targetCells.has(key(u.x,u.y)))resolveAttack(selected(),u,state.mode==='skill');else showUnit(u);};
    ui.units.appendChild(n);
  }
}

function renderRange(){
  ui.range.innerHTML=''; let set=state.mode==='move'?new Set(state.moveCells.keys()):state.targetCells;
  if(!state.selected)set=new Set();
  for(const k of set){const [x,y]=k.split(',').map(Number);const d=el('div',`range-cell ${state.mode}`);d.style.left=`${x/COLS*100}%`;d.style.top=`${y/ROWS*100}%`;d.style.width=`${100/COLS}%`;d.style.height=`${100/ROWS}%`;ui.range.appendChild(d);}
}

function showUnit(u){
  const sk=u.skill?`<div class="skill-line"><b>${u.skill.name}</b> MP ${u.skill.mp} · 冷却 ${u.skill.cd}/${u.skill.cdMax}</div>`:'';
  ui.info.innerHTML=`<div class="panel-title">武将 <span>${u.side==='ally'?'我军':'敌军'}</span></div><div class="unit-card"><div class="portrait">${spriteSVG(u)}</div><div><h3>${u.name}</h3><p>${className(u.cls)} · HP ${u.hp}/${u.maxHp}</p><div class="meter"><i style="width:${u.hp/u.maxHp*100}%"></i></div>${u.maxMp?`<p>MP ${u.mp}/${u.maxMp}</p>`:''}</div></div><div class="stats"><span>攻击 ${u.atk}</span><span>防御 ${u.def}</span><span>移动 ${u.mov}</span><span>射程 ${u.minR}–${u.maxR}</span></div>${sk}`;
}
function className(c){return {lord:'群雄',cavalry:'骑兵',archer:'弓骑',infantry:'步兵',spear:'枪兵',boss:'妖术师'}[c]||c;}

function render(){
  ui.turn.textContent=`第 ${state.turn} 回合`;ui.phase.textContent=state.phase==='ally'?'我军阶段':state.phase==='enemy'?'敌军阶段':'战斗结束';ui.goal.textContent=state.ch.objective;ui.score.textContent=`${living('ally').length} : ${living('enemy').length}`;
  renderRange();renderUnits();
  const u=selected(); if(u)showUnit(u); else if(state.phase==='ally')ui.info.innerHTML='<div class="panel-title">武将 <span>未选择</span></div><div class="empty-info">点击我军武将查看信息并行动。</div>';
  const enabled=!!u&&state.phase==='ally'&&!u.acted;
  ui.attack.disabled=!enabled;ui.skill.disabled=!enabled||!u?.skill;ui.wait.disabled=!enabled;ui.cancel.disabled=!enabled;ui.end.disabled=state.phase!=='ally'||state.over;
  ui.command.textContent=state.over?'战斗结束。':!u?'选择我军武将开始行动。':state.mode==='move'?'蓝色区域可移动；也可直接选择攻击或技能。':state.mode==='attack'?'选择红色范围内的敌军。':'选择紫色范围内的敌军施放技能。';
}

(async()=>{
  try{await loadMap();setup();}catch(err){console.error(err);$('#mapStatus').textContent=`地图加载失败：${err.message}`;}
})();
