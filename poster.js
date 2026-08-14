/* Poster Grid — shared behaviour: theme, reveal, scramble, marquee */
(function(){
const root=document.documentElement,KEY='pf-poster-theme';
function setT(t,btn){root.dataset.theme=t;document.querySelectorAll('[data-tgl]').forEach(b=>b.textContent=t==='dark'?'Light':'Dark');try{localStorage.setItem(KEY,t)}catch(e){}}
document.addEventListener('DOMContentLoaded',()=>{
  setT(root.dataset.theme||'light');
  document.querySelectorAll('[data-tgl]').forEach(b=>b.addEventListener('click',()=>setT(root.dataset.theme==='dark'?'light':'dark')));
  /* scramble */
  const G='ABCDEFGHIJKLMNOPQRSTUVWXYZ#%$&/*';
  document.querySelectorAll('[data-sc]').forEach(el=>{
    const src=el.textContent;let raf,f=0;
    el.addEventListener('mouseenter',()=>{cancelAnimationFrame(raf);f=0;
      const tick=()=>{f++;el.textContent=src.split('').map((c,i)=>c===' '?' ':(i<f/2?c:G[Math.floor(Math.random()*G.length)])).join('');
        if(f/2<src.length)raf=requestAnimationFrame(tick);else el.textContent=src};
      raf=requestAnimationFrame(tick)});
    el.addEventListener('mouseleave',()=>{cancelAnimationFrame(raf);el.textContent=src});
  });
  /* draggable auto marquee */
  const mq=document.querySelector('[data-mq]');
  if(mq){const t=mq.firstElementChild;t.innerHTML+=t.innerHTML;let x=0,down=false,sx=0,ox=0;
    const loop=()=>{if(!down){x-=.55;const w=t.scrollWidth/2;if(x<=-w)x+=w;t.style.transform='translateX('+x+'px)'}requestAnimationFrame(loop)};loop();
    mq.addEventListener('pointerdown',e=>{down=true;sx=e.clientX;ox=x;mq.classList.add('drag')});
    addEventListener('pointermove',e=>{if(!down)return;x=ox+(e.clientX-sx);t.style.transform='translateX('+x+'px)'});
    addEventListener('pointerup',()=>{if(!down)return;down=false;mq.classList.remove('drag');const w=t.scrollWidth/2;while(x<=-w)x+=w;while(x>0)x-=w});
  }
  /* email reveal — never fires mailto */
  document.querySelectorAll('[data-mail]').forEach(b=>{
    const addr=b.dataset.mail+'@'+b.dataset.dom,txt=b.querySelector('.txt'),hint=b.querySelector('.hint');let shown=false;
    b.addEventListener('click',e=>{e.preventDefault();
      if(!shown){shown=true;txt.textContent=addr;hint.textContent='Click again to copy';b.classList.add('on');return}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(addr).then(()=>hint.textContent='Copied to clipboard').catch(()=>hint.textContent='Select and copy: '+addr)}else{hint.textContent='Select and copy: '+addr}});
  });
  /* reveal */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
  document.querySelectorAll('.rv3').forEach(el=>io.observe(el));
  const showAll=()=>document.querySelectorAll('.rv3:not(.in)').forEach(e=>e.classList.add('in'));
  setTimeout(showAll,1400);addEventListener('load',()=>setTimeout(showAll,400));
});
})();
