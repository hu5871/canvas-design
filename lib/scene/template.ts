import Design from "..";
import { Graphics } from "../graphics/graphics";
import { createComponent } from "../graphics/components";
import { DrawText } from "../graphics/components/text";
import { GraphicsType, IComponentAttrs } from "../graphics/components/types";
import { IRect, ITemplateAttrs, WithRequired } from "../types";
import getDpr from "../utils/dpr";
import { hitRect } from "../utils/hitTest";

export class Template extends Graphics<ITemplateAttrs> {
  selectItem:Graphics|null= null
  constructor(
    attrs: WithRequired<Partial<ITemplateAttrs>, 'width' | 'height'>,
    opts: Pick<IRect, 'x' | 'y'>,
    design: Design
  ) {
    super(attrs, design, opts)
    
  }

  override customAttrs(attrs: WithRequired<Partial<ITemplateAttrs>, 'width' | 'height'>) {
    this.attrs.children = attrs?.children ?? []
    this.attrs.children?.map(childAttrs => {
      const comp = createComponent(this.design,childAttrs.type,childAttrs)
      this.childrenGraphics.push(comp!)
    })
  }

  setChild(attrs: IComponentAttrs) {
    this.attrs.children.push(attrs)
  }

  appednGraphics(type: GraphicsType, e: DragEvent) {
    const { x: cx, y: cy } = this.design.canvas.getSceneCursorXY(e)
    const comp = createComponent(this.design,type,null, { x: cx, y: cy })
    if (!comp) return
    this.childrenGraphics.push(comp!)
    this.setChild(comp.getJson())
    this.design.render()
  }

  override hit (e: MouseEvent): Boolean  {
    const scenePoint = this.design.canvas.getSceneCursorXY(e)
    const localPoint = this.getLocalPosition()
    const { width, height } = this.attrs
    return hitRect(scenePoint,localPoint,{width,height})
  }


   override getJson(): ITemplateAttrs {
    const children= this.childrenGraphics.map(item=>{
      return {...item.getJson()}
    })
    
    return {...this.attrs,children}
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
      graphics.draw()
    })
    ctx.closePath()
    ctx.restore();
    // this.selectItem?.drawOutLine()
  }



  setSelectItem(graphics:Graphics|undefined){
    this.selectItem=graphics ?? null
    this.design.render()
  }

}