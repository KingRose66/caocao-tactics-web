const MAP={cao:0,dun:1,yuan:2,ren:3,xun:4,inf:5,spear:6,archer:7,zhangbao:8,hua:9,lubu:10,yanliang:11};
function mount(el){if(!el||el.dataset.sheet==='1')return;el.dataset.sheet='1';const cls=[...el.classList].find(c=>c!=='sprite')||'inf',i=MAP[cls]??5;const s=document.createElement('span');s.className='unitSprite';s.style.setProperty('--sx',String(i));el.innerHTML='';el.append(s)}
function refresh(){document.querySelectorAll('.sprite').forEach(mount)}
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true});refresh();setTimeout(refresh,60);setTimeout(refresh,260);
