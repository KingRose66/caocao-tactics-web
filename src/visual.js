const $=s=>document.querySelector(s);
const NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e}
function palette(cls){if(cls.includes('enemy'))return null;return null}
function mountSprite(el){if(!el||el.dataset.v4==='1')return;el.dataset.v4='1';const cls=[...el.classList].find(c=>c!=='sprite')||'inf';const svg=svgEl('svg',{viewBox:'0 0 64 86','aria-hidden':'true'});const g=svgEl('g');svg.append(g);
 const shadow=svgEl('ellipse',{cx:32,cy:80,rx:18,ry:5,fill:'rgba(0,0,0,.26)'});g.append(shadow);
 const colors={cao:['#2d4f7b','#6f90b5','#cda173','#3a3940','#802e29'],dun:['#405d72','#87979a','#cda173','#41444b','#7b2924'],yuan:['#405e71','#7896a9','#cda173','#44464c','#345f36'],ren:['#48515b','#89939a','#cda173','#41434a','#652722'],xun:['#66547f','#9b86b4','#d3ad86','#554b65','#49375f'],hua:['#703838','#b6574b','#ca966d','#4b3d37','#682219'],lubu:['#573365','#8f68aa','#cb9871','#463647','#9b2d28'],yanliang:['#735f29','#b89a4d','#cb9871','#53482c','#77631e'],archer:['#694333','#9b704d','#c79770','#51453d','#405f32'],spear:['#694333','#98704d','#c79770','#51453d','#68491f'],inf:['#694333','#98704d','#c79770','#51453d','#68491f'],zhangbao:['#62416f','#9269a4','#c99a73','#63562f','#7a4b20']}[cls]||['#694333','#98704d','#c79770','#51453d','#68491f'];
 const cape=svgEl('path',{d:'M19 35 Q32 28 45 35 L51 69 Q32 77 13 69 Z',fill:colors[4]});g.append(cape);
 const body=svgEl('path',{d:'M21 31 Q32 26 43 31 L47 65 Q32 72 17 65 Z',fill:colors[0],stroke:'#1d2529','stroke-width':'2'});g.append(body);
 const armor=svgEl('path',{d:'M23 36 L41 36 L44 58 L20 58 Z',fill:colors[1],opacity:'.92'});g.append(armor);
 const head=svgEl('circle',{cx:32,cy:24,r:9,fill:colors[2],stroke:'#3f2c23','stroke-width':'2'});g.append(head);
 const helm=svgEl('path',{d:'M21 22 Q23 10 32 9 Q42 10 44 22 L39 21 Q32 17 25 21 Z',fill:colors[3],stroke:'#202226','stroke-width':'2'});g.append(helm);
 if(cls==='cao'){g.append(svgEl('path',{d:'M31 9 L32 0 L34 9',stroke:'#dbc36e','stroke-width':'3','stroke-linecap':'round'}))}
 if(cls==='lubu'){g.append(svgEl('path',{d:'M25 10 L21 0 M39 10 L43 0',stroke:'#c9332f','stroke-width':'4','stroke-linecap':'round'}))}
 if(cls==='dun'||cls==='hua'||cls==='yanliang'){g.append(svgEl('path',{d:'M32 10 L32 2',stroke:'#c64a37','stroke-width':'3','stroke-linecap':'round'}))}
 if(cls==='yuan'||cls==='archer'){
  g.append(svgEl('path',{d:'M45 28 Q57 43 45 59',fill:'none',stroke:'#7a512c','stroke-width':'3'}));
  g.append(svgEl('line',{x1:45,y1:28,x2:45,y2:59,stroke:'#e5d2aa','stroke-width':'1'}));
  g.append(svgEl('line',{x1:39,y1:44,x2:56,y2:38,stroke:'#d9c49f','stroke-width':'2'}));
 }else if(cls==='xun'||cls==='zhangbao'){
  g.append(svgEl('line',{x1:47,y1:27,x2:48,y2:68,stroke:'#71502e','stroke-width':'3'}));g.append(svgEl('circle',{cx:48,cy:25,r:5,fill:'#d7b775'}));
 }else{
  g.append(svgEl('line',{x1:47,y1:16,x2:50,y2:70,stroke:'#6e4d2f','stroke-width':'4'}));
  g.append(svgEl('path',{d:'M44 16 L49 5 L54 16 Z',fill:'#e6dfc4',stroke:'#756e61','stroke-width':'1'}));
 }
 if(cls==='ren'){g.append(svgEl('circle',{cx:18,cy:48,r:10,fill:'#65717a',stroke:'#252b30','stroke-width':'2'}));g.append(svgEl('circle',{cx:18,cy:48,r:4,fill:'#9d855d'}))}
 el.innerHTML='';el.append(svg)
}
function ensureCanvas(){const frame=document.querySelector('.frame');const field=$('#field');if(!frame||!field)return null;let c=$('#terrainCanvas');if(!c){c=document.createElement('canvas');c.id='terrainCanvas';frame.prepend(c)}const r=field.getBoundingClientRect();const dpr=Math.max(1,window.devicePixelRatio||1);c.style.width=field.scrollWidth+'px';c.style.height=field.scrollHeight+'px';c.width=Math.round(field.scrollWidth*dpr);c.height=Math.round(field.scrollHeight*dpr);const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {c,ctx,w:field.scrollWidth,h:field.scrollHeight}}
function noise(ctx,x,y,w,h,seed){for(let i=0;i<8;i++){const px=x+((i*17+seed*11)%100)/100*w,py=y+((i*29+seed*7)%100)/100*h,r=1+((i+seed)%3);ctx.fillStyle=i%2?'rgba(255,255,210,.08)':'rgba(45,71,32,.10)';ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill()}}
function draw(){const field=$('#field');const data=ensureCanvas();if(!field||!data)return;const {ctx,w,h}=data;ctx.clearRect(0,0,w,h);const cw=w/14,ch=h/10;const tiles=[...field.children];
 for(let y=0;y<10;y++)for(let x=0;x<14;x++){const t=tiles[y*14+x];if(!t)continue;const X=x*cw,Y=y*ch;let g=ctx.createLinearGradient(X,Y,X,Y+ch);if(t.classList.contains('river')){g.addColorStop(0,'#4c92a4');g.addColorStop(1,'#2d7183')}else if(t.classList.contains('hill')){g.addColorStop(0,'#a99167');g.addColorStop(1,'#766045')}else{g.addColorStop(0,'#789650');g.addColorStop(1,'#5e7e43')}ctx.fillStyle=g;ctx.fillRect(X,Y,cw+1,ch+1);noise(ctx,X,Y,cw,ch,x+y*14);
  if(t.classList.contains('forest')){for(const [ox,oy,rr] of [[.28,.31,.19],[.58,.25,.21],[.69,.57,.20],[.34,.65,.22]]){ctx.fillStyle='#244a2d';ctx.beginPath();ctx.arc(X+cw*ox,Y+ch*oy,cw*rr,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3f6c37';ctx.beginPath();ctx.arc(X+cw*(ox-.04),Y+ch*(oy-.05),cw*rr*.55,0,Math.PI*2);ctx.fill()}}
  if(t.classList.contains('hill')){ctx.fillStyle='rgba(222,201,150,.24)';ctx.beginPath();ctx.moveTo(X,Y+ch*.72);ctx.lineTo(X+cw*.36,Y+ch*.28);ctx.lineTo(X+cw*.58,Y+ch*.57);ctx.lineTo(X+cw*.78,Y+ch*.22);ctx.lineTo(X+cw,Y+ch*.72);ctx.closePath();ctx.fill();const below=tiles[(y+1)*14+x];if(y===9||!below?.classList.contains('hill')){ctx.fillStyle='#58452f';ctx.fillRect(X,Y+ch*.83,cw+1,ch*.17)}}
  if(t.classList.contains('river')){ctx.strokeStyle='rgba(235,248,241,.34)';ctx.lineWidth=1;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(X+cw*.1,Y+ch*(.25+k*.23));ctx.bezierCurveTo(X+cw*.38,Y+ch*(.19+k*.23),X+cw*.63,Y+ch*(.31+k*.23),X+cw*.9,Y+ch*(.25+k*.23));ctx.stroke()}}
  if(t.classList.contains('bridge')){ctx.fillStyle='#7c5c39';ctx.fillRect(X,Y,cw,ch);ctx.strokeStyle='#4f3822';ctx.lineWidth=2;for(let xx=4;xx<cw;xx+=9){ctx.beginPath();ctx.moveTo(X+xx,Y);ctx.lineTo(X+xx,Y+ch);ctx.stroke()}}
  if(t.classList.contains('gate')){ctx.fillStyle='#776a58';ctx.fillRect(X+cw*.08,Y+ch*.12,cw*.84,ch*.72);ctx.fillStyle='#473b30';ctx.fillRect(X+cw*.18,Y+ch*.48,cw*.64,ch*.36);ctx.fillStyle='#97876f';for(let q=0;q<4;q++)ctx.fillRect(X+cw*(.1+q*.22),Y+ch*.04,cw*.14,ch*.14)}
  if(t.classList.contains('village')){ctx.fillStyle='#b27f50';ctx.fillRect(X+cw*.31,Y+ch*.43,cw*.38,ch*.34);ctx.fillStyle='#65432c';ctx.beginPath();ctx.moveTo(X+cw*.24,Y+ch*.45);ctx.lineTo(X+cw*.5,Y+ch*.2);ctx.lineTo(X+cw*.76,Y+ch*.45);ctx.closePath();ctx.fill()}
 }
}
function refreshSprites(){document.querySelectorAll('.sprite').forEach(mountSprite)}
let scheduled=false;function refresh(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;draw();refreshSprites()})}
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});window.addEventListener('resize',refresh);setTimeout(refresh,50);setTimeout(refresh,400);
