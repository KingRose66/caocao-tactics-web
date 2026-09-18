import { COLS, ROWS, TERRAIN, cloneChapter } from './data.js';

const MAP={parts:15,len:44192,last:2192,w:1120,h:800,base:'assets/hd11v2/map-'};
const $=s=>document.querySelector(s);
const el=(tag,cls,html='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(html)n.innerHTML=html;return n;};
const key=(x,y)=>`${x},${y}`;
const manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const state={ch:cloneChapter(),turn:1,phase:'ally',selected:null,mode:'move',moveCells:new Map(),targetCells:new Set(),over:false,logs:[],animating:false};
const ui={};

async function loadMap(){
  const status=$('#mapStatus'),image=$('#mapImage');
  const texts=await Promise.all(Array.from({length:MAP.parts},async(_,i)=>{
    const r=await fetch(`${MAP.base}${i}.b64?v=16`,{cache:'no-store'});if(!r.ok)throw new Error(`地图分片 ${i} HTTP ${r.status}`);
    const t=(await r.text()).trim(),expected=i===MAP.parts-1?MAP.last:3000;if(t.length!==expected)throw new Error(`地图分片 ${i} 长度 ${t.length}/${expected}`);return t;
  }));
  const b64=texts.join('');if(b64.length!==MAP.len||!b64.startsWith('/9j/'))throw new Error('地图完整性校验失败');
  const raw=atob(b64),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});
  if(image.naturalWidth!==MAP.w||image.naturalHeight!==MAP.h)throw new Error('地图尺寸校验失败');
  status.textContent='地图 1120×800 · 28×20 逻辑地形已校准 · BATTLE BUILD 16';
}

function setup(){
  ui.board=$('#battlefield');ui.grid=$('#logicGrid');ui.range=$('#rangeLayer');ui.units=$('#unitLayer');ui.fx=$('#fxLayer');ui.info=$('#unitInfo');ui.terrain=$('#terrainInfo');ui.log=$('#battleLog');
  ui.turn=$('#turnText');ui.phase=$('#phaseText');ui.goal=$('#goalText');ui.score=$('#scoreText');ui.command=$('#commandText');ui.attack=$('#btnAttack');ui.skill=$('#btnSkill');ui.wait=$('#btnWait');ui.cancel=$('#btnCancel');ui.end=$('#btnEnd');
  buildGrid();bindCommands();const cao=state.ch.units.find(u=>u.id==='cao');$('#dialogPortrait').innerHTML=spriteSVG(cao);addLog('战斗开始：先夺桥头，再突破东岸纵深。');render();
}

function buildGrid(){
  ui.grid.innerHTML='';ui.grid.style.gridTemplateColumns=`repeat(${COLS},1fr)`;ui.grid.style.gridTemplateRows=`repeat(${ROWS},1fr)`;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const b=el('button','logic-cell');b.type='button';b.dataset.x=x;b.dataset.y=y;b.setAttribute('aria-label',`${x+1},${y+1}`);
    b.addEventListener('mouseenter',()=>showTerrain(x,y));b.addEventListener('focus',()=>showTerrain(x,y));b.addEventListener('click',()=>handleCell(x,y));ui.grid.appendChild(b);
  }
}
function bindCommands(){ui.attack.onclick=()=>setMode('attack');ui.skill.onclick=()=>setMode('skill');ui.wait.onclick=()=>finishUnit('待机');ui.cancel.onclick=cancelAction;ui.end.onclick=()=>{if(state.phase==='ally'&&!state.over&&!state.animating)enemyPhase();};$('#btnRestart').onclick=restart;}
function living(side){return state.ch.units.filter(u=>u.side===side&&!u.dead);}
function unitAt(x,y){return state.ch.units.find(u=>!u.dead&&u.x===x&&u.y===y);}
function selected(){return state.ch.units.find(u=>u.id===state.selected&&!u.dead);}
function terrainAt(x,y){return TERRAIN[state.ch.terrain[y]?.[x]||'p'];}
function inside(x,y){return x>=0&&x<COLS&&y>=0&&y<ROWS;}
function showTerrain(x,y){const t=terrainAt(x,y),u=unitAt(x,y);ui.terrain.innerHTML=`<div class="panel-title">地形 <span>${t.name}</span></div><div class="terrain-body"><b>${t.name}</b><small>防御 +${t.def}% · 回避 +${t.evade}% · 移动 ${t.passable?t.cost:'不可通行'}</small>${u?`<em>${u.name} 位于此处</em>`:''}</div>`;}

