

import Design from "../..";
import { IRect } from "../../types";
import { IBaseTool, ToolType } from "../tpyes";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawChartLine } from "../../graphics/components/chart/line-chart";
import { DrawPie } from "../../graphics/components/chart/pie";

export class DrawPieTool extends DrawGraphicsTool implements IBaseTool {
  static type:ToolType = "drawPie"
  static toolName ="饼图"
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {

    const options = this.design.setting.get("pie")
    
    rect = normalizeRect(rect);
    return new DrawPie(
      {
        type: GraphicsType.ChartPie,
        width: rect.width,
        height: rect.height,
        ...options,
      },
      this.design,
      {
        advancedAttrs: { x: rect.x, y: rect.y },
      },
    );
  }
}