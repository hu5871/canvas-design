import Design from "..";
import EventEmitter from "../events/eventEmitter";
import { SelectedTool } from "./select";
import { DrawTemplateTool } from "./draw/draw_template";
import { DragTool } from "./drag";
import { ITool, IToolClassConstructor, ToolType } from "./tpyes";
import { DrawTextTool } from "./draw/draw_Text";
import { DrawLineTool } from "./draw/draw_line";
import { IPoint } from "../types";
import { DrawBarcodeTool } from "./draw/draw_barcode";
import { DrawTableTool } from "./draw/draw_table";
import { DrawBarTool } from "./draw/draw_bar";
import { DrawChartLineTool } from "./draw/draw_chart_line";
import { DrawPieTool } from "./draw/draw_pie";
import { getRotationCursor } from "../control_handle_manager/utils";
import { throttle } from "../utils/loadsh";


interface Event {
  [key: string | symbol]: (...args: any[]) => void
  onChange(tool: string): void
  editFail(msg: string): void
}

export class Tool {
  private emitter = new EventEmitter<Event>()
  private currentTool: ITool | null = null;
  private toolMap = new Map<ToolType, IToolClassConstructor>()
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
    this.registerTool(DrawChartLineTool)
    this.registerTool(DrawPieTool)

    this.setAction(SelectedTool.type)
    this.registerEvent()
  }



  registerEvent() {
    this.design.designEvent.on("pointerMove", this.hover.bind(this))
  }


  

  hover = throttle((e) => {
    const point = this.design.canvas.getSceneCursorXY(e);
    const controlHandleManager = this.design.sceneGraph.controlHandleManager;
    const handleInfo = controlHandleManager.getHandleInfoByPoint(point);
    this.design.canvas.Cursor.setCursor(handleInfo?.cursor || 'default');
  }, 20);

  //注册工具
  private registerTool(toolCtor: IToolClassConstructor) {
    const type = toolCtor.type
    this.toolMap.set(type, toolCtor)
  }


  editFail(msg: string) {
    this.emitter.emit("editFail", msg)
  }


  setAction = (action: ToolType) => {
    const preTool = this.currentTool
    const Control = this.toolMap.get(action)
    if (!Control) return
    const currentTool = (this.currentTool = new Control(this.design))
    preTool?.onInactive()
    currentTool.onActive()
    this.emitter.emit("onChange", action)
  }

  getTools() {
    const tools = Array.from(this.toolMap, ([key, value]): { key: ToolType, value: string } => ({ key, value: value.toolName }))
    return tools
  }



  onStart = (e: PointerEvent) => {
    this.isPressing = true
    this.startPos = { x: e.clientX, y: e.clientY };
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
    this._isDragging = false
  }

  on<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.off(eventName, handler);
  }

  destroy() {
    this.design.designEvent.off("pointerMove", this.hover.bind(this))
  }
}