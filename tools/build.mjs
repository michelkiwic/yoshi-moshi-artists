import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const data=JSON.parse(await fs.readFile(path.join(root,'content/site.json'),'utf8'));
const dist=path.join(root,'dist');
await fs.mkdir(dist,{recursive:true});
await fs.cp(path.join(root,'public'),dist,{recursive:true});
const currentMedia=new Set(await fs.readdir(path.join(root,'public/media')));
for(const file of await fs.readdir(path.join(dist,'media')))if(!currentMedia.has(file))await fs.unlink(path.join(dist,'media',file));
// Deliver lightweight responsive character assets instead of the large lossless originals.
for(const name of ['yoshi','moshi']){
  const art=data.art[name];
  const source=path.join(root,'public',art.src);
  const widths=[240,480,720,960,art.width].filter((w,i,a)=>w<=art.width&&a.indexOf(w)===i);
  art.variants=await Promise.all(widths.map(async width=>{
    const src=`media/optimized-${name}-${width}.webp`;
    await sharp(source).resize({width}).webp({quality:82,alphaQuality:90,effort:6}).toFile(path.join(dist,src));
    return {src,width};
  }));
  art.src=art.variants.at(-1).src;
  art.mobileVariants=await Promise.all([360,540,720].map(async width=>{
    const src=`media/mobile-${name}-${width}.webp`;
    await sharp(source).resize({width}).grayscale().webp({quality:70,alphaQuality:85,effort:6}).toFile(path.join(dist,src));
    return {src,width};
  }));
}
const siteUrl=(process.env.SITE_URL||'').replace(/\/$/,'');
const routes=['','news','performances','films','pictures','about','contact'];
const names=['Yoshi + Moshi','News','Performances','Films','Pictures','About','Contact'];
const descriptions={home:'Yoshi + Moshi: artists, performances, films and exhibitions. Live and work in Mendrisio TI, Switzerland.',news:'Latest exhibitions, films and encounters from Yoshi + Moshi.',performances:'Explore the live performances of Yoshi + Moshi.',films:'Short films, live moments and moving images by Yoshi + Moshi.',pictures:'Photographs of Yoshi + Moshi on stage, on the road and in between.',about:'Biography, performances, films and exhibitions of Yoshi + Moshi.',contact:'Contact Yoshi + Moshi artists in Mendrisio, Switzerland.'};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let prefix='';
const url=s=>prefix+s;
function image(a,alt='',className='',eager=false,sizes='(max-width: 767px) 90vw, 50vw') {
  if (!a) return '';
  const srcset=a.variants?.map(v=>`${url(v.src)} ${v.width}w`).join(', ');
  return `<img src="${url(a.src)}" ${srcset?`srcset="${srcset}" sizes="${sizes}"`:''} ${a.width?`width="${a.width}" height="${a.height}"`:''} alt="${escape(alt)}" class="${className}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
}
function links(html='') {
  return html.replace(/href="(media\/[^"#]+|news\/[^" ]*|performances\/[^" ]*|films\/[^" ]*|pictures\/[^" ]*|about\/[^" ]*|contact\/[^" ]*|\.\/[^" ]*)"/g,(_,s)=>`href="${url(s)}"`);
}
function media(m) {
  if (m.type==='loop') return `<video class="news-loop" muted loop playsinline preload="none" data-loop="${url(m.src)}" aria-label="${escape(m.alt||'Yoshi + Moshi video')}" ></video>`;
  if (m.type==='video') return `<video controls playsinline preload="none" data-src="${url(m.src)}" aria-label="Yoshi + Moshi film"></video>`;
  if (m.video) return `<video class="preview-loop" muted loop playsinline preload="none" poster="${url(m.poster.src)}" data-loop="${url(m.video.src)}" aria-label="${escape(m.alt)}"></video>`;
  return image(m,m.alt||'Yoshi + Moshi');
}
function panel(html) {return `<section class="intro-panel">${links(html)}</section>`;}
function intro(page) {return `<header class="page-intro"><p class="kicker">${escape(page.kicker)}</p><h1>${escape(page.title)}</h1><p class="lede">${page.lede||''}</p></header>`;}
function heads(){return `<a class="header-head head-left" href="${url('./')}" aria-label="Yoshi + Moshi home">${image(data.art.yoshi,'','',true,'(max-width: 767px) 180px, 260px')}</a><a class="header-head head-right" href="${url('./')}" aria-label="Yoshi + Moshi home">${image(data.art.moshi,'','',true,'(max-width: 767px) 180px, 240px')}</a>`;}
function nav(active,overlay=false){return `<nav aria-label="${overlay?'Mobile':'Main'} navigation" class="${overlay?'mobile-links':'desktop-links'}">${routes.map((r,i)=>`<a href="${url(r?r+'/':'./')}" ${r===active?'aria-current="page"':''}>${escape(names[i])}</a>`).join('')}</nav>`;}
function character(name,page){
  const art=data.art[name];
  const img=image(art,'',`character ${name}`,true,'(max-width: 767px) 70vw, 50vw');
  if(page!=='home')return img;
  return `<picture><source media="(max-width: 767px)" srcset="${art.mobileVariants.map(v=>`${url(v.src)} ${v.width}w`).join(', ')}" sizes="min(44vh, 400px)">${img}</picture>`;
}
function decoration(page){return `<div class="ambient" aria-hidden="true"><span class="dot dot-one"></span><span class="dot dot-two"></span><span class="dot dot-three"></span>${['home','about'].includes(page)?character('yoshi',page)+character('moshi',page):''}</div>`;}
function content(page){
  if(page==='home')return `<section class="home-stage"><h1><button class="wordmark-menu" type="button" aria-label="Open navigation" aria-controls="menu-dialog" aria-expanded="false">${image(data.art.logo,'Yoshi + Moshi','wordmark',true,'(max-width: 767px) 145px, 340px')}</button></h1><p class="sr-only">Artists based in Mendrisio TI, Switzerland. Discover our news, performances, films and pictures.</p></section>`;
  if(page==='about')return `<div class="about-content"><div class="about-intro"><header class="page-intro"><h1>Yoshi +<br>Moshi<br>artists</h1><p class="lede">${escape(data.about.lede)}</p></header>${panel(data.about.panel)}</div>${data.about.sections.map(s=>`<section class="timeline-section"><h2>${escape(s.title)}</h2>${links(s.html)}</section>`).join('')}</div>`;
  if(page==='contact')return `<section class="contact-stage"><header class="contact-intro"><p class="kicker">YOSHI + MOSHI / CONTACT</p><h1><span>SAY</span><span>HELLO.</span></h1><p class="contact-lede">Exhibitions, performances, films —<br> or something we haven’t thought of yet.</p></header><figure class="contact-duo">${image(data.art.yoshi,'Yoshi','contact-yoshi',true,'(max-width: 767px) 65vw, 440px')}${image(data.art.moshi,'Moshi','contact-moshi',true,'(max-width: 767px) 65vw, 440px')}</figure><a class="contact-invitation" href="${escape(data.contact.email)}"><span class="contact-invitation-label">SEND A SIGNAL</span><span class="contact-email"><span>yoshi-moshi@</span><span>yoshi-moshi.com</span></span><span class="contact-arrow" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 24 24 8M8 8h16v16" stroke="currentColor" stroke-width="2"/></svg></span><span class="contact-invitation-note">A hello is a good place to start.</span></a><section class="contact-details" aria-label="Contact details">${links(data.contact.html)}</section></section>`;
  const d=data[page];
  let feed='';
  if(page==='news')feed=`<div class="news-feed">${d.entries.map((e,i)=>`<article class="news-entry" aria-label="News item ${i+1}"><div class="news-entry-inner"><div class="news-media">${e.media.map(media).join('')}</div><div class="news-copy">${links(e.html)}</div></div></article>`).join('')}</div>`;
  if(page==='performances')feed=`<div class="performance-grid">${d.entries.map(e=>`<article class="performance-card"><h2>${escape(e.title)}</h2><div class="performance-media ${e.media.length>1?'multiple':''}">${e.media.map(media).join('')}</div></article>`).join('')}</div>`;
  if(page==='pictures')feed=`<div class="pictures-grid">${d.entries.map((e,i)=>`<a class="picture-card" href="${url(e.src)}" data-gallery="${i}" aria-label="View photograph ${i+1}">${image(e,e.alt)}</a>`).join('')}</div>`;
  if(page==='films')feed=`<div class="film-grid" aria-label="Film archive">${d.entries.map(e=>`<button type="button" class="film-card" data-film="${url(e.film.src)}" aria-label="Play: ${escape(e.title)}"><span class="film-frame"><video class="preview-loop" muted loop playsinline preload="none" poster="${url(e.poster.src)}" data-loop="${url(e.loop.src)}" aria-hidden="true"></video><span class="play-mark" aria-hidden="true"></span></span><span class="film-title">${escape(e.title)}</span></button>`).join('')}</div>`;
  return `<div class="archive">${intro(d)}${panel(d.panel)}${feed}</div>`;
}
const font=data.fonts.find(f=>/woff2$/.test(f.src))||data.fonts[0];
if(!font)throw new Error('No local Oswald font imported');
await fs.writeFile(path.join(dist,'font.css'),`@font-face{font-family:Oswald;src:url("${font.src}") format("${font.src.endsWith('woff2')?'woff2':font.src.endsWith('woff')?'woff':'truetype'}");font-style:normal;font-weight:${font.weight||400};font-display:swap}`);
await fs.writeFile(path.join(dist,'art.css'),`:root{--drip-left:url("${data.art.dripLeft.src}");--drip-right:url("${data.art.dripRight.src}")}`);
const revisions=Object.fromEntries(await Promise.all(['font.css','art.css','site.css','fidelity.css','contact.css','entry.css','site.js'].map(async file=>[file,crypto.createHash('sha256').update(await fs.readFile(path.join(dist,file))).digest('hex').slice(0,10)])));
for(const route of routes){
  prefix=route?'../':'';
  const page=route||'home';
  const title=page==='home'?'Yoshi + Moshi':`${names[routes.indexOf(route)]} — Yoshi + Moshi`;
  const canonical=siteUrl?`${siteUrl}/${route?route+'/':''}`:'';
  const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#070707"><title>${escape(title)}</title><meta name="description" content="${escape(descriptions[page])}">${canonical?`<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}">`:''}<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(descriptions[page])}"><meta property="og:type" content="website"><link rel="icon" href="${url('favicon.svg')}" type="image/svg+xml"><link rel="preload" href="${url(font.src)}" as="font" type="${font.src.endsWith('woff2')?'font/woff2':'font/ttf'}" crossorigin><link rel="stylesheet" href="${url('font.css')}"><link rel="stylesheet" href="${url('art.css')}"><link rel="stylesheet" href="${url('site.css')}"><script src="${url('site.js')}" defer></script></head>
<body class="page-${page}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header">${heads()}${nav(route)}<button class="menu-toggle" type="button" aria-label="Open navigation" aria-controls="menu-dialog" aria-expanded="false"><span></span><span></span><span></span></button></header><div class="header-spacer"></div>${decoration(page)}<main id="main">${content(page)}</main><dialog class="menu-dialog" id="menu-dialog" aria-label="Navigation"><div class="menu-header">${heads()}<button class="close-menu" aria-label="Close navigation" type="button">×</button></div>${nav(route,true)}</dialog><dialog class="media-dialog" aria-label="Media viewer"><div class="dialog-bar"><h2></h2><button class="close-media" type="button" aria-label="Close media">×</button></div><div class="dialog-content"></div><div class="gallery-controls"><button type="button" data-direction="-1" aria-label="Previous photograph">←</button><span aria-live="polite"></span><button type="button" data-direction="1" aria-label="Next photograph">→</button></div></dialog></body></html>`;
  const dir=path.join(dist,route);
  await fs.mkdir(dir,{recursive:true});
  const faithfulHtml=html.replace('</head>',`<link rel="stylesheet" href="${url('fidelity.css')}">${page==='contact'?`<link rel="stylesheet" href="${url('contact.css')}">`:''}</head>`).replace(/((?:src|href)=")([^"]+\.(?:css|js))"/g,(_,start,ref)=>`${start}${ref}?v=${revisions[path.basename(ref)]}"`);
  const entryMarkup=page==='home'?`<dialog class="entry-gate" id="entry-gate" aria-labelledby="entry-title"><p class="entry-brand">${image(data.art.logo,'Yoshi + Moshi','entry-logo',true,'64px')}</p><div class="entry-dots" aria-hidden="true"><i class="entry-dot"></i><i class="entry-dot"></i><i class="entry-dot"></i></div><div class="entry-message"><h2 id="entry-title"><span>NO HUMOR</span><span>= NO ENTRY</span></h2><button class="entry-enter" type="button" autofocus>I BROUGHT HUMOR</button></div></dialog>`:'';
  const entryHtml=page==='home'?faithfulHtml.replace('</head>',`<link rel="stylesheet" href="${url('entry.css')}?v=${revisions['entry.css']}"><script>document.documentElement.dataset.entryPending='';</script></head>`).replace('</body>',`${entryMarkup}</body>`):faithfulHtml;
  await fs.writeFile(path.join(dir,'index.html'),entryHtml);
}
// Existing bookmarked WordPress paths continue to work without a server.
for(const [old,next] of [['film-performances-yoshi-moshi','films'],['yoshi-moshi-3','contact'],['log','news']]){
  await fs.mkdir(path.join(dist,old),{recursive:true});
  await fs.writeFile(path.join(dist,old,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=../${next}/"><title>Yoshi + Moshi</title><a href="../${next}/">Continue to ${next}</a></html>`);
}
await fs.writeFile(path.join(dist,'404.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Yoshi + Moshi</title><link rel="stylesheet" href="${siteUrl}/font.css"><style>body{background:#070707;color:#f6f5f1;font-family:Oswald,sans-serif;margin:0;padding:10vh 8vw}h1{font-size:6rem;margin:0}a{color:inherit}</style><body><main><h1>404</h1><p>This page could not be found.</p><a href="${siteUrl}/">Back to Yoshi + Moshi</a></main></body></html>`);
await fs.writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\n${siteUrl?`Sitemap: ${siteUrl}/sitemap.xml\n`:''}`);
if(siteUrl)await fs.writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${escape(siteUrl)}/${r?r+'/':''}</loc></url>`).join('')}</urlset>`);
else await fs.unlink(path.join(dist,'sitemap.xml')).catch(()=>{});
await fs.writeFile(path.join(dist,'.nojekyll'),'');
console.log(`Built ${routes.length} pages in ${dist}`);
