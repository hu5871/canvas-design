import Design from "../..";
import { IGraphicsOpts, IPoint, IRect } from "../../types";
import { Template } from "../../scene/template";
import { IBaseTool } from "../tpyes";
import { createComponent } from "../../graphics/components";
import { GraphicsType } from "../../graphics/components/types";
import { DrawGraphicsTool } from "./draw_graphics";
import { normalizeRect } from "../../scene";

export class DrawTemplateTool extends DrawGraphicsTool implements IBaseTool {
  static type="DRAWTEMPLATE"
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