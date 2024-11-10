import Design from "../../..";
import { Graphics } from "../../graphics";
import { IGraphicsOpts, IMatrixArr, IPaint, IRect, Optional, PaintType } from "../../../types";
import { GraphicsType } from "../types";
import getDpr from "../../../utils/dpr";
import { IRectAttrs } from "./type";
import { parseRGBAStr } from "../../../utils/color";


export class DrawRect extends Graphics<IRectAttrs>  {
  type = GraphicsType.Rect
  constructor(attrs: Optional<IRectAttrs,'transform'|'state'> , design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
  }

  override  getJson(): IRectAttrs {
    return { ...this.attrs }
  }


  override draw(overrideStyle?: {
    fill?: IPaint[];
    stroke?: IPaint[];
    strokeWidth?: number;
    transform: IMatrixArr;
  },) {
    const { transform ,fill, strokeWidth, stroke,} = overrideStyle ||this.attrs
    const ctx =this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()
    ctx.rect(0, 0, this.attrs.width, this.attrs.height);
    for (const paint of fill ?? []) {
      switch (paint.type) {
        case PaintType.Solid: {
          ctx.fillStyle = parseRGBAStr(paint.attrs);
          ctx.fill();
          break;
        }
      }
    }

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
    }
    ctx.closePath();
    ctx.restore();
  }
}