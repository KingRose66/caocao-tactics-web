const $=s=>document.querySelector(s);
const NS='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e};
const add=(p,tag,attrs={})=>{const e=svgEl(tag,attrs);p.append(e);return e};

const P={
 cao:['#355a87','#8ba4bd','#d2a276','#363944','#7d2927'],dun:['#3b586e','#87979a','#d0a178','#42464d','#742a27'],yuan:['#3b6074','#789aad','#d0a178','#42464d','#315b35'],ren:['#46515c','#8b959b','#d0a178','#41444a','#5e2723'],xun:['#61517b','#9b86b2','#d8ae88','#554b65','#49375f'],
 hua:['#753938','#b95a4c','#cd9a72','#493d38','#6a201c'],lubu:['#583367','#9068a9','#cc9a72','#463548','#972c27'],yanliang:['#736129','#b99c4c','#cd9a72','#51472e','#75611e'],archer:['#654433','#9d724d','#cb9b73','#51443d','#3e6135'],spear:['#654433','#9b714e','#cb9b73','#51443d','#67491f'],inf:['#654433','#9b714e','#cb9b73','#51443d','#67491f'],zhangbao:['#62416f','#936ba4','#ca9b75','#63572f','#7a4b20']
};
function pixelRect(g,x,y,w,h,fill,stroke){const r=add(g,'rect',{x,y,width:w,height:h,fill,'shape-rendering':'crispEdges'});if(stroke){r.setAttribute('stroke',stroke);r.setAttribute('stroke-width','1')}return r}
function mountSprite(el){
 if(!el||el.dataset.v5==='1')return;el.dataset.v5='1';
 const cls=[...el.classList].find(c=>c!=='sprite')||'inf', c=P[cls]||P.inf;
 const svg=svgEl('svg',{viewBox:'0 0 32 44','aria-hidden':'true','shape-rendering':'crispEdges'}),g=add(svg,'g');
 add(g,'ellipse',{cx:16,cy:41,rx:9,ry:2.3,fill:'rgba(0,0,0,.35)'});
 const mounted=['dun','yuan','hua','lubu','yanliang'].includes(cls);
 if(mounted){
   pixelRect(g,7,27,18,7,'#5c4232','#2d211b');pixelRect(g,5,31,5,5,'#5c4232');pixelRect(g,22,31,5,5,'#5c4232');
   pixelRect(g,8,34,3,7,'#3a2b23');pixelRect(g,21,34,3,7,'#3a2b23');pixelRect(g,24,24,4,6,'#6b4b36','#30231c');
 }
 const oy=mounted?-5:0;
 pixelRect(g,8,21+oy,16,12,c[4]);
 pixelRect(g,10,18+oy,12,12,c[0],'#20262b');
 pixelRect(g,12,20+oy,8,8,c[1]);
 pixelRect(g,7,20+oy,4,9,c[0]);pixelRect(g,21,20+oy,4,9,c[0]);
 pixelRect(g,12,10+oy,8,7,c[2],'#493126');pixelRect(g,11,7+oy,10,5,c[3],'#22252a');
 pixelRect(g,14,13+oy,1,1,'#2a211d');pixelRect(g,18,13+oy,1,1,'#2a211d');
 if(!mounted){pixelRect(g,11,30,4,9,'#35343a');pixelRect(g,18,30,4,9,'#35343a');pixelRect(g,10,38,5,2,'#2b211d');pixelRect(g,18,38,5,2,'#2b211d')}
 if(cls==='cao'){pixelRect(g,15,2+oy,2,6,'#d8c06d');pixelRect(g,13,5+oy,6,2,'#47494f')}
 if(cls==='dun'||cls==='hua'||cls==='yanliang'){pixelRect(g,15,2+oy,2,6,'#b73c31')}
 if(cls==='lubu'){pixelRect(g,11,1+oy,2,7,'#c3332f');pixelRect(g,19,1+oy,2,7,'#c3332f');pixelRect(g,9,0+oy,2,4,'#c3332f');pixelRect(g,21,0+oy,2,4,'#c3332f')}
 if(cls==='xun'||cls==='zhangbao'){pixelRect(g,9,6+oy,14,3,c[3]);pixelRect(g,12,4+oy,8,3,c[3])}
 if(cls==='yuan'||cls==='archer'){
   add(g,'path',{d:`M25 ${16+oy} Q31 ${24+oy} 25 ${32+oy}`,fill:'none',stroke:'#7a4d29','stroke-width':'2'});
   add(g,'line',{x1:25,y1:16+oy,x2:25,y2:32+oy,stroke:'#e3d3af','stroke-width':'1'});
   add(g,'line',{x1:20,y1:25+oy,x2:30,y2:22+oy,stroke:'#d8c6a3','stroke-width':'1.5'});
 } else if(cls==='xun'||cls==='zhangbao'){
   pixelRect(g,25,16+oy,2,18,'#6d4e30');pixelRect(g,23,12+oy,6,5,'#d1b274');
 } else {
   pixelRect(g,25,13+oy,2,24,'#6d4d30');add(g,'polygon',{points:`22,${14+oy} 26,${6+oy} 30,${14+oy}`,fill:'#ded8bd',stroke:'#786e5e','stroke-width':'1'});
 }
 if(cls==='ren'){add(g,'circle',{cx:7,cy:25+oy,r:5,fill:'#68747c',stroke:'#242a30','stroke-width':'1.5'});add(g,'circle',{cx:7,cy:25+oy,r:2,fill:'#9a835c'})}
 el.innerHTML='';el.append(svg);
}

