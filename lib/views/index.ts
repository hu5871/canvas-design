import { type ToolType } from './../tool/index';
import { Tool } from "../tool";
import Design from "../index";
import { IPoint, IRect, IView } from "../types";

import { View } from './view';

/**
 * normalize rect,
 * width or height may be negative
 */
export const normalizeRect = ({ x, y, width, height }: IRect): IRect => {
  const x2 = x + width;
  const y2 = y + height;
  return getRectByTwoPoint({ x, y }, { x: x2, y: y2 });
};


export const getRectByTwoPoint = (point1: IPoint, point2: IPoint): IRect => {
  return {
    x: Math.min(point1.x, point2.x),
    y: Math.min(point1.y, point2.y),
    width: Math.abs(point1.x - point2.x),
    height: Math.abs(point1.y - point2.y),
  };
};

export default class Views {
  views: View[] = []
  public tool: Tool = new Tool(this.design)
  constructor(private design: Design) {
    this.registerEvent()
  }
  registerEvent() {
    this.design.designEvents.on("pointerDown", this.onStart)
    this.design.designEvents.on("dbclick", this.onDblclick)
    this.design.designEvents.on("pointerMove", this.onDrag)
    this.design.designEvents.on("pointerUp", this.onEnd)
  }
  onDblclick = (e: MouseEvent) => {
  }

  activeTool(tool:ToolType){
    this.tool.setAction(tool)
  }

  onStart = (e: PointerEvent) => {
    this.tool.onStart(e);
  }
  onDrag = (e: PointerEvent) => {
    this.tool.onDrag(e)
  }
  onEnd = (e: PointerEvent) => {
    this.tool.onEnd(e)
  }


  // 更新模版
  updateView(
    { startPoint, lastPoint }: { startPoint: IPoint, lastPoint: IPoint },
    curView: View | null,
    isDragging: boolean) {
    let viewInfo: View | null = curView
    const { x: startX, y: startY } = startPoint;
    if (!isDragging || !viewInfo) {
      const { width, height } = this.design.setting.settingConfig.view
      this.appendView(new View({ width, height }, { x: startX, y: startY }, this.design))
      return
    }
    const { x, y } = lastPoint;
    let width = x - startX;
    let height = y - startY;
    if (width === 0 || height === 0) {
      return
    }
    const rect = normalizeRect({ x: startX, y: startY, width, height })
    viewInfo.updateAttrs(rect)
  }

  draw() {
    this.views.forEach(item => item.draw())
  }

  hitTest(e: MouseEvent) {
    return this.views.find(item => item.hitView(e))
  }

  appendView(view: View) {
    this.views.push(view)
  }

}