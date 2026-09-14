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
    const current=$('#title')?.textContent?.trim();
    m.classList.add('hide');
    $('#chapters').click();
    requestAnimationFrame(()=>{
      const buttons=[...document.querySelectorAll('#chapterList .chap')];
      const idx=titles.indexOf(current);
      const next=buttons[idx+1];
      if(next&&!next.disabled) next.click();
    });
  };
}
function showVictory(){
  ensureVictoryModal();
  const current=$('#title')?.textContent?.trim()||'本关';
  const idx=titles.indexOf(current);
  const hasNext=idx>=0&&idx<titles.length-1;
  $('#victoryTitle').textContent=current+' · 胜利';
  $('#victoryText').textContent=hasNext?'下一关已经解锁，可以直接继续进军。':'当前章节已经全部完成。';
  $('#nextChapter').style.display=hasNext?'':'none';
  $('#victoryModal').classList.remove('hide');
}
function decorateTerrain(){
  const field=$('#field');if(!field)return;
  const tiles=[...field.children];
  tiles.forEach((tile,i)=>{
    tile.dataset.v=String((i*7+Math.floor(i/14)*3)%3);
    if(!tile.querySelector('.terrain-deco')){const d=document.createElement('i');d.className='terrain-deco';tile.prepend(d)}
    const x=i%14,y=Math.floor(i/14),grid=tiles;
    if(tile.classList.contains('hill')){
      const below=grid[(y+1)*14+x]; if(y===9||!below?.classList.contains('hill'))tile.classList.add('cliff-s');
      const left=grid[y*14+x-1]; if(x===0||!left?.classList.contains('hill'))tile.classList.add('cliff-w');
      const right=grid[y*14+x+1]; if(x===13||!right?.classList.contains('hill'))tile.classList.add('cliff-e');
    }
    if(tile.classList.contains('river')){
      const up=grid[(y-1)*14+x],down=grid[(y+1)*14+x];
      if(y===0||(!up?.classList.contains('river')&&!up?.classList.contains('bridge')))tile.classList.add('bank-n');
      if(y===9||(!down?.classList.contains('river')&&!down?.classList.contains('bridge')))tile.classList.add('bank-s');
    }
  });
}
ensureVictoryModal();
let victoryShown=false;
const observer=new MutationObserver(()=>{
  decorateTerrain();
  const t=$('#talk')?.textContent||'';
  if(t.includes('此战已定')&&!victoryShown){victoryShown=true;setTimeout(showVictory,450)}
  if(!t.includes('此战已定'))victoryShown=false;
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
setTimeout(decorateTerrain,100);