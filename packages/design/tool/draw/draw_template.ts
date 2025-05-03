import Design from "../../";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { Template } from "../../graphics/template";
import { IBaseTool, ToolType } from "../tpyes";
import { createComponent } from "../../graphics/components";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";

export class DrawTemplateTool extends DrawGraphicsTool implements IBaseTool {
  static type:ToolType="DRAWTEMPLATE"
  static toolName = '模板'
  constructor(design: Design) {
    super(design)
  }

  protected createGraphics(rect: IRect) {
    rect = normalizeRect(rect);
    return new Template(
      {
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