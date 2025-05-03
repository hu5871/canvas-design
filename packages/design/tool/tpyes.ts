import Design from "..";

export interface ITool  extends IBaseTool{

}
export  interface IBaseTool {
  onActive: () => void;
  onInactive: () => void;
  onStart: (event: PointerEvent) => void;
  onDrag: (event: PointerEvent) => void;
  onEnd: (event: PointerEvent) => void;
}


export interface IToolClassConstructor {
  new (design: Design): ITool;
  type: ToolType;
  toolName :string
}

export const toolType = [
  "DRAWTEMPLATE",
  "select",
  'drag',
  'drawText',
  'drawLine',
  'drawBarcode',
  'drawTable',
  'drawBar',
  'drawChartLine',
  'drawPie',
  'drag'
] as const;
export type ToolType = typeof toolType[number];