function ensureCanvas(){
 const frame=document.querySelector('.frame'),field=$('#field');if(!frame||!field)return null;
 let c=$('#terrainCanvas');if(!c){c=document.createElement('canvas');c.id='terrainCanvas';frame.prepend(c)}
 const w=field.scrollWidth,h=field.scrollHeight,dpr=Math.max(1,window.devicePixelRatio||1);
 c.style.width=w+'px';c.style.height=h+'px';c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
 const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;return {ctx,w,h};
}
function hash(n){n=(n<<13)^n;return 1-((n*(n*n*15731+789221)+1376312589)&0x7fffffff)/1073741824}
function rr(seed,a,b){return a+(hash(seed)*.5+.5)*(b-a)}
function typeOf(t){for(const x of ['forest','hill','river','bridge','gate','village','plain'])if(t.classList.contains(x))return x;return'plain'}
function drawTree(ctx,x,y,s,v){
 ctx.fillStyle='rgba(26,42,22,.32)';ctx.fillRect(x-s*.08,y+s*.34,s*.16,s*.3);
 const cols=v%2?['#214827','#315d32','#4d753b']:['#284c2d','#386536','#567d40'];
 for(const [dx,dy,r,c] of [[-.23,.02,.28,0],[.18,-.08,.31,1],[.05,.2,.34,2]]){ctx.fillStyle=cols[c];ctx.beginPath();ctx.arc(x+s*dx,y+s*dy,s*r,0,Math.PI*2);ctx.fill()}
}
function draw(){
 const field=$('#field'),data=ensureCanvas();if(!field||!data)return;const {ctx,w,h}=data,cw=w/14,ch=h/10,tiles=[...field.children];
 ctx.clearRect(0,0,w,h);
 let grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#879a5a');grad.addColorStop(.45,'#748a4c');grad.addColorStop(1,'#637940');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 for(let i=0;i<650;i++){const x=rr(i*17,0,w),y=rr(i*31,0,h),r=rr(i*47,.5,2.3);ctx.fillStyle=i%3?'rgba(38,62,29,.10)':'rgba(226,222,165,.10)';ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(r),Math.ceil(r))}
 for(let i=0;i<28;i++){ctx.fillStyle=i%2?'rgba(109,117,61,.08)':'rgba(160,137,83,.07)';ctx.beginPath();ctx.ellipse(rr(i*73,0,w),rr(i*89,0,h),rr(i*13,25,90),rr(i*23,14,46),rr(i*29,-.7,.7),0,Math.PI*2);ctx.fill()}
 const get=(x,y)=>x<0||y<0||x>13||y>9?null:typeOf(tiles[y*14+x]);
 for(let y=0;y<10;y++)for(let x=0;x<14;x++){
   const t=get(x,y),X=x*cw,Y=y*ch;
   if(t==='hill'){
     ctx.fillStyle='#9a845f';ctx.fillRect(X,Y,cw+1,ch+1);
     for(let k=0;k<5;k++){ctx.strokeStyle=k%2?'rgba(71,55,39,.22)':'rgba(220,198,149,.20)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X+rr(x*91+y*37+k,0,cw*.65),Y+rr(x*17+y*53+k,0,ch));ctx.lineTo(X+rr(x*61+y*23+k,cw*.35,cw),Y+rr(x*29+y*47+k,0,ch));ctx.stroke()}
     if(get(x,y+1)!=='hill'){ctx.fillStyle='#5b4732';ctx.fillRect(X,Y+ch*.80,cw+1,ch*.20);ctx.fillStyle='#765c40';ctx.fillRect(X,Y+ch*.80,cw+1,4)}
     if(get(x-1,y)!=='hill'){ctx.fillStyle='rgba(70,54,38,.26)';ctx.fillRect(X,Y,5,ch)}
   }
   if(t==='river'){
     const g=ctx.createLinearGradient(X,Y,X+cw,Y+ch);g.addColorStop(0,'#4d98a8');g.addColorStop(1,'#327687');ctx.fillStyle=g;ctx.fillRect(X,Y,cw+1,ch+1);
     for(let k=0;k<3;k++){ctx.strokeStyle='rgba(225,243,237,.34)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X+cw*.05,Y+ch*(.22+k*.27));ctx.bezierCurveTo(X+cw*.28,Y+ch*(.14+k*.27),X+cw*.66,Y+ch*(.31+k*.27),X+cw*.95,Y+ch*(.22+k*.27));ctx.stroke()}
     if(get(x-1,y)!=='river'&&get(x-1,y)!=='bridge'){ctx.fillStyle='#8b7552';ctx.fillRect(X,Y,4,ch)}
     if(get(x+1,y)!=='river'&&get(x+1,y)!=='bridge'){ctx.fillStyle='#a08a61';ctx.fillRect(X+cw-4,Y,4,ch)}
   }
 }
 for(let y=0;y<10;y++)for(let x=0;x<14;x++)if(get(x,y)==='forest'){
   const X=x*cw,Y=y*ch;ctx.fillStyle='rgba(38,72,37,.12)';ctx.beginPath();ctx.ellipse(X+cw*.5,Y+ch*.55,cw*.57,ch*.46,0,0,Math.PI*2);ctx.fill();
   const count=4+(Math.abs((x*3+y*5)%3));for(let k=0;k<count;k++)drawTree(ctx,X+rr(x*101+y*41+k*7,cw*.05,cw*.95),Y+rr(x*31+y*113+k*11,ch*.08,ch*.9),Math.min(cw,ch)*rr(k+x*7+y*13,.34,.50),k+x+y)
 }
 for(let y=0;y<10;y++)for(let x=0;x<14;x++){
   const t=get(x,y),X=x*cw,Y=y*ch;
   if(t==='bridge'){
     ctx.fillStyle='#805d39';ctx.fillRect(X-2,Y,cw+4,ch);ctx.strokeStyle='#513821';ctx.lineWidth=2;for(let px=3;px<cw;px+=8){ctx.beginPath();ctx.moveTo(X+px,Y);ctx.lineTo(X+px,Y+ch);ctx.stroke()}ctx.fillStyle='#4b351f';ctx.fillRect(X,Y+ch*.18,cw,3);ctx.fillRect(X,Y+ch*.78,cw,3)
   } else if(t==='gate'){
     ctx.fillStyle='#756956';ctx.fillRect(X,Y+ch*.18,cw,ch*.67);ctx.fillStyle='#4e4033';ctx.fillRect(X+cw*.16,Y+ch*.48,cw*.68,ch*.37);ctx.fillStyle='#9a8a70';for(let q=0;q<4;q++)ctx.fillRect(X+cw*(.04+q*.25),Y+ch*.06,cw*.16,ch*.15)
   } else if(t==='village'){
     const houses=[[.18,.35,.28,.28],[.52,.48,.24,.24]];for(const [hx,hy,hw,hh] of houses){ctx.fillStyle='#b1845a';ctx.fillRect(X+cw*hx,Y+ch*hy,cw*hw,ch*hh);ctx.fillStyle='#68442d';ctx.beginPath();ctx.moveTo(X+cw*(hx-.04),Y+ch*hy);ctx.lineTo(X+cw*(hx+hw/2),Y+ch*(hy-.18));ctx.lineTo(X+cw*(hx+hw+.04),Y+ch*hy);ctx.closePath();ctx.fill()}
   }
 }
 const vg=ctx.createRadialGradient(w*.5,h*.45,Math.min(w,h)*.2,w*.5,h*.45,Math.max(w,h)*.72);vg.addColorStop(.55,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(20,14,7,.20)');ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
}
function refreshSprites(){document.querySelectorAll('.sprite').forEach(mountSprite)}
let scheduled=false;function refresh(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;draw();refreshSprites()})}
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});window.addEventListener('resize',refresh);setTimeout(refresh,50);setTimeout(refresh,350);
