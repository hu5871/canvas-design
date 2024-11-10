import Design from "..";
import { IPoint } from "../types";
import { EDIT, LOCK } from "./menu";
import { IBaseTool } from "./tpyes";


export class Move  implements IBaseTool{
  type= 'move'
  private startPoint: IPoint|null = { x: -1, y: -1 };
  private lastPoint: IPoint | null = null;
  private dragPoint: IPoint | null = null;
  startLocalPosition: { x: number; y: number; } | undefined;
  startChildLocalPosition : {x:number;y:number}[] | undefined

  constructor(private design:Design){
    
  }

  onActive(){

  }

  onInactive(){}

  onStart(e:PointerEvent){
    this.startPoint = this.design.canvas.getSceneCursorXY(e);
    const store = this.design.store
    const selectTemp = store.getTemp()
    this.startLocalPosition=selectTemp?.getLocalPosition()
    this.startChildLocalPosition=selectTemp?.childrenGraphics?.map(graphics=>{
      return graphics.getLocalPosition()
    })
  }

  onDrag(e:PointerEvent){
    if(!this.startPoint) return 
    this.dragPoint = this.design.canvas.getCursorPoint(e);
    // 获取场景坐标
    const {x,y}=this.design.canvas.viwePortToScenePoint(  
      this.dragPoint!.x,
      this.dragPoint!.y,
    )

    let dx = x - this.startPoint!.x;
    let dy = y - this.startPoint!.y;
    const store = this.design.store
    const selectTemp = store.getTemp()

    // 锁定时不可拖拽模版或者子图形
    if(!selectTemp || selectTemp.attrs.state & LOCK) return 
    if(selectTemp.attrs.state & EDIT ) {
      //编辑
      const selectedItem=this.design.store.get(selectTemp.getId())
      const index=selectTemp.childrenGraphics.findIndex(item=> item === selectedItem)
      selectedItem?.updateAttrs({
        x: this.startChildLocalPosition![index]!.x + dx ,
        y: this.startChildLocalPosition![index]!.y + dy 
      })
      this.design.render();
      return 
    }
    const startLocalPosition= this.startLocalPosition
    selectTemp?.updateAttrs({
      x: startLocalPosition!.x + dx ,
      y: startLocalPosition!.y + dy 
    });


    this.design.render();
  }
  onEnd(){
    this.dragPoint = null;
    this.startPoint=null
    this.startLocalPosition=undefined
    this.startChildLocalPosition=undefined

  }
}