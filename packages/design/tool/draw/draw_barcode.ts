import Design from "../../";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { IBaseTool, ToolType } from "../tpyes";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawBarcode } from "../../graphics/components/barcode";

export class DrawBarcodeTool extends DrawGraphicsTool implements IBaseTool {
  static type:ToolType = "drawBarcode"

  static toolName = '条形码'
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {
    rect = normalizeRect(rect);
    const options  = this.design.setting.get("bwipOptions")
    return new DrawBarcode(
      {
        ...options,
        type: GraphicsType.Text,
        width: rect.width,
        height: rect.height,
      },
      this.design,
      {
        advancedAttrs: { x: rect.x, y: rect.y },
      },
    );
  }
}