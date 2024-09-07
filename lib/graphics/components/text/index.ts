import Design from "../../..";
import { Graphics } from "../../graphics";
import { IRect, WithRequired } from "../../../types";
import { hitRect } from "../../../utils/hitTest";
import { GraphicsType } from "../types";
import { ITextAttrs } from "./type";
import getDpr from "../../../utils/dpr";


export class DrawText extends Graphics<ITextAttrs>  {
  type = GraphicsType.Text
  constructor(attrs: ITextAttrs, design: Design, opts?: Pick<IRect, 'x' | 'y'>) {
    super(attrs, design, opts)
  }


  override customAttrs(attrs: WithRequired<Partial<ITextAttrs>, "width" | "height">): void {
    this.attrs.style = attrs.style ?? this.design.setting.settingConfig.components[GraphicsType.Text].style
  }

  override  getJson(): ITextAttrs {
    return { ...this.attrs }
  }


  override draw() {
    const { fontSize, fill, textBaseline,padding } = this.attrs.style
    const { transform } = this.attrs
    const dpr = getDpr();
    const ctx = this.design.canvas.ctx
    const viewport = this.design.canvas.getViewPortRect();
    const zoom = this.design.zoom.getZoom();
    const dx = -viewport.x;
    const dy = -viewport.y;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr * zoom, dpr * zoom);
    ctx.translate(dx, dy);
    ctx.beginPath()
    ctx.transform(...transform);
    ctx.font = `${fontSize}px sans-serif`
    ctx.textBaseline = textBaseline
    ctx.fillStyle = fill
    ctx.fillText('文本',padding[1] , padding[0]);
    ctx.closePath()
    ctx.restore();
    this.drawBorder()
  }


  override hit(e: MouseEvent): Boolean {
    const scenePoint = this.design.canvas.getSceneCursorXY(e)
    const localPoint = this.getLocalPosition()
    const { width, height } = this.attrs
    return hitRect(scenePoint, localPoint, { width, height })
  }

  drawBorder() {
    const { width, height, transform } = this.attrs
    const ctx = this.design.canvas.ctx
    const dpr = getDpr();
    const viewport = this.design.canvas.getViewPortRect();
    const zoom = this.design.zoom.getZoom();
    const dx = -viewport.x;
    const dy = -viewport.y;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr * zoom, dpr * zoom);
    ctx.translate(dx, dy);
    ctx.beginPath();
    ctx.transform(...transform);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([5]);
    ctx.rect(0, 0, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}