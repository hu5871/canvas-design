import { Graphics } from '../graphics/graphics';
import Design from "..";
import { IPoint } from "../types";
import { ITool, ToolType } from "./tpyes";
import { Move } from "./move";
import { Resize } from "./resize";
import { Template } from "../graphics/template";
import { Rotation } from "./rotation";
import { isRotationCursor } from "../cursor";

export class SelectedTool implements ITool {
  static type: ToolType = "select";
  static toolName = '选择'
  private startPoint: IPoint = { x: -1, y: -1 };

  // 策略
  private readonly strategyMove: Move;
  private readonly strategySelectResize: Resize;
  private readonly strategySelectRotation: Rotation;
  private currStrategy: ITool | null = null;

  constructor(private design: Design) {
    this.strategyMove = new Move(design);
    this.strategySelectResize = new Resize(design);
    this.strategySelectRotation = new Rotation(design)
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
      } else {
        this.currStrategy = this.strategySelectResize;
      }
    } else {
      if (curTemp) {
        //选中子图形
        this.currStrategy = this.strategyMove;
        childGraphics = curTemp.childrenGraphics.find(graphics => {
          return graphics.hitTest(this.startPoint, this.design.setting.get("selectionHitPadding") / this.design.zoom.getZoom())
        })
      }
      let graphics: Graphics | undefined = childGraphics || curTemp
      this.design.store.selectGraphics(graphics)
      this.design.sceneGraph.selectedGraphics(graphics ? {...graphics.getGraphicsInfo()} : undefined)
    }

    if (this.currStrategy) {
      this.currStrategy.onActive();
      this.currStrategy.onStart(e);
    }
    this.design.render()
  }

  onDrag(e: PointerEvent) {
    if (this.currStrategy) {
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