const F=document.querySelector('#field');
function layout(){if(!F)return;[...F.children].forEach((t,i)=>{const x=i%14,y=Math.floor(i/14);t.style.position='absolute';t.style.left=(x*100/14)+'%';t.style.top=(y*10)+'%';t.style.width=(100/14)+'%';t.style.height='10%';});}
new MutationObserver(layout).observe(F,{childList:true});addEventListener('resize',layout);layout();setTimeout(layout,60);