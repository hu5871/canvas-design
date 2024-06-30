export interface IPoint {
  x: number;
  y: number;
}


export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}



export interface IZoomConfig{
  zoomStep: number
  zoomMin: number
  zoomMax:number
  zoomLevels: number[]
}


export interface IAppendViewRect{
  width:number;
  height:number;
  isGrid:Boolean;
}

export interface IConfig{
  view:{
    width: number;
    height: number;
  }
}



export type DeepRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends object ? DeepRequired<NonNullable<T[K]>> : NonNullable<T[K]>;
};