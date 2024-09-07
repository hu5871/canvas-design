import Design from "../..";
import { IGraphicsAttrs, IPoint } from "../../types";
import { DrawText } from "./text";
import { GraphicsType } from "./types";

const graphCtorMap = {
  [GraphicsType.Text]: DrawText,

};

export function createComponent(
  design: Design,
  type: GraphicsType,
  attrs?: IGraphicsAttrs | null,
  opts?: IPoint
) {
  const Component = graphCtorMap[type];
  if (!Component) {
    console.error(`Component of type "${type}" not found.`);
    return;
  }
  const fianAttrs = { ...design.setting.settingConfig.components[type], ...(attrs ?? {}) }
  return new Component(fianAttrs as any, design, opts)
}