function movement(unit){
  const dist=new Map([[key(unit.x,unit.y),0]]),q=[{x:unit.x,y:unit.y}];
  while(q.length){const cur=q.shift(),d=dist.get(key(cur.x,cur.y));for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=cur.x+dx,y=cur.y+dy;if(!inside(x,y))continue;const terr=terrainAt(x,y);if(!terr.passable)continue;const occ=unitAt(x,y);if(occ&&occ.id!==unit.id)continue;const nd=d+terr.cost;if(nd>unit.mov)continue;const k=key(x,y);if(!dist.has(k)||nd<dist.get(k)){dist.set(k,nd);q.push({x,y});}}}
  return dist;
}
function targetSet(unit,minR=unit.minR,maxR=unit.maxR){const set=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const d=Math.abs(x-unit.x)+Math.abs(y-unit.y);if(d>=minR&&d<=maxR)set.add(key(x,y));}return set;}
function selectUnit(unit){if(state.over||state.animating||state.phase!=='ally'||unit.side!=='ally'||unit.acted)return;state.selected=unit.id;state.mode='move';state.moveCells=unit.moved?new Map([[key(unit.x,unit.y),0]]):movement(unit);state.targetCells.clear();render();}
function handleCell(x,y){
  if(state.over||state.animating||state.phase!=='ally')return;const hit=unitAt(x,y),u=selected();if(!u){if(hit?.side==='ally')selectUnit(hit);return;}
  if(state.mode==='move'){if(hit?.side==='ally'){selectUnit(hit);return;}const k=key(x,y);if(state.moveCells.has(k)&&!hit){u.x=x;u.y=y;u.moved=true;state.moveCells=new Map([[k,0]]);addLog(`${u.name} 移动。`);render();return;}}
  if((state.mode==='attack'||state.mode==='skill')&&hit?.side==='enemy'&&state.targetCells.has(key(x,y)))resolveAttack(u,hit,state.mode==='skill');
}
function setMode(mode){const u=selected();if(!u||u.acted||state.animating||state.phase!=='ally')return;if(mode==='skill'){if(!u.skill){addLog(`${u.name} 没有可用技能。`);return;}if(u.skill.cd>0){addLog(`${u.skill.name} 还需 ${u.skill.cd} 回合冷却。`);return;}if(u.mp<u.skill.mp){addLog('MP不足。');return;}state.targetCells=targetSet(u,1,u.skill.range);}else state.targetCells=targetSet(u,u.minR,u.maxR);state.mode=mode;render();}
function cancelAction(){const u=selected();if(!u||state.animating)return;state.mode='move';state.targetCells.clear();state.moveCells=u.moved?new Map([[key(u.x,u.y),0]]):movement(u);render();}
function matchup(a,d){const table={cavalry:{infantry:1.15,archer:1.16,spear:.82},infantry:{archer:1.12,spear:1.08},archer:{cavalry:.88,infantry:1.04},spear:{cavalry:1.25}};return table[a.cls]?.[d.cls]||1;}
function damage(a,d,power=1){const terr=terrainAt(d.x,d.y),base=Math.max(6,a.atk*power*matchup(a,d)-d.def*.62),reduced=base*(1-terr.def/100);return Math.max(5,Math.round(reduced*(.9+Math.random()*.2)));}

