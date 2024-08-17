import Design from "..";
import { IPoint } from "../types";
import { IBaseTool } from "./tpyes";


export class Move  implements IBaseTool{
  type= 'move'
  private startPoint: IPoint|null = { x: -1, y: -1 };
  private lastPoint: IPoint | null = null;
  private dragPoint: IPoint | null = null;
  startLocalPosition: { x: number; y: number; } | undefined;

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

    const selectItem = sceneGraph.currentSelectedTemplate

    const startLocalPosition= this.startLocalPosition
    selectItem?.updateAttrs({
      x: startLocalPosition!.x + dx ,
      y: startLocalPosition!.y + dy 
    });

    this.design.render();

  }
  onEnd(){
    this.dragPoint = null;
    this.startPoint=null
    this.startLocalPosition=undefined

  }
}