import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
async function files(dir){
  const result=[];
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())result.push(...await files(file));
    else if(/\.(jpe?g|png|webp)$/i.test(entry.name))result.push(file);
  }
  return result;
}
const originals=(await files(path.resolve(process.argv[2]))).sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
if(!originals.length)throw new Error('No images found');
const entries=[];
for(const file of originals){
  const normalized=await sharp(file).rotate().toBuffer();
  const metadata=await sharp(normalized).metadata();
  const stem=path.basename(file,path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const widths=[...new Set([360,720,1200,Math.min(metadata.width,1920)].filter(w=>w<=metadata.width))].sort((a,b)=>a-b);
  const variants=[];
  for(const width of widths){
    const src=`media/gallery-new-${stem}-${width}.webp`;
    const result=await sharp(normalized).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,'public',src));
    variants.push({src,width,bytes:result.size});
  }
  const full=variants.at(-1);
  entries.push({src:full.src,width:full.width,height:Math.round(metadata.height*full.width/metadata.width),variants,originalBytes:(await fs.stat(file)).size,alt:'Yoshi + Moshi — photograph '+(entries.length+1)});
}
console.log(JSON.stringify(entries,null,2));
