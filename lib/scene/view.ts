import Design from "..";
import { identityMatrix } from "../geo/geo_matrix";
import { IRect, IView, WithRequired } from "../types";
import getDpr from "../utils/dpr";
import { omit } from "../utils/omit";
import { UniqueId } from "../utils/uuid";


export class View {
  attrs: IView
  constructor(
    attrs: WithRequired<Partial<IView>, 'width' | 'height'>,
    opts: Pick<IRect, 'x' | 'y'>,
    private design: Design
  ) {
    const { v } = this.design.setting
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
    this.attrs = {
      __version: attrs.__version ?? v,
      __id: attrs.__id ?? UniqueId(),
      width: attrs.width,
      height: attrs.height,
      transform: transform,
      lock: attrs.lock ?? false,
      scale: attrs.scale ?? 1
    }
  }

  updateAttrs(partialAttrs: Partial<IView & IRect>) {
    if (!partialAttrs.transform) {
      if (partialAttrs.x !== undefined) {
        this.attrs.transform[4] = +(partialAttrs.x).toFixed(2);
      }
      if (partialAttrs.y !== undefined) {
        this.attrs.transform[5] = +(partialAttrs.y).toFixed(2);
      }
    }

    partialAttrs = omit(partialAttrs, 'x', 'y') as Partial<IView>
    for (const key in partialAttrs) {
      if (partialAttrs[key as keyof IView] !== undefined) {
        (this.attrs as any)[key as keyof IView] = +(partialAttrs[key as keyof IView]! as number).toFixed(2)
      }
    }


    this.design.sceneGraph.emitWatchRect({...this.getRect()})

  }

  getRect() {
    return {
      ...this.getLocalPosition(),
      width: this.attrs.width,
      height: this.attrs.height,
    };
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
    let strokeWidth = 1 / zoom;
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


  getLocalPosition() {
    return { x: this.attrs.transform[4], y: this.attrs.transform[5] };
  }

  hitView = (e: MouseEvent): Boolean => {
    const { x: cx, y: cy } = this.design.canvas.getSceneCursorXY(e)
    const { x, y } = this.getLocalPosition()
    const { width, height } = this.attrs
    const isHit = (
      x <= cx &&
      x + width >= cx &&
      y <= cy &&
      y + height >= cy
    )
    return isHit
  }

  draw() {
    const ctx = this.design.canvas.ctx
    const attrs = this.attrs;
    const { transform } = this.attrs;
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath();
    ctx.rect(0, 0, attrs.width, attrs.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

}