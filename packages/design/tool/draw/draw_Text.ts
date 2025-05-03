import Design from "../../";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { IBaseTool, ToolType } from "../tpyes";
import { createComponent } from "../../graphics/components";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawText } from "../../graphics/components/text";

export class DrawTextTool extends DrawGraphicsTool implements IBaseTool {
  static type:ToolType="drawText"
  static toolName  = "文字"
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {
    rect = normalizeRect(rect);
    return new DrawText(
      {
        type: GraphicsType.Text,
        width: rect.width,
        height: rect.height,
        fill: this.design.setting.get("textFill"),
        style:this.design.setting.get("textStyle"),
        text:"文本"
      },
      this.design,
      {
        advancedAttrs: { x: rect.x, y: rect.y },
      },
    );
  }
}