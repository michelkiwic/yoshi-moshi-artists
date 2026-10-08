import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..',process.argv[2]||'dist');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{
  try{
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+name);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    let info=await fs.stat(file).catch(()=>null);
    if(info?.isDirectory()){file=path.join(file,'index.html');info=await fs.stat(file).catch(()=>null);}
    if(!info){res.writeHead(404,{'Content-Type':'text/html'});return res.end(await fs.readFile(path.join(root,'404.html')));}
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),info.size-1):info.size-1;if(start> end){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}const h=await fs.open(file);const buf=Buffer.alloc(end-start+1);await h.read(buf,0,buf.length,start);await h.close();res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':buf.length});return res.end(buf);}
    res.writeHead(200,{...headers,'Content-Length':info.size});if(req.method==='HEAD')return res.end();res.end(await fs.readFile(file));
  }catch(error){res.writeHead(500);res.end('Could not serve this file.');console.error(error.message);}
}).listen(port,'127.0.0.1',()=>console.log(`Yoshi + Moshi preview: http://127.0.0.1:${port}`));
