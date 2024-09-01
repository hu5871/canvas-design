import Design from "..";
import { IPoint } from "../types";
import { ITool } from "./tpyes";
import { Move } from "./move";
import { Resize } from "./resize";

export class SelectedTool implements ITool {
  static type: string = "select";
  private startPoint: IPoint = { x: -1, y: -1 };

  // 策略
  private readonly strategyMove: Move;
  private readonly strategySelectResize: Resize;
  private currStrategy: ITool | null = null;

  constructor(private design: Design) {
    this.strategyMove = new Move(design);
    this.strategySelectResize = new Resize(design);

  }
  onActive() {
  }
  onInactive() { }

  onStart(e: PointerEvent) {
    this.startPoint = this.design.canvas.getSceneCursorXY(e);
    const sceneGraph = this.design.sceneGraph
    //选中模版
    const curTemp= sceneGraph.hitTest(e)
    

    if (curTemp) {
      this.currStrategy = this.strategyMove;
      sceneGraph.setCurrent(curTemp)
      const itemGraphics=curTemp.childrenGraphics.find(graphics=>{
        return graphics.hit(e)
      })
      curTemp.setSelectItem(itemGraphics)
    }


    if (this.currStrategy && sceneGraph.currentSelectedTemplate) {
      this.currStrategy.onActive();
      this.currStrategy.onStart(e);
    }
  }

  onDrag(e: PointerEvent) {
    const sceneGraph = this.design.sceneGraph
    if (this.currStrategy && sceneGraph.currentSelectedTemplate) {
      this.currStrategy.onDrag(e);
    }
  }
  onEnd(e: PointerEvent) {
    const sceneGraph = this.design.sceneGraph
    if (this.currStrategy && sceneGraph.currentSelectedTemplate) {
      this.currStrategy.onEnd(e);
    }
  }
}