import { type ToolType } from '../tool/index';
import { Tool } from "../tool";
import Design from "../index";
import { IPoint, IRect, IView } from "../types";

import { View } from './view';
import EventEmitter from '../events/eventEmitter';

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


interface EmitEvents {
  selectTemplate(rect: IRect|null): void;
  watchRect(rect:IRect|null) :void
  [key: string | symbol]: (...args: any[]) => void
}

export default class SceneGraph {
  private emitter = new EventEmitter<EmitEvents>()
  views: View[] = []
  public tool: Tool = new Tool(this.design)
  currentSelectedView:View | undefined=undefined
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

  setCurrent(view:View|undefined){
    if(this.currentSelectedView  === view) return 
    this.currentSelectedView= view
    this.emitter.emit("selectTemplate",view ? {...view?.getRect()} : null)
    this.design.render()
  }

  emitWatchRect(rect:IRect){
    this.emitter.emit("watchRect",rect)
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
    let width = +(x - startX).toFixed(2);
    let height = +(y - startY).toFixed(2);
    if (width === 0 || height === 0) {
      return
    }
    const rect = normalizeRect({ x: +startX.toFixed(2), y: +startY.toFixed(2), width, height })
    viewInfo.updateAttrs(rect)
  }

  draw() {
    this.views.forEach(item => item.draw())
    if(this.currentSelectedView){
      this.currentSelectedView.drawOutLine()
    }
  }

  hitTest(e: MouseEvent) {
    return this.views.find(item => item.hitView(e))
  }

  appendView(view: View) {
    this.views.push(view)
  }


  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }

}