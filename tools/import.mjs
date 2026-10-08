import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { load } from 'cheerio';
import sharp from 'sharp';

// One-time migration tool. Building and hosting never need WordPress.
const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.SOURCE_URL || 'http://yoshi-moshi-local.local';
const wpRoot = process.env.SOURCE_DIRECTORY;
if (!wpRoot) throw new Error('Set SOURCE_DIRECTORY to the WordPress public directory before running this optional migration tool.');
const pages = ['/', '/news/', '/performances/', '/film-performances-yoshi-moshi/', '/pictures/', '/about/', '/yoshi-moshi-3/'];
const documents = await Promise.all(pages.map(async route => {
  const response = await fetch(origin + route);
  if (!response.ok) throw new Error(`${route}: ${response.status}`);
  return load(await response.text());
}));
await fs.mkdir(path.join(root, 'public/media'), { recursive: true });
await fs.mkdir(path.join(root, 'content'), { recursive: true });
const manifest = new Map();
const warnings = [];
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
function run(command,args) {return new Promise((resolve,reject)=>{const p=spawn(command,args,{windowsHide:true});let error='';p.stderr.on('data',b=>error+=b);p.on('error',reject);p.on('close',code=>code===0?resolve():reject(new Error(error.slice(-1500))));});}
const assetPath = s => new URL(s, origin).pathname;
async function bytes(url) {
  const pathname = decodeURIComponent(assetPath(url));
  if (!pathname.startsWith('/wp-content/')) throw new Error(`Unexpected source asset: ${url}`);
  const absolute = path.resolve(wpRoot, '.' + pathname);
  if (!absolute.startsWith(path.resolve(wpRoot) + path.sep)) throw new Error('Asset escapes source directory');
  return fs.readFile(absolute);
}
async function asset(url, options = {}) {
  if (!url) return null;
  const key = assetPath(url);
  if (manifest.has(key)) return manifest.get(key);
  const buffer = await bytes(url);
  const ext = path.extname(key).toLowerCase();
  const name = `${path.basename(key, ext).replace(/[^a-z0-9-]/gi, '-').slice(0, 65)}-${hash(key)}`;
  let result;
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    const input = sharp(buffer).rotate();
    const metadata = await input.metadata();
    const sizes = [...new Set([360, 720, 1200, Math.min(metadata.width, 1800)].filter(w => w <= metadata.width))].sort((a,b)=>a-b);
    if (!sizes.length) sizes.push(metadata.width);
    const variants = [];
    for (const width of sizes) {
      const file = `${name}-${width}.webp`;
      const output = await input.clone().resize({ width, withoutEnlargement: true }).webp({ quality: options.quality || 82, effort: 5 }).toBuffer();
      await fs.writeFile(path.join(root, 'public/media', file), output);
      variants.push({ src: `media/${file}`, width, bytes: output.length });
    }
    const largest = variants.at(-1);
    result = { src: largest.src, width: largest.width, height: Math.round(metadata.height * largest.width / metadata.width), variants, originalBytes: buffer.length };
  } else if (ext === '.gif') {
    const meta = await sharp(buffer, { animated: true }).metadata();
    const local = path.resolve(wpRoot, '.' + decodeURIComponent(key));
    const file = `${name}.mp4`;
    const poster = `${name}-poster.webp`;
    const width = Math.min(720,meta.width);
    await sharp(buffer).resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(path.join(root,'public/media',poster));
    await run(process.env.FFMPEG || 'ffmpeg',['-hide_banner','-loglevel','error','-y','-i',local,'-vf',`fps=12,scale=trunc(min(${width}\\,iw)/2)*2:-2`,'-an','-c:v','libx264','-crf','27','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'public/media',file)]);
    result = {src:`media/${poster}`,width,height:Math.round((meta.pageHeight||meta.height)*width/meta.width),originalBytes:buffer.length,video:{src:`media/${file}`,bytes:(await fs.stat(path.join(root,'public/media',file))).size},poster:{src:`media/${poster}`,width,height:Math.round((meta.pageHeight||meta.height)*width/meta.width)}};
  } else {
    const file = name + ext;
    await fs.writeFile(path.join(root, 'public/media', file), buffer);
    result = { src: `media/${file}`, bytes: buffer.length };
    if (ext === '.gif') {
      const meta = await sharp(buffer, { animated: true }).metadata();
      result.width = meta.width;
      result.height = meta.pageHeight || meta.height;
      result.animated = (meta.pages || 1) > 1;
    }
  }
  manifest.set(key, result);
  return result;
}
const routeMap = new Map(pages.map((p,i)=>[p,['','news','performances','films','pictures','about','contact'][i]]));
function cleanHtml(html = '') {
  const $ = load(`<div>${html}</div>`, null, false);
  $('script,style,iframe').remove();
  $('*').each((_, e) => {
    for (const attr of Object.keys(e.attribs || {})) if (!['href','target','rel'].includes(attr)) $(e).removeAttr(attr);
    if (!['div','p','br','a','strong','em','h2','h3','ul','ol','li','dl','dt','dd','span'].includes(e.tagName)) $(e).replaceWith($(e).contents());
  });
  $('a').each((_,e)=>{
    const href = $(e).attr('href');
    if (!href) return;
    const u = new URL(href, origin);
    if (u.origin === origin && routeMap.has(u.pathname)) $(e).attr('href', `${routeMap.get(u.pathname) ? routeMap.get(u.pathname) + '/' : './'}${u.hash}`);
    if (u.origin !== origin && /^https?:/.test(u.protocol)) $(e).attr('rel','noopener noreferrer');
  });
  return $('div').first().html()?.trim() || '';
}
async function copyLinks(html) {
  const $ = load(html, null, false);
  for (const e of $('a[href]').toArray()) {
    const href = $(e).attr('href');
    const u = new URL(href, origin);
    if (u.origin === origin && u.pathname.startsWith('/wp-content/')) {
      const a = await asset(href);
      $(e).attr('href', a.src);
    }
  }
  return $.html();
}
async function media($, scope) {
  const output = [];
  for (const e of $(scope).find('img').toArray()) {
    const url = $(e).attr('src') || $(e).attr('data-src');
    if (!url || /tribute-performance-300x200\.gif/.test(url)) continue;
    try { output.push({ type: 'image', alt: $(e).attr('alt') || 'Yoshi + Moshi', ...await asset(url) }); }
    catch (error) { warnings.push(`${url}: ${error.message}`); }
  }
  for (const e of $(scope).find('video').toArray()) {
    const url = $(e).attr('src') || $(e).attr('data-ym-full-src') || $(e).find('source').attr('src') || $(e).find('source').attr('data-ym-full-src');
    if (url) output.push({ type: 'video', ...await asset(url) });
  }
  return output;
}
function intro($, prefix) {
  return { kicker: $(`.${prefix}-kicker`).first().text().trim(), title: $(`.${prefix}-intro h1`).first().text().trim(), lede: $(`.${prefix}-lede`).first().html()?.replace(/<br\s*\/?>/g, ' ').trim() };
}
const data = { home: {}, news: {}, performances: {}, films: {}, pictures: {}, about: {}, contact: {} };
const theme = `${origin}/wp-content/themes/enfold-child/assets/`;
data.art = {};
for (const [key,file] of Object.entries({ yoshi:'yoshi-transparent-v2.png', moshi:'moshi-transparent-v2.png', logo:'logo-yoshi-moshi-sharp-v2.png', dripLeft:'header-drip-left-white-v6.png', dripRight:'header-drip-right-white-v6.png' })) data.art[key] = await asset(theme + file, { quality: 90 });
let $ = documents[1];
data.news = { ...intro($, 'ym-news'), panel: cleanHtml($('.ym-news-intro-panel').html()), entries: [] };
for (const section of $('.ym-news-feed > .avia-section').toArray()) {
  const copy = $(section).find('.avia_textblock').map((_,e)=>$(e).html()).get().join('\n');
  data.news.entries.push({ html: await copyLinks(cleanHtml(copy)), media: await media($, section) });
}
$ = documents[2];
data.performances = { ...intro($,'ym-performances'), panel:'', entries: [] };
const wrapper = $('.ym-performance-feed .entry-content-wrapper').first();
const nodes = (wrapper.length ? wrapper : $('.ym-performance-feed')).children().toArray();
let card;
for (const node of nodes) {
  const heading = $(node).find('h2').first();
  if (heading.length) {
    if (card) data.performances.entries.push(card);
    card = { title: heading.text().trim(), html: cleanHtml($(node).find('.avia_textblock').html() || ''), media: await media($, node) };
  } else if (!card && $(node).find('.avia_textblock').length) data.performances.panel = cleanHtml($(node).find('.avia_textblock').html());
  else if (card) card.media.push(...await media($, node));
}
if (card) data.performances.entries.push(card);
$ = documents[3];
data.films = { ...intro($,'ym-film'), panel:cleanHtml($('.ym-film-intro-panel').html()), entries:[] };
for (const e of $('.ym-film-card').toArray()) {
  const poster = $(e).find('img').attr('src');
  data.films.entries.push({ title:$(e).find('.ym-film-card__title').text().trim(), film:await asset($(e).attr('data-film-src')), poster:await asset(poster), loop:await asset(poster.replace('-poster.webp','-loop.mp4')) });
}
$ = documents[4];
data.pictures = { ...intro($,'ym-pictures'), panel:cleanHtml($('.ym-pictures-panel').html()), entries:[] };
for (const e of $('.ym-picture').toArray()) data.pictures.entries.push({ ...await asset($(e).attr('href')), alt:$(e).find('img').attr('alt') || 'Yoshi + Moshi' });
$ = documents[5];
data.about.lede = $('.ym-about-lede').text().trim();
data.about.panel = cleanHtml($('.ym-about-panel').html());
data.about.sections = [];
for (const e of $('.ym-about-section-title').toArray()) data.about.sections.push({ title:$(e).text().trim(), html: await copyLinks(cleanHtml($(e).next('.ym-about-timeline').prop('outerHTML'))) });
$ = documents[6];
data.contact.html = cleanHtml($('#main .avia_textblock').first().html());
data.contact.email = $('#main a[href^="mailto:"]').attr('href') || 'mailto:nina@ninastaehli.com';
data.contact.media = await media($, '#main');
// Self-host the exact font used by the source theme.
const uploads = path.join(wpRoot,'wp-content/uploads');
async function findFonts(dir) {
  const found = [];
  for (const e of await fs.readdir(dir,{withFileTypes:true})) {
    if (e.isDirectory() && /font/i.test(e.name)) found.push(...await scan(path.join(dir,e.name)));
  }
  return found;
}
async function scan(dir) {
  const a=[];
  for(const e of await fs.readdir(dir,{withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory()) a.push(...await scan(f)); else if(/\.(woff2?|ttf)$/i.test(e.name)&&/oswald/i.test(f))a.push(f); }
  return a;
}
const fonts = await findFonts(uploads);
for (const [i,f] of fonts.entries()) {
  const dest = `oswald-${i}${path.extname(f)}`;
  await fs.mkdir(path.join(root,'public/fonts'),{recursive:true});
  await fs.copyFile(f,path.join(root,'public/fonts',dest));
}
data.fonts = fonts.map((f,i)=>({src:`fonts/oswald-${i}${path.extname(f)}`,name:path.basename(f)}));
if(!data.fonts.length){
  const response=await fetch('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
  if(!response.ok)throw new Error('Could not fetch the Oswald font');
  const css=await response.text();
  const fontUrl=[...css.matchAll(/url\((https:[^)]+)\)/g)].at(-1)?.[1];
  if(!fontUrl)throw new Error('Oswald font URL not found');
  const ext=fontUrl.endsWith('.woff2')?'woff2':'ttf';
  await fs.mkdir(path.join(root,'public/fonts'),{recursive:true});
  const fontResponse=await fetch(fontUrl);if(!fontResponse.ok)throw new Error('Font download failed');
  await fs.writeFile(path.join(root,`public/fonts/oswald-variable.${ext}`),Buffer.from(await fontResponse.arrayBuffer()));
  const licenseResponse=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt');
  if(!licenseResponse.ok)throw new Error('Font license download failed');
  await fs.writeFile(path.join(root,'public/fonts/OFL.txt'),await licenseResponse.text());
  data.fonts=[{src:`fonts/oswald-variable.${ext}`,name:'Oswald variable 200–700'}];
}
await fs.writeFile(path.join(root,'content/site.json'),JSON.stringify(data,null,2)+'\n');
await fs.writeFile(path.join(root,'content/asset-manifest.json'),JSON.stringify(Object.fromEntries(manifest),null,2)+'\n');
// Remove only obsolete generated files from this migration's media directory.
const keep=new Set();
function collect(value){if(!value||typeof value!=='object')return;for(const [key,v] of Object.entries(value)){if(key==='src'&&typeof v==='string'&&v.startsWith('media/'))keep.add(path.basename(v));else collect(v);}}
collect(Object.fromEntries(manifest));
for(const f of await fs.readdir(path.join(root,'public/media')))if(!keep.has(f))await fs.unlink(path.join(root,'public/media',f));
console.log(JSON.stringify({ news:data.news.entries.length,performances:data.performances.entries.length,films:data.films.entries.length,pictures:data.pictures.entries.length,aboutSections:data.about.sections.length,assets:manifest.size,fonts:data.fonts,warnings },null,2));
