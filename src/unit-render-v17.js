const FIELD=document.querySelector('#field');
const MAP={cao:0,dun:1,yuan:2,ren:3,xun:4,inf:5,spear:6,archer:7,zhangbao:8,hua:9,lubu:10,yanliang:11};
function layoutTiles(){if(!FIELD)return;[...FIELD.children].forEach((t,i)=>{const x=i%14,y=Math.floor(i/14);t.style.position='absolute';t.style.left=(x*100/14)+'%';t.style.top=(y*10)+'%';t.style.width=(100/14)+'%';t.style.height='10%';});}
function renderSprite(el){if(!el)return;const cls=[...el.classList].find(c=>c!=='sprite')||'inf';const i=MAP[cls]??5;let s=el.querySelector('.unitSprite');if(!s){s=document.createElement('span');s.className='unitSprite';el.replaceChildren(s)}s.style.backgroundPosition=(-i*32)+'px 0px';s.style.backgroundSize='384px 40px';s.style.backgroundImage="url('assets/unit-atlas.svg')";}
function refresh(){layoutTiles();document.querySelectorAll('.sprite').forEach(renderSprite)}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});addEventListener('resize',schedule);refresh();setTimeout(refresh,50);setTimeout(refresh,180);setTimeout(refresh,500);
