const FIELD=document.querySelector('#field');
const MAP={cao:0,dun:1,yuan:2,ren:3,xun:4,inf:5,spear:6,archer:7,zhangbao:8,hua:9,lubu:10,yanliang:11};
const css=document.querySelector('link[href*="visuals.css"]');if(css&&!css.href.includes('v=19r2'))css.href='css/visuals.css?v=19r2';
import('./classic-map.js?v=19r2').catch(()=>{});
function layoutTiles(){if(!FIELD)return;[...FIELD.children].forEach((t,i)=>{const x=i%14,y=Math.floor(i/14);Object.assign(t.style,{position:'absolute',left:(x*100/14)+'%',top:(y*10)+'%',width:(100/14)+'%',height:'10%'});});}
function renderSprite(el){if(!el)return;const cls=[...el.classList].find(c=>c!=='sprite')||'inf';const i=MAP[cls]??5;let s=el.querySelector('.unitSprite');if(!s){s=document.createElement('span');s.className='unitSprite';el.replaceChildren(s)}Object.assign(s.style,{display:'block',width:'32px',height:'40px',backgroundImage:"url('assets/unit-atlas.svg?v=19r2')",backgroundRepeat:'no-repeat',backgroundSize:'384px 40px',backgroundPosition:(-i*32)+'px 0px',imageRendering:'pixelated',transform:'scale(1.45)',transformOrigin:'50% 82%'});}
function refresh(){layoutTiles();document.querySelectorAll('.sprite').forEach(renderSprite)}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});addEventListener('resize',schedule);refresh();setTimeout(refresh,30);setTimeout(refresh,120);setTimeout(refresh,360);
