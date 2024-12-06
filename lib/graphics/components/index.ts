import Design from "../..";
import { Template } from "../../scene/template";
import { IGraphicsAttrs, IGraphicsOpts, IPoint, Optional } from "../../types";
import { DrawBarcode } from "./barcode";
import { DrawLine } from "./line";
import { DrawRect } from "./rect";
import { DrawText } from "./text";
import { GraphicsType } from "./types";

const graphCtorMap = {
  [GraphicsType.Text]: DrawText,
  [GraphicsType.Rect]:DrawRect,
  [GraphicsType.Line]:DrawLine,
  [GraphicsType.Barcode]:DrawBarcode,
  // [GraphicsType.Template] : Template
};

// 获取 graphCtorMap 中每个构造函数的类型映射
type GraphCtorMap = typeof graphCtorMap;

// 根据传入的 GraphicsType 动态推断返回的组件实例类型
type GraphComponentInstance<T extends GraphicsType> = InstanceType<GraphCtorMap[T]>;

export function createComponent<T extends GraphicsType>(
  design: Design,
  type:T,
  attrs: Optional<IGraphicsAttrs, 'state'|'__id'|'transform'> | null,
  opts?: IGraphicsOpts
): GraphComponentInstance<T> | undefined {
  const Component = graphCtorMap[type];
  if (!Component) {
    console.error(`Component of type "${type}" not found.`);
    return;
  }
  const fianAttrs = {  ...(attrs ?? {}) }
  return new (Component as new (attrs: any, design: Design, opts?: IGraphicsOpts) => GraphComponentInstance<T>)(fianAttrs as any, design, opts)
}