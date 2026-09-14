const F=document.querySelector('#field');
const MAP={cao:0,dun:1,yuan:2,ren:3,xun:4,inf:5,spear:6,archer:7,zhangbao:8,hua:9,lubu:10,yanliang:11};
let busy=false;
function ensureSprite(el){if(!el)return;const cls=[...el.classList].find(c=>c!=='sprite')||'inf';let img=el.querySelector('.unitSprite');if(!img){img=document.createElement('span');img.className='unitSprite';el.append(img)}const i=MAP[cls]??5;img.style.backgroundPosition=(-i*32)+'px 0px';}
function convertTile(node){
  if(!node)return node;
  if(node.classList?.contains('cell-hitbox'))return node;
  if(!node.classList?.contains('tile'))return node;
  const d=document.createElement('div');
  const kept=[...node.classList].filter(c=>c!=='tile');
  d.className=['cell-hitbox',...kept].join(' ');
  d.setAttribute('role','button');
  d.tabIndex=-1;
  for(const a of [...node.attributes]){
    if(!['class','style','type','tabindex'].includes(a.name))d.setAttribute(a.name,a.value);
  }
  while(node.firstChild)d.append(node.firstChild);
  const click=node.onclick,enter=node.onmouseenter;
  d.onclick=click;d.onmouseenter=enter;
  d.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&typeof click==='function'){e.preventDefault();click.call(d,e)}});
  node.replaceWith(d);
  return d;
}
function layout(){
  if(!F||busy)return;
  busy=true;
  const raw=[...F.children];
  raw.forEach((node,i)=>{
    const t=convertTile(node);
    if(!t?.classList?.contains('cell-hitbox'))return;
    const x=i%14,y=Math.floor(i/14);
    t.style.cssText=`position:absolute;left:${x*100/14}%;top:${y*10}%;width:${100/14}%;height:10%;margin:0;padding:0;border:0;outline:0;box-shadow:none;background:transparent;`;
    t.querySelectorAll('.sprite').forEach(ensureSprite);
  });
  document.querySelectorAll('.portrait .sprite').forEach(ensureSprite);
  busy=false;
}
const obs=new MutationObserver(()=>requestAnimationFrame(layout));
obs.observe(document.body,{childList:true,subtree:true});
addEventListener('resize',layout);
layout();setTimeout(layout,30);setTimeout(layout,150);setTimeout(layout,500);
