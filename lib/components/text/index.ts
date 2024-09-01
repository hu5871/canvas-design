import Design from "../..";
import { Graphics } from "../../common/graphics";
import { IRect, WithRequired } from "../../types";
import { hitRect } from "../../utils/hitTest";
import { GraphicsType, IBaseComponents } from "../types";
import { ITextAttrs } from "./type";


export class DrawText extends Graphics<ITextAttrs> implements IBaseComponents {
  type = GraphicsType.Text
  constructor(attrs: ITextAttrs, design: Design, opts?: Pick<IRect, 'x' | 'y'>) {
    super(attrs, design, opts)
  }


  override customAttrs(attrs: WithRequired<Partial<ITextAttrs>, "width" | "height">): void {
    this.attrs.style = attrs.style ?? this.design.setting.settingConfig.components[GraphicsType.Text].style
  }

  override  getJson(): ITextAttrs {
    return {...this.attrs}
  }
  

  override draw() {
    const { fontSize, fill,textBaseline} = this.attrs.style
    const {transform} = this.attrs
    const ctx = this.design.canvas.ctx
    this.drawBorder()
    ctx.save();
    ctx.beginPath()
    ctx.transform(...transform);
    ctx.font = `${fontSize}px sans-serif`
    ctx.textBaseline = textBaseline
    ctx.fillStyle = fill
    ctx.fillText('文本', 0,0);
    ctx.closePath()
    ctx.restore();

  }


  override hit (e: MouseEvent): Boolean  {
    const scenePoint = this.design.canvas.getSceneCursorXY(e)
    const localPoint = this.getLocalPosition()
    const { width, height } = this.attrs
    return hitRect(scenePoint,localPoint,{width,height})
  }

  drawBorder(){
    const { width, height,transform } = this.attrs
    const ctx = this.design.canvas.ctx
    ctx.save()
    ctx.transform(...transform);
    ctx.beginPath();
     ctx.strokeStyle = '#d1d5db';
     ctx.lineWidth = 1; 
     ctx.setLineDash([5]);
     ctx.rect(0, 0, width, height);
     ctx.stroke(); 
     ctx.closePath();
     ctx.restore();
  }


  onStart(event: PointerEvent) {

  }
  onDrag(event: PointerEvent) { }
  onEnd(event: PointerEvent) { }
}