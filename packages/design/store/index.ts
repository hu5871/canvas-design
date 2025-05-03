import { Graphics } from '../graphics/graphics';
import EventEmitter from "../events/eventEmitter"
import { Template } from '../graphics/template';



interface EmitEvents {
  addStore(graphics: Graphics): void;
  [key: string | symbol]: (...args: any[]) => void
}

export class Store {

  private graphics: Graphics | undefined = undefined
  private emitter = new EventEmitter<EmitEvents>()
  constructor() {

  }


  //删除选中
  delete() {
    this.graphics = undefined
  }

  selectGraphics(graphics: Graphics | undefined) {
    this.graphics = graphics
  }

  getGraphics() {
    return !(this.graphics instanceof Template) ? this.graphics : undefined
  }

  getTemplate() {
    return this.graphics instanceof Template ? this.graphics : undefined
  }

  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }
}