/*
 * PZ Online Decoration Tool
 * Copyright (C) 2026 PZ Online Decoration Tool contributors
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
namespace PZODT {
  export type ToolName='pencil'|'eraser'|'rect'|'picker'|'pan'|'furniture';
  export type GraphicsQuality='low'|'medium'|'high';
  export type ViewCategory='Floor'|'Wall'|'Doors & Windows'|'Furniture'|'Roof'|'Decor / Overlay'|'Roads & Ground'|'Vegetation'|'Fences & Railings'|'Exterior'|'Other';
  export const VIEW_CATEGORIES:ViewCategory[]=['Floor','Wall','Doors & Windows','Furniture','Roof','Decor / Overlay','Roads & Ground','Vegetation','Fences & Railings','Exterior','Other'];
  export interface AssetRef{name:string;sourceId:string;tilesetName:string;tileIndex:number;sx:number;sy:number;sw:number;sh:number;frameW:number;frameH:number;offsetX:number;offsetY:number;scale:number;}
  export interface ImageSourceRecord{id:string;label:string;width:number;height:number;blob:Blob;objectUrl:string;}
  export interface FurnitureEntry{orient:string;grime:boolean;cells:Array<[number,number,string]>;}
  export interface FurnitureDef{index:number;layer:string;corners:boolean;entries:FurnitureEntry[];}
  export interface FurnitureGroup{label:string;furniture:FurnitureDef[];}
  export interface FurnitureCatalog{version:number;revision:number;sourceRevision:number;groups:FurnitureGroup[];}
  export interface FurnitureHit{group:FurnitureGroup;def:FurnitureDef;groupIndex:number;furnitureIndex:number;available:number;total:number;}
  export interface FurnitureTileMatch{group:FurnitureGroup;def:FurnitureDef;groupIndex:number;furnitureIndex:number;orient:string;dx:number;dy:number;tileName:string;}
  export interface Camera{panX:number;panY:number;zoom:number;}
  export interface TileProperties{[key:string]:string;}
  export interface TileSurfaceInfo{surface:number;itemHeight:number;isSurfaceOffset:boolean;isTable:boolean;isTableTop:boolean;}
  export interface PlacementHeightPreset{label:string;height:number;count:number;}
  export interface PlacementGhostCell{x:number;y:number;z:number;name:string;valid:boolean;height?:number;}
  export interface PickCandidate{name:string;targetId:string;sourceLabel:string;category:ViewCategory;z:number;x:number;y:number;placementHeight?:number;}
  export interface BaseStackChange{kind:'base';z:number;x:number;y:number;before:string[];after:string[];}
  export interface LayerCellChange{kind:'layer';layerId:string;x:number;y:number;before:string|null;after:string|null;beforeHeight?:number;afterHeight?:number;}
  export type EditChange=BaseStackChange|LayerCellChange;
}

namespace PZODT {
  export interface PerformanceStats {
    fps:number;
    frameMs:number;
    visibleChunks:number;
    totalChunks:number;
    visibleSprites:number;
    drawCalls:number;
    activeTextures:number;
    cachedChunkBatches:number;
    dirtyChunks:number;
  }
}
