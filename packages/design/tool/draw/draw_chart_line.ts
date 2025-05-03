

import Design from "../../";
import { IRect } from "../../types";
import { IBaseTool, ToolType } from "../tpyes";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawChartLine } from "../../graphics/components/chart/line-chart";

export class DrawChartLineTool extends DrawGraphicsTool implements IBaseTool {
  static type:ToolType = "drawChartLine"
  static toolName = '折线图'
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {

    const options = this.design.setting.get("chartLine")
    
    rect = normalizeRect(rect);
    return new DrawChartLine(
      {
        type: GraphicsType.ChartLine,
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