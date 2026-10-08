const menu=document.querySelector('.menu-dialog');
const toggle=document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true');});
menu.querySelector('.close-menu').addEventListener('click',()=>menu.close());
menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus();});
const dialog=document.querySelector('.media-dialog');
const content=dialog.querySelector('.dialog-content');
const title=dialog.querySelector('h2');
const gallery=[...document.querySelectorAll('[data-gallery]')];
let index=0;
function showPhoto(next){
  index=(next+gallery.length)%gallery.length;
  const item=gallery[index];
  const img=document.createElement('img');
  img.src=item.href;
  img.alt=item.querySelector('img').alt;
  content.replaceChildren(img);
  title.textContent=img.alt || 'Yoshi + Moshi';
  dialog.querySelector('.gallery-controls span').textContent=`${index+1} / ${gallery.length}`;
}
gallery.forEach((item,i)=>item.addEventListener('click',event=>{
  event.preventDefault();dialog.classList.remove('is-film');showPhoto(i);dialog.showModal();
}));
dialog.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>showPhoto(index+Number(b.dataset.direction))));
dialog.addEventListener('keydown',event=>{
  if(dialog.classList.contains('is-film'))return;
  if(event.key==='ArrowRight')showPhoto(index+1);
  if(event.key==='ArrowLeft')showPhoto(index-1);
});
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{
  const video=document.createElement('video');
  video.controls=true;video.playsInline=true;video.preload='metadata';video.src=button.dataset.film;
  title.textContent=button.querySelector('.film-title').textContent;
  dialog.classList.add('is-film');content.replaceChildren(video);dialog.showModal();
  video.play().catch(()=>{});
}));
dialog.querySelector('.close-media').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
dialog.addEventListener('close',()=>{
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
