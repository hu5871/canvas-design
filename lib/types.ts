import { ITextStyle } from "./graphics/components/text/type";
import { GraphicsType, IComponentAttrs } from "./graphics/components/types";

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
  template:{
    width: number;
    height: number;
  },
  components:{
    [GraphicsType.Text]:{
      type:string;
      width:number;
      height:number;
      style:ITextStyle
    }
  }
}



export type DeepRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends object ? DeepRequired<NonNullable<T[K]>> : NonNullable<T[K]>;
};

export type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;


export interface IGraphicsAttrs{
  __version: string;
  __id: string
  width: number;
  height: number;
  state:number;
  transform: IMatrixArr;
  type:GraphicsType
}
export interface ITemplateAttrs extends  IGraphicsAttrs{
  children: IComponentAttrs[]
}

 /**
   * | a | c | tx|
   * | b | d | ty|
   * | 0 | 0 | 1 |
   */
export type IMatrixArr = [
  a: number,
  b: number,
  c: number,
  d: number,
  tx: number,
  ty: number,
];



