(()=>{
  const nativeAppend=Element.prototype.append;
  const spriteIndex={cao:0,dun:1,yuan:2,ren:3,xun:4,inf:5,spear:6,archer:7,zhangbao:8,hua:9,lubu:10,yanliang:11};
  function ensureSprite(el){
    if(!(el instanceof Element)||!el.classList.contains('sprite'))return;
    const cls=[...el.classList].find(c=>c!=='sprite')||'inf';
    let img=el.querySelector('.unitSprite');
    if(!img){img=document.createElement('span');img.className='unitSprite';nativeAppend.call(el,img)}
    img.style.backgroundPosition=(-32*(spriteIndex[cls]??5))+'px 0px';
  }
  function convertTile(btn,parent){
    const d=document.createElement('div');
    d.className=['cell-hitbox',...[...btn.classList].filter(c=>c!=='tile')].join(' ');
    for(const a of [...btn.attributes]){
      if(!['class','style','type','role','tabindex'].includes(a.name))d.setAttribute(a.name,a.value);
    }
    while(btn.firstChild)d.appendChild(btn.firstChild);
    d.onclick=btn.onclick;
    d.onmouseenter=btn.onmouseenter;
    const i=parent.children.length,x=i%14,y=Math.floor(i/14);
    d.style.cssText=`position:absolute;left:${x*100/14}%;top:${y*10}%;width:${100/14}%;height:10%;margin:0;padding:0;border:0;outline:0;box-shadow:none;background:transparent;-webkit-appearance:none;appearance:none;-webkit-tap-highlight-color:transparent;`;
    d.querySelectorAll('.sprite').forEach(ensureSprite);
    return d;
  }
  Element.prototype.append=function(...nodes){
    const out=nodes.map(n=>{
      if(n instanceof Element)ensureSprite(n);
      if(this.id==='field'&&n instanceof HTMLButtonElement&&n.classList.contains('tile'))return convertTile(n,this);
      return n;
    });
    return nativeAppend.apply(this,out);
  };
})();
