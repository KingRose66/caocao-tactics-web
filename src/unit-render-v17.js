const F=document.querySelector('#field');
const MAP={cao:0,dun:1,yuan:2,ren:3,xun:4,inf:5,spear:6,archer:7,zhangbao:8,hua:9,lubu:10,yanliang:11};
function ensureSprite(el){if(!el)return;const cls=[...el.classList].find(c=>c!=='sprite')||'inf';let img=el.querySelector('.unitSprite');if(!img){img=document.createElement('span');img.className='unitSprite';el.append(img)}const i=MAP[cls]??5;img.style.backgroundPosition=(-i*32)+'px 0px';}
function layout(){if(!F)return;[...F.children].forEach((t,i)=>{const x=i%14,y=Math.floor(i/14);t.style.position='absolute';t.style.left=(x*100/14)+'%';t.style.top=(y*10)+'%';t.style.width=(100/14)+'%';t.style.height='10%';t.querySelectorAll('.sprite').forEach(ensureSprite)});document.querySelectorAll('.portrait .sprite').forEach(ensureSprite)}
const obs=new MutationObserver(layout);obs.observe(document.body,{childList:true,subtree:true});addEventListener('resize',layout);layout();setTimeout(layout,30);setTimeout(layout,150);
