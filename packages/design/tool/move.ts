import { Graphics } from '../graphics/graphics';
import Design from "..";
import { IPoint } from "../types";
import { EDIT, LOCK } from "./menu";
import { IBaseTool } from "./tpyes";
import { boxToRect } from '../geo/geo_rect';


export class Move implements IBaseTool {
  type = 'move'
  private startPoint: IPoint | null = { x: -1, y: -1 };
  private lastPoint: IPoint | null = null;
  private dragPoint: IPoint | null = null;
  startLocalPosition: { x: number; y: number; } | undefined;
  startChildLocalPosition: { x: number; y: number }[] | undefined
  private prevBBoxPos: IPoint = { x: -1, y: -1 };
  constructor(private design: Design) {

  }

  onActive() {

  }

  onInactive() { }

  onStart(e: PointerEvent) {
    let selectTemp = this.design.store.getTemplate()
    const graphics=this.design.store.getGraphics()
    if (!selectTemp && !graphics) return
  
    graphics && (selectTemp=graphics.getParent()!)
    this.startPoint = this.design.canvas.getSceneCursorXY(e);
    this.startLocalPosition = selectTemp!.getLocalPosition()

    this.startChildLocalPosition = selectTemp?.childrenGraphics?.map(graphics => {
      return graphics.getLocalPosition()
    })

    graphics && (this.prevBBoxPos = boxToRect(graphics.getBbox())) 
  }

  onDrag(e: PointerEvent) {
    if (!this.startPoint) return
    this.dragPoint = this.design.canvas.getCursorPoint(e);
    // 获取场景坐标
    const { x, y } = this.design.canvas.toScenePt(
      this.dragPoint!.x,
      this.dragPoint!.y,
    )

    let dx = x - this.startPoint!.x;
    let dy = y - this.startPoint!.y;
    const store = this.design.store
    const tmp = store.getTemplate()
    const graphics = store.getGraphics()

    // 锁定时不可拖拽模版或者子图形
    if (graphics && graphics.getParent()!.attrs.state & LOCK) return
    if (graphics && graphics.getParent()!.attrs.state & EDIT) {

      if (this.design.setting.get('snapToGrid')) {
        // if dx == 0, we thing it is in vertical moving.
        if (dx !== 0)
          dx = Math.round(this.prevBBoxPos.x + dx) - this.prevBBoxPos.x;
        // similarly dy
        if (dy !== 0)
          dy = Math.round(this.prevBBoxPos.y + dy) - this.prevBBoxPos.y;
      }

      //编辑
      const index = graphics.getParent()!.childrenGraphics.findIndex(item => item === graphics)
      graphics?.updateAttrs({
        x: this.startChildLocalPosition![index]!.x + dx,
        y: this.startChildLocalPosition![index]!.y + dy
      })
      this.design.render();
      return
    }
    if (!tmp) return 
    const startLocalPosition = this.startLocalPosition
    tmp?.updateAttrs({
      x: startLocalPosition!.x + dx,
      y: startLocalPosition!.y + dy
    });


    this.design.render();
  }
  onEnd() {
    this.dragPoint = null;
    this.startPoint = null
    this.startLocalPosition = undefined
    this.startChildLocalPosition = undefined

  }
}