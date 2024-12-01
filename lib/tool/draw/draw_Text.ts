import Design from "../..";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { IBaseTool } from "../tpyes";
import { createComponent } from "../../graphics/components";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawText } from "../../graphics/components/text";

export class DrawTextTool extends DrawGraphicsTool implements IBaseTool {
  static type="drawText"
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
        style:this.design.setting.get("textStyle")
      },
      this.design,
      {
        advancedAttrs: { x: rect.x, y: rect.y },
      },
    );
  }
}