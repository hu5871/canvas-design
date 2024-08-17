import Design from "../index";
import EventEmitter from "../events/eventEmitter";
import { SelectedTool } from "./select";
import { DrawTemplateTool } from "./draw/draw_template";
import { ITool, IToolClassConstructor } from "./tpyes";

export const toolType = ["DRAWVIEW", "select"] as const;

export type ToolType = typeof toolType[number];
interface Event {
  [key: string | symbol]: (...args: any[]) => void
  onChange(tool: string): void
}

export class Tool {
  private emitter = new EventEmitter<Event>()
  private currentTool: ITool | null = null;
  private toolMap = new Map<string, IToolClassConstructor>()
  private enableToolTypes:string[]=[]



  constructor(private design: Design) {
    this.registerTool(SelectedTool as any)
    this.registerTool(DrawTemplateTool as any)

    this.setAction(SelectedTool.type)
  }

  //注册工具
  private registerTool(toolCtor: IToolClassConstructor) {
    const type = toolCtor.type
    this.toolMap.set(type, toolCtor)
  }


  setAction = (action: string) => {
    const preTool = this.currentTool
    const Control = this.toolMap.get(action)
    if (!Control) return
    const currentTool = (this.currentTool = new Control(this.design))
    preTool?.onInactive()
    currentTool.onActive()
    this.emitter.emit("onChange",action)
  }



  onStart = (e: PointerEvent) => {
    this.currentTool?.onStart(e)

  }
  onDrag = (e: PointerEvent) => {
    this.currentTool?.onDrag(e)
  }
  onEnd = (e: PointerEvent) => {
    this.currentTool?.onEnd(e)
  }

  on<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.off(eventName, handler);
  }
}