import Design from "..";
import { IBaseTool } from "./tpyes";

export class SelectedTool implements IBaseTool {
  static type:string = "select";
  constructor(private design:Design) {
    
    
  }
  onActive() {
    console.log("onActive")
  }
  onInactive(){}

  onStart() {

  }

  onDrag() {

  }
  onEnd() {

  }
}