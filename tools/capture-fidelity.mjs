import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const source=process.env.SOURCE_DIRECTORY;
if(!source)throw new Error('Set SOURCE_DIRECTORY to the reference WordPress public directory.');
const data=JSON.parse(await fs.readFile(path.join(root,'content/site.json'),'utf8'));
const css=await (await fetch('https://fonts.googleapis.com/css?family=Oswald&display=auto',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}})).text();
const fontUrl=[...css.matchAll(/url\((https:[^)]+)\)/g)].at(-1)?.[1];
if(!fontUrl)throw new Error('Reference font URL unavailable');
const font=await fetch(fontUrl);if(!font.ok)throw new Error('Reference font download failed');
await fs.writeFile(path.join(root,'public/fonts/oswald-reference-regular.woff2'),Buffer.from(await font.arrayBuffer()));
data.fonts=[{src:'fonts/oswald-reference-regular.woff2',name:'Oswald Regular — matching the WordPress Google Fonts request',weight:400}];
for(const [key,file] of Object.entries({yoshi:'yoshi-transparent-v2.png',moshi:'moshi-transparent-v2.png',logo:'logo-yoshi-moshi-sharp-v2.png',dripLeft:'header-drip-left-white-v6.png',dripRight:'header-drip-right-white-v6.png'})){
  const input=sharp(path.join(source,'wp-content/themes/enfold-child/assets',file));
  const meta=await input.metadata();
  const dest=`media/reference-${key}.webp`;
  await input.webp({lossless:true,effort:6}).toFile(path.join(root,'public',dest));
  data.art[key]={src:dest,width:meta.width,height:meta.height};
}
data.films.lede='Short films, live moments and moving<br>images.';
data.pictures.lede='A few moments standing still. Yoshi + Moshi<br>rarely do.';
await fs.writeFile(path.join(root,'content/site.json'),JSON.stringify(data,null,2)+'\n');
console.log('Reference regular font, lossless artwork and original line breaks captured.');
