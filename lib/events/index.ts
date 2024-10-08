import Design from "../index";
import { DragCanvas } from "./drag_canvas";
import EventEmitter from './eventEmitter';


export interface IDesignEvent {
  [key: string | symbol]: (...args: any[]) => void
  pointerdown(e: PointerEvent): void
  pointerMove(e: PointerEvent): void
  pointerUp(e: PointerEvent): void
  canvasWheel(e: WheelEvent): void
  whidowWheel(e: WheelEvent): void
  keyDown(e: KeyboardEvent): void
  keyUp(e: KeyboardEvent): void
  contextmenu(e: MouseEvent): void
  dblclick(e:MouseEvent):void
}

export default class DesignEvent {
  private emitter = new EventEmitter<IDesignEvent>()
  dragCanvas:DragCanvas = new DragCanvas(this.design,this)

  constructor(private design: Design) {
    this.listendragTemp(design.canvas.canvasElement)
  }

  private listendragTemp(canvas: HTMLCanvasElement) {
    canvas.addEventListener('wheel', this.canvasWheel);
    canvas.addEventListener('dblclick', this.canvasdbClick);
    window.addEventListener("keydown", this.keyDown)
    window.addEventListener("keyup", this.keyUp)
    canvas.addEventListener('pointerdown', this.pointerDown);
    window.addEventListener('pointermove', this.pointerMove);
    window.addEventListener('pointerup', this.pointerUp);
    window.addEventListener('wheel', this.whidowWheel, {
      passive: false,
    });
    canvas.addEventListener("contextmenu", this.contextmenu)


  }

  contextmenu = (e: MouseEvent) => {
    e.preventDefault();
    this.emitter.emit("contextmenu", e)
  }


  pointerDown = (e: PointerEvent) => {
    this.emitter.emit("pointerDown", e)
  }

  pointerMove = (e: PointerEvent) => {
    this.emitter.emit("pointerMove", e)
  }
  pointerUp = (e: PointerEvent) => {
    this.emitter.emit("pointerUp", e)
  }

  keyDown = (e: KeyboardEvent) => {
    this.emitter.emit("keyDown", e)
  }
  keyUp = (e: KeyboardEvent) => {
    this.emitter.emit("keyUp", e)
  }

  canvasWheel = (e: WheelEvent) => {
    this.emitter.emit("canvasWheel", e)
  }
  canvasdbClick = (e: MouseEvent) => {
    this.emitter.emit("dblclick", e)
  }
  whidowWheel = (e: WheelEvent) => {
    this.emitter.emit("whidowWheel", e)
  }


  on<K extends keyof IDesignEvent>(eventName: K, handler: IDesignEvent[K]) {
    this.emitter.on(eventName, handler);
  }



  off<K extends keyof IDesignEvent>(eventName: K, handler: IDesignEvent[K]) {
    this.emitter.off(eventName, handler);
  }

}