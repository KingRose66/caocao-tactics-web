const titles=['颍川之战','汜水关之战','虎牢关之战','官渡前哨战'];
const $=s=>document.querySelector(s);
function ensureVictoryModal(){
  if($('#victoryModal')) return;
  const m=document.createElement('div');m.id='victoryModal';m.className='modal hide';
  m.innerHTML='<section class="victory-card"><div class="seal">胜</div><h2 id="victoryTitle">战斗胜利</h2><p id="victoryText">敌军主将已经被击破。</p><div class="victory-actions"><button id="nextChapter">进入下一关</button><button id="replayChapter">重玩本关</button><button id="backChapters">章节选择</button></div></section>';
  document.body.append(m);
  $('#replayChapter').onclick=()=>{m.classList.add('hide');$('#restart').click()};
  $('#backChapters').onclick=()=>{m.classList.add('hide');$('#chapters').click()};
  $('#nextChapter').onclick=()=>{
    const current=$('#title')?.textContent?.trim();m.classList.add('hide');$('#chapters').click();
    requestAnimationFrame(()=>{const buttons=[...document.querySelectorAll('#chapterList .chap')],idx=titles.indexOf(current),next=buttons[idx+1];if(next&&!next.disabled)next.click()});
  };
}
function showVictory(){
  ensureVictoryModal();const current=$('#title')?.textContent?.trim()||'本关',idx=titles.indexOf(current),hasNext=idx>=0&&idx<titles.length-1;
  $('#victoryTitle').textContent=current+' · 胜利';$('#victoryText').textContent=hasNext?'下一关已经解锁，可以直接继续进军。':'当前章节已经全部完成。';$('#nextChapter').style.display=hasNext?'':'none';$('#victoryModal').classList.remove('hide');
}
ensureVictoryModal();
let victoryShown=false;
const observer=new MutationObserver(()=>{const t=$('#talk')?.textContent||'';if(t.includes('此战已定')&&!victoryShown){victoryShown=true;setTimeout(showVictory,450)}if(!t.includes('此战已定'))victoryShown=false});
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
