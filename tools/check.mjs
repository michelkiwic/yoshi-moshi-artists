import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'dist');
const data=JSON.parse(await fs.readFile(path.join(root,'content/site.json'),'utf8'));
const routes=['','news','performances','films','pictures','about','contact'];
const errors=[];
let checked=0;
for(const route of routes){
  const dir=path.join(dist,route);
  const html=await fs.readFile(path.join(dir,'index.html'),'utf8');
  const $=load(html);
  if($('h1').length!==1)errors.push(`${route||'home'}: expected exactly one h1`);
  if(!$('meta[name="description"]').attr('content'))errors.push(`${route}: missing description`);
  if(/wp-content|wp-includes|jquery|yoshi-moshi-local\.local/i.test(html))errors.push(`${route}: contains a WordPress/local source dependency`);
  const refs=[];
  for(const attr of ['src','href','poster','data-film','data-loop','data-src']) $(`[${attr}]`).each((_,e)=>refs.push($(e).attr(attr)));
  $('[srcset]').each((_,e)=>refs.push(...$(e).attr('srcset').split(',').map(s=>s.trim().split(/\s+/)[0])));
  for(const ref of refs){
    if(!ref||/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(ref))continue;
    let file=path.resolve(dir,decodeURIComponent(ref.split(/[?#]/)[0]));
    if(file!==dist&&!file.startsWith(dist+path.sep)){errors.push(`${route}: path outside build: ${ref}`);continue;}
    const stat=await fs.stat(file).catch(()=>null);
    if(!stat)errors.push(`${route}: missing ${ref}`);
    if(stat?.isDirectory()&&!await fs.stat(path.join(file,'index.html')).catch(()=>null))errors.push(`${route}: missing index in ${ref}`);
    checked++;
  }
  if(route==='pictures'&&$('[data-gallery]').length!==data.pictures.entries.length)errors.push('Gallery count does not match imported content');
  if(route==='films'&&$('[data-film]').length!==data.films.entries.length)errors.push('Film count does not match imported content');
  if(route==='news'&&$('.news-entry').length!==data.news.entries.length)errors.push('News count does not match imported content');
  if(route==='performances'&&$('.performance-card').length!==data.performances.entries.length)errors.push('Performance count does not match imported content');
}
if(!data.performances.entries.length)errors.push('No performances imported');
async function walk(dir){let result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())result.push(...await walk(f));else result.push({path:f,size:(await fs.stat(f)).size});}return result;}
const files=await walk(dist);
for(const f of files)if(f.size>=100*1024*1024)errors.push(`File exceeds GitHub limit: ${path.relative(dist,f.path)}`);
const sourceFiles=files.filter(f=>/\.(html|css|js)$/.test(f.path));
console.log(`${routes.length} pages, ${checked} local references checked, ${files.length} files, ${(files.reduce((n,f)=>n+f.size,0)/1024/1024).toFixed(1)} MiB total.`);
console.log(`HTML/CSS/JS: ${(sourceFiles.reduce((n,f)=>n+f.size,0)/1024).toFixed(1)} KiB across the entire site.`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('All local assets, page links and content counts are valid.');
