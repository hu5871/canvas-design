import Design from "..";
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
}

export default class DesignEvent {
  isShiftPressing = false;
  isCtrlPressing = false;
  isAltPressing = false;
  isCommandPressing = false;
  isSpacePressing = false;
  isWheelBtnPressing = false;


  isDraggingCanvasBySpace = false;
  isEnableDelete = true;
  isEnableContextMenu = true;
  private emitter = new EventEmitter<IDesignEvent>()
  dragCanvas: DragCanvas

  constructor(private design: Design) {
    this.dragCanvas = new DragCanvas(this.design, this)
    this.listendragTemp(design.canvas.canvasElement)
  }

  private listendragTemp(canvas: HTMLCanvasElement) {
    canvas.addEventListener('wheel', this.canvasWheel);
    document.addEventListener("keydown", this.keyDown)
    document.addEventListener("keyup", this.keyUp)
    canvas.addEventListener('pointerdown', this.pointerDown);
    document.addEventListener('pointermove', this.pointerMove);
    document.addEventListener('pointerup', this.pointerUp);
    document.addEventListener('wheel', this.whidowWheel, {
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


  handlerKeys(e: KeyboardEvent) {
    this.isShiftPressing = e.shiftKey;
    this.isCtrlPressing = e.ctrlKey;
    this.isAltPressing = e.altKey;
    this.isCommandPressing = e.metaKey;
    if (e.code === 'Space') {
      this.isSpacePressing = e.type === 'keydown';
    }
  }

  keyDown = (e: KeyboardEvent) => {
    this.handlerKeys(e)
    this.emitter.emit("keyDown", e)
  }
  keyUp = (e: KeyboardEvent) => {
    this.handlerKeys(e)
    this.emitter.emit("keyUp", e)
  }

  canvasWheel = (e: WheelEvent) => {
    this.emitter.emit("canvasWheel", e)
  }

  whidowWheel = (e: WheelEvent) => {
    this.emitter.emit("whidowWheel", e)
  }

  enableDelete() {
    this.isEnableDelete = true;
  }
  disableDelete() {
    this.isEnableDelete = false;
  }
  enableContextmenu() {
    this.isEnableContextMenu = true;
  }
  disableContextmenu() {
    this.isEnableContextMenu = false;
  }



  destroy() {
    const canvas = this.design.canvas.canvasElement
    canvas.removeEventListener('wheel', this.canvasWheel);
    document.removeEventListener("keydown", this.keyDown)
    document.removeEventListener("keyup", this.keyUp)
    canvas.removeEventListener('pointerdown', this.pointerDown);
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerup', this.pointerUp);
    document.removeEventListener('wheel', this.whidowWheel);
    canvas.removeEventListener("contextmenu", this.contextmenu)

  }


  on<K extends keyof IDesignEvent>(eventName: K, handler: IDesignEvent[K]) {
    this.emitter.on(eventName, handler);
  }



  off<K extends keyof IDesignEvent>(eventName: K, handler: IDesignEvent[K]) {
    this.emitter.off(eventName, handler);
  }

}