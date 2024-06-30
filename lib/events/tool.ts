import Design from "../index";
import EventEmitter from "./eventEmitter";

export const toolType = ["drawView", ""] as const;

export type ToolType = typeof toolType[number];
interface Event {
  [key:string|symbol]:(...args:any[])=>void
  onChange(tool:ToolType):void
}

export class Tool {
  private emitter = new EventEmitter<Event>()
  constructor(private design:Design){
    
  }

  setAction(tool:ToolType){
    this.emitter.emit("onChange",tool)
  }

  on<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.on(eventName, handler);
  }
  
  off<K extends keyof Event>(eventName: K, handler: Event[K]) {
    this.emitter.off(eventName, handler);
  }
}