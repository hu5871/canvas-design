import { type ToolType } from '../tool/index';
import { Tool } from "../tool";
import Design from "../index";
import { IPoint, IRect, ITemplateAttrs } from "../types";
import {  Template } from './template';
import EventEmitter from '../events/eventEmitter';
import { EDIT, IMenuItem, Menu } from '../tool/menu';
import { Store } from '../store';
import { Graphics } from '../graphics/graphics';
import { ControlHandleManager } from '../control_handle_manager';
import Grid from '../grid';
// import { createComponent } from '../graphics/components';

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
  watchRect(rect: IRect | undefined): void
  contextmenu(): void
  getMenuList(emnu: IMenuItem[] | undefined): void
  [key: string | symbol]: (...args: any[]) => void
}

export default class SceneGraph {
  private emitter = new EventEmitter<EmitEvents>()
  templates: Template[] = []
  public tool: Tool = new Tool(this.design)
  private menu: Menu = new Menu(this.design)
  controlHandleManager:ControlHandleManager
  grid:Grid
  constructor(private design: Design, data: ITemplateAttrs[]) {
    this.grid = new Grid(design);
    this.registerEvent()
    this.controlHandleManager=new ControlHandleManager(design)
    data?.forEach(attrs => {
      const { transform } = attrs
      const tmp = new Template(attrs,  this.design,{
        advancedAttrs:{ x: transform[4], y: transform[5] },
      })
      this.appendTemplate(tmp)
      if (attrs.state & EDIT) {
        // this.design.store.add({
        //   graphics:tmp,
        //   parent:undefined
        // })
      }
    })
  }

  getParent(childId:string){
    return this.templates.find(item=> item.attrs.children?.some(child=> child.__id === childId))
  }

  registerEvent() {
    this.design.designEvent.on("pointerDown", this.onStart)
    this.design.designEvent.on("pointerMove", this.onDrag)
    this.design.designEvent.on("pointerUp", this.onEnd)
    this.design.designEvent.on("contextmenu", this.contextmenu)
  }

  contextmenu = (e: MouseEvent) => {
    this.emitter.emit("contentmenu", { x: e.clientX, y: e.clientY })
    this.emitMenu(this.menu?.getMenu())
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


  emitWatchRect(rect: IRect|undefined) {
    this.emitter.emit("watchRect", rect)
  }

  emitMenu(menu: IMenuItem[] | undefined) {
    this.emitter.emit("getMenuList", menu)
  }

  activeMenu(type: string) {
    this.menu?.activeMenu(type)
  }


  draw() {
    this.templates.forEach(item => item.draw())

    const graphics = this.design.store.getTemplate() || this.design.store.getGraphics()

    if (!(graphics instanceof Template)){
      graphics?.getParent()?.drawOutLine()
    }else{
      graphics?.drawOutLine()
    }

  }

  hitTest(e: IPoint) {
    return this.templates.find(item => item.hitTest(e))
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