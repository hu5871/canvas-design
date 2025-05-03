import Design from "..";
import { IPoint } from "../types";
import DesignEvent from "./index";

export class DragCanvas {
  private _active = false;
  private _isPressing: boolean = false;
  private startPoint = { x: 0, y: 0 };
  private startViewportPos: { x: number; y: number; width: number; height: number; } = { x: 0, y: 0, width: 0, height: 0 };
  private _isDragging: boolean = false;
  constructor(private design: Design,private designEvent:DesignEvent) {
    this.registerEvent()
  }

  isActive() {
    return this._active;
  }

  active(){
    if(this.isActive()) return 
    this._active = true;
    this.design.canvas.Cursor.setCursor('grab');
    this.designEvent.on("pointerDown", this.handleDown)
    this.designEvent.on("pointerMove", this.handleMove)
    this.designEvent.on("pointerUp", this.handleUp)
  }

  inactive(){
    if (!this._active) {
      return;
    }
    this._active = false;
    this.design.canvas.Cursor.setCursor('default');
    this.designEvent.off("pointerDown", this.handleDown)
    this.designEvent.off("pointerMove", this.handleMove)
    this.designEvent.off("pointerUp", this.handleUp)
  }

  registerEvent() {
    this.designEvent.on("canvasWheel", this.handleCanvasWheel)
    this.designEvent.on("whidowWheel", this.handleWindowWheel)
    this.designEvent.on("keyDown", this.handleKeyDown)
    this.designEvent.on("keyUp", this.handleKeyUp)
  }

  offEvent(){
    this.designEvent.off("canvasWheel", this.handleCanvasWheel)
    this.designEvent.off("whidowWheel", this.handleWindowWheel)
    this.designEvent.off("keyDown", this.handleKeyDown)
    this.designEvent.off("keyUp", this.handleKeyUp)
  }
  
  get isDragging(){
    return this._isDragging
  }

  private handleWindowWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }

  private handleCanvasWheel = (e: WheelEvent) => {
    if ((e.ctrlKey || e.metaKey)) {
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
    } else {
      // 视图滚动
      e.preventDefault();
      const zoom = this.design.zoom.getZoom();
      this.design.canvas.translate(
        e.deltaX / zoom,
        e.deltaY / zoom,
      );
      this.design.render();
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // 拖拽模版快捷键
    if(e.code == 'KeyH'){
      this.active()
      this.design.activeTool('drag')
    }


    // 拖拽模版快捷键
    if(e.code == 'Delete'){
      this.active()
      
    }


  }
  private handleKeyUp = (e: KeyboardEvent) => {
  }
  private handleDown = (e: PointerEvent) => {
    if (!(e.button === 0 || e.button === 1)) return;
    this._isPressing = true;
    this.startPoint = this.design.canvas.getCursorPoint(e);
    this.startViewportPos = this.design.canvas.getViewPortRect();
  }

  handleMove = (e: PointerEvent) => {
    if (!this._isPressing) return
    const point: IPoint = this.design.canvas.getCursorPoint(e);
    const dx = point.x - this.startPoint.x;
    const dy = point.y - this.startPoint.y;
    const zoom = this.design.zoom.getZoom()
    if (
      !this.isDragging &&
      (Math.abs(dx) > 4 || Math.abs(dy) > 4)
    ) {
      this._isDragging = true;
    }

    if (this.isDragging) {
      const viewportX = this.startViewportPos.x - dx / zoom;
      const viewportY = this.startViewportPos.y - dy / zoom;
      this.design.canvas.setViewport({ x: viewportX, y: viewportY });
      this.design.render();
    }
  }

  handleUp = (e: PointerEvent) => {
    this._isDragging = false;
    this._isPressing = false;
  }

  destroy(){
    this.offEvent()
  }

}