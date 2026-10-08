/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  class TileDefReader{view:DataView;bytes:Uint8Array;pos=0;constructor(buf:ArrayBuffer){this.view=new DataView(buf);this.bytes=new Uint8Array(buf);}i32():number{if(this.pos+4>this.bytes.length)throw new Error('Truncated .tiles');const v=this.view.getInt32(this.pos,true);this.pos+=4;return v;}u8():number{if(this.pos>=this.bytes.length)throw new Error('Truncated .tiles');return this.bytes[this.pos++];}line():string{let s='';for(let i=0;i<1024*1024;i++){const c=this.u8();if(c===10)return s;s+=String.fromCharCode(c);}throw new Error('Invalid .tiles string');}seek(n:number){this.pos=n;}}
  export class TileDefDatabase{
    props=new Map<string,TileProperties>();loadedFileKeys=new Set<string>();
    private key(name:string):string{const p=parseTileName(name);return `${p.tilesetName.toLowerCase()}:${p.tileIndex}`;}
    properties(name:string):TileProperties{return this.props.get(this.key(name))??{};}
    clear():void{this.props.clear();this.loadedFileKeys.clear();}
    private fileKey(f:File):string{const p=((f as any).webkitRelativePath||f.name).replace(/\\/g,'/');return `${p}|${f.size}|${f.lastModified}`;}
    async loadFiles(files:File[],progress?:(s:string)=>void):Promise<number>{const list=files.filter(f=>/\.tiles$/i.test(f.name)&&!this.loadedFileKeys.has(this.fileKey(f)));let total=0;for(let i=0;i<list.length;i++){try{total+=await this.readBinary(list[i]);this.loadedFileKeys.add(this.fileKey(list[i]));progress?.(`Tile definitions ${i+1}/${list.length} · ${total.toLocaleString()} property-bearing tiles`);}catch(e){console.warn('Tile definitions failed',list[i].name,e);}}return total;}
    private async readBinary(file:File):Promise<number>{const buf=await file.arrayBuffer(),r=new TileDefReader(buf);let version=0;const magic=String.fromCharCode(r.u8(),r.u8(),r.u8(),r.u8());if(magic==='tdef'){version=r.i32();if(version<0||version>1)throw new Error(`Unsupported .tiles version ${version}`);}else r.seek(0);const nts=r.i32();if(nts<0||nts>8192)throw new Error('Invalid tileset count');let stored=0;for(let i=0;i<nts;i++){const name=r.line();r.line();const cols=r.i32(),rows=r.i32();if(version>0)r.i32();const count=r.i32();if(cols<0||rows<0||count<0||count>cols*rows)throw new Error('Invalid tile-definition grid');for(let j=0;j<count;j++){const np=r.i32(),p:TileProperties={};if(np<0||np>100000)throw new Error('Invalid property count');for(let k=0;k<np;k++)p[r.line()]=r.line();if(Object.keys(p).length){this.props.set(`${name.toLowerCase()}:${j}`,p);stored++;}}}return stored;}
    classify(name:string,furniture:Set<string>):ViewCategory{const p=this.properties(name),keys=Object.keys(p).map(x=>x.toLowerCase()),vals=Object.values(p).map(x=>String(x).toLowerCase()),all=keys.concat(vals).join(' '),n=name.toLowerCase();
      const has=(...q:string[])=>q.some(x=>keys.includes(x.toLowerCase())||all.includes(x.toLowerCase()));
      if(has('solidfloor')||/(^|_)(floor|floors|flooring)(_|$)/.test(n)||BUILDING_TILE_CATEGORIES['Floors']?.has(name))return 'Floor';
      if(has('walln','wallw','wallnw','wallse','wall','treataswallorder')||n.includes('wall')||BUILDING_TILE_CATEGORIES['Exterior Walls']?.has(name)||BUILDING_TILE_CATEGORIES['Interior Walls']?.has(name))return 'Wall';
      if(has('windown','windoww','doorwalln','doorwallw','doorn','doorw','window','door')||/(^|_)(door|doors|window|windows|curtain|curtains|shutter|shutters)(_|$)/.test(n)||BUILDING_TILE_CATEGORIES['Doors']?.has(name)||BUILDING_TILE_CATEGORIES['Windows']?.has(name))return 'Doors & Windows';
      if(has('walloverlay','flooroverlay','overlay','attachedn','attacheds','attachede','attachedw','ontable')||/(overlay|graffiti|poster|sign_)/.test(n))return 'Decor / Overlay';
      if(furniture.has(name)||has('container','surface','table','tablen','tables','tablee','tablew','countertop','isstackable')||/(furniture|appliances|fixtures|chairs?|tables?|beds?|shelves?|counters?|seating|lighting|lamps?|radio|television|computers?|fridge|stove|sink|toilet|bath|cabinets?)/.test(n))return 'Furniture';
      if(has('roof')||n.includes('roof')||BUILDING_TILE_CATEGORIES['Roof Caps']?.has(name)||BUILDING_TILE_CATEGORIES['Roof Slopes']?.has(name))return 'Roof';
      if(/(vegetation|trees?|bush|grass|plants?|natural|street_|curbs?|fencing|railings?|parking|pavement|road_|sidewalk|exterior)/.test(n))return 'Exterior';
      return 'Other';}
  }
}
