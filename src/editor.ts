/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  export class EditorController{
    tool:ToolName='pencil';
    selectedAsset:string|null=null;
    selectedFurniture:FurnitureDef|null=null;
    furnitureOrient='N';
    placementHeight=0;
    isDown=false;
    pan=false;
    last={x:0,y:0};
    rectStart:{x:number;y:number}|null=null;
    changes=new Map<string,EditChange>();
    private strokeCells=new Set<string>();private strokeId=0;
    onStatus:(s:string)=>void=()=>{};
    onChanged:()=>void=()=>{};
    onSelection:()=>void=()=>{};
    onPickCandidates:(items:PickCandidate[],p:{x:number;y:number})=>void=()=>{};
    onDebugLog:(entry:Record<string,unknown>)=>void=()=>{};

    constructor(
      public renderer:WebGLMapRenderer,
      public map:()=>PZMapModel,
      public catalog:CatalogManager,
      public classifier:(n:string)=>ViewCategory,
      public visible:(n:string)=>boolean,
      public history:History
    ){this.bind();}

    setTool(t:ToolName){this.tool=t;this.refreshPlacementGhost();this.onSelection();}
    setPlacementHeight(height:number){this.placementHeight=Math.max(0,Math.min(128,Math.round(Number(height)||0)));this.refreshPlacementGhost();this.onSelection();}
    selectAsset(n:string){this.selectedAsset=n;this.selectedFurniture=null;this.tool='pencil';this.placementHeight=0;this.refreshPlacementGhost();this.onSelection();}
    selectFurniture(d:FurnitureDef){this.selectedFurniture=d;this.selectedAsset=null;this.tool='furniture';this.placementHeight=0;this.furnitureOrient=d.entries.find(e=>e.orient==='N')?.orient??d.entries[0]?.orient??'N';this.refreshPlacementGhost();this.onSelection();}
    rotateFurniture(delta=1){const d=this.selectedFurniture;if(!d)return;const a=d.entries.map(e=>e.orient),i=Math.max(0,a.indexOf(this.furnitureOrient));this.furnitureOrient=a[(i+delta+a.length)%a.length];this.refreshPlacementGhost();this.onSelection();}
    refreshPlacementGhost(){const p=this.renderer.hover;if(p)this.updatePlacementGhost(p);else this.renderer.clearPlacementGhost();}

    private bind(){
      const c=this.renderer.overlay;
      c.tabIndex=0;
      c.addEventListener('contextmenu',e=>e.preventDefault());
      c.addEventListener('pointerdown',e=>this.down(e));
      c.addEventListener('pointermove',e=>this.move(e));
      c.addEventListener('pointerup',e=>this.up(e));
      c.addEventListener('pointercancel',e=>this.up(e));
      c.addEventListener('pointerleave',()=>{if(!this.isDown){this.renderer.hover=null;this.renderer.clearPlacementGhost();this.renderer.request();}});
      c.addEventListener('wheel',e=>this.wheel(e),{passive:false});
      window.addEventListener('keydown',e=>this.key(e));
    }
    private point(e:PointerEvent){const r=this.renderer.overlay.getBoundingClientRect();return this.renderer.screenToTile(e.clientX-r.left,e.clientY-r.top,this.map().currentLevel);}
    private valid(p:{x:number;y:number}){const m=this.map();return p.x>=0&&p.y>=0&&p.x<m.width&&p.y<m.height;}

    private down(e:PointerEvent){
      this.renderer.overlay.focus();this.isDown=true;this.last={x:e.clientX,y:e.clientY};this.pan=this.tool==='pan'||e.button===1||e.button===2||e.shiftKey;this.changes.clear();this.strokeCells.clear();this.strokeId++;this.renderer.overlay.setPointerCapture(e.pointerId);if(this.pan)return;
      const p=this.point(e);if(!this.valid(p))return;
      if(this.tool==='picker'){this.pick(p);return;}
      if(this.tool==='rect'){this.rectStart=p;this.updatePlacementGhost(p);return;}
      if(this.selectedFurniture&&(this.tool==='furniture'||this.tool==='pencil')){this.placeFurniture(p);this.commit();this.updatePlacementGhost(p);return;}
      this.paint(p);
    }
    private move(e:PointerEvent){
      const p=this.point(e);this.renderer.hover=this.valid(p)?p:null;this.updatePlacementGhost(p);this.renderer.request();if(!this.isDown)return;
      if(this.pan){const q=this.renderer.ratio();this.renderer.camera.panX+=(e.clientX-this.last.x)*q;this.renderer.camera.panY+=(e.clientY-this.last.y)*q;this.last={x:e.clientX,y:e.clientY};this.renderer.request();return;}
      if(this.tool==='pencil'||this.tool==='eraser')if(this.valid(p))this.paint(p);
    }
    private up(e:PointerEvent){if(!this.isDown)return;this.isDown=false;if(this.pan){this.pan=false;return;}if(this.tool==='rect'&&this.rectStart){const p=this.point(e);if(this.valid(p))this.rect(this.rectStart,p);this.rectStart=null;this.updatePlacementGhost(p);}this.commit();}
    private wheel(e:WheelEvent){e.preventDefault();const r=this.renderer.overlay.getBoundingClientRect(),q=this.renderer.ratio(),sx=(e.clientX-r.left)*q,sy=(e.clientY-r.top)*q,old=this.renderer.camera.zoom,n=Math.max(.12,Math.min(5,old*Math.exp(-e.deltaY*.0015))),wx=(sx-this.renderer.camera.panX)/old,wy=(sy-this.renderer.camera.panY)/old;this.renderer.camera.zoom=n;this.renderer.camera.panX=sx-wx*n;this.renderer.camera.panY=sy-wy*n;this.renderer.request();}
    private key(e:KeyboardEvent){const t=e.target as HTMLElement|null,typing=!!t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);if(typing)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?this.redo():this.undo();return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();this.redo();return;}if(e.key.toLowerCase()==='r'&&this.selectedFurniture){e.preventDefault();this.rotateFurniture(e.shiftKey?-1:1);return;}if((e.key==='+'||e.code==='NumpadAdd')&&(this.selectedAsset||this.selectedFurniture)){e.preventDefault();this.setPlacementHeight(this.placementHeight+1);this.onStatus(`Placement height H${this.placementHeight}.`);return;}if((e.key==='-'||e.code==='NumpadSubtract')&&(this.selectedAsset||this.selectedFurniture)){e.preventDefault();this.setPlacementHeight(this.placementHeight-1);this.onStatus(`Placement height H${this.placementHeight}.`);return;}const k:{[k:string]:ToolName}={'1':'pencil','2':'eraser','3':'rect','4':'picker','5':'pan'};if(k[e.key])this.setTool(k[e.key]);}

    private updatePlacementGhost(p:{x:number;y:number}){
      const m=this.map();
      if((this.tool==='furniture'||this.tool==='pencil')&&this.selectedFurniture){const e=this.catalog.entry(this.selectedFurniture,this.furnitureOrient);if(!e){this.renderer.clearPlacementGhost();return;}const cells:PlacementGhostCell[]=e.cells.map(([dx,dy,name])=>{const x=p.x+dx,y=p.y+dy;return{x,y,z:m.currentLevel,name,valid:x>=0&&y>=0&&x<m.width&&y<m.height&&!!this.catalog.assets.asset(name),height:this.placementHeight};});this.renderer.setPlacementGhost(cells);return;}
      if(this.tool==='rect'&&this.selectedAsset){const a=this.rectStart??p,x0=Math.min(a.x,p.x),x1=Math.max(a.x,p.x),y0=Math.min(a.y,p.y),y1=Math.max(a.y,p.y),cells:PlacementGhostCell[]=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)cells.push({x,y,z:m.currentLevel,name:this.selectedAsset,valid:x>=0&&y>=0&&x<m.width&&y<m.height&&!!this.catalog.assets.asset(this.selectedAsset),height:this.placementHeight});this.renderer.setPlacementGhost(cells);return;}
      if(this.tool==='pencil'&&this.selectedAsset){this.renderer.setPlacementGhost([{x:p.x,y:p.y,z:m.currentLevel,name:this.selectedAsset,valid:this.valid(p)&&!!this.catalog.assets.asset(this.selectedAsset),height:this.placementHeight}]);return;}
      this.renderer.clearPlacementGhost();
    }

    private layerChange(l:UserLayerModel,x:number,y:number,after:string|null,afterHeight=0){const m=this.map(),before=l.get(x,y,m.width),beforeHeight=l.placementHeight(x,y,m.width),key=`L:${l.id}:${x}:${y}`,old=this.changes.get(key) as LayerCellChange|undefined,h=Math.max(0,Math.min(128,Math.round(Number(afterHeight)||0)));if(old){old.after=after;old.afterHeight=h;}else this.changes.set(key,{kind:'layer',layerId:l.id,x,y,before,after,beforeHeight,afterHeight:h});l.set(x,y,m.width,after);if(after)l.setPlacementHeight(x,y,m.width,h);this.renderer.invalidateCell(l.level,x,y);}
    private baseChange(z:number,x:number,y:number,after:string[]){const m=this.map(),before=[...m.stack(z,x,y)],key=`B:${z}:${x}:${y}`,old=this.changes.get(key) as BaseStackChange|undefined;if(old)old.after=[...after];else this.changes.set(key,{kind:'base',z,x,y,before,after:[...after]});m.setStack(z,x,y,after);this.renderer.invalidateCell(z,x,y);}
    private paint(p:{x:number;y:number},notify=true){const m=this.map(),strokeKey=`${m.currentLevel}:${p.x}:${p.y}`;if((this.tool==='pencil'||this.tool==='eraser')&&this.strokeCells.has(strokeKey))return;if(this.tool==='pencil'||this.tool==='eraser')this.strokeCells.add(strokeKey);
      if(this.tool==='eraser'){let removed=false;for(let i=m.layers.length-1;i>=0;i--){const l=m.layers[i];if(l.level!==m.currentLevel)continue;const before=l.get(p.x,p.y,m.width);if(before&&this.visible(before)){this.layerChange(l,p.x,p.y,null,0);this.onDebugLog({type:'erase',strokeId:this.strokeId,target:l.id,layer:l.name,z:l.level,x:p.x,y:p.y,removed:before,before,after:null,time:new Date().toISOString()});removed=true;break;}}if(!removed){const before=[...m.stack(m.currentLevel,p.x,p.y)],s=[...before];let removedName:string|null=null;for(let i=s.length-1;i>=0;i--)if(this.visible(s[i])){removedName=s[i];s.splice(i,1);break;}if(removedName){this.baseChange(m.currentLevel,p.x,p.y,s);this.onDebugLog({type:'erase',strokeId:this.strokeId,target:'base',z:m.currentLevel,x:p.x,y:p.y,removed:removedName,before,after:[...s],time:new Date().toISOString()});}}}
      else if(this.selectedAsset){const already=m.layers.some(l=>l.level===m.currentLevel&&l.get(p.x,p.y,m.width)===this.selectedAsset)||m.stack(m.currentLevel,p.x,p.y).includes(this.selectedAsset);if(!already){const cat=this.classifier(this.selectedAsset),target=m.findStackLayer(cat,m.currentLevel,[p],true,true);if(target)this.layerChange(target,p.x,p.y,this.selectedAsset,this.placementHeight);}}if(notify){this.renderer.request();this.onChanged();}}
    private rect(a:{x:number;y:number},b:{x:number;y:number}){if(!this.selectedAsset)return;const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)this.paint({x,y},false);this.renderer.request();this.onChanged();}

    private pick(p:{x:number;y:number}){
      const m=this.map(),items:PickCandidate[]=[];
      for(let i=m.layers.length-1;i>=0;i--){const l=m.layers[i];if(l.level!==m.currentLevel)continue;const n=l.get(p.x,p.y,m.width);if(n&&this.visible(n))items.push({name:n,targetId:l.id,sourceLabel:l.name,category:this.classifier(n),z:m.currentLevel,x:p.x,y:p.y,placementHeight:l.placementHeight(p.x,p.y,m.width)});}
      if(m.baseVisible&&m.baseOpacity>.001){const s=m.stack(m.currentLevel,p.x,p.y);for(let i=s.length-1;i>=0;i--)if(this.visible(s[i]))items.push({name:s[i],targetId:'base',sourceLabel:`Imported Base · stack ${i+1}`,category:this.classifier(s[i]),z:m.currentLevel,x:p.x,y:p.y,placementHeight:0});}
      if(!items.length){this.onStatus('Nothing visible to pick on this cell.');return;}
      if(items.length===1){const matches=this.catalog.matchesTile(items[0].name,false);if(matches.length===1){this.applyPickFurniture(matches[0],items[0]);return;}if(!matches.length){this.applyPickCandidate(items[0]);return;}}
      this.onPickCandidates(items,p);
    }
    applyPickCandidate(c:PickCandidate){this.selectedAsset=c.name;this.selectedFurniture=null;this.tool='pencil';this.placementHeight=0;this.refreshPlacementGhost();this.onStatus(`Picked ${c.name} from ${c.sourceLabel}. New placements start at H0.`);this.onSelection();}
    applyPickFurniture(match:FurnitureTileMatch,c:PickCandidate){this.selectedFurniture=match.def;this.selectedAsset=null;this.tool='furniture';this.placementHeight=0;this.furnitureOrient=match.orient;this.refreshPlacementGhost();const appearance=Math.max(0,match.def.entries.findIndex(e=>e.orient===match.orient))+1;this.onStatus(`Picked furniture ${match.group.label} · #${match.def.index} (appearance ${appearance}). New placements start at H0.`);this.onSelection();}

    private placeFurniture(p:{x:number;y:number}){
      const d=this.selectedFurniture,e=d?this.catalog.entry(d,this.furnitureOrient):null;if(!d||!e)return;const m=this.map(),cells:Array<{x:number;y:number;name:string}>=[];let missing=0,outside=0;
      for(const [dx,dy,n] of e.cells){const x=p.x+dx,y=p.y+dy;if(x<0||y<0||x>=m.width||y>=m.height){outside++;continue;}if(!this.catalog.assets.asset(n)){missing++;continue;}cells.push({x,y,name:n});}
      if(outside){this.onStatus('Furniture does not fit inside the current map area.');return;}
      if(!cells.length){this.onStatus('Furniture assets are not available.');return;}
      const target=m.findStackLayer('Furniture',m.currentLevel,cells,true,true)!;for(const c of cells)this.layerChange(target,c.x,c.y,c.name,this.placementHeight);this.onStatus(`${cells.length} furniture tile(s) placed${missing?` · ${missing} missing`:''}.`);this.renderer.request();this.onChanged();
    }
    private commit(){const c=[...this.changes.values()];this.changes.clear();this.history.push(c);if(c.length)this.onDebugLog({type:'commit',strokeId:this.strokeId,tool:this.tool,changes:c.length,time:new Date().toISOString()});}
    undo(){const c=this.history.undo(this.map());if(c){this.renderer.invalidateChanges(c);this.renderer.request();this.onChanged();}}
    redo(){const c=this.history.redo(this.map());if(c){this.renderer.invalidateChanges(c);this.renderer.request();this.onChanged();}}
  }
}
