const PARTS=15;
const EXPECTED_LENGTH=44192;
const EXPECTED_WIDTH=1120;
const EXPECTED_HEIGHT=800;

(async()=>{
  const status=document.getElementById('mapStatus');
  const image=document.getElementById('mapImage');
  let url=null;
  try{
    const texts=await Promise.all(Array.from({length:PARTS},async(_,i)=>{
      const res=await fetch(`assets/hd11v2/map-${i}.b64?v=11`,{cache:'no-store'});
      if(!res.ok) throw new Error(`分片 ${i} HTTP ${res.status}`);
      const t=(await res.text()).trim();
      const expected=i===PARTS-1?2192:3000;
      if(t.length!==expected) throw new Error(`分片 ${i} 长度 ${t.length}，应为 ${expected}`);
      return t;
    }));
    const b64=texts.join('');
    if(b64.length!==EXPECTED_LENGTH) throw new Error(`总长度 ${b64.length}，应为 ${EXPECTED_LENGTH}`);
    if(!b64.startsWith('/9j/')) throw new Error('JPEG 头校验失败');
    if(!b64.endsWith('//Z')) throw new Error('JPEG 尾校验失败');
    const raw=atob(b64);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
    url=URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
    image.onload=()=>{
      if(image.naturalWidth!==EXPECTED_WIDTH||image.naturalHeight!==EXPECTED_HEIGHT){
        status.textContent=`尺寸异常：${image.naturalWidth}×${image.naturalHeight}`;
        return;
      }
      status.textContent='高清地图已加载 · 1120×800 JPEG · 15 分片逐块校验通过';
    };
    image.onerror=()=>{ status.textContent='JPEG 解码失败：分片完整但图像无法解码'; };
    image.src=url;
  }catch(err){
    console.error(err);
    status.textContent=`加载失败：${err.message}`;
  }
})();