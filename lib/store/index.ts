import { Graphics } from './../graphics/graphics';
import EventEmitter from "../events/eventEmitter"
import { Template } from '../scene/template';



interface EmitEvents {
  addStore(graphics: Graphics): void;
  [key: string | symbol]: (...args: any[]) => void
}

export class Store {
  //选中节点
  private selectedGraphics = new Map<string, {
    graphics: Graphics,
    parent?: string | undefined
  }>()
  //当前选中模板
  private currTemp: Template | null = null
  private currGraphics: Graphics | null = null
  private emitter = new EventEmitter<EmitEvents>()
  constructor() {

  }

  //添加选中节点
  add(node: ({
    graphics: Graphics,
    parent?: string | undefined
  })) {
    const id = node.graphics.getId()
    this.selectedGraphics.set(id!, node)
    if (node.graphics instanceof Template) {
      this.currTemp = node.graphics
      this.selectedGraphics.forEach(item => {
        //清空父节点下的子节点选中
        if (item.parent === id) {
          this.currGraphics?.getParent()?.getId()  == id && (this.currGraphics =null)
          this.delete(item.graphics.getId()!)

        }
      })
    }else{
      this.currGraphics= node.graphics
    }
  }

  //删除选中节点
  delete(id: string) {
    this.selectedGraphics.delete(id)
  }

  clear() {
    this.selectedGraphics.clear()
    this.currTemp = null
  }

  get(): Graphics[];
  get(parentId?: string): Graphics | undefined;
  get(parentId?: any): any {
    if (parentId) {
      let child: Graphics | undefined
      this.selectedGraphics.forEach(item => {
        if (item.parent === parentId) {
          child = item.graphics
        }
      })

      return child
    }
    return [...this.selectedGraphics.values()].map(item => item.graphics) as Graphics[]
  }

  getTemp(): Template | null {
    return this.currTemp
  }


  // getBoundingRect(){
  //   return  boxToRect(mergeBoxes(bboxes));
  // }


  getSelectedChild(){
    return this.currGraphics
  }

  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }
}