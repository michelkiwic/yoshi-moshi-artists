// Preserve the original three-hole movement, including the random starting phase.
const holes=[...document.querySelectorAll('.dot')];
const viewportWidth=innerWidth,viewportHeight=innerHeight;
const columns=[0,1,2].sort(()=>Math.random()-.5);
const rows=[0,1,2].sort(()=>Math.random()-.5);
const headerBottom=document.querySelector('.site-header').getBoundingClientRect().bottom;
const isSubpage=!document.body.classList.contains('page-home')&&!document.body.classList.contains('page-about');
const isHome=document.body.classList.contains('page-home');
const between=(min,max)=>min+Math.random()*Math.max(0,max-min);
holes.forEach((hole,i)=>{
  const radius=hole.getBoundingClientRect().width/2;
  const wobbleReach=Math.min(isHome?86:64,viewportWidth*(isHome?.16:.12),viewportHeight*(isHome?.133:.1));
  const inset=radius+wobbleReach+8;
  const columnWidth=viewportWidth/3;
  const top=headerBottom+inset;
  const rowHeight=Math.max(1,viewportHeight-top-inset)/3;
  const leftMin=Math.max(inset,columns[i]*columnWidth+radius*.25);
  const leftMax=Math.min(viewportWidth-inset,(columns[i]+1)*columnWidth-radius*.25);
  const left=leftMin<=leftMax?between(leftMin,leftMax):Math.max(inset,Math.min(viewportWidth-inset,(columns[i]+.5)*columnWidth));
  const upper=top+rows[i]*rowHeight+rowHeight*.15;
  const lower=top+rows[i]*rowHeight+rowHeight*.85;
  const driftX=wobbleReach*between(.7,1)*(Math.random()<.5?-1:1);
  const driftY=wobbleReach*between(.7,1)*(Math.random()<.5?-1:1);
  hole.style.left=left+'px';hole.style.right='auto';hole.style.top=between(upper,lower)+'px';
  hole.style.setProperty('--ym-drift-x',driftX+'px');hole.style.setProperty('--ym-drift-y',driftY+'px');
  hole.style.animationDuration=between(5,8)+'s';hole.style.animationDelay=-between(0,8)+'s';
  if(isHome){
    const centers=[.353,.647,.5],vertical=[.17,.52,.84];
    hole.style.left=(viewportWidth*(centers[i]+between(-.033,.033)))+'px';
    hole.style.top=(viewportHeight*(vertical[i]+between(-.053,.053)))+'px';
  }else if(isSubpage){hole.style.left=(i%2?between(94,99):between(1,6))+'%';hole.style.top=(26+rows[i]*25+between(0,8))+'%';}
});
const menu=document.querySelector('.menu-dialog');
const toggle=document.querySelector('.menu-toggle');
// Focus the close control, not the first decorative head link, when opening the dialog.
menu.querySelector('.close-menu').autofocus=true;
toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true');});
menu.querySelector('.close-menu').addEventListener('click',()=>menu.close());
menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus();});
const dialog=document.querySelector('.media-dialog');
const content=dialog.querySelector('.dialog-content');
const title=dialog.querySelector('h2');
const gallery=[...document.querySelectorAll('[data-gallery]')];
const films=[...document.querySelectorAll('[data-film]')];
const soundToggle=document.createElement('button');
soundToggle.type='button';soundToggle.className='sound-toggle';
const soundIcon=audible=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4Z"/>${audible?'<path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>':'<path d="m16 9 5 6m0-6-5 6"/>'}</svg>`;
soundToggle.innerHTML=soundIcon(false);soundToggle.setAttribute('aria-label','Ton einschalten');
soundToggle.setAttribute('aria-pressed','false');
dialog.querySelector('.dialog-bar').insertBefore(soundToggle,dialog.querySelector('.close-media'));
function updateSoundToggle(video){
  const audible=!video.muted&&video.volume>0;
  soundToggle.innerHTML=soundIcon(audible);
  soundToggle.setAttribute('aria-pressed',String(audible));
  soundToggle.setAttribute('aria-label',audible?'Ton ausschalten':'Ton einschalten');
}
soundToggle.addEventListener('click',()=>{
  const video=content.querySelector('video');
  if(!video)return;
  if(video.muted||video.volume===0){video.muted=false;if(video.volume===0)video.volume=1;}
  else video.muted=true;
  updateSoundToggle(video);
});
let filmIndex=0;
function showFilm(next){
  if(!films.length)return;
  filmIndex=Math.max(0,Math.min(next,films.length-1));
  const button=films[filmIndex];
  const previous=content.querySelector('video');
  if(previous){previous.pause();previous.removeAttribute('src');previous.load();}
  const video=document.createElement('video');
  video.muted=true;video.defaultMuted=true;
  video.controls=true;video.playsInline=true;video.preload='metadata';video.src=button.dataset.film;
  updateSoundToggle(video);
  video.addEventListener('volumechange',()=>updateSoundToggle(video));
  title.textContent=button.querySelector('.film-title').textContent;
  dialog.classList.add('is-film');content.replaceChildren(video);
  dialog.querySelector('.gallery-controls span').textContent=`${filmIndex+1} / ${films.length}`;
  dialog.querySelectorAll('[data-direction]').forEach(control=>{
    control.setAttribute('aria-label',Number(control.dataset.direction)<0?'Previous film':'Next film');
    control.disabled=Number(control.dataset.direction)<0?filmIndex===0:filmIndex===films.length-1;
  });
  video.play().catch(()=>{});
}
function navigateMedia(direction){
  if(dialog.classList.contains('is-film'))showFilm(filmIndex+direction);
  else showPhoto(index+direction);
}
let index=0;
let photoRequest=0;
async function showPhoto(next){
  if(!gallery.length)return;
  const request=++photoRequest;
  index=Math.max(0,Math.min(next,gallery.length-1));
  const item=gallery[index];
  const img=document.createElement('img');
  img.src=item.href;
  img.alt=item.querySelector('img').alt;
  try{await img.decode();}catch{return false;}
  if(request!==photoRequest)return false;
  content.replaceChildren(img);
  title.textContent=img.alt || 'Yoshi + Moshi';
  dialog.querySelector('.gallery-controls span').textContent=`${index+1} / ${gallery.length}`;
  dialog.querySelectorAll('[data-direction]').forEach(button=>{
    button.disabled=Number(button.dataset.direction)<0?index===0:index===gallery.length-1;
  });
}
gallery.forEach((item,i)=>item.addEventListener('click',async event=>{
  event.preventDefault();dialog.classList.remove('is-film');
  await showPhoto(i);
  if(content.querySelector('img'))dialog.showModal();
}));
dialog.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>navigateMedia(Number(b.dataset.direction))));
content.addEventListener('click',event=>{
  if(!['IMG','VIDEO'].includes(event.target.tagName))return;
  const bounds=event.target.getBoundingClientRect();
  if(event.target.tagName==='VIDEO'&&event.clientY>bounds.bottom-64)return;
  navigateMedia(event.clientX<bounds.left+bounds.width/2?-1:1);
});
content.addEventListener('pointermove',event=>{
  if(!['IMG','VIDEO'].includes(event.target.tagName))return;
  const bounds=event.target.getBoundingClientRect();
  const direction=event.clientX<bounds.left+bounds.width/2?-1:1;
  dialog.querySelectorAll('[data-direction]').forEach(button=>{
    button.classList.toggle('is-image-hover',Number(button.dataset.direction)===direction);
  });
});
content.addEventListener('pointerleave',()=>{
  dialog.querySelectorAll('[data-direction]').forEach(button=>button.classList.remove('is-image-hover'));
});
dialog.addEventListener('keydown',event=>{
  if(event.target.tagName==='VIDEO')return;
  if(event.key==='ArrowRight'){event.preventDefault();navigateMedia(1);}
  if(event.key==='ArrowLeft'){event.preventDefault();navigateMedia(-1);}
});
films.forEach((button,i)=>button.addEventListener('click',()=>{
  showFilm(i);dialog.showModal();
}));
dialog.querySelector('.close-media').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
dialog.addEventListener('close',()=>{
  photoRequest++;
  const video=content.querySelector('video');
  if(video){video.pause();video.removeAttribute('src');video.load();}
  content.replaceChildren();
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const saveData=navigator.connection?.saveData;
const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target:video,isIntersecting})=>{
    if(video.dataset.loop){
      if(isIntersecting&&!reduced.matches&&!saveData){
        if(!video.getAttribute('src'))video.src=video.dataset.loop;
        video.play().catch(()=>{});
      }else video.pause();
    }else if(isIntersecting&&video.dataset.src){video.src=video.dataset.src;delete video.dataset.src;observer.unobserve(video);}
  });
},{rootMargin:'120px',threshold:.05});
document.querySelectorAll('video[data-loop],video[data-src]').forEach(v=>observer.observe(v));
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());
  else document.querySelectorAll('video[data-loop][src]').forEach(v=>{
    const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&!reduced.matches&&!saveData)v.play().catch(()=>{});
  });
});
