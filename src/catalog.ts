/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  export class CatalogManager{
    catalog:FurnitureCatalog=BUILTIN_FURNITURE_CATALOG;furnitureTiles=new Set<string>();private tileMatches=new Map<string,FurnitureTileMatch[]>();private tileMatchesByKey=new Map<string,FurnitureTileMatch[]>();
    constructor(public assets:AssetManager,public tileDefs:TileDefDatabase){for(let gi=0;gi<this.catalog.groups.length;gi++){const g=this.catalog.groups[gi];for(let fi=0;fi<g.furniture.length;fi++){const d=g.furniture[fi];for(const e of d.entries)for(const cell of e.cells){const name=cell[2],p=parseTileName(name),canonical=`${p.tilesetName.toLowerCase()}_${p.tileIndex}`;this.furnitureTiles.add(name.toLowerCase());this.furnitureTiles.add(canonical);const match={group:g,def:d,groupIndex:gi,furnitureIndex:fi,orient:e.orient,dx:cell[0],dy:cell[1],tileName:name};const a=this.tileMatches.get(name)??[];a.push(match);this.tileMatches.set(name,a);const k=`${p.tilesetName.toLowerCase()}:${p.tileIndex}`,b=this.tileMatchesByKey.get(k)??[];b.push(match);this.tileMatchesByKey.set(k,b);}}}}
    categories():string[]{return this.catalog.groups.map(g=>g.label).filter((v,i,a)=>a.indexOf(v)===i).sort();}
    displayName(d:FurnitureDef,g:FurnitureGroup|null):string{const counts=new Map<string,number>(),seen=new Set<string>();for(const e of d.entries)for(const c of e.cells){const tile=c[2];if(seen.has(tile))continue;seen.add(tile);const name=this.tileDefs.displayName(tile);if(name&&name!==tile)counts.set(name,(counts.get(name)??0)+1);}const best=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];if(best)return best;const group=(g?.label??'Furniture').replace(/^Location\s*-\s*/i,'').replace(/\s*-\s*/g,' · ');return `${group} #${d.index}`;}
    search(query:string,category='',limit=350):FurnitureHit[]{category=category.toLowerCase();const out:FurnitureHit[]=[];for(let gi=0;gi<this.catalog.groups.length;gi++){const g=this.catalog.groups[gi];if(category&&g.label.toLowerCase()!==category)continue;for(let fi=0;fi<g.furniture.length;fi++){const d=g.furniture[fi],seen=new Set<string>();let total=0,available=0,text=`${g.label} ${d.layer} ${this.displayName(d,g)} #${d.index}`;for(const e of d.entries)for(const c of e.cells)if(!seen.has(c[2])){seen.add(c[2]);total++;if(this.assets.asset(c[2]))available++;text+=' '+this.tileDefs.searchText(c[2]);}if(query&&!searchMatches(text,query))continue;out.push({group:g,def:d,groupIndex:gi,furnitureIndex:fi,available,total});if(out.length>=limit)return out;}}return out;}
    entry(d:FurnitureDef,o:string):FurnitureEntry|null{return d.entries.find(e=>e.orient===o)??d.entries[0]??null;}
    orientations(d:FurnitureDef):string[]{return d.entries.map(e=>e.orient);}
    matchesTile(name:string,multiOnly=true):FurnitureTileMatch[]{const p=parseTileName(name),k=`${p.tilesetName.toLowerCase()}:${p.tileIndex}`,a=this.tileMatches.get(name)??this.tileMatchesByKey.get(k)??[];return multiOnly?a.filter(x=>(this.entry(x.def,x.orient)?.cells.length??0)>1):[...a];}
  }
}
