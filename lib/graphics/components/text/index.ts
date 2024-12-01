import Design from "../../..";
import { Graphics } from "../../graphics";
import { IAdvancedAttrs, IGraphicsAttrs, IGraphicsOpts, IRect, Optional, PaintType } from "../../../types";
import { isPointInTransformedRect } from "../../../utils/hitTest";
import { GraphicsType } from "../types";
import { ITextAttrs } from "./type";
import getDpr from "../../../utils/dpr";
import { parseRGBAStr } from "../../../utils/color";


export class DrawText extends Graphics<ITextAttrs>  {
  type = GraphicsType.Text
  static type = GraphicsType.Text
  constructor(attrs: Optional<ITextAttrs, 'state'|'__id'|'transform'|'type'|'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
  }


  override customAttrs(attrs: Optional<ITextAttrs, 'state'|'__id'|'transform'|'type'|'field'>): void {
    this.attrs.style = attrs.style 
  }

  override  getJson(): ITextAttrs {
    return { ...this.attrs }
  }


  override draw() {
    if(!this.isVisible()) return
    const { fontSize, textBaseline,padding } = this.attrs.style
    const { transform,fill,width,height } = this.attrs
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()
    ctx.font = `${fontSize}px sans-serif`
    ctx.textBaseline = textBaseline
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "transparent";
    ctx.fill();
    ctx.clip();
    for (const paint of fill ?? []) {
      switch (paint.type) {
        case PaintType.Solid: {
          ctx.fillStyle = parseRGBAStr(paint.attrs);

          break;
        }
      }
    }
    ctx.fillText('文本',padding[0],padding[1]);
    ctx.closePath();
    ctx.restore();
    this.boxLine()
  }



  boxLine() {
    const { width, height, transform } = this.attrs
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.beginPath();
    ctx.transform(...transform);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([5]);
    ctx.rect(0, 0, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }


  override  updateAttrs(partialAttrs: Partial<IGraphicsAttrs > & IAdvancedAttrs) {
    
    super.updateAttrs(partialAttrs)
  }


 
  
}