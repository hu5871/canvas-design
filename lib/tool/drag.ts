import Design from "..";
import { ICursor } from "../cursor";
import { IPoint } from "../types";
import { IBaseTool } from "./tpyes";



//拖拽画布工具

export class DragTool implements IBaseTool{
  static type: string = 'drag'
  cursor: ICursor = 'grab';
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