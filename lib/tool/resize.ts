import Design from "..";
import { IPoint } from "../types";
import { IBaseTool } from "./tpyes";


export class Resize  implements IBaseTool{
  type= 'resize'
  private startPoint: IPoint = { x: -1, y: -1 };
  private handleName!: string;
  private lastPoint: IPoint | null = null;
  constructor(private design:Design){
  }

  onActive(){

  }

  onInactive(){}

  onStart(){

  }

  onDrag(){

  }
  onEnd(){

  }
}