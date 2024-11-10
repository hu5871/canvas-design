import Design from "..";
import { IPoint } from "../types";
import { ITool } from "./tpyes";
import { Move } from "./move";
import { Resize } from "./resize";
import { Graphics } from "../graphics/graphics";
import { Template } from "../scene/template";
import { Rotation } from "./rotation";
import { isRotationCursor } from "../cursor";

export class SelectedTool implements ITool {
  static type: string = "select";
  private startPoint: IPoint = { x: -1, y: -1 };

  // 策略
  private readonly strategyMove: Move;
  private readonly strategySelectResize: Resize;
  private readonly strategySelectRotation: Rotation;
  private currStrategy: ITool | null = null;

  constructor(private design: Design) {
    this.strategyMove = new Move(design);
    this.strategySelectResize = new Resize(design);
    this.strategySelectRotation= new Rotation(design)
  }

  onActive() {
  }

  onInactive() {

  }

  onStart(e: PointerEvent) {
    this.startPoint = this.design.canvas.getSceneCursorXY(e);
    const sceneGraph = this.design.sceneGraph
    //选中模版
    const curTemp = sceneGraph.hitTest(this.startPoint)
    let childGraphics: Graphics | undefined = undefined


    const handleInfo = this.design.sceneGraph.controlHandleManager.getHandleInfoByPoint(
      this.startPoint,
    );
    if (handleInfo) {
      if (handleInfo.handleName.endsWith("Rotation")) {
        this.strategySelectRotation.handleType = handleInfo.handleName;
        this.currStrategy = this.strategySelectRotation;
      }else{
        this.currStrategy = this.strategySelectResize;
      }
    } else {
      if (curTemp) {
        //选中子图形
        this.currStrategy = this.strategyMove;
        childGraphics = curTemp.childrenGraphics.find(graphics => {
          return graphics.hitTest(this.startPoint)
        })
      }

      let temp = curTemp ? {
        graphics: curTemp,
        parent: undefined,
      } : undefined

      let child = childGraphics ? {
        graphics: childGraphics,
        parent: temp?.graphics.getId()!,
      } : undefined

      temp && this.design.store.add(temp)
      if (child) {
        this.design.store.add(child)
      }
      this.design.sceneGraph.emitWatchRect(childGraphics ? childGraphics.getRect() : curTemp ? curTemp.getRect() : null)

      !temp && !child && this.design.store.clear()
    }

    if (this.currStrategy) {
      this.currStrategy.onActive();
      this.currStrategy.onStart(e);
    }
    this.design.render()
  }

  onDrag(e: PointerEvent) {
    if (this.currStrategy ) {
      this.currStrategy.onDrag(e);
    }
  }
  onEnd(e: PointerEvent) {
    if (this.currStrategy) {
      this.currStrategy.onEnd(e);
    }
    this.currStrategy = null;
  }
}