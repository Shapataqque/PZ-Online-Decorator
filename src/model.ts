namespace PZODT {
  let nextId=1; const uid=(p:string)=>`${p}-${nextId++}`;
  export class UserLayerModel{
    id=uid('layer');name:string;level:number;visible=true;opacity=1;locked=false;category:ViewCategory|'Custom';cells=new Map<number,string>();
    constructor(name:string,level:number,category:ViewCategory|'Custom'='Custom'){this.name=name;this.level=level;this.category=category;}
    get(x:number,y:number,w:number):string|null{return this.cells.get(y*w+x)??null;}
    set(x:number,y:number,w:number,v:string|null):void{const k=y*w+x;if(v)this.cells.set(k,v);else this.cells.delete(k);}
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
    addLayer(name:string,level=this.currentLevel,category:ViewCategory|'Custom'='Custom'):UserLayerModel{const l=new UserLayerModel(name,level,category);this.layers.push(l);this.activeTarget=l.id;return l;}
    deleteLayer(id:string):void{this.layers=this.layers.filter(l=>l.id!==id);if(this.activeTarget===id)this.activeTarget='base';}
    moveLayer(id:string,d:number):void{const i=this.layers.findIndex(l=>l.id===id);if(i<0)return;const j=Math.max(0,Math.min(this.layers.length-1,i+d));const [x]=this.layers.splice(i,1);this.layers.splice(j,0,x);}
    findStackLayer(category:ViewCategory,level:number,cells:Array<{x:number;y:number}>,create=true):UserLayerModel|null{const candidates=this.layers.filter(l=>l.level===level&&l.category===category&&!l.locked);for(const l of candidates)if(cells.every(c=>!l.get(c.x,c.y,this.width)))return l;if(!create)return null;let n=1;let name:string=category;while(this.layers.some(l=>l.level===level&&l.name===name)){n++;name=`${category} ${n}`;}return this.addLayer(name,level,category);}
    toJSON():any{return{format:'PZOnlineDecorationTool',version:3,width:this.width,height:this.height,tileWidth:this.tileWidth,tileHeight:this.tileHeight,cellsPerLevelY:this.cellsPerLevelY,currentLevel:this.currentLevel,properties:this.properties,baseVisible:this.baseVisible,baseOpacity:this.baseOpacity,baseLocked:this.baseLocked,activeTarget:this.activeTarget,baseStacks:[...this.baseStacks].map(([z,m])=>[z,[...m]]),layers:this.layers.map(l=>({id:l.id,name:l.name,level:l.level,visible:l.visible,opacity:l.opacity,locked:l.locked,category:l.category,cells:[...l.cells]}))};}
    static fromJSON(o:any):PZMapModel{const m=new PZMapModel(o.width||64,o.height||64);m.tileWidth=o.tileWidth||64;m.tileHeight=o.tileHeight||32;m.cellsPerLevelY=o.cellsPerLevelY||3;m.currentLevel=o.currentLevel||0;m.properties=o.properties||{};m.baseVisible=o.baseVisible!==false;m.baseOpacity=Number.isFinite(o.baseOpacity)?o.baseOpacity:1;m.baseLocked=o.baseLocked===true;m.activeTarget=o.activeTarget||'base';m.baseStacks=new Map((o.baseStacks||[]).map((q:any)=>[+q[0],new Map(q[1]||[])]));m.layers=[];for(const q of o.layers||[]){const imported=/^(Imported Base|Imported ·|Base ·)/.test(q.name||'');if(imported&&!o.baseStacks){const z=q.level||0;let lev=m.baseStacks.get(z);if(!lev){lev=new Map();m.baseStacks.set(z,lev);}for(const [k,v] of q.cells||[]){const stack=lev.get(+k)||[];stack.push(v);lev.set(+k,stack);}continue;}const l=new UserLayerModel(q.name||'Layer',q.level||0,q.category||'Custom');l.id=q.id||l.id;l.visible=q.visible!==false;l.opacity=Number.isFinite(q.opacity)?q.opacity:1;l.locked=q.locked===true;l.cells=new Map(q.cells||[]);m.layers.push(l);}if(m.activeTarget!=='base'&&!m.layers.some(l=>l.id===m.activeTarget))m.activeTarget='base';return m;}
  }
  export class History{
    undoStack:EditChange[][]=[];redoStack:EditChange[][]=[];limit=100;
    push(c:EditChange[]):void{if(!c.length)return;this.undoStack.push(c);if(this.undoStack.length>this.limit)this.undoStack.shift();this.redoStack=[];}
    private apply(map:PZMapModel,c:EditChange[],reverse:boolean):void{for(const ch of (reverse?[...c].reverse():c)){if(ch.kind==='base')map.setStack(ch.z,ch.x,ch.y,reverse?ch.before:ch.after);else{const l=map.layers.find(x=>x.id===ch.layerId);if(l)l.set(ch.x,ch.y,map.width,reverse?ch.before:ch.after);}}}
    undo(map:PZMapModel):EditChange[]|null{const c=this.undoStack.pop();if(!c)return null;this.apply(map,c,true);this.redoStack.push(c);return c;}
    redo(map:PZMapModel):EditChange[]|null{const c=this.redoStack.pop();if(!c)return null;this.apply(map,c,false);this.undoStack.push(c);return c;}
  }
}
