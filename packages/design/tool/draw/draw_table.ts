import Design from "../..";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { IBaseTool, ToolType } from "../tpyes";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawBarcode } from "../../graphics/components/barcode";
import { DrawTable } from "../../graphics/components/table";

export class DrawTableTool extends DrawGraphicsTool implements IBaseTool {
  static type:ToolType = "drawTable"
  static toolName  = "表格"
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {
    rect = normalizeRect(rect);
    const options  = this.design.setting.get("tableOptions")
    return new DrawTable(
      {
        ...options,
        type: GraphicsType.Table,
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