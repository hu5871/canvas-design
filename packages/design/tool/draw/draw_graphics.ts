import Design from "../../";
import { IMatrixArr, IPoint, IRect, ISize } from "../../types";
import { Template } from "../../graphics/template";
import { IBaseTool } from "../tpyes";
import { Graphics } from "../../graphics/graphics";
import { getTemplateItem, isTempGraphics } from "../../scene/utils";
import { normalizeRect } from "../../scene";
import { applyMatrix, invertMatrix } from "../../geo/geo_matrix";
import { SnapHelper } from "../../utils/snap";

export abstract class DrawGraphicsTool implements IBaseTool {
  static type = ""
  startPoint: IPoint = { x: -1, y: -1 };
  lastPoint: IPoint = { x: -1, y: -1 };
  private __is_draw: boolean = false
  private __is_dragging: boolean = false
  design: Design
  drawingGraphics: Graphics | null = null
  constructor(design: Design) {
    this.design = design
  }

  onActive() {

  }

  onInactive() { }

  onStart = (e: PointerEvent) => {
    this.__is_draw = true
    this.__is_dragging = false
    this.drawingGraphics = null;
    this.startPoint = SnapHelper.getSnapPtBySetting(
      this.design.canvas.getSceneCursorXY(e),
      this.design.setting,
    );
  }

  onDrag = (e: PointerEvent) => {
    e.stopPropagation()
    if (!this.__is_draw) return

    this.__is_dragging = true

    this.lastPoint = SnapHelper.getSnapPtBySetting(
      this.design.canvas.getSceneCursorXY(e),
      this.design.setting,
    );

    this.updateRect();
    this.design.canvas.render()
  }

  onEnd = (e: PointerEvent | undefined) => {
    e?.stopPropagation()
    if (!this.__is_draw || !this.__is_dragging) return
    this.__is_draw = false
    this.__is_dragging = false
    this.design.canvas.render()
  }


  protected adjustSizeWhenShiftPressing(rect: IRect) {
    // pressing Shift to draw a square
    const { width, height } = rect;
    const size = Math.max(Math.abs(width), Math.abs(height));
    rect.height = (Math.sign(height) || 1) * size;
    rect.width = (Math.sign(width) || 1) * size;
    return rect;
  }

  updateRect() {
    if (!this.__is_dragging) return;
    const { x, y } = this.lastPoint;
    const { x: startX, y: startY } = this.startPoint;
    const sceneGraph = this.design.sceneGraph;
    let width = x - startX;
    let height = y - startY;

    let rect = {
      x: startX,
      y: startY,
      width, // width may be negative
      height, // height may be negative
    };

    if (this.drawingGraphics) {
      this.updateGraphics(rect);
    } else {
      const graphics = this.createGraphics(rect)!;
      this.design.store.selectGraphics(graphics)
      const temp = getTemplateItem(
        this.startPoint,
        this.design.sceneGraph.templates,
      );
      //模版下不允许添加模版
      //todo 后续通过引入子模版实现模版服用
      if (temp && graphics && !isTempGraphics(graphics)) {
        const isSuccss = temp?.addGraphics(graphics);
        if (!isSuccss) return this.onEnd(undefined)
        const tf = [...graphics.attrs.transform] as IMatrixArr;
        graphics.setWorldTransform(tf);
      } else if (isTempGraphics(graphics)) {
        sceneGraph.appendTemplate(graphics as Template)
      } else {
        return this.onEnd(undefined)
      }
      this.drawingGraphics = graphics;
    }
  }

  protected abstract createGraphics(
    rect: IRect,
    noMove?: boolean,
  ): Graphics | null

  updateGraphics(rect: IRect) {
    rect = normalizeRect(rect);
    const drawingShape = this.drawingGraphics!;
    const parent = drawingShape.getParent();
    let x = rect.x;
    let y = rect.y;
    if (parent && isTempGraphics(parent)) {
      const tf = parent.getWorldTransform();
      const point = applyMatrix(invertMatrix(tf), rect);
      x = point.x;
      y = point.y;
    }

    drawingShape.updateAttrs({
      x: x,
      y: y,
      width: rect.width,
      height: rect.height,
    });
  }
}