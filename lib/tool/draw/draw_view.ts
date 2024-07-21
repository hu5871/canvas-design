import Design from "../..";
import { IPoint } from "../../types";
import { View } from "../../views/view";
import { IBaseTool } from "../tpyes";

export class DrawViewTool implements IBaseTool {
  static type="DRAWVIEW"
  startPoint: IPoint = { x: -1, y: -1 };
  lastPoint: IPoint = { x: -1, y: -1 };
  private __is_draw: boolean = false
  private __is_dragging: boolean = false
  private drawView: View | null = null
  constructor(private design: Design) {
  }

  onActive(){
    return
  }

  onInactive(){}

  onStart = (e: PointerEvent) => {
    const viewsIns = this.design.views
    if (viewsIns.hitTest(e)) return
    this.__is_draw = true
    this.__is_dragging = false
    this.drawView = null
    this.startPoint = this.design.canvas.getSceneCursorXY(e)
  }

  onDrag = (e: PointerEvent) => {
    e.stopPropagation()
    const viewsIns = this.design.views
    if (viewsIns.hitTest(e)) {
      this.design.canvas.Cursor.setCursor("no-drop")
    } else {
      this.design.canvas.Cursor.setCursor("default")
    }
    if (!this.__is_draw) return

    this.lastPoint = this.design.canvas.getSceneCursorXY(e)
    if (!this.drawView) {
      const attrs = {
        width: 0,
        height: 0
      }
      const opts = {
        x: this.startPoint.x,
        y: this.startPoint.y
      }
      this.drawView = new View(attrs, opts, this.design)
      viewsIns.appendView(this.drawView)
    }
    this.__is_dragging = true
    viewsIns.updateView({
      startPoint: this.startPoint,
      lastPoint: this.lastPoint,
    }, this.drawView, this.__is_dragging)
    this.design.canvas.render()
  }

  onEnd = (e: PointerEvent) => {
    e.stopPropagation()
    const viewsIns = this.design.views
    this.design.activeTool("select")
    viewsIns.updateView({
      startPoint: this.startPoint,
      lastPoint: this.lastPoint,
    }, this.drawView, this.__is_dragging)
    this.__is_draw = false
    this.__is_dragging = false
    this.drawView = null
    this.design.canvas.render()
  }
}