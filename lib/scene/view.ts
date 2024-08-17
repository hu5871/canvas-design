import Design from "..";
import { identityMatrix } from "../geo/geo_matrix";
import {  IRect, IViewAttrs, WithRequired } from "../types";
import getDpr from "../utils/dpr";
import { omit } from "../utils/omit";
import { UniqueId } from "../utils/uuid";



const menuList: IMenuItem[] = [
  {
    type: 'edit',
    label: "编辑",
    disabled: false
  },
  {
    type: 'save',
    label: "保存",
    disabled: false
  },
  {
    type: 'lock',
    label: "锁定",
    disabled: false
  },
  {
    type: 'unLock',
    label: "取消锁定",
    disabled: false
  }
]

export interface IMenuItem {
  type: string;
  label: string;
  disabled: boolean;
}


let STATE = 0;

const EDIT = 0b0001;  // 1 表示编辑状态
const SAVE = 0b0010;  // 2 表示保存状态
const LOCK = 0b0100;  // 4 表示锁定状态


export class View {
  attrs: IViewAttrs
  constructor(
    attrs: WithRequired<Partial<IViewAttrs>, 'width' | 'height'>,
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
      state: attrs.state ?? STATE,
    }
  }

  updateAttrs(partialAttrs: Partial<IViewAttrs & IRect>) {
    if (!partialAttrs.transform) {
      if (partialAttrs.x !== undefined) {
        this.attrs.transform[4] = +(partialAttrs.x).toFixed(2);
      }
      if (partialAttrs.y !== undefined) {
        this.attrs.transform[5] = +(partialAttrs.y).toFixed(2);
      }
    }

    partialAttrs = omit(partialAttrs, 'x', 'y') as Partial<IViewAttrs>
    for (const key in partialAttrs) {
      if (partialAttrs[key as keyof IViewAttrs] !== undefined) {
        (this.attrs as any)[key as keyof IViewAttrs] = partialAttrs[key as keyof IViewAttrs]
      }
    }
    this.design.sceneGraph.emitWatchRect({ ...this.getRect() })

  }

  // 切换编辑状态
  toggleEdit() {
    let state = this.attrs.state
    if (!(state & LOCK)) {  // 仅在未锁定状态下可编辑
      state |= EDIT;   // 进入编辑状态
      this.updateAttrs({ state })
    } else {
      console.error('当前锁定状态，无法编辑');
    }
  }

  // 切换保存状态
  toggleSave() {
    let state = this.attrs.state
    if (!(state & LOCK)) {  // 仅在未锁定且未编辑状态下可保存
      state |= SAVE;          // 进入保存状态
      state &= ~EDIT;         // 保存后退出编辑状态
      this.updateAttrs({ state })
    } else {
      console.error('当前锁定或编辑状态，无法保存');
    }
  }

  // 切换锁定状态
  toggleLock() {
    let state = this.attrs.state
    if (!(state & EDIT)) {  // 仅在未编辑状态下可锁定
      state |= LOCK;        // 进入锁定状态
      state &= ~(EDIT | SAVE);  // 清除编辑和保存状态
      this.updateAttrs({ state })
    } else {
      console.error('当前编辑状态，无法锁定');
    }
  }

  // 取消锁定
  toggleUnlock() {
    let state = this.attrs.state
    if (state & LOCK) {     // 仅在锁定状态下可取消锁定
      state &= ~(LOCK|SAVE|SAVE);       // 解除状态
      this.updateAttrs({ state })
    } else {
      console.error('当前未锁定状态，无法解除锁定');
    }
  }


  getMenu(): IMenuItem[] {
    const state = this.attrs.state
    const stateMap: Record<IMenuItem['type'], boolean> = {
      edit: !!(state & EDIT) || !!(state & LOCK), // 编辑状态中或锁定状态下不可用
      lock: !!(state & EDIT) || !!(state & LOCK) ,// 锁定状态下保存按钮禁用
      save:  !!(state & LOCK),// 编辑状态中或锁定状态下不可用
      'unLock': !(state & LOCK)// 仅在锁定状态下可用
    }
    return menuList.map(item => {
      item.disabled=stateMap[item.type]
       return item
    });
  }

  activeMenu(type: string) {
    const state = this.attrs.state
    switch (type) {
      case 'edit':
        this.toggleEdit()
        break
      case 'lock':
        this.toggleLock()
        break
      case 'save':
        this.toggleSave()
        break
      case 'unLock':
        this.toggleUnlock()
        break
    }
    this.design.sceneGraph.emitMenu(undefined)
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