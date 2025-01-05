import Design from "../..";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { IBaseTool } from "../tpyes";
import { createComponent } from "../../graphics/components";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawText } from "../../graphics/components/text";
import { DrawLine } from "../../graphics/components/line";
import { getSweepAngle } from "../../geo/geo_angle";
import { HALF_PI } from "../../setting";
import { Matrix, applyInverseMatrix } from "../../geo/geo_matrix";
import { adjustSizeToKeepPolarSnap } from "../../utils/geo";
import { isTempGraphics } from "../../scene/utils";

export class DrawLineTool extends DrawGraphicsTool implements IBaseTool {
  static type = "drawLine"
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {

    rect = normalizeRect(rect);
    const attrs = this.calcAttrs(rect);
    return new DrawLine(
      {
        ...attrs,
        type: GraphicsType.Line,
        width: rect.width,
        height: rect.height,
        stroke:[this.design.setting.get("stroke")],
        strokeWidth:this.design.setting.get("strokeWidth"),

      },
      this.design,
      {
        advancedAttrs: { x: rect.x, y: rect.y },
      },
    );
  }

  protected override adjustSizeWhenShiftPressing(rect: IRect) {
    return adjustSizeToKeepPolarSnap(rect);
  }


   override updateGraphics(rect: IRect) {
    const parent = this.drawingGraphics!.getParent();
    let x = rect.x;
    let y = rect.y;
    if (parent && isTempGraphics(parent)) {
      const tf = parent.getWorldTransform();
      const point = applyInverseMatrix(tf, rect);
      x = point.x;
      y = point.y;
    }

    const attrs = this.calcAttrs({
      x,
      y,
      width: rect.width,
      height: rect.height,
    });
    this.drawingGraphics!.updateAttrs({
      width: attrs.width,
      transform: attrs.transform,
    });
  }

  private calcAttrs({ x, y, width, height }: IRect) {
    const rotate =
      getSweepAngle({ x: 0, y: -1 }, { x: width, y: height }) - HALF_PI;

    const cx = x + width / 2;
    const cy = y + height / 2;

    const tf = new Matrix()
      .translate(cx, cy)
      .rotate(rotate)
      .translate(-cx, -cy);
    tf.tx = x;
    tf.ty = y;

    return {
      width: Math.sqrt(width * width + height * height),
      transform: tf.getArray(),
    };
  }
}