async function resolveAttack(a,d,isSkill){
  if(state.animating)return;state.animating=true;const sk=isSkill?a.skill:null;attackFx(a,d,isSkill);await sleep(isSkill?300:220);const dmg=damage(a,d,sk?.power||1);d.hp=Math.max(0,d.hp-dmg);
  if(sk){a.mp-=sk.mp;sk.cd=sk.cdMax;addLog(`${a.name} 施展「${sk.name}」，对 ${d.name} 造成 ${dmg} 点伤害。`);}else addLog(`${a.name} 攻击 ${d.name}，造成 ${dmg} 点伤害。`);
  fx(d.x,d.y,isSkill?'skill':'hit',dmg);if(d.hp<=0){d.dead=true;addLog(`${d.name} 被击破！`);}a.acted=true;state.selected=null;state.mode='move';state.targetCells.clear();state.moveCells.clear();state.animating=false;checkEnd();render();if(!state.over&&living('ally').every(x=>x.acted))setTimeout(enemyPhase,450);
}
function finishUnit(reason){const u=selected();if(!u||u.acted||state.animating)return;u.acted=true;addLog(`${u.name} ${reason}。`);state.selected=null;state.mode='move';state.targetCells.clear();state.moveCells.clear();render();if(living('ally').every(x=>x.acted))setTimeout(enemyPhase,350);}

function shouldWake(e,targets){const ai=e.ai;if(!ai)return true;if(state.turn>=(ai.wakeTurn||99))return true;const nearest=Math.min(...targets.map(t=>manhattan(e,t)));if(nearest<=(ai.wakeDist||0))return true;if(ai.role==='boss'&&living('enemy').length<=3)return true;return false;}
function chooseTarget(e,targets){return[...targets].sort((a,b)=>{const da=manhattan(e,a),db=manhattan(e,b);let sa=da*10,sb=db*10;if(e.ai?.role==='reserve'){if(a.cls==='archer')sa-=16;if(b.cls==='archer')sb-=16;}if(e.ai?.role==='ranged'){sa+=a.hp/a.maxHp*4;sb+=b.hp/b.maxHp*4;}if(a.id==='cao')sa-=2;if(b.id==='cao')sb-=2;return sa-sb;})[0];}
function cellThreat(x,y,targets){let n=0;for(const t of targets){const d=Math.abs(x-t.x)+Math.abs(y-t.y);if(d>=t.minR&&d<=t.maxR)n++;}return n;}
function moveEnemy(e,target){
  const dist=movement(e),ai=e.ai,choices=[];
  for(const[k,cost]of dist){const[x,y]=k.split(',').map(Number);if(x===e.x&&y===e.y)continue;const d=Math.abs(x-target.x)+Math.abs(y-target.y);let score=d*10+cost;if(ai?.role==='ranged'){const ideal=Math.max(e.minR,Math.min(e.maxR,5));score=Math.abs(d-ideal)*14+cost;if(d<e.minR)score+=40;}if(ai?.role==='reserve'&&target.cls==='archer')score-=10;if(ai?.anchorX!=null){const anchor=Math.abs(x-ai.anchorX)+Math.abs(y-ai.anchorY);if(anchor>(ai.leash||99))score+=55+(anchor-(ai.leash||99))*12;}const terr=terrainAt(x,y);score-=terr.def*.18;score+=cellThreat(x,y,living('ally'))*2.5;choices.push({x,y,score});}
  choices.sort((a,b)=>a.score-b.score);if(choices[0]){e.x=choices[0].x;e.y=choices[0].y;render();}
}
async function enemyPhase(){
  if(state.phase!=='ally'||state.over||state.animating)return;state.phase='enemy';state.selected=null;state.targetCells.clear();state.moveCells.clear();render();addLog('敌军阶段。');
  for(const e of living('enemy')){if(state.over)break;await sleep(230);let targets=living('ally');if(!targets.length)break;if(!shouldWake(e,targets)){addLog(`${e.name} 坚守阵位。`);continue;}let t=chooseTarget(e,targets);if(!inRange(e,t))moveEnemy(e,t);targets=living('ally');t=chooseTarget(e,targets);if(t&&inRange(e,t)){const useSkill=e.skill&&e.skill.cd===0&&manhattan(e,t)<=e.skill.range;state.animating=true;attackFx(e,t,useSkill);await sleep(useSkill?280:190);const dmg=damage(e,t,useSkill?e.skill.power:1);t.hp=Math.max(0,t.hp-dmg);if(useSkill){e.skill.cd=e.skill.cdMax;addLog(`${e.name} 施展「${e.skill.name}」，${t.name} 受到 ${dmg} 点伤害。`);}else addLog(`${e.name} 攻击 ${t.name}，造成 ${dmg} 点伤害。`);fx(t.x,t.y,useSkill?'skill':'hit',dmg);if(t.hp<=0){t.dead=true;addLog(`${t.name} 阵亡！`);}state.animating=false;render();checkEnd();}}
  if(state.over)return;state.turn++;if(state.turn>state.ch.turnLimit){endBattle(false,'超过回合限制，曹军撤退。');return;}for(const u of state.ch.units.filter(u=>!u.dead))if(u.skill&&u.skill.cd>0)u.skill.cd--;for(const a of living('ally')){a.acted=false;a.moved=false;const tr=terrainAt(a.x,a.y);if(tr.heal)a.hp=Math.min(a.maxHp,a.hp+tr.heal);}state.phase='ally';addLog(`第 ${state.turn} 回合，我军阶段。`);render();
}
function inRange(a,b){const d=manhattan(a,b);return d>=a.minR&&d<=a.maxR;}
function checkEnd(){const cao=state.ch.units.find(u=>u.id==='cao'),boss=state.ch.units.find(u=>u.id==='zhangbao');if(cao.dead)endBattle(false,'曹操阵亡，战斗失败。');else if(boss.dead)endBattle(true,'张宝败退，颍川之战胜利！');else if(living('enemy').length===0)endBattle(true,'黄巾军溃散，颍川之战胜利！');}
function endBattle(win,msg){state.over=true;state.phase='over';state.animating=false;addLog(msg);render();$('#resultModal').classList.add('show');$('#resultTitle').textContent=win?'胜利':'失败';$('#resultText').textContent=msg;}
function restart(){state.ch=cloneChapter();state.turn=1;state.phase='ally';state.selected=null;state.mode='move';state.moveCells.clear();state.targetCells.clear();state.over=false;state.animating=false;state.logs=[];$('#resultModal').classList.remove('show');addLog('战斗重新开始。');render();}

