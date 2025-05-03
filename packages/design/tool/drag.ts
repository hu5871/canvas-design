import Design from "..";
import { ICursor } from "../cursor";
import { IPoint } from "../types";
import { IBaseTool, ToolType } from "./tpyes";



//拖拽画布工具

export class DragTool implements IBaseTool{
  static type: ToolType = 'drag'
  cursor: ICursor = 'grab';
  static toolName = "拖拽画布"
  constructor(private design:Design){
  }

  onActive(){
    this.design.designEvent.dragCanvas.active();
  }

  onInactive(){
    this.design.designEvent.dragCanvas.inactive();
  }

  onStart(){

  }

  onDrag(){

  }
  onEnd(){

  }
}