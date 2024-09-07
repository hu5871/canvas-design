import Design from "..";
import { identityMatrix } from "../geo/geo_matrix";
import { IGraphicsAttrs, IMatrixArr, IRect, WithRequired } from "../types";
import getDpr from "../utils/dpr";
import { omit } from "../utils/omit";
import { UniqueId } from "../utils/uuid";

let STATE = 0;



export const multiplyMatrix = (m1: IMatrixArr, m2: IMatrixArr): IMatrixArr => {
  const a1 = m1[0];
  const b1 = m1[1];
  const c1 = m1[2];
  const d1 = m1[3];

  return [
    m2[0] * a1 + m2[1] * c1,
    m2[0] * b1 + m2[1] * d1,
    m2[2] * a1 + m2[3] * c1,
    m2[2] * b1 + m2[3] * d1,
    m2[4] * a1 + m2[5] * c1 + m1[4],
    m2[4] * b1 + m2[5] * d1 + m1[5],
  ];
};
export class Graphics<ATTRS extends IGraphicsAttrs = IGraphicsAttrs> {
  childrenGraphics: Graphics[] = []
  attrs: ATTRS;
  design: Design;
  constructor(
    attrs: WithRequired<Partial<ATTRS>, 'width' | 'height'>,
    design: Design,
    opts?: Pick<IRect, 'x' | 'y'>,
  ) {
    this.design = design
    const { v } = design.setting
    const transform = attrs?.transform || identityMatrix()
    const advancedAttrs = opts;
    if (advancedAttrs && !attrs.transform) {
      if (advancedAttrs.x !== undefined) {
        transform[4] = advancedAttrs.x;
      }
      if (advancedAttrs.y !== undefined) {
        transform[5] = advancedAttrs.y;
      }
    }
    this.attrs = { ...attrs } as ATTRS;
    this.attrs.__version = attrs.__version ?? v;
    this.attrs.__id = attrs.__id ?? UniqueId();
    this.attrs.transform = transform;
    this.attrs.state = attrs.state ?? STATE;
    this.customAttrs(attrs)
  }


  customAttrs(_: WithRequired<Partial<ATTRS>, 'width' | 'height'>) {
  }


  updateAttrs(partialAttrs: Partial<ATTRS & IRect>) {
    if (!partialAttrs.transform) {
      if (partialAttrs.x !== undefined) {
        this.attrs.transform[4] = +(partialAttrs.x).toFixed(2);
      }
      if (partialAttrs.y !== undefined) {
        this.attrs.transform[5] = +(partialAttrs.y).toFixed(2);
      }
    }

    let attrs = omit(partialAttrs, 'x', 'y') as Partial<ATTRS>
    for (const key in attrs) {
      if (attrs[key as keyof ATTRS] !== undefined) {
        (this.attrs as any)[key as keyof ATTRS] = attrs[key as keyof ATTRS]
      }
    }
    this.design.sceneGraph.emitWatchRect({ ...this.getRect() })

  }


  getJson(): ATTRS {
    return { ...this.attrs }
  }


  getLocalPosition() {
    return { x: this.attrs.transform[4], y: this.attrs.transform[5] };
  }



  drawOutLine() {
    const ctx = this.design.canvas.ctx;
    const dpr = getDpr();
    const viewport = this.design.canvas.getViewPortRect();
    const zoom = this.design.zoom.getZoom();
    const dx = -viewport.x;
    const dy = -viewport.y;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr * zoom, dpr * zoom);
    ctx.translate(dx, dy);
    let strokeWidth = 1 * zoom;
    const { width, height, transform } = this.attrs;
    ctx.transform(...transform);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  hit(e: MouseEvent) {
  }

  getRect() {
    return {
      ...this.getLocalPosition(),
      width: this.attrs.width,
      height: this.attrs.height,
    };
  }



  draw() {

  }

}
