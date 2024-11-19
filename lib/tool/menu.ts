import Design from "..";
import { IBaseTool } from "./tpyes";


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


export const EDIT = 0b0001;  // 1 表示编辑状态
export const SAVE = 0b0010;  // 2 表示保存状态
export const LOCK = 0b0100;  // 4 表示锁定状态
export class Menu implements IBaseTool {
  type ='MENU'
  constructor(private design: Design) {

  }

  // 切换编辑状态
  toggleEdit() {
    const tmp= this.design.store.getTemplate()
    if(!tmp) return 
    let state =tmp?.attrs.state
    if (!(state & LOCK)) {  // 仅在未锁定状态下可编辑
      state |= EDIT;   // 进入编辑状态
      tmp.updateAttrs({ state })
    } else {
      console.error('当前锁定状态，无法编辑');
    }
  }

  // 切换保存状态
  toggleSave() {
    const tmp= this.design.store.getTemplate()
    if(!tmp) return 
    let state =tmp?.attrs.state
    if (!(state & LOCK)) {  // 仅在未锁定且未编辑状态下可保存
      state |= SAVE;          // 进入保存状态
      state &= ~EDIT;         // 保存后退出编辑状态
      tmp.updateAttrs({ state })
    } else {
      console.error('当前锁定或编辑状态，无法保存');
    }
  }

  // 切换锁定状态
  toggleLock() {
     const tmp= this.design.store.getTemplate()
    if(!tmp) return 
    let state =tmp?.attrs.state
    if (!(state & EDIT)) {  // 仅在未编辑状态下可锁定
      state |= LOCK;        // 进入锁定状态
      state &= ~(EDIT | SAVE);  // 清除编辑和保存状态
      tmp.updateAttrs({ state })
    } else {
      console.error('当前编辑状态，无法锁定');
    }
  }

  // 取消锁定
  toggleUnlock() {
     const tmp= this.design.store.getTemplate()
    if(!tmp) return 
    let state =tmp?.attrs.state
    if (state & LOCK) {     // 仅在锁定状态下可取消锁定
      state &= ~(LOCK | SAVE | SAVE);       // 解除状态
      tmp.updateAttrs({ state })
    } else {
      console.error('当前未锁定状态，无法解除锁定');
    }
  }


  getMenu(): IMenuItem[] {
     const tmp= this.design.store.getTemplate() || this.design.store.getGraphics()?.getParent()
    if(!tmp) return []
    let state =tmp?.attrs.state
    const stateMap: Record<IMenuItem['type'], boolean> = {
      edit: !!(state & EDIT) || !!(state & LOCK), // 编辑状态中或锁定状态下不可用
      lock: !!(state & EDIT) || !!(state & LOCK),// 锁定状态下保存按钮禁用
      save: !!(state & LOCK),// 锁定状态下不可用
      unLock: !(state & LOCK)// 仅在锁定状态下可用
    }
    return menuList.map(item => {
      item.disabled = stateMap[item.type]
      return item
    });
  }

  activeMenu(type: string) {
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


  onActive() { } 
  onInactive() { } 
  onStart() { } 
  onDrag() { } 
  onEnd() { }
}