/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  class TileDefReader{view:DataView;bytes:Uint8Array;pos=0;constructor(buf:ArrayBuffer){this.view=new DataView(buf);this.bytes=new Uint8Array(buf);}i32():number{if(this.pos+4>this.bytes.length)throw new Error('Truncated .tiles');const v=this.view.getInt32(this.pos,true);this.pos+=4;return v;}u8():number{if(this.pos>=this.bytes.length)throw new Error('Truncated .tiles');return this.bytes[this.pos++];}line():string{let s='';for(let i=0;i<65536;i++){const c=this.u8();if(c===10)return s;s+=String.fromCharCode(c);}throw new Error('Invalid .tiles string');}seek(n:number){if(n<0||n>this.bytes.length)throw new Error('Invalid .tiles offset');this.pos=n;}}
  export class TileDefDatabase{
    props=new Map<string,TileProperties>();tilesetCounts=new Map<string,number>();loadedFileKeys=new Set<string>();
    private key(name:string):string{const p=parseTileName(name);return `${p.tilesetName.toLowerCase()}:${p.tileIndex}`;}
    properties(name:string):TileProperties{return this.props.get(this.key(name))??{};}
    clear():void{this.props.clear();this.tilesetCounts.clear();this.loadedFileKeys.clear();}
    private fileKey(f:File):string{const p=((f as any).webkitRelativePath||f.name).replace(/\\/g,'/');return `${p}|${f.size}|${f.lastModified}`;}
    async loadFiles(files:File[],progress?:(s:string)=>void):Promise<number>{const list=files.filter(f=>/\.tiles$/i.test(f.name)&&!this.loadedFileKeys.has(this.fileKey(f))),q=[...list];let total=0,done=0;const workers=Array.from({length:Math.min(4,q.length)},async()=>{while(q.length){const f=q.shift()!;try{total+=await this.readBinary(f);this.loadedFileKeys.add(this.fileKey(f));}catch(e){console.warn('Tile definitions failed',f.name,e);}done++;if(done===list.length||done%2===0)progress?.(`Tile definitions ${done}/${list.length} · ${total.toLocaleString()} property-bearing tiles`);}});await Promise.all(workers);return total;}
    private async readBinary(file:File):Promise<number>{if(file.size<4||file.size>256*1024*1024)throw new Error('.tiles file size is outside supported limits');const buf=await file.arrayBuffer(),r=new TileDefReader(buf);let version=0;const magic=String.fromCharCode(r.u8(),r.u8(),r.u8(),r.u8());if(magic==='tdef'){version=r.i32();if(version<0||version>1)throw new Error(`Unsupported .tiles version ${version}`);}else r.seek(0);const nts=r.i32();if(nts<0||nts>8192)throw new Error('Invalid tileset count');let stored=0;for(let i=0;i<nts;i++){const name=r.line();r.line();const cols=r.i32(),rows=r.i32();if(version>0)r.i32();const count=r.i32();if(cols<0||rows<0||cols>4096||rows>4096||count<0||count>cols*rows)throw new Error('Invalid tile-definition grid');this.tilesetCounts.set(name.toLowerCase(),Math.max(this.tilesetCounts.get(name.toLowerCase())??0,count));for(let j=0;j<count;j++){const np=r.i32(),p=Object.create(null) as TileProperties;if(np<0||np>4096)throw new Error('Invalid property count');for(let k=0;k<np;k++)p[r.line()]=r.line();if(Object.keys(p).length){this.props.set(`${name.toLowerCase()}:${j}`,p);stored++;}}}return stored;}
    tilesetCount(name:string):number{return this.tilesetCounts.get(name.toLowerCase())??0;}
    searchText(name:string):string{const p=this.properties(name),parts=[name];for(const [k,v] of Object.entries(p)){parts.push(k);if(v)parts.push(String(v));}return parts.join(' ');}
    displayName(name:string):string{const p=this.properties(name),entry=(key:string)=>Object.entries(p).find(([k])=>k.toLowerCase()===key)?.[1]?.trim()??'',group=entry('groupname'),custom=entry('customname'),named=entry('name');if(group&&custom)return `${group} ${custom}`;if(custom)return custom;if(named&&!/^(none|null)$/i.test(named))return named;return name;}
    surfaceInfo(name:string):TileSurfaceInfo{const p=this.properties(name),entries=Object.entries(p).map(([k,v])=>[k.toLowerCase(),String(v).trim().toLowerCase()] as [string,string]),value=(k:string)=>entries.find(([x])=>x===k)?.[1],number=(k:string)=>{const n=Number.parseInt(value(k)??'0',10);return Number.isFinite(n)?Math.max(0,Math.min(512,n)):0;},flag=(k:string)=>{const e=entries.find(([x])=>x===k);if(!e)return false;return !['false','0','no','off'].includes(e[1]);};
      return{surface:number('surface'),itemHeight:number('itemheight'),isSurfaceOffset:flag('issurfaceoffset')||flag('ontable')||flag('attachedsurface'),isTable:flag('istable'),isTableTop:flag('istabletop')};}
    placementHeightValues(limit=5):Array<{height:number;count:number}>{const hist=new Map<number,number>(),add=(h:number,w:number)=>{if(!Number.isFinite(h)||h<=0||h>128)return;const n=Math.round(h);hist.set(n,(hist.get(n)??0)+w);};for(const [key,p] of this.props){const entries=Object.entries(p).map(([k,v])=>[k.toLowerCase(),String(v).trim().toLowerCase()] as [string,string]),value=(k:string)=>entries.find(([x])=>x===k)?.[1],num=(k:string)=>{const n=Number.parseInt(value(k)??'0',10);return Number.isFinite(n)?n:0;},flag=(k:string)=>{const e=entries.find(([x])=>x===k);return !!e&&!['false','0','no','off'].includes(e[1]);},tableLike=flag('istable')||flag('istabletop')||/(table|counter|desk|workbench|cabinet|dresser|vanity|shelf)/.test(key),surface=num('surface'),item=num('itemheight');if(tableLike){add(surface,5);add(item,2);}else if(surface>0)add(surface,1);}const raw=[...hist].sort((a,b)=>a[0]-b[0]),clusters:Array<{height:number;count:number;sum:number}> = [];for(const [height,count] of raw){const last=clusters[clusters.length-1];if(last&&height-last.height<=2){last.sum+=height*count;last.count+=count;last.height=Math.round(last.sum/last.count);}else clusters.push({height,count,sum:height*count});}return clusters.sort((a,b)=>b.count-a.count).slice(0,Math.max(1,limit)).sort((a,b)=>a.height-b.height).map(({height,count})=>({height,count}));}
    classifyDetailed(name:string,furniture:Set<string>):{category:ViewCategory;source:string;rule:string}{const p=this.properties(name),keys=Object.keys(p).map(x=>x.toLowerCase()),vals=Object.values(p).map(x=>String(x).toLowerCase()),all=keys.concat(vals).join(' '),n=name.toLowerCase(),canonical=n.replace(/_0*(\d+)$/,(_,d)=>`_${Number(d)}`);
      const has=(...q:string[])=>q.some(x=>keys.includes(x.toLowerCase())||all.includes(x.toLowerCase())),hit=(category:ViewCategory,source:string,rule:string)=>({category,source,rule});
      if(/(^|_)roofs?(_|$)/.test(n))return hit('Roof','name','roof family');
      if(n.includes('vegetation_indoor'))return hit('Furniture','name','vegetation_indoor');
      if(canonical==='vegetation_indoor_01_11'||canonical==='location_community_school_01_33'||canonical==='fixtures_counters_01_151'||canonical==='animated_clock_01_1')return hit('Furniture','override',canonical);
      if(/(^|_)(fencing|fences?|railings?|barrier|guardrail)(_|$)/.test(n))return hit('Fences & Railings','name','fence/railing family');
      if(has('solidfloor'))return hit('Floor','metadata','solidfloor');
      if(/(^|_)(floor|floors|flooring)(_|$)/.test(n))return hit('Floor','name','floor family');
      if(BUILDING_TILE_CATEGORIES['Floors']?.has(name))return hit('Floor','building-category','Floors');
      if(has('walln','wallw','wallnw','wallse','wall','treataswallorder'))return hit('Wall','metadata','wall property');
      if(n.includes('wall'))return hit('Wall','name','wall');
      if(BUILDING_TILE_CATEGORIES['Exterior Walls']?.has(name))return hit('Wall','building-category','Exterior Walls');
      if(BUILDING_TILE_CATEGORIES['Interior Walls']?.has(name))return hit('Wall','building-category','Interior Walls');
      if(has('windown','windoww','doorwalln','doorwallw','doorn','doorw','window','door'))return hit('Doors & Windows','metadata','door/window property');
      if(/(^|_)(door|doors|window|windows|curtain|curtains|shutter|shutters)(_|$)/.test(n))return hit('Doors & Windows','name','door/window family');
      if(BUILDING_TILE_CATEGORIES['Doors']?.has(name))return hit('Doors & Windows','building-category','Doors');
      if(BUILDING_TILE_CATEGORIES['Windows']?.has(name))return hit('Doors & Windows','building-category','Windows');
      if(n.includes('appliances')||n.includes('furniture'))return hit('Furniture','name','appliance/furniture family');
      if(furniture.has(n)||furniture.has(canonical))return hit('Furniture','furniture-catalog','catalog match');
      if(has('walloverlay','flooroverlay','overlay','attachedn','attacheds','attachede','attachedw','ontable'))return hit('Decor / Overlay','metadata','overlay/attached property');
      if(/(overlay|graffiti|poster|sign_)/.test(n))return hit('Decor / Overlay','name','overlay/decor family');
      if(has('container','surface','table','tablen','tables','tablee','tablew','countertop','isstackable'))return hit('Furniture','metadata','furniture/surface property');
      if(/(^|_)(cooking|cookware|fixtures|chairs?|tables?|beds?|shelves?|counters?|seating|lighting|lamps?|radio|television|computers?|fridge|freezer|stove|oven|microwave|sink|toilet|bath|cabinets?)(_|$)/.test(n))return hit('Furniture','name','furniture family');
      if(has('roof'))return hit('Roof','metadata','roof');
      if(n.includes('roof'))return hit('Roof','name','roof');
      if(BUILDING_TILE_CATEGORIES['Roof Caps']?.has(name))return hit('Roof','building-category','Roof Caps');
      if(BUILDING_TILE_CATEGORIES['Roof Slopes']?.has(name))return hit('Roof','building-category','Roof Slopes');
      if(/(^|_)(blends_street|street|road|roads|asphalt|pavement|sidewalk|parking|curb|curbs)(_|$)/.test(n)||n.includes('blends_street'))return hit('Roads & Ground','name','road/ground family');
      if(/(^|_)(vegetation|tree|trees|bush|bushes|grass|plants?|natural|forest)(_|$)/.test(n)||n.includes('blends_natural'))return hit('Vegetation','name','vegetation family');
      if(/(^|_)(outdoor|exterior|clutter|street_decoration|streetdecor|trash|garbage|dumpster|mailbox|hydrant|bollard)(_|$)/.test(n)||n.includes('outdoor_clutter')||n.includes('exterior_'))return hit('Exterior','name','exterior family');
      return hit('Other','fallback','unmatched');}
    classify(name:string,furniture:Set<string>):ViewCategory{return this.classifyDetailed(name,furniture).category;}
  }
}
