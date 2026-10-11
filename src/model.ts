/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  let nextId=1; const uid=(p:string)=>`${p}-${nextId++}`;
  export class UserLayerModel{
    id=uid('layer');name:string;level:number;visible=true;opacity=1;locked=false;category:ViewCategory|'Custom';cells=new Map<number,string>();placementHeights=new Map<number,number>();
    constructor(name:string,level:number,category:ViewCategory|'Custom'='Custom'){this.name=name;this.level=level;this.category=category;}
    get(x:number,y:number,w:number):string|null{return this.cells.get(y*w+x)??null;}
    set(x:number,y:number,w:number,v:string|null):void{const k=y*w+x;if(v)this.cells.set(k,v);else{this.cells.delete(k);this.placementHeights.delete(k);}}
    placementHeight(x:number,y:number,w:number):number{return this.placementHeights.get(y*w+x)??0;}
    setPlacementHeight(x:number,y:number,w:number,height=0):void{const k=y*w+x,h=Math.max(0,Math.min(512,Math.round(Number(height)||0)));if(h===0)this.placementHeights.delete(k);else this.placementHeights.set(k,h);}
  }
  export class PZMapModel{
    width=64;height=64;tileWidth=64;tileHeight=32;cellsPerLevelY=3;currentLevel=0;properties:Record<string,string>={};
    baseVisible=true;baseOpacity=1;baseLocked=false;baseStacks=new Map<number,Map<number,string[]>>();layers:UserLayerModel[]=[];activeTarget='base';
    constructor(w=64,h=64){this.width=w;this.height=h;}
    key(x:number,y:number):number{return y*this.width+x;}
    stack(z:number,x:number,y:number,create=false):string[]{let lev=this.baseStacks.get(z);if(!lev&&create){lev=new Map();this.baseStacks.set(z,lev);}const k=this.key(x,y);let s=lev?.get(k);if(!s&&create){s=[];lev!.set(k,s);}return s??[];}
    setStack(z:number,x:number,y:number,v:string[]):void{let lev=this.baseStacks.get(z);if(!lev){lev=new Map();this.baseStacks.set(z,lev);}const k=this.key(x,y);if(v.length)lev.set(k,[...v]);else lev.delete(k);}
    levels():number[]{const s=new Set<number>([0,...this.baseStacks.keys(),...this.layers.map(l=>l.level)]);return [...s].sort((a,b)=>a-b);}
    maxLevel():number{return Math.max(0,...this.levels());}
    minLevel():number{return Math.min(0,...this.levels());}
    activeLayer():UserLayerModel|null{return this.layers.find(l=>l.id===this.activeTarget)??null;}
    addLayer(name:string,level=this.currentLevel,category:ViewCategory|'Custom'='Custom'):UserLayerModel{const l=new UserLayerModel(name,level,category);this.layers.push(l);return l;}
    deleteLayer(id:string):void{this.layers=this.layers.filter(l=>l.id!==id);if(this.activeTarget===id)this.activeTarget='base';}
    moveLayer(id:string,d:number):void{const i=this.layers.findIndex(l=>l.id===id);if(i<0)return;const j=Math.max(0,Math.min(this.layers.length-1,i+d));const [x]=this.layers.splice(i,1);this.layers.splice(j,0,x);}
    findStackLayer(category:ViewCategory,level:number,cells:Array<{x:number;y:number}>,create=true,preferTop=false):UserLayerModel|null{const candidates=this.layers.filter(l=>l.level===level&&l.category===category),ordered=preferTop?[...candidates].reverse():candidates;for(const l of ordered)if(cells.every(c=>!l.get(c.x,c.y,this.width)))return l;if(!create)return null;let n=1;let name:string=category;while(this.layers.some(l=>l.level===level&&l.name===name)){n++;name=`${category} ${n}`;}return this.addLayer(name,level,category);}
    toJSON():any{return{format:'PZOnlineDecorationTool',version:4,width:this.width,height:this.height,tileWidth:this.tileWidth,tileHeight:this.tileHeight,cellsPerLevelY:this.cellsPerLevelY,currentLevel:this.currentLevel,properties:this.properties,baseVisible:this.baseVisible,baseOpacity:this.baseOpacity,baseLocked:this.baseLocked,activeTarget:this.activeTarget,baseStacks:[...this.baseStacks].map(([z,m])=>[z,[...m]]),layers:this.layers.map(l=>({id:l.id,name:l.name,level:l.level,visible:l.visible,opacity:l.opacity,locked:l.locked,category:l.category,cells:[...l.cells],placementHeights:[...l.placementHeights]}))};}
    static fromJSON(o:any):PZMapModel{
      const width=Math.max(1,Math.min(600,Math.trunc(Number(o.width)||64)));
      const height=Math.max(1,Math.min(600,Math.trunc(Number(o.height)||64)));
      const m=new PZMapModel(width,height);
      m.tileWidth=Math.max(16,Math.min(512,Number(o.tileWidth)||64));
      m.tileHeight=Math.max(8,Math.min(256,Number(o.tileHeight)||32));
      m.cellsPerLevelY=Math.max(0,Math.min(64,Number(o.cellsPerLevelY)||3));
      m.currentLevel=Math.max(-64,Math.min(64,Math.trunc(Number(o.currentLevel)||0)));
      const props:Record<string,string>=Object.create(null);
      if(o.properties&&typeof o.properties==='object'&&!Array.isArray(o.properties)){
        for(const [k,v] of Object.entries(o.properties)){
          if(typeof v==='string'&&k.length<=128&&v.length<=2048&&!['__proto__','prototype','constructor'].includes(k))props[k]=v;
        }
      }
      m.properties=props;
      m.baseVisible=true;m.baseOpacity=1;m.baseLocked=false;m.activeTarget='base';
      m.baseStacks=new Map((o.baseStacks||[]).map((q:any)=>[+q[0],new Map(q[1]||[])]));
      m.layers=[];
      const ids=new Set<string>();
      for(const q of o.layers||[]){
        const name=typeof q.name==='string'&&q.name?q.name.slice(0,128):'Layer';
        const imported=/^(Imported Base|Imported ·|Base ·)/.test(name);
        if(imported&&!o.baseStacks){
          const z=Math.max(-64,Math.min(64,Math.trunc(Number(q.level)||0)));
          let lev=m.baseStacks.get(z);if(!lev){lev=new Map();m.baseStacks.set(z,lev);}
          for(const [k,v] of q.cells||[]){const stack=lev.get(+k)||[];stack.push(v);lev.set(+k,stack);}
          continue;
        }
        const level=Math.max(-64,Math.min(64,Math.trunc(Number(q.level)||0)));
        const category=(VIEW_CATEGORIES as readonly string[]).includes(q.category)?q.category:'Custom';
        const l=new UserLayerModel(name,level,category as ViewCategory|'Custom');
        let id=typeof q.id==='string'&&q.id.length<=128?q.id:l.id;if(ids.has(id))id=l.id;ids.add(id);l.id=id;
        l.visible=true;l.opacity=1;l.locked=false;l.cells=new Map(q.cells||[]);
        const heights=Array.isArray(q.placementHeights)?q.placementHeights:[];
        l.placementHeights=new Map(heights.filter((x:any)=>x&&x.length>=2&&Number.isInteger(+x[0])&&Number.isFinite(+x[1])).map((x:any)=>[+x[0],Math.max(0,Math.min(512,Math.round(+x[1])))]));
        if(!heights.length&&Array.isArray(q.placementModes)){for(const x of q.placementModes){if(!x||x.length<2)continue;const legacy=x[1],h=legacy==='ontable'?32:legacy==='surface'?16:0;if(h)l.placementHeights.set(+x[0],h);}}
        m.layers.push(l);
      }
      return m;
    }
  }
  export class History{
    undoStack:EditChange[][]=[];redoStack:EditChange[][]=[];limit=100;
    push(c:EditChange[]):void{if(!c.length)return;this.undoStack.push(c);if(this.undoStack.length>this.limit)this.undoStack.shift();this.redoStack=[];}
    private apply(map:PZMapModel,c:EditChange[],reverse:boolean):void{for(const ch of (reverse?[...c].reverse():c)){if(ch.kind==='base')map.setStack(ch.z,ch.x,ch.y,reverse?ch.before:ch.after);else{const l=map.layers.find(x=>x.id===ch.layerId);if(l){l.set(ch.x,ch.y,map.width,reverse?ch.before:ch.after);l.setPlacementHeight(ch.x,ch.y,map.width,reverse?(ch.beforeHeight??0):(ch.afterHeight??0));}}}}
    undo(map:PZMapModel):EditChange[]|null{const c=this.undoStack.pop();if(!c)return null;this.apply(map,c,true);this.redoStack.push(c);return c;}
    redo(map:PZMapModel):EditChange[]|null{const c=this.redoStack.pop();if(!c)return null;this.apply(map,c,false);this.undoStack.push(c);return c;}
  }
}
