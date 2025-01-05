import Design from "../index";
import EventEmitter from "../events/eventEmitter";
import { SelectedTool } from "./select";
import { DrawTemplateTool } from "./draw/draw_template";
import { DragTool } from "./drag";
import { ITool, IToolClassConstructor } from "./tpyes";
import { DrawTextTool } from "./draw/draw_Text";
import { DrawLineTool } from "./draw/draw_line";
import { IPoint } from "../types";
import { DrawBarcodeTool } from "./draw/draw_barcode";
import { DrawTableTool } from "./draw/draw_table";
import { DrawBarTool } from "./draw/draw_bar";

export const toolType = ["DRAWTEMPLATE", "select", 'drag'] as const;

export type ToolType = typeof toolType[number];
interface Event {
  [key: string | symbol]: (...args: any[]) => void
  onChange(tool: string): void
  editFail(msg: string): void
}

export class Tool {
  private emitter = new EventEmitter<Event>()
  private currentTool: ITool | null = null;
  private toolMap = new Map<string, IToolClassConstructor>()
  private enableToolTypes: string[] = []
  private isPressing = false
  private _isDragging = false
  startPos: IPoint = { x: 0, y: 0 };

  constructor(private design: Design) {
    this.registerTool(SelectedTool)
    this.registerTool(DrawTemplateTool)
    this.registerTool(DrawTextTool)
    this.registerTool(DrawLineTool)
    this.registerTool(DrawBarcodeTool)
    this.registerTool(DrawTableTool)
    this.registerTool(DragTool)
    this.registerTool(DrawBarTool)

    this.setAction(SelectedTool.type)
  }

  //注册工具
  private registerTool(toolCtor: IToolClassConstructor) {
    const type = toolCtor.type
    this.toolMap.set(type, toolCtor)
  }


  editFail(msg: string) {
    this.emitter.emit("editFail", msg)
  }


  setAction = (action: string) => {
    const preTool = this.currentTool
    const Control = this.toolMap.get(action)
    if (!Control) return
    const currentTool = (this.currentTool = new Control(this.design))
    preTool?.onInactive()
    currentTool.onActive()
    this.emitter.emit("onChange", action)
  }



  onStart = (e: PointerEvent) => {
    this.isPressing = true
    this.currentTool?.onStart(e)
  }
  onDrag = (e: PointerEvent) => {
    if (!this.isPressing) return
    const dx = e.clientX - this.startPos.x;
    const dy = e.clientY - this.startPos.y;
    const dragBlockStep =
      this.design.setting.get('dragBlockStep');
    if (
      !this._isDragging &&
      (Math.abs(dx) > dragBlockStep || Math.abs(dy) > dragBlockStep)
    ) {
      this._isDragging = true;
    }
    if (!this._isDragging) return
    this.currentTool?.onDrag(e)
  }
  onEnd = (e: PointerEvent) => {
    if (this.isPressing) {
      this.currentTool?.onEnd(e)
      this.setAction("select")
    }
    this.isPressing = false;
    this._isDragging=false
  }

  on<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.off(eventName, handler);
  }
}