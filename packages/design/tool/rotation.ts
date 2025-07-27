import cloneDeep from "lodash.clonedeep";
import { getSweepAngle } from "../geo/geo_angle";
import { IGraphicsAttrs, IMatrixArr, IPoint } from "../types";
import { IBaseTool } from "./tpyes";
import Design from "..";
import { Graphics } from "../graphics/graphics";
import { boxToRect } from "../geo/geo_rect";
import { getClosestTimesVal } from "../utils/common";
import { getRotationCursor } from "../control_handle_manager/utils";




export class Rotation implements IBaseTool {
  private selectedItem: Graphics | undefined = undefined
  private originWorldTf: IMatrixArr | null = null;


  private lastPoint: IPoint | null = null;
  private startRotation = 0;
  private startBboxRotation = 0;
  private dRotation = 0; // 按下，然后释放的整个过程中，产生的相对角度
  /** center of selected graphs */
  private selectedBoxCenter: IPoint | null = null;
  handleType = '';



  constructor(private design: Design) {
  }

  onActive() {
  }
  onInactive() {
  }
  onStart(e: PointerEvent) {
    this.selectedItem = this.design.store.getGraphics()

    if (!this.selectedItem) return
    this.originWorldTf = this.selectedItem.getWorldTransform()

    const boundingRect = boxToRect(this.selectedItem.getBbox())
    this.selectedBoxCenter = {
      x: boundingRect.x + boundingRect.width / 2,
      y: boundingRect.y + boundingRect.height / 2,
    };

    const mousePoint = this.design.canvas.getSceneCursorXY(e);
    this.startRotation = getSweepAngle(
      { x: 0, y: -1 },
      {
        x: mousePoint.x - this.selectedBoxCenter.x,
        y: mousePoint.y - this.selectedBoxCenter.y,
      },
    );
    this.startBboxRotation = this.selectedItem.getRotate();
  }
  onDrag(e: PointerEvent) {

    this.lastPoint = this.design.canvas.getSceneCursorXY(e);
    this.rotateSelectedGraphics();
  }
  private rotateSelectedGraphics() {
    const lastPoint = this.lastPoint;
    if (!lastPoint) return;

    const design = this.design;
    const selectedItem = this.selectedItem;

    const { x: cxInSelectedElementBBox, y: cyInSelectedElementBBox } =
      this.selectedBoxCenter!;

    const lastMouseRotation = getSweepAngle(
      { x: 0, y: -1 },
      {
        x: lastPoint.x - cxInSelectedElementBBox,
        y: lastPoint.y - cyInSelectedElementBBox,
      },
    );

    this.dRotation = lastMouseRotation - this.startRotation;
    if (design.designEvent.isShiftPressing) {
      const lockRotation = design.setting.get('lockRotation');
      const bboxRotation = this.startBboxRotation + this.dRotation;
      this.dRotation =
        getClosestTimesVal(bboxRotation, lockRotation!) - this.startBboxRotation;
    }

    // update cursor
    design.canvas.Cursor.setCursor(
      getRotationCursor(this.handleType, {
        ...selectedItem!.getSize(),
        transform: selectedItem!.getWorldTransform()
      }),
    );

    selectedItem!.dRotate(
      this.dRotation,
      this.originWorldTf!,
      {
        x: cxInSelectedElementBBox,
        y: cyInSelectedElementBBox,
      },
    );

    this.design.sceneGraph.attrsChange({...selectedItem!.getGraphicsInfo()})
    this.design.render();
  }
  onEnd() {
    this.lastPoint = null;
    this.dRotation = 0;
    this.selectedBoxCenter = null;
    this.design.canvas.Cursor.setCursor("default");
  }

}
