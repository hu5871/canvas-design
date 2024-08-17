import Design from "../..";
import { IPoint } from "../../types";
import { Template } from "../../scene/template";
import { IBaseTool } from "../tpyes";

export class DrawTemplateTool implements IBaseTool {
  static type="DRAWTEMPLATE"
  startPoint: IPoint = { x: -1, y: -1 };
  lastPoint: IPoint = { x: -1, y: -1 };
  private __is_draw: boolean = false
  private __is_dragging: boolean = false
  private drawTemplate: Template | null = null
  constructor(private design: Design) {
  }

  onActive(){
    return
  }

  onInactive(){}

  onStart = (e: PointerEvent) => {
    const sceneGraphIns = this.design.sceneGraph
    if (sceneGraphIns.hitTest(e)) return
    this.__is_draw = true
    this.__is_dragging = false
    this.drawTemplate = null
    this.startPoint = this.design.canvas.getSceneCursorXY(e)
  }

  onDrag = (e: PointerEvent) => {
    e.stopPropagation()
    const sceneGraphIns = this.design.sceneGraph
    if (sceneGraphIns.hitTest(e)) {
      this.design.canvas.Cursor.setCursor("no-drop")
    } else {
      this.design.canvas.Cursor.setCursor("default")
    }
    if (!this.__is_draw) return

    this.lastPoint = this.design.canvas.getSceneCursorXY(e)
    if (!this.drawTemplate) {
      const attrs = {
        width: 0,
        height: 0
      }
      const opts = {
        x: this.startPoint.x,
        y: this.startPoint.y
      }
      this.drawTemplate = new Template(attrs, opts, this.design)
      sceneGraphIns.appendTemplate(this.drawTemplate)
    }
    this.__is_dragging = true
    sceneGraphIns.updateTemplate({
      startPoint: this.startPoint,
      lastPoint: this.lastPoint,
    }, this.drawTemplate, this.__is_dragging)
    this.design.canvas.render()
  }

  onEnd = (e: PointerEvent) => {
    e.stopPropagation()
    if(!this.__is_draw || !this.__is_dragging) return 
    const sceneGraphIns = this.design.sceneGraph
    this.design.activeTool("select")
    sceneGraphIns.updateTemplate({
      startPoint: this.startPoint,
      lastPoint: this.lastPoint,
    }, this.drawTemplate, this.__is_dragging)
    this.__is_draw = false
    this.__is_dragging = false
    this.drawTemplate = null
    this.design.canvas.render()
  }
}