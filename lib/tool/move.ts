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
    const sceneGraph = this.design.sceneGraph
    const selectItem = sceneGraph.currentSelectedTemplate
    this.startLocalPosition=selectItem?.getLocalPosition()
    this.startChildLocalPosition=selectItem?.childrenGraphics?.map(graphics=>{
      return graphics.getLocalPosition()
    })
  }

  onDrag(e:PointerEvent){
    if(!this.startPoint) return 
    this.dragPoint = this.design.canvas.getCursorPoint(e);
    // 获取场景坐标
    const {x,y}=this.design.canvas.viewportCoordsToScene(  
      this.dragPoint!.x,
      this.dragPoint!.y,
    )

    let dx = x - this.startPoint!.x;
    let dy = y - this.startPoint!.y;
    const sceneGraph = this.design.sceneGraph

    const selectTemp = sceneGraph.currentSelectedTemplate

    // 锁定不可拖拽模版或者子图形
    if(!selectTemp || selectTemp.attrs.state & LOCK) return 

    if(selectTemp.attrs.state & EDIT ) {
      //编辑
      const index=selectTemp.childrenGraphics.findIndex(item=> item === selectTemp.selectItem)
      selectTemp.selectItem?.updateAttrs({
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

    // 更新子图形的属性
    for (let i = 0; i < selectTemp.childrenGraphics.length; i++) {
      const graphics = selectTemp.childrenGraphics[i];
      graphics.updateAttrs({
        x: this.startChildLocalPosition![i]!.x + dx ,
        y: this.startChildLocalPosition![i]!.y + dy 
      })
    }
    this.design.render();

  }
  onEnd(){
    this.dragPoint = null;
    this.startPoint=null
    this.startLocalPosition=undefined
    this.startChildLocalPosition=undefined

  }
}