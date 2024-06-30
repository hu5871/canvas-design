import Design from "../index";
import { IPoint } from "../types";
import DesignEvents from "./index";

export class DragCanvas {
  private _isPressing: boolean = false;
  private _isCtrl: boolean = false;
  private startPoint = { x: 0, y: 0 };
  private startViewportPos: { x: number; y: number; width: number; height: number; } = { x: 0, y: 0, width: 0, height: 0 };
  private isDragging: boolean = false;
  constructor(private design: Design,private designEvent:DesignEvents) {
    this.registerEvent()
  }

  registerEvent() {
    this.designEvent.on("canvasWheel", this.handleCanvasWheel)
    this.designEvent.on("whidowWheel", this.handleWindowWheel)

    this.designEvent.on("keyDown", this.handleKeyDown)
    this.designEvent.on("keyUp", this.handleKeyUp)

    this.designEvent.on("pointerDown", this.handleDown)
    this.designEvent.on("pointerMove", this.handleMove)
    this.designEvent.on("pointerUp", this.handleUp)
  }

  private handleWindowWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }

  private handleCanvasWheel = (e: WheelEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      //获取鼠标当前坐标
      const point = this.design.canvas.getCursorPoint(e)
      // 判断是否缩小 （zoom out）
      let isZoomOut = e.deltaY > 0;
      if (isZoomOut) {
        this.design.zoom.zoomOut({
          center: point,
        });
      } else {
        this.design.zoom.zoomIn({
          center: point,
        });
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      this._isCtrl = true
    }

  }
  private handleKeyUp = (e: KeyboardEvent) => {
    this._isCtrl = false
  }
  private handleDown = (e: PointerEvent) => {
    if (!(e.button === 0 || e.button === 1) || !this._isCtrl) return;
    this._isPressing = true;
    this.startPoint = this.design.canvas.getCursorPoint(e);
    this.startViewportPos = this.design.canvas.getViewPortRect();
  }
  handleMove = (e: PointerEvent) => {
    if (!this._isPressing ) return  
      const point: IPoint = this.design.canvas.getCursorPoint(e);
      const dx = point.x - this.startPoint.x;
      const dy = point.y - this.startPoint.y;
      const zoom = this.design.zoom.getZoom()
      if (
        !this.isDragging &&
        (Math.abs(dx) > 4 || Math.abs(dy) > 4)
      ) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const viewportX = this.startViewportPos.x - dx / zoom;
        const viewportY = this.startViewportPos.y - dy / zoom;
        this.design.canvas.setViewport({ x: viewportX, y: viewportY });
        this.design.render();
      }
  }

  handleUp = (e: PointerEvent) => {
    this.isDragging = false;
    this._isPressing = false;
  }

}