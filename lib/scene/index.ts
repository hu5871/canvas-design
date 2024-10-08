import { type ToolType } from '../tool/index';
import { Tool } from "../tool";
import Design from "../index";
import { IPoint, IRect, ITemplateAttrs } from "../types";

import { Template } from './template';
import EventEmitter from '../events/eventEmitter';
import { EDIT, IMenuItem, Menu } from '../tool/menu';
import { GraphicsType } from '../graphics/components/types';

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
  selectTemplate(rect: IRect | null): void;
  watchRect(rect: IRect | null): void
  contextmenu(): void
  getMenuList(emnu: IMenuItem[] | undefined): void
  [key: string | symbol]: (...args: any[]) => void
}

export default class SceneGraph {
  private emitter = new EventEmitter<EmitEvents>()
  templates: Template[] = []
  public tool: Tool = new Tool(this.design)
  private menu: Menu = new Menu(this.design)
  currentSelectedTemplate: Template | undefined = undefined
  editTemps: Template[] = []
  constructor(private design: Design, data: ITemplateAttrs[]) {
    this.registerEvent()
    data?.forEach(attrs => {
      const { transform } = attrs
      const tmp = new Template(attrs, { x: transform[4], y: transform[5] }, this.design)
      this.appendTemplate(tmp)
      if (attrs.state & EDIT) {
        this.addEditTemp(tmp)
      }
    })
  }

  registerEvent() {
    this.design.designEvent.on("pointerDown", this.onStart)
    this.design.designEvent.on("dblclick", this.onDblclick)
    this.design.designEvent.on("pointerMove", this.onDrag)
    this.design.designEvent.on("pointerUp", this.onEnd)
    this.design.designEvent.on("contextmenu", this.contextmenu)
  }

  contextmenu = (e: MouseEvent) => {
    this.currentSelectedTemplate = this.hitTest(e)
    this.emitter.emit("contentmenu", { x: e.clientX, y: e.clientY })
    this.emitMenu(this.menu?.getMenu())
  }


  onDblclick = (e: MouseEvent) => {
  }

  activeTool(tool: ToolType) {
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

  addEditTemp(temp: Template) {
    this.editTemps.indexOf(temp) === -1 && this.editTemps.push(temp)
  }

  setCurrent(temp: Template | undefined) {
    if (this.currentSelectedTemplate === temp) return
    this.currentSelectedTemplate = temp
    this.emitter.emit("selectTemplate", temp ? { ...temp?.getRect() } : null)
    this.design.render()
  }

  emitWatchRect(rect: IRect) {
    this.emitter.emit("watchRect", rect)
  }

  emitMenu(menu: IMenuItem[] | undefined) {
    this.emitter.emit("getMenuList", menu)
  }

  activeMenu(type: string) {
    this.menu?.activeMenu(type)
  }


  // 更新模版
  updateTemplate(
    { startPoint, lastPoint }: { startPoint: IPoint, lastPoint: IPoint },
    curTemp: Template | null,
    isDragging: boolean) {
    let tempInfo: Template | null = curTemp
    const { x: startX, y: startY } = startPoint;
    if (!isDragging || !tempInfo) {
      const { width, height } = this.design.setting.settingConfig.template
      this.appendTemplate(new Template({ width, height }, { x: startX, y: startY }, this.design))
      return
    }
    const { x, y } = lastPoint;
    let width = +(x - startX).toFixed(2);
    let height = +(y - startY).toFixed(2);
    if (width === 0 || height === 0) {
      return
    }
    const rect = normalizeRect({ x: +startX.toFixed(2), y: +startY.toFixed(2), width, height })
    tempInfo.updateAttrs(rect)
  }

  draw() {
    this.templates.forEach(item => item.draw())
    if (this.currentSelectedTemplate) {
      this.currentSelectedTemplate.drawOutLine()
    }
    this.editTemps.forEach(tmp => {
      tmp.drawOutLine()
    })
  }

  hitTest(e: MouseEvent) {
    return this.templates.find(item => item.hit(e))
  }

  //创建业务图形
  dragTarget(e: DragEvent,type:GraphicsType) {
    const temp = this.editTemps.find(item => item.hit(e))
    temp?.appednGraphics(type,e)
    return 
  }

  appendTemplate(temp: Template) {
    this.templates.push(temp)
  }


  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }

}