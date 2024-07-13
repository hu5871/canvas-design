import { IPoint } from "../types";
import { IBaseTool } from "./tpyes";


export class Resize  implements IBaseTool{
  private startPoint: IPoint = { x: -1, y: -1 };
  private handleName!: string;
  private lastPoint: IPoint | null = null;
  constructor(){
    
  }

  onActive(){

  }

  onStart(){

  }

  onDrag(){

  }
  onEnd(){

  }
}