import Design from "../..";
import { IRect } from "../../types";
import { IBaseTool } from "../tpyes";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";
import { DrawBar } from "../../graphics/components/bar";

export class DrawBarTool extends DrawGraphicsTool implements IBaseTool {
  static type = "drawBar"
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {


    const bar = this.design.setting.get("bar")
    
    rect = normalizeRect(rect);
    return new DrawBar(
      {
        type: GraphicsType.Bar,
        width: rect.width,
        height: rect.height,
        ...bar,
      },
      this.design,
      {
        advancedAttrs: { x: rect.x, y: rect.y },
      },
    );
  }
}