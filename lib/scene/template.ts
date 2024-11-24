import Design from "..";
import { Graphics } from "../graphics/graphics";
import { createComponent } from "../graphics/components";
import { IComponentAttrs } from "../graphics/components/types";
import { IGraphicsOpts, ITemplateAttrs, Optional, } from "../types";
import { EDIT } from "../tool/menu";

export class Template extends Graphics<ITemplateAttrs> {
  constructor(
    attrs: Optional<ITemplateAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>,
    design: Design,
    opts?: IGraphicsOpts,
  ) {
    super(attrs, design, opts)
  }

  isEdit() {
    return Boolean(this.attrs.state & EDIT)
  }

  override customAttrs(attrs: Optional<ITemplateAttrs, 'state' | '__id' | 'transform' | 'field'>) {
    this.attrs.children = attrs?.children ?? []
    this.attrs.children?.map(childAttrs => {
      const comp = createComponent(this.design, childAttrs.type, childAttrs)
      this.childrenGraphics.push(comp!)
    })
  }

  setChild(attrs: IComponentAttrs) {
    this.attrs?.children?.push(attrs)
  }

  addGraphics(graphics: Graphics) {
    if (!this.isEdit()) {
      //非编辑状态
      this.design.sceneGraph.tool.editFail("未编辑模版，创建图形失败")
      return false
    }
    this.childrenGraphics.push(graphics!)
    this.setChild(graphics.getJson())
    return true
  }


  override getJson(): ITemplateAttrs {
    const children = this.childrenGraphics.map(item => {
      return { ...item.getJson() }
    })

    return { ...this.attrs, children }
  }

  override draw() {
    const ctx = this.design.canvas.ctx
    const attrs = this.attrs;
    const { transform } = this.attrs;

    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath();
    ctx.rect(0, 0, attrs.width, attrs.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.clip();
    this.childrenGraphics?.forEach(graphics => {
      graphics?.draw()
    })
    ctx.restore();

    if (this.isEdit()){
      this.drawOutLine()
    }
  }

  override drawOutLine() {
    const ctx = this.design.canvas.ctx;
    let strokeWidth = 1 
    ctx.save();
    const { width, height } = this.attrs;
    ctx.transform(...this.getWorldTransform());
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

}