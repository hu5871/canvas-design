import Design from "../../..";
import { Graphics } from "../../graphics";
import { IAdvancedAttrs, IGraphicsAttrs, IGraphicsOpts, IRect, Optional, PaintType } from "../../../types";
import { isPointInTransformedRect } from "../../../utils/hitTest";
import { GraphicsType } from "../types";
import getDpr from "../../../utils/dpr";
import { parseRGBAStr } from "../../../utils/color";
import { ILineAttrs } from "./type";


export class DrawLine extends Graphics<ILineAttrs> {
  type = GraphicsType.Line
  static type = GraphicsType.Line
  constructor(attrs: Optional<ILineAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super({...attrs,height: 0}, design, opts)
  }

  override  getJson(): ILineAttrs {
    return { ...this.attrs }
  }


  override draw() {
    if (!this.isVisible()) return;
    const ctx = this.design.canvas.ctx
    const { width, transform, stroke, strokeWidth } = this.attrs;
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    if (strokeWidth) {
      ctx.lineWidth = strokeWidth;
      for (const paint of stroke ?? []) {
        switch (paint.type) {
          case PaintType.Solid: {
            ctx.strokeStyle = parseRGBAStr(paint.attrs);
            ctx.stroke();
            break;
          }
        }
      }
      ctx.closePath();
      ctx.restore();
    }
  }

  override drawOutLine() {
    const ctx = this.design.canvas.ctx
    const { width, transform, stroke, strokeWidth } = this.attrs;
    ctx.transform(...this.getWorldTransform());
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineWidth =  strokeWidth / this.design.zoom.getZoom();
    ctx.strokeStyle = "#d1d5db";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  override  updateAttrs(partialAttrs: Partial<ILineAttrs> & IAdvancedAttrs) {
    partialAttrs!.height=0
    super.updateAttrs(partialAttrs)
  }




}