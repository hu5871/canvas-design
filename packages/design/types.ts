import { PieData } from "./graphics/components/chart/pie/type";
import { ITextStyle } from "./graphics/components/text/type";
import { GraphicsType, IComponentAttrs } from "./graphics/components/types";

export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}


export interface IGraphicsInfo extends IRect {
  rotate: number;
}

export interface IBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}



export interface IZoomConfig {
  zoomStep: number
  zoomMin: number
  zoomMax: number
  zoomLevels: number[]
}


export interface IAppendViewRect {
  width: number;
  height: number;
  isGrid: Boolean;
}

export interface Columns {
  field: string;
  title: string;
  width?: number;
  columns?: Columns[]
}


export interface ChartCommonPorps {
  data: Record<string, number | string>[]
  encode: ChartEncode
  xSafeMargin: number;
  ySafeMargin: number;
  scaleTextBaseline: TextBaseline;
  xscaleTextAlign: TextAlign;
  yscaleTextAlign: TextAlign;
  scaleGap: number;
  scaleWidth: number;
  lineFill: IPaint

}

export interface Bar extends ChartCommonPorps {
  barFill: IPaint;
  barCategoryGap: number;
}



export interface ChartLineSetting extends ChartCommonPorps {
}

export interface ChartEncode {
  x: string;
  y: string;
}


export interface ChartPie {
  paddingTop:number;
  data: PieData[];
  label: {
    mode: 'top';
    fontSize: number,
    textBaseline: 'top';
    textAlign: "left";
  }
  color: string[];
}


export type TextAlign = "left" | 'right' | "center" | 'start' | 'end'
export type TextBaseline = "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top"

export interface IConfig {
  theme: string,
  template: {
    width: number;
    height: number;
  },
  //条形码
  bwipOptions: {
    bcid: string;
    text: string;
    includetext: boolean;
    textxalign: "left" | "center" | 'right'
  },
  //表格
  tableOptions: {
    defaultRowHeight: number,//默认行高
    defaultHeaderRowHeight: number,//默认表头行高
    autoColWidth: boolean,//自动平分列宽
    columns: Columns[],

    textColor: string;
    borderColor: string;
    textAlign: "left" | 'center' | 'right'
  },
  bar: Bar;
  chartLine: ChartLineSetting,
  pie: ChartPie;
  dragBlockStep: number;
  textFill: IPaint[];
  textStyle: ITextStyle;
  stroke: IPaint;
  strokeWidth: number;
  handleSize: number
  handleFill: string
  handleStroke: string
  handleStrokeWidth: number
  neswHandleWidth: number
  lockRotation?: number
  minStepInViewport: number, // 视口区域下的最小步长

  //网格
  enablePixelGrid: boolean;
  snapToGrid: boolean; // 是否吸附到网格
  minPixelGridZoom: number; // draw pixel grid When zoom reach this value
  pixelGridLineColor: string; // pixel grid line color
  gridViewX: number;
  gridViewY: number;
  gridSnapX: number;
  gridSnapY: number;
  selectionHitPadding: number; //选中距离填充
  flipObjectsWhileResizing: boolean;


  // size 指示器
  sizeIndicatorMinSize: number; // if length less this value, not render
  sizeIndicatorOffset: number;
  sizeIndicatorRectRadius: number
  sizeIndicatorRectPadding: number[]
  sizeIndicatorTextColor: string
  sizeIndicatorTextFontStyle: string;
  sizeIndicatorNumPrecision: number


  selectBoxStroke: string;
  selectBoxStrokeWidth: number;


}



/**
 * 将给定类型 (T) 的所有字段递归地设置为必选（非可选且非空），即深度必选。
 *
 * @template T - 原始类型。
 *
 * 该工具类型可以递归地将所有字段及其嵌套对象都标记为必选且非空。
 *
 * 1. `[K in keyof T]-?`：遍历 T 类型的所有键，并将其设置为必选字段（`-?` 取消可选标记）。
 * 2. `NonNullable<T[K]>`：确保字段 T[K] 不是 `null` 或 `undefined`。
 * 3. `NonNullable<T[K]> extends object ? DeepRequired<NonNullable<T[K]>> : NonNullable<T[K]>`：
 *    - 如果字段是对象类型（数组或普通对象），递归调用 `DeepRequired`，将嵌套对象的字段也设置为必选。
 *    - 否则，直接返回 `NonNullable<T[K]>`。
 */
export type DeepRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends object ? DeepRequired<NonNullable<T[K]>> : NonNullable<T[K]>;
};


/**
 * 通过将指定的键 (K) 设置为可选，创建一个新的类型，基于给定的类型 (T)。
 * 
 * @template T - 原始类型。
 * @template K - T 中要设置为可选的键。
 * 
 * 该工具类型基于现有类型，仅将某些字段设置为可选，而其他字段保持必选时。
 * 
 * 1. `Omit<T, K>` 从类型 T 中移除 K 指定的键。
 * 2. `Pick<T, K>` 从类型 T 中选择 K 指定的键，创建一个新类型。
 * 3. `Partial<Pick<T, K>>` 将 Pick 选择的键设置为可选。
 * 4. `Omit<T, K> & Partial<Pick<T, K>>` 将 Omit 的必选字段和 Partial 的可选字段组合成一个新类型。
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export enum PaintType {
  Solid = 'Solid',
}
export interface IRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}
export interface IPaint {
  type: PaintType.Solid;
  attrs: IRGBA;
}

export interface IGraphicsAttrs {
  __version?: string;
  __id?: string
  width: number;
  height: number;
  state: number;
  field: string;
  transform: IMatrixArr;
  type: GraphicsType
  fill?: IPaint[];
  stroke?: IPaint[];
  strokeWidth?: number;
  visible?: boolean;
}
export interface IAdvancedAttrs {
  x?: number;
  y?: number;
  rotate?: number;
}
export interface IGraphicsOpts {
  advancedAttrs?: IAdvancedAttrs;
  noCollectUpdate?: boolean
}
export interface ITemplateAttrs extends IGraphicsAttrs {
  children?: IComponentAttrs[]
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



