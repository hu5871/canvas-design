import Canvas from "./canvas";
import Design from "./index";



export type ICursor =
  'no-drop'
  | 'default'
  | 'grab'
  | 'grabbing'
  | 'move'
  | 'pointer'
  | 'crosshair'
  | 'text';

export default class Cursor {
  private cursor!: ICursor;
  constructor(private canvas: Canvas, private design: Design) {
    this.setCursor('default')
  }
  setCursor(cursor: ICursor) {
    this.cursor = cursor
    this.canvas.canvasElement.style.cursor = cursor
  }

  getCursor() {
    return this.cursor
  }
}