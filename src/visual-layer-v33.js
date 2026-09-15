const field=document.querySelector('#field');
const frame=field?.closest('.frame');
let visual=null,lastHover=-1,refreshing=false;
function pctCell(el,x,y){el.style.left=(x*100/14)+'%';el.style.top=(y*10)+'%';el.style.width=(100/14)+'%';el.style.height='10%';}
function ensureLayer(){if(!frame)return null;if(visual?.isConnected)return visual;visual=document.createElement('div');visual.id='visualLayer';frame.insertBefore(visual,document.querySelector('#fx'));return visual}
function refresh(){
  if(!field||refreshing)return;refreshing=true;
  const layer=ensureLayer();if(!layer){refreshing=false;return}
  layer.innerHTML='';
  const cells=[...field.querySelectorAll(':scope>.cell-hitbox')];
  cells.forEach((cell,i)=>{
    const x=i%14,y=Math.floor(i/14);
    const unit=cell.querySelector(':scope>.unit');
    if(unit){const w=document.createElement('div');w.className='visual-unit';pctCell(w,x,y);w.append(unit.cloneNode(true));layer.append(w)}
    const states=['move','target','skilltarget','selected'].filter(c=>cell.classList.contains(c));
    if(states.length){const r=document.createElement('div');r.className='range-cell '+states.join(' ');pctCell(r,x,y);layer.append(r)}
  });
  refreshing=false;
}
function indexFromEvent(e){const r=field.getBoundingClientRect();if(!r.width||!r.height)return-1;const x=Math.floor((e.clientX-r.left)/r.width*14),y=Math.floor((e.clientY-r.top)/r.height*10);if(x<0||x>13||y<0||y>9)return-1;return y*14+x}
field?.addEventListener('click',e=>{const i=indexFromEvent(e),cells=field.querySelectorAll(':scope>.cell-hitbox');if(i>=0&&cells[i])cells[i].click()});
field?.addEventListener('pointermove',e=>{const i=indexFromEvent(e);if(i===lastHover)return;lastHover=i;const cells=field.querySelectorAll(':scope>.cell-hitbox');if(i>=0&&cells[i]&&typeof cells[i].onmouseenter==='function')cells[i].onmouseenter()});
field?.addEventListener('pointerleave',()=>{lastHover=-1});
const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
if(field)observer.observe(field,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
refresh();setTimeout(refresh,50);setTimeout(refresh,250);