function attackFx(a,d,isSkill){const node=el('div',`attack-fx ${isSkill?'spell':a.cls==='archer'?'arrow':'slash'}`),x1=(a.x+.5)/COLS*100,y1=(a.y+.5)/ROWS*100,x2=(d.x+.5)/COLS*100,y2=(d.y+.5)/ROWS*100;node.style.left=`${x1}%`;node.style.top=`${y1}%`;const rect=ui.board.getBoundingClientRect();node.style.setProperty('--tx',`${(x2-x1)/100*rect.width}px`);node.style.setProperty('--ty',`${(y2-y1)/100*rect.height}px`);ui.fx.appendChild(node);setTimeout(()=>node.remove(),520);}
function fx(x,y,type,num){const d=el('div',`fx ${type}`,`-${num}`);d.style.left=`${(x+.5)/COLS*100}%`;d.style.top=`${(y+.42)/ROWS*100}%`;ui.fx.appendChild(d);setTimeout(()=>d.remove(),700);}
function addLog(s){state.logs.unshift(s);state.logs=state.logs.slice(0,8);if(ui.log)ui.log.innerHTML=state.logs.map(x=>`<li>${x}</li>`).join('');}

// BUILD 16：真正按老式 SRPG 像素棋子重做。所有主轮廓都落在整数像素网格上，
// 不再用圆润曲线画“缩小版插画”。地图层只保留一个小棋子和阵营底条。
function spriteSVG(u){
  const ally=u.side==='ally';
  const blue='#2d67a5',blueDark='#153b67',red='#a84034',redDark='#64241f';
  const main=ally?blue:red,dark=ally?blueDark:redDark,side=ally?'#3b83d5':'#dd4c3f';
  const gold='#d0a94f',skin='#c8905b',ink='#171311',steel='#ded8c8',wood='#76502b',leather='#4c3322';
  const R=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const P=(pts,fill,extra='')=>`<polygon points="${pts}" fill="${fill}" ${extra}/>`;
  const L=(pts,stroke,width=2,extra='')=>`<polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
  const out=[];
  out.push(R(15,54,34,3,'#000','opacity=".35"'),R(18,52,28,3,side));
  if(u.cls==='cavalry'){
    out.push(R(8,37,34,11,'#60412a'),R(13,34,24,7,'#6f4b2e'),R(39,31,9,14,'#60412a'),P('43,30 48,25 50,31','#4b3120'),R(11,47,4,8,leather),R(22,47,4,8,leather),R(34,47,4,8,leather),R(43,43,4,11,leather),R(10,34,5,3,'#2a1d16'),R(18,35,20,2,gold));
    out.push(R(22,18,13,15,main),R(24,20,9,9,dark),R(18,22,5,10,main),R(34,21,5,10,main),R(24,12,9,7,skin),R(23,8,11,5,ink),R(25,6,7,3,gold),R(26,14,2,2,ink),R(31,14,2,2,ink),R(25,31,4,7,leather),R(32,31,4,7,leather));
    out.push(R(28,2,2,6,ally?'#b8352f':'#81251f'),R(27,1,4,2,ally?'#c94a3d':'#9a3027'));
    out.push(R(49,10,2,35,wood),P('46,10 50,3 54,10',steel));
  }else{
    const boss=u.cls==='boss',robe=boss?'#66346f':main,robeDark=boss?'#3f2147':dark;
    out.push(R(23,43,5,10,leather),R(34,43,5,10,leather),R(20,24,22,20,robe),R(23,27,16,13,robeDark),R(16,27,5,12,robe),R(42,27,5,12,robe),R(26,16,11,9,skin),R(25,11,13,6,ink),R(27,9,9,3,boss?'#8b4b8f':gold),R(28,19,2,2,ink),R(34,19,2,2,ink));
    out.push(R(25,29,12,3,main),R(29,33,4,6,gold),R(23,41,17,3,dark));
    if(u.id==='cao'){
      out.push(R(23,10,17,3,'#202126'),R(27,6,9,4,'#202126'),R(31,1,2,6,'#bd382f'),R(33,2,3,2,'#d14a3e'),P('18,25 12,31 16,44 21,39',blueDark),R(46,18,2,28,steel),P('43,18 47,11 51,18',steel),R(43,29,8,2,gold));
    }else if(boss){
      out.push(R(25,8,13,4,'#4b2552'),R(28,4,7,4,'#6e3877'),R(49,13,2,36,wood),R(46,8,8,8,'#c77735'),R(48,10,4,4,'#ffe39c'));
    }else if(u.cls==='archer'){
      out.push(L('47,19 52,23 54,29 52,35 47,39','#c89b50',2,'stroke-linejoin="miter"'),L('47,19 48,39','#eadfc7',1),R(17,25,2,20,wood),R(14,26,2,18,wood),R(39,29,13,2,wood),P('52,27 57,30 52,33',steel));
    }else if(u.cls==='spear'){
      out.push(R(49,11,2,38,wood),P('46,11 50,3 54,11',steel));
    }else if(u.cls==='infantry'){
      out.push(P('12,28 18,24 21,29 20,40 15,44 11,39','#705139'),R(46,18,2,28,steel),P('43,18 47,11 51,18',steel));
    }else{
      out.push(R(46,18,2,28,steel),P('43,18 47,11 51,18',steel));
    }
  }
  return `<svg viewBox="0 0 64 58" shape-rendering="crispEdges" aria-hidden="true">${out.join('')}</svg>`;
}

function renderUnits(){
  ui.units.innerHTML='';
  for(const u of state.ch.units.filter(u=>!u.dead)){
    const n=el('button',`unit ${u.side} ${u.cls}${u.id===state.selected?' selected':''}${u.acted?' acted':''}`);n.type='button';n.style.left=`${(u.x+.5)/COLS*100}%`;n.style.top=`${(u.y+.6)/ROWS*100}%`;n.dataset.id=u.id;
    n.innerHTML=`<span class="unit-sprite">${spriteSVG(u)}</span><span class="unit-name">${u.name}</span><span class="hpbar"><i style="width:${u.hp/u.maxHp*100}%"></i></span>`;
    n.onclick=e=>{e.stopPropagation();if(u.side==='ally')selectUnit(u);else if(selected()&&(state.mode==='attack'||state.mode==='skill')&&state.targetCells.has(key(u.x,u.y)))resolveAttack(selected(),u,state.mode==='skill');else showUnit(u);};ui.units.appendChild(n);
  }
}
function renderRange(){ui.range.innerHTML='';let set=state.mode==='move'?new Set(state.moveCells.keys()):state.targetCells;if(!state.selected)set=new Set();for(const k of set){const[x,y]=k.split(',').map(Number),d=el('div',`range-cell ${state.mode}`);d.style.left=`${x/COLS*100}%`;d.style.top=`${y/ROWS*100}%`;d.style.width=`${100/COLS}%`;d.style.height=`${100/ROWS}%`;ui.range.appendChild(d);}}
function showUnit(u){const sk=u.skill?`<div class="skill-line"><b>${u.skill.name}</b> MP ${u.skill.mp} · 冷却 ${u.skill.cd}/${u.skill.cdMax}</div>`:'';ui.info.innerHTML=`<div class="panel-title">武将 <span>${u.side==='ally'?'我军':'敌军'}</span></div><div class="unit-card"><div class="portrait">${spriteSVG(u)}</div><div><h3>${u.name}</h3><p>${className(u.cls)} · HP ${u.hp}/${u.maxHp}</p><div class="meter"><i style="width:${u.hp/u.maxHp*100}%"></i></div>${u.maxMp?`<p>MP ${u.mp}/${u.maxMp}</p>`:''}</div></div><div class="stats"><span>攻击 ${u.atk}</span><span>防御 ${u.def}</span><span>移动 ${u.mov}</span><span>射程 ${u.minR}–${u.maxR}</span></div>${sk}`;}
function className(c){return{lord:'群雄',cavalry:'骑兵',archer:'弓兵',infantry:'步兵',spear:'枪兵',boss:'妖术师'}[c]||c;}
function render(){ui.turn.textContent=`第 ${state.turn} 回合`;ui.phase.textContent=state.phase==='ally'?'我军阶段':state.phase==='enemy'?'敌军阶段':'战斗结束';ui.goal.textContent=state.ch.objective;ui.score.textContent=`${living('ally').length} : ${living('enemy').length}`;renderRange();renderUnits();const u=selected();if(u)showUnit(u);else if(state.phase==='ally')ui.info.innerHTML='<div class="panel-title">武将 <span>未选择</span></div><div class="empty-info">点击我军武将查看信息并行动。</div>';const enabled=!!u&&state.phase==='ally'&&!u.acted&&!state.animating;ui.attack.disabled=!enabled;ui.skill.disabled=!enabled||!u?.skill;ui.wait.disabled=!enabled;ui.cancel.disabled=!enabled;ui.end.disabled=state.phase!=='ally'||state.over||state.animating;ui.command.textContent=state.over?'战斗结束。':state.animating?'战斗演出中……':!u?'选择我军武将开始行动。':state.mode==='move'?'蓝色区域可移动；树林减速，山岩与河流不可通行。':state.mode==='attack'?'选择红色范围内的敌军。':'选择紫色范围内的敌军施放技能。';}

(async()=>{try{await loadMap();setup();}catch(err){console.error(err);$('#mapStatus').textContent=`地图加载失败：${err.message}`;}})();
