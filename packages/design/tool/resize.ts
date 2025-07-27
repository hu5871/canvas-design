import Design from "..";
import { isTransformHandle } from "../control_handle_manager";
import { ITransformRect } from "../control_handle_manager/types";
import { getSweepAngle } from "../geo/geo_angle";
import { getPolarTrackSnapPt } from "../geo/geo_line";
import { Matrix, invertMatrix } from "../geo/geo_matrix";
import { distance } from "../geo/geo_point";
import { recomputeTransformRect } from "../geo/geo_rect";
import { Graphics, multiplyMatrix } from "../graphics/graphics";
import { IGraphicsAttrs, IMatrixArr, IPoint } from "../types";
import { cloneDeep, isEqual } from "../utils/loadsh";
import { resizeRect } from "../utils/resize";
import { SnapHelper } from "../utils/snap";
import { IBaseTool } from "./tpyes";


export class Resize implements IBaseTool {
  type = 'resize'
  private startPoint: IPoint = { x: -1, y: -1 };
  private prevLastPoint: IPoint | null = null;
  private lastPoint: IPoint | null = null;
  private handleName!: string;
  private originAttrs: IGraphicsAttrs | null = null
  private updatedAttrs: Partial<IGraphicsAttrs> | null = null
  private originWorldTransform: IMatrixArr | null = null
  constructor(private design: Design) {
  }

  onActive() {

  }

  onInactive() { }

  onStart(e: PointerEvent) {
    this.startPoint = this.design.canvas.getSceneCursorXY(e);
    //获取控制点
    const handleInfo = this.design.sceneGraph.controlHandleManager.getHandleInfoByPoint(
      this.startPoint,
    );

    if (!handleInfo) return


    const selectedGraphics = this.design.store.getGraphics()
    if (!selectedGraphics) return

    this.originAttrs = selectedGraphics.getAttrs()
    this.originWorldTransform = [
      ...selectedGraphics.getWorldTransform(),
    ]
    this.handleName = handleInfo.handleName;
  }

  onDrag(e: PointerEvent) {
    if(!this.design.store.getGraphics()?.getParent()?.isEdit()) return 
    this.lastPoint = this.design.canvas.getSceneCursorXY(e);
    const prevLastPoint = this.prevLastPoint;
    this.prevLastPoint = this.lastPoint;
    const enableGripSnap = this.design.setting.get('snapToGrid') &&
    (['nw', 'ne', 'se', 'sw'].includes(this.handleName) ||
      (['n', 'e', 's', 'w'].includes(this.handleName) ) )
        if (enableGripSnap) {
      this.lastPoint = SnapHelper.getSnapPtBySetting(
        this.lastPoint,
        this.design.setting,
      );
    }

    //判断相等
    if (isEqual(prevLastPoint, this.lastPoint)) {
      return;
    }
    this.updateGraphics();
    this.design.render();
  }
  onEnd(_e: PointerEvent) {
    const selectedItem = this.design.store.getGraphics()
    if (!selectedItem) return
    this.design.render();
    this.originAttrs = null;
    this.updatedAttrs = null;
    this.startPoint = { x: -1, y: -1 };
    this.lastPoint = null;
  }

  isResizeOp(){
    return ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'].includes(
      this.handleName,
    );
  }

  private updateSingleGraphics(graphics: Graphics,originAttrs:IGraphicsAttrs,originWorldTf:IMatrixArr) {
    const updatedAttrs = graphics.calcNewAttrsByControlHandle(
      this.handleName,
      this.lastPoint!,
      originAttrs,
      originWorldTf,
      this.design.designEvent.isShiftPressing,
      this.design.designEvent.isAltPressing,
      this.design.setting.get('flipObjectsWhileResizing'),
    );

    graphics.updateAttrs(updatedAttrs);
    this.updatedAttrs=cloneDeep(updatedAttrs);
    this.updateControls(graphics);
  }

  updateGraphics() {
    if (!this.lastPoint) return;
    const selectedGraphics = this.design.store.getGraphics()
    if(!selectedGraphics) return 
    let prependedTransform: Matrix = new Matrix();
    const originWorldTf = this.originWorldTransform!
    const originAttrs = this.originAttrs!
    if (!this.isResizeOp() || selectedGraphics.attrs.height === 0) {
      this.updateSingleGraphics(selectedGraphics,originAttrs,originWorldTf);
      return;
    }
    const updatedTransformRect = resizeRect(
      this.handleName,
      this.lastPoint,
      {
        width: originAttrs!.width,
        height: originAttrs!.height,
        transform: originWorldTf!,
      },
      {
        keepRatio: this.design.designEvent.isShiftPressing,
        scaleFromCenter: this.design.designEvent.isAltPressing,
        noChangeWidthAndHeight: true,
        flip: false,
      },
    );

    if (
      !this.checkEnableUpdate(
        originAttrs!,
        recomputeTransformRect(updatedTransformRect) as ITransformRect,
      )
    ) {
      return;
    }

    prependedTransform = new Matrix(...updatedTransformRect.transform).append(
      new Matrix(...originWorldTf!).invert(),
    );

    this.resizeGraphicsArray(prependedTransform.getArray())
    this.updateControls(selectedGraphics!);

  }
  private checkEnableUpdate(
    originAttrs: ITransformRect,
    updatedAttrs: ITransformRect,
  ) {
    if (
      (updatedAttrs.width === 0 || updatedAttrs?.transform?.[0] === 0) &&
      (updatedAttrs.height === 0 || updatedAttrs?.transform?.[3] === 0)
    ) {
      return false;
    }

    const isLineLikeGraph = originAttrs.width === 0 || originAttrs.height === 0;
    if (
      !isLineLikeGraph &&
      (updatedAttrs.width === 0 ||
        updatedAttrs.height === 0 ||
        (updatedAttrs.transform &&
          (updatedAttrs.transform[0] === 0 || updatedAttrs.transform[3]) === 0))
    ) {
      return false;
    }
    return true;
  }

  private updateControls = (graphics: Graphics) => {
    const controlHandleManager = this.design.sceneGraph.controlHandleManager;
    if (
      !isTransformHandle(this.handleName) &&
      controlHandleManager.hasCustomHandles()
    ) {
      const controlHandle = graphics.getControlHandles(
        this.design.zoom.getZoom(),
      );
      if (controlHandle) {
        controlHandleManager.setCustomHandles(controlHandle);
      }
    }
  };


  private resizeGraphicsArray(prependedTransform: IMatrixArr) {
    const selectedItem = this.design.store.getGraphics()
    if (!selectedItem) return
    const originWorldTf = this.originWorldTransform!
    const newWorldTf = multiplyMatrix(prependedTransform, originWorldTf);
    const newLocalTf = multiplyMatrix(
      invertMatrix(selectedItem.getParentWorldTransform()),
      newWorldTf,
    );
    const { width, height } = this.originAttrs!
    const newAttrs = recomputeTransformRect({
      width,
      height,
      transform: newLocalTf,
    });
    selectedItem.updateAttrs(newAttrs);
    this.design.sceneGraph.attrsChange({...selectedItem.getGraphicsInfo()})
    this.updatedAttrs = cloneDeep(newAttrs)

  }

}

