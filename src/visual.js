const NS='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
const add=(p,tag,attrs={})=>{const e=svgEl(tag,attrs);p.append(e);return e};
const PAL={
 cao:['#263d5a','#71869a','#c49772','#2b2d34','#71251f'],dun:['#334a58','#727d82','#c49772','#30343a','#64241f'],yuan:['#304b58','#6d8794','#c49772','#30353b','#315034'],ren:['#363e45','#737d83','#c49772','#303239','#56231f'],xun:['#514064','#806e91','#c99f7b','#493f50','#453153'],
 hua:['#622d2a','#99463c','#c28e68','#3d332f','#5d1c19'],lubu:['#452751','#704f84','#c28e68','#392d3c','#872621'],yanliang:['#5d4f22','#967d39','#c28e68','#423b25','#62511b'],archer:['#553b2d','#806047','#be8b66','#433a35','#354d2b'],spear:['#553b2d','#806047','#be8b66','#433a35','#573d1b'],inf:['#553b2d','#806047','#be8b66','#433a35','#573d1b'],zhangbao:['#4d3258','#765284','#bf8f69','#504629','#67401c']
};
function r(g,x,y,w,h,fill){add(g,'rect',{x,y,width:w,height:h,fill,'shape-rendering':'crispEdges'})}
function pixelUnit(el){if(!el||el.dataset.px==='1')return;el.dataset.px='1';const cls=[...el.classList].find(c=>c!=='sprite')||'inf',c=PAL[cls]||PAL.inf,m=['dun','yuan','hua','lubu','yanliang'].includes(cls),oy=m?-3:0;const s=svgEl('svg',{viewBox:'0 0 24 32','aria-hidden':'true','shape-rendering':'crispEdges'}),g=add(s,'g');
 r(g,6,29,12,2,'rgba(20,17,13,.42)');
 if(m){r(g,5,21,13,5,'#493529');r(g,3,23,4,4,'#493529');r(g,17,22,4,4,'#5b4130');r(g,6,25,2,5,'#2a201a');r(g,15,25,2,5,'#2a201a');r(g,18,20,3,3,'#5a4030')}
 r(g,6,17+oy,12,8,c[4]);r(g,8,14+oy,8,8,c[0]);r(g,9,16+oy,6,5,c[1]);r(g,6,15+oy,2,6,c[0]);r(g,16,15+oy,2,6,c[0]);r(g,8,20+oy,9,2,'#32271f');
 if(!m){r(g,8,23,3,6,'#2e3035');r(g,14,23,3,6,'#2e3035');r(g,7,28,4,2,'#251d19');r(g,14,28,4,2,'#251d19')}
 r(g,9,7+oy,7,6,c[2]);r(g,8,5+oy,9,3,c[3]);r(g,10,4+oy,6,2,c[3]);r(g,10,9+oy,1,1,'#211916');r(g,14,9+oy,1,1,'#211916');
 if(cls==='cao'){r(g,11,1+oy,2,4,'#c2a95c');r(g,9,3+oy,6,2,'#404247')}if(['dun','hua','yanliang'].includes(cls))r(g,11,1+oy,2,4,'#a4312a');if(cls==='lubu'){r(g,7,0+oy,2,5,'#ad2e29');r(g,16,0+oy,2,5,'#ad2e29');r(g,6,0+oy,2,2,'#ad2e29');r(g,17,0+oy,2,2,'#ad2e29')}if(cls==='xun'||cls==='zhangbao'){r(g,7,4+oy,11,3,c[3]);r(g,9,2+oy,7,2,c[3])}
 if(cls==='yuan'||cls==='archer'){add(g,'path',{d:`M19 ${12+oy} Q23 ${17+oy} 19 ${22+oy}`,fill:'none',stroke:'#684329','stroke-width':'1.5'});add(g,'line',{x1:19,y1:12+oy,x2:19,y2:22+oy,stroke:'#c6b594','stroke-width':'1'});add(g,'line',{x1:15,y1:18+oy,x2:22,y2:16+oy,stroke:'#b9a98d','stroke-width':'1'})}else if(cls==='xun'||cls==='zhangbao'){r(g,19,12+oy,2,14,'#5f432b');r(g,17,9+oy,6,4,'#b49a64')}else{r(g,19,10+oy,2,18,'#60432a');add(g,'polygon',{points:`17,${11+oy} 20,${5+oy} 23,${11+oy}`,fill:'#d0c9ae',stroke:'#6b6356','stroke-width':'1'})}
 if(cls==='ren'){r(g,3,17+oy,5,7,'#58636a');r(g,2,18+oy,7,5,'#58636a');r(g,4,19+oy,3,3,'#8a7653')}
 el.innerHTML='';el.append(s)}
function refresh(){document.querySelectorAll('.sprite').forEach(pixelUnit)}
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true});refresh();setTimeout(refresh,60);setTimeout(refresh,300);
