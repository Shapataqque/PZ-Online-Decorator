/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  const SPATIAL_CHUNK_SIZE=16;
  interface GLTex{tex:WebGLTexture;width:number;height:number;}
  interface CachedSegment{
    order:number;
    orderEnd:number;
    firstVertex:number;
    vertexCount:number;
    spriteCount:number;
    sourceId:string;
    ownerId:string;
    categoryMask:number;
    categoryCounts:number[];
    chunkKey:string;
    buffer:WebGLBuffer|null;
    diag:number;
    z:number;
  }
  interface ChunkCache{
    key:string;
    z:number;
    cx:number;
    cy:number;
    buffer:WebGLBuffer|null;
    segments:CachedSegment[];
    spriteCount:number;
    builtAt:number;
  }
  interface BuildCommand{
    a:AssetRef;
    x:number;
    y:number;
    order:number;
    diag:number;
    ownerId:string;
    category:ViewCategory;
    lift:number;
  }

  export class WebGLMapRenderer{
    gl:WebGL2RenderingContext;program:WebGLProgram;lp:number;lu:number;lc:number;
    ur:WebGLUniformLocation;up:WebGLUniformLocation;uz:WebGLUniformLocation;ut:WebGLUniformLocation;uts:WebGLUniformLocation;ua:WebGLUniformLocation;ufm:WebGLUniformLocation;
    textures=new Map<string,Promise<GLTex>>();resolved=new Map<string,GLTex>();quality:GraphicsQuality='high';nightMode=true;raf=0;
    hover:{x:number;y:number}|null=null;
    private placementGhost:PlacementGhostCell[]=[];
    private ghostBitmaps=new Map<string,ImageBitmap>();
    private chunkCache=new Map<string,ChunkCache>();
    private dirtyChunks=new Set<string>();
    private cachedBatchCount=0;
    private statsEnabled=false;
    private statsListener:((s:PerformanceStats)=>void)|null=null;
    private stats:PerformanceStats={fps:0,frameMs:0,visibleChunks:0,totalChunks:0,visibleSprites:0,drawCalls:0,activeTextures:0,cachedChunkBatches:0,dirtyChunks:0};
    private lastFrameAt=0;
    private smoothedFps=0;
    private chunkBuilds=0;
    private chunkRebuilds=0;
    private textureEpoch=0;

    constructor(
      public canvas:HTMLCanvasElement,
      public overlay:HTMLCanvasElement,
      public assets:AssetManager,
      public map:()=>PZMapModel,
      public camera:Camera,
      public classify:(name:string)=>ViewCategory,
      public categoryVisible:(category:ViewCategory)=>boolean,
      public surfaceInfo:(name:string)=>TileSurfaceInfo
    ){
      const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false});if(!gl)throw new Error('WebGL2 required');this.gl=gl;
      const vs=`#version 300 es\nprecision highp float;in vec2 a_pos;in vec2 a_uvpx;in float a_category;uniform vec2 u_res;uniform vec2 u_pan;uniform float u_zoom;uniform vec2 u_texSize;flat out int v_category;out vec2 v_uv;void main(){vec2 s=a_pos*u_zoom+u_pan;vec2 z=s/u_res;gl_Position=vec4(z.x*2.0-1.0,1.0-z.y*2.0,0,1);v_uv=a_uvpx/u_texSize;v_category=int(a_category+0.5);}`;
      const fs=`#version 300 es\nprecision mediump float;in vec2 v_uv;flat in int v_category;uniform sampler2D u_tex;uniform float u_alpha;uniform int u_filterMask;out vec4 o;void main(){if((u_filterMask&(1<<v_category))==0)discard;vec4 c=texture(u_tex,v_uv);o=vec4(c.rgb,c.a*u_alpha);}`;
      this.program=this.prog(vs,fs);this.lp=gl.getAttribLocation(this.program,'a_pos');this.lu=gl.getAttribLocation(this.program,'a_uvpx');this.lc=gl.getAttribLocation(this.program,'a_category');this.ur=gl.getUniformLocation(this.program,'u_res')!;this.up=gl.getUniformLocation(this.program,'u_pan')!;this.uz=gl.getUniformLocation(this.program,'u_zoom')!;this.ut=gl.getUniformLocation(this.program,'u_tex')!;this.uts=gl.getUniformLocation(this.program,'u_texSize')!;this.ua=gl.getUniformLocation(this.program,'u_alpha')!;this.ufm=gl.getUniformLocation(this.program,'u_filterMask')!;
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);this.resize();window.addEventListener('resize',()=>{this.resize();this.request();});
    }
    private shader(t:number,s:string){const x=this.gl.createShader(t)!;this.gl.shaderSource(x,s);this.gl.compileShader(x);if(!this.gl.getShaderParameter(x,this.gl.COMPILE_STATUS))throw new Error(this.gl.getShaderInfoLog(x)||'shader');return x;}
    private prog(v:string,f:string){const p=this.gl.createProgram()!;this.gl.attachShader(p,this.shader(this.gl.VERTEX_SHADER,v));this.gl.attachShader(p,this.shader(this.gl.FRAGMENT_SHADER,f));this.gl.linkProgram(p);if(!this.gl.getProgramParameter(p,this.gl.LINK_STATUS))throw new Error(this.gl.getProgramInfoLog(p)||'link');return p;}
    private qCanvas(){return this.quality==='low'?.55:this.quality==='medium'?.78:1;}private qTex(){return this.quality==='low'?.5:this.quality==='medium'?.75:1;}ratio(){return Math.max(.4,(devicePixelRatio||1)*this.qCanvas());}
    setQuality(q:GraphicsQuality){if(this.quality===q)return;this.quality=q;this.resetTextures();this.resize();this.request();}
    setNightMode(enabled:boolean){this.nightMode=enabled;this.request();}
    setPlacementGhost(cells:PlacementGhostCell[]){this.placementGhost=cells;for(const c of cells){const a=this.assets.asset(c.name);if(!a||this.ghostBitmaps.has(a.sourceId))continue;this.assets.bitmap(a.sourceId).then(b=>{this.ghostBitmaps.set(a.sourceId,b);this.request();}).catch(()=>{});}this.request();}
    clearPlacementGhost(){if(!this.placementGhost.length)return;this.placementGhost=[];this.request();}
    resetTextures(){this.textureEpoch++;for(const t of this.resolved.values())this.gl.deleteTexture(t.tex);this.textures.clear();this.resolved.clear();this.request();}
    assetsChanged(){this.ghostBitmaps.clear();this.resetTextures();this.invalidateAllGeometry();}
    resize(){const r=this.canvas.getBoundingClientRect(),q=this.ratio(),w=Math.max(1,Math.round(r.width*q)),h=Math.max(1,Math.round(r.height*q));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.overlay.width=w;this.overlay.height=h;}this.gl.viewport(0,0,w,h);}
    request(){if(this.raf)return;this.raf=requestAnimationFrame(()=>{this.raf=0;this.render();});}
    setPerformanceStats(enabled:boolean,listener?:((s:PerformanceStats)=>void)|null){this.statsEnabled=enabled;if(listener!==undefined)this.statsListener=listener??null;if(enabled)this.request();}
    performanceStats():PerformanceStats{return{...this.stats};}
    debugCounters(){return{chunkBuilds:this.chunkBuilds,chunkRebuilds:this.chunkRebuilds,cachedChunks:this.chunkCache.size,cachedBatches:this.cachedBatchCount,dirtyChunks:this.dirtyChunks.size};}
    displayScale(){return this.assets.dominantScale();}
    metrics(){const m=this.map(),s=this.displayScale();return{tw:m.tileWidth*s,th:m.tileHeight*s};}
    tileToWorld(x:number,y:number,z:number){const m=this.map(),{tw,th}=this.metrics(),max=m.maxLevel();return{x:(x-y)*tw/2+m.height*tw/2,y:(x+y)*th/2+m.cellsPerLevelY*(max-z)*th};}
    worldToTile(px:number,py:number,z:number){const m=this.map(),{tw,th}=this.metrics(),max=m.maxLevel();px-=m.height*tw/2;py-=m.cellsPerLevelY*(max-z)*th;const rr=tw/th;return{x:(py+px/rr)/th,y:(py-px/rr)/th};}
    screenToTile(sx:number,sy:number,z:number){const q=this.ratio(),w=this.worldToTile((sx*q-this.camera.panX)/this.camera.zoom,(sy*q-this.camera.panY)/this.camera.zoom,z);return{x:Math.floor(w.x),y:Math.floor(w.y)};}
    center(){const m=this.map(),{tw,th}=this.metrics(),worldW=(m.width+m.height)*tw/2,worldH=(m.width+m.height)*th/2+m.maxLevel()*m.cellsPerLevelY*th+th,q=this.ratio();this.camera.panX=(this.canvas.width-worldW*this.camera.zoom)/2;this.camera.panY=Math.max(20*q,(this.canvas.height-worldH*this.camera.zoom)/2);this.request();}

    private async texture(id:string):Promise<GLTex>{let p=this.textures.get(id);if(p)return p;const src=this.assets.sources.get(id);if(!src)throw new Error('Missing texture');const epoch=this.textureEpoch;p=this.assets.bitmap(id).then(async b=>{let upload:ImageBitmap=b,q=this.qTex();if(q<.999){try{upload=await createImageBitmap(b,{resizeWidth:Math.max(1,Math.round(b.width*q)),resizeHeight:Math.max(1,Math.round(b.height*q)),resizeQuality:'pixelated'});}catch{upload=b;}}const gl=this.gl,t=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);if(upload!==b)upload.close();const r={tex:t,width:b.width,height:b.height};if(epoch===this.textureEpoch){this.resolved.set(id,r);this.request();}else this.gl.deleteTexture(t);return r;});this.textures.set(id,p);return p;}
    private ensure(id:string){if(this.resolved.has(id))return;this.texture(id).catch(console.warn);}

    private chunkKey(z:number,cx:number,cy:number){return`${z}:${cx}:${cy}`;}
    invalidateCell(z:number,x:number,y:number){const cx=Math.floor(x/SPATIAL_CHUNK_SIZE),cy=Math.floor(y/SPATIAL_CHUNK_SIZE),k=this.chunkKey(z,cx,cy);this.dirtyChunks.add(k);this.request();}
    invalidateChanges(changes:EditChange[]){for(const ch of changes)this.invalidateCell(ch.kind==='base'?ch.z:(this.map().layers.find(l=>l.id===ch.layerId)?.level??this.map().currentLevel),ch.x,ch.y);}
    invalidateAllGeometry(){for(const c of this.chunkCache.values())if(c.buffer)this.gl.deleteBuffer(c.buffer);this.chunkCache.clear();this.dirtyChunks.clear();this.cachedBatchCount=0;this.request();}
    mapReplaced(){this.invalidateAllGeometry();}

    private tileBounds(z:number){const m=this.map(),q=this.ratio(),pts=[[0,0],[this.canvas.width/q,0],[0,this.canvas.height/q],[this.canvas.width/q,this.canvas.height/q]].map(([x,y])=>this.screenToTile(x,y,z)),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);return{minX:Math.max(0,Math.floor(Math.min(...xs))-2),maxX:Math.min(m.width-1,Math.ceil(Math.max(...xs))+2),minY:Math.max(0,Math.floor(Math.min(...ys))-2),maxY:Math.min(m.height-1,Math.ceil(Math.max(...ys))+2)};}
    private visibleChunkCoords(){const m=this.map(),cw=Math.ceil(m.width/SPATIAL_CHUNK_SIZE),ch=Math.ceil(m.height/SPATIAL_CHUNK_SIZE),out:Array<{z:number;cx:number;cy:number;key:string}>=[];for(const z of m.levels()){if(z>m.currentLevel)continue;const b=this.tileBounds(z),cx0=Math.max(0,Math.floor(b.minX/SPATIAL_CHUNK_SIZE)-1),cy0=Math.max(0,Math.floor(b.minY/SPATIAL_CHUNK_SIZE)-1),cx1=Math.min(cw-1,Math.floor(b.maxX/SPATIAL_CHUNK_SIZE)+1),cy1=Math.min(ch-1,Math.floor(b.maxY/SPATIAL_CHUNK_SIZE)+1);for(let cx=cx0;cx<=cx1;cx++)for(let cy=cy0;cy<=cy1;cy++)out.push({z,cx,cy,key:this.chunkKey(z,cx,cy)});}return out;}
    private totalChunkCount(){const m=this.map(),per=Math.ceil(m.width/SPATIAL_CHUNK_SIZE)*Math.ceil(m.height/SPATIAL_CHUNK_SIZE);return per*m.levels().length;}
    private order(z:number,x:number,y:number,local:number){return(z+20)*1e12+(x+y)*1e7+y*1e4+local;}
    private categoryIndex(c:ViewCategory){const i=VIEW_CATEGORIES.indexOf(c);return i<0?VIEW_CATEGORIES.length-1:i;}
    private filterMask(){let mask=0;for(let i=0;i<VIEW_CATEGORIES.length;i++)if(this.categoryVisible(VIEW_CATEGORIES[i]))mask|=(1<<i);return mask;}
    private allFilterMask(){return(1<<VIEW_CATEGORIES.length)-1;}
    private tabletopItem(name:string){const i=this.surfaceInfo(name),n=name.toLowerCase();if(i.isSurfaceOffset||i.isTableTop)return true;return /(television|(^|_)tv(_|$)|radio|computer|monitor|microwave|toaster|kettle|coffee_machine|coffeemaker|lamp|telephone|phone|clock|stereo|speaker|cash_?register|small_?appliance)/.test(n);}
    private supportHeight(name:string){const i=this.surfaceInfo(name),n=name.toLowerCase();if(this.tabletopItem(name))return 0;const explicit=Math.max(i.surface,i.itemHeight);if(explicit>0)return explicit;
      if(/(furniture_tables_high|table_high|counter|kitchen|island|workbench|desk|cabinet|dresser|vanity)/.test(n))return 32;
      if(/(furniture_tables_low|table_low|coffee_table|coffee_?table|side_?table|end_?table|nightstand)/.test(n))return 18;
      if(/(^|_)table(s)?(_|$)/.test(n)||n.includes('furniture_table'))return 26;
      return 0;}
    private advanceSurface(current:number,name:string){const h=this.supportHeight(name);return h>0?Math.max(current,h):current;}
    private supportSurfaceAt(z:number,x:number,y:number){const m=this.map();let h=0;for(const n of m.stack(z,x,y))h=this.advanceSurface(h,n);for(const l of m.layers){if(l.level!==z)continue;const n=l.get(x,y,m.width);if(n)h=this.advanceSurface(h,n);}return h;}
    private liftFor(name:string,support:number){return this.tabletopItem(name)&&support>0?support:0;}

    private buildChunk(z:number,cx:number,cy:number,key:string):ChunkCache{
      const m=this.map(),old=this.chunkCache.get(key);if(old?.buffer)this.gl.deleteBuffer(old.buffer);if(old)this.cachedBatchCount-=old.segments.length;
      const x0=cx*SPATIAL_CHUNK_SIZE,y0=cy*SPATIAL_CHUNK_SIZE,x1=Math.min(m.width,x0+SPATIAL_CHUNK_SIZE),y1=Math.min(m.height,y0+SPATIAL_CHUNK_SIZE),cmds:BuildCommand[]=[];
      const base=m.baseStacks.get(z);
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
        const k=m.key(x,y),stack=base?.get(k);if(stack)for(let i=0;i<stack.length;i++){const n=stack[i],a=this.assets.asset(n);if(!a)continue;cmds.push({a,x,y,order:this.order(z,x,y,i),diag:x+y,ownerId:'base',category:this.classify(n),lift:0});}
      }
      for(let li=0;li<m.layers.length;li++){
        const l=m.layers[li];if(l.level!==z)continue;
        for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
          const n=l.get(x,y,m.width);if(!n)continue;const a=this.assets.asset(n);if(!a)continue;cmds.push({a,x,y,order:this.order(z,x,y,1000+li),diag:x+y,ownerId:l.id,category:this.classify(n),lift:0});
        }
      }
      cmds.sort((a,b)=>a.order-b.order);
      const surfaces=new Map<number,number>();for(const d of cmds){const ck=m.key(d.x,d.y),support=surfaces.get(ck)??0;d.lift=this.liftFor(d.a.name,support);surfaces.set(ck,this.advanceSurface(support,d.a.name));}
      const floats:number[]=[],segments:CachedSegment[]=[];let seg:CachedSegment|null=null,vertexCursor=0;
      const {th}=this.metrics(),displayScale=this.displayScale();
      for(const d of cmds){
        const a=d.a,s=displayScale/(a.scale||1),fw=a.frameW*s,fh=a.frameH*s,p=this.tileToWorld(d.x,d.y,z),lift=d.lift*displayScale,left=p.x-fw/2+a.offsetX*s,top=p.y+th-fh+a.offsetY*s-lift,right=left+a.sw*s,bottom=top+a.sh*s,cat=this.categoryIndex(d.category),catBit=1<<cat;
        const same=seg&&seg.sourceId===a.sourceId&&seg.ownerId===d.ownerId&&seg.diag===d.diag;
        if(!same){seg={order:d.order,orderEnd:d.order,firstVertex:vertexCursor,vertexCount:0,spriteCount:0,sourceId:a.sourceId,ownerId:d.ownerId,categoryMask:0,categoryCounts:new Array(VIEW_CATEGORIES.length).fill(0),chunkKey:key,buffer:null,diag:d.diag,z};segments.push(seg);}
        seg!.orderEnd=d.order;seg!.categoryMask|=catBit;seg!.categoryCounts[cat]++;seg!.spriteCount++;seg!.vertexCount+=6;
        floats.push(left,top,a.sx,a.sy,cat,right,top,a.sx+a.sw,a.sy,cat,right,bottom,a.sx+a.sw,a.sy+a.sh,cat,left,top,a.sx,a.sy,cat,right,bottom,a.sx+a.sw,a.sy+a.sh,cat,left,bottom,a.sx,a.sy+a.sh,cat);vertexCursor+=6;
      }
      const buffer=floats.length?this.gl.createBuffer():null;if(buffer){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,buffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(floats),this.gl.STATIC_DRAW);}for(const s of segments)s.buffer=buffer;
      const cache={key,z,cx,cy,buffer,segments,spriteCount:cmds.length,builtAt:performance.now()};this.chunkCache.set(key,cache);this.dirtyChunks.delete(key);this.cachedBatchCount+=segments.length;this.chunkBuilds++;if(old)this.chunkRebuilds++;return cache;
    }
    private getChunk(z:number,cx:number,cy:number,key:string){const c=this.chunkCache.get(key);return!c||this.dirtyChunks.has(key)?this.buildChunk(z,cx,cy,key):c;}
    private ownerState(ownerId:string,layers:Map<string,UserLayerModel>){const m=this.map();if(ownerId==='base')return{visible:m.baseVisible,alpha:m.baseOpacity};const l=layers.get(ownerId);return l?{visible:l.visible,alpha:l.opacity}:{visible:false,alpha:0};}

    render(){
      const started=performance.now();this.resize();const now=started;if(this.lastFrameAt){const inst=1000/Math.max(.1,now-this.lastFrameAt);this.smoothedFps=this.smoothedFps?this.smoothedFps*.85+inst*.15:inst;}this.lastFrameAt=now;
      const gl=this.gl,m=this.map();if(this.nightMode)gl.clearColor(.065,.075,.082,1);else gl.clearColor(.91,.93,.945,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.uniform2f(this.ur,this.canvas.width,this.canvas.height);gl.uniform2f(this.up,this.camera.panX,this.camera.panY);gl.uniform1f(this.uz,this.camera.zoom);gl.uniform1i(this.ut,0);
      const mask=this.filterMask(),allMask=this.allFilterMask();
      const chunks=this.visibleChunkCoords(),segments:CachedSegment[]=[],layerMap=new Map(m.layers.map(l=>[l.id,l]));
      let visibleSprites=0;
      for(const q of chunks){const c=this.getChunk(q.z,q.cx,q.cy,q.key);for(const s of c.segments){const owner=this.ownerState(s.ownerId,layerMap),segmentMask=s.z===m.currentLevel?mask:allMask;if(!owner.visible||owner.alpha<=.001||(s.categoryMask&segmentMask)===0)continue;let count=0;for(let i=0;i<VIEW_CATEGORIES.length;i++)if(segmentMask&(1<<i))count+=s.categoryCounts[i];if(!count)continue;visibleSprites+=count;segments.push(s);}}
      segments.sort((a,b)=>a.order-b.order);
      let drawCalls=0,lastBuffer:WebGLBuffer|null=null,lastTexture:WebGLTexture|null=null,lastMask=-1;
      const stride=5*4;gl.enableVertexAttribArray(this.lp);gl.enableVertexAttribArray(this.lu);gl.enableVertexAttribArray(this.lc);
      for(const s of segments){const tex=this.resolved.get(s.sourceId);if(!tex){this.ensure(s.sourceId);continue;}const owner=this.ownerState(s.ownerId,layerMap);if(!owner.visible||owner.alpha<=.001)continue;const segmentMask=s.z===m.currentLevel?mask:allMask;if(segmentMask!==lastMask){gl.uniform1i(this.ufm,segmentMask);lastMask=segmentMask;}if(s.buffer!==lastBuffer){gl.bindBuffer(gl.ARRAY_BUFFER,s.buffer);gl.vertexAttribPointer(this.lp,2,gl.FLOAT,false,stride,0);gl.vertexAttribPointer(this.lu,2,gl.FLOAT,false,stride,8);gl.vertexAttribPointer(this.lc,1,gl.FLOAT,false,stride,16);lastBuffer=s.buffer;}if(tex.tex!==lastTexture){gl.bindTexture(gl.TEXTURE_2D,tex.tex);gl.uniform2f(this.uts,tex.width,tex.height);lastTexture=tex.tex;}gl.uniform1f(this.ua,owner.alpha);gl.drawArrays(gl.TRIANGLES,s.firstVertex,s.vertexCount);drawCalls++;}
      this.grid();const ended=performance.now();this.stats={fps:this.smoothedFps,frameMs:ended-started,visibleChunks:chunks.length,totalChunks:this.totalChunkCount(),visibleSprites,drawCalls,activeTextures:this.resolved.size,cachedChunkBatches:this.cachedBatchCount,dirtyChunks:this.dirtyChunks.size};if(this.statsEnabled&&this.statsListener)this.statsListener({...this.stats});if(this.statsEnabled)this.request();
    }
    grid(){
      const c=this.overlay.getContext('2d')!,m=this.map(),{tw,th}=this.metrics(),b=this.tileBounds(m.currentLevel),displayScale=this.displayScale();
      c.clearRect(0,0,this.overlay.width,this.overlay.height);c.save();c.setTransform(this.camera.zoom,0,0,this.camera.zoom,this.camera.panX,this.camera.panY);c.strokeStyle=this.nightMode?'rgba(190,210,220,.20)':'rgba(45,65,75,.20)';c.lineWidth=1/this.camera.zoom;c.beginPath();
      for(let y=b.minY;y<=b.maxY+1;y++){const a=this.tileToWorld(b.minX,y,m.currentLevel),d=this.tileToWorld(b.maxX+1,y,m.currentLevel);c.moveTo(a.x,a.y);c.lineTo(d.x,d.y);}
      for(let x=b.minX;x<=b.maxX+1;x++){const a=this.tileToWorld(x,b.minY,m.currentLevel),d=this.tileToWorld(x,b.maxY+1,m.currentLevel);c.moveTo(a.x,a.y);c.lineTo(d.x,d.y);}c.stroke();
      if(this.hover){const p=this.tileToWorld(this.hover.x,this.hover.y,m.currentLevel);c.fillStyle='rgba(60,165,255,.14)';c.strokeStyle='rgba(80,190,255,.9)';c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+tw/2,p.y+th/2);c.lineTo(p.x,p.y+th);c.lineTo(p.x-tw/2,p.y+th/2);c.closePath();c.fill();c.stroke();}
      c.imageSmoothingEnabled=false;for(const g of this.placementGhost){const a=this.assets.asset(g.name);if(!a)continue;const bm=this.ghostBitmaps.get(a.sourceId);if(!bm)continue;const s=displayScale/(a.scale||1),fw=a.frameW*s,fh=a.frameH*s,p=this.tileToWorld(g.x,g.y,g.z),support=this.supportSurfaceAt(g.z,g.x,g.y),lift=this.liftFor(g.name,support)*displayScale,left=p.x-fw/2+a.offsetX*s,top=p.y+th-fh+a.offsetY*s-lift;c.globalAlpha=g.valid?.46:.22;c.drawImage(bm,a.sx,a.sy,a.sw,a.sh,left,top,a.sw*s,a.sh*s);if(!g.valid){c.globalAlpha=.9;c.strokeStyle='rgba(255,95,85,.95)';c.lineWidth=2/this.camera.zoom;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+tw/2,p.y+th/2);c.lineTo(p.x,p.y+th);c.lineTo(p.x-tw/2,p.y+th/2);c.closePath();c.stroke();}}c.globalAlpha=1;c.restore();
    }
  }
}
