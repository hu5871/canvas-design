import Design from "..";
import { ControlHandle } from "../control_handle_manager/handler";
import { calcRectBbox } from "../geo";
import { Matrix, applyMatrix, identityMatrix, invertMatrix } from "../geo/geo_matrix";
import { normalizeRect } from "../scene";
import { IAdvancedAttrs, IBox, IGraphicsAttrs, IGraphicsOpts, IMatrixArr, IPoint, IRect, Optional } from "../types";
import { cloneDeep } from "../utils/loadsh";
import getDpr from "../utils/dpr";
import { isPointInTransformedRect } from "../utils/hitTest";
import { omit } from "../utils/omit";
import { UniqueId } from "../utils/uuid";
import { getTransformAngle } from "../geo/geo_angle";
import { recomputeTransformRect } from "../geo/geo_rect";
import { ITransformRect } from "../control_handle_manager/types";
import { resizeLine, resizeRect } from "../tool/resize";

let STATE = 0;



export const multiplyMatrix = (m1: IMatrixArr, m2: IMatrixArr): IMatrixArr => {
  const a1 = m1[0];
  const b1 = m1[1];
  const c1 = m1[2];
  const d1 = m1[3];

  return [
    m2[0] * a1 + m2[1] * c1,
    m2[0] * b1 + m2[1] * d1,
    m2[2] * a1 + m2[3] * c1,
    m2[2] * b1 + m2[3] * d1,
    m2[4] * a1 + m2[5] * c1 + m1[4],
    m2[4] * b1 + m2[5] * d1 + m1[5],
  ];
};
export class Graphics<ATTRS extends IGraphicsAttrs = IGraphicsAttrs> {
  childrenGraphics: Graphics[] = []
  attrs: ATTRS;
  design: Design;
  private noCollectUpdate: boolean;
  constructor(
    attrs: Optional<ATTRS, 'state'|'__id'|'transform'|'type'|'field'>,
    design: Design,
    opts?: IGraphicsOpts,
  ) {
    this.design = design
    const { v } = design.setting
    const transform = attrs?.transform || identityMatrix()
    const advancedAttrs = opts?.advancedAttrs;
    if (advancedAttrs && !attrs.transform) {
      if (advancedAttrs.x !== undefined) {
        transform[4] = advancedAttrs.x;
      }
      if (advancedAttrs.y !== undefined) {
        transform[5] = advancedAttrs.y;
      }
    }
    this.attrs = { ...attrs } as ATTRS;
    this.attrs.__version = attrs.__version ?? v;
    this.attrs.__id = attrs.__id ?? UniqueId();
    this.attrs.transform = transform;
    this.attrs.state = attrs.state ?? STATE;
    this.noCollectUpdate=Boolean(opts?.noCollectUpdate)
    this.customAttrs(attrs)
  }


  customAttrs(_: Optional<ATTRS, 'state'|'__id'|'transform'|'type'|'field'>) {
  }

  getWorldTransform(): IMatrixArr {
    const parent = this.getParent();
    if (parent) {
      return multiplyMatrix(parent.getWorldTransform(), this.attrs.transform);
    }
    return [...this.attrs.transform];
  }


  isVisible(){
    return this.attrs.visible ?? true;
  }

  getParent(){
    return  this.design.sceneGraph.getParent(this.attrs.__id as string);
  }

  getId(){
    return this.attrs.__id
  }

  updateAttrs(partialAttrs: Partial<IGraphicsAttrs > & IAdvancedAttrs) {
    if (!partialAttrs.transform) {
      if (partialAttrs.x !== undefined) {
        this.attrs.transform[4] = (partialAttrs.x)
      }
      if (partialAttrs.y !== undefined) {
        this.attrs.transform[5] = (partialAttrs.y)
      }
    }
    if (partialAttrs.rotate !== undefined) {
      this.setRotate(partialAttrs.rotate);
    }

    let attrs = omit(partialAttrs, 'x', 'y','rotate') as Partial<ATTRS>
  
    for (const key in attrs) {
      if (attrs[key as keyof ATTRS] !== undefined) {
        (this.attrs as any)[key as keyof ATTRS] = attrs[key as keyof ATTRS]
      }
    }
  }

  
  /**
   * calculate new attributes by control handle
   */
  calcNewAttrsByControlHandle(
    /** 'se' | 'ne' | 'nw' | 'sw' | 'n' | 'e' | 's' | 'w' */
    type: string,
    newPos: IPoint,
    oldRect: ITransformRect,
    oldWorldTransform: IMatrixArr,
    isShiftPressing = false,
    isAltPressing = false,
    flipWhenResize?: boolean,
  ): Partial<ATTRS> {
    const parentTf = this.getParentWorldTransform();
    oldRect = {
      width: oldRect.width,
      height: oldRect.height,
      transform: oldWorldTransform,
    };
    const rect =
      this.attrs.height === 0
        ? resizeLine(type, newPos, oldRect, {
            keepPolarSnap: isShiftPressing,
            scaleFromCenter: isAltPressing,
          })
        : resizeRect(type, newPos, oldRect, {
            keepRatio: isShiftPressing,
            scaleFromCenter: isAltPressing,
            flip: flipWhenResize,
          });
    rect.transform = multiplyMatrix(invertMatrix(parentTf), rect.transform);
    return rect as Partial<ATTRS>;
  }


  getBbox(): Readonly<IBox> {
    return calcRectBbox({
      ...this.getSize(),
      transform: this.getWorldTransform(),
    });
  }


  getJson(): ATTRS {
    return { ...this.attrs }
  }


  getLocalPosition() {
    return { x: this.attrs.transform[4], y: this.attrs.transform[5] };
  }

  getRotate() {
    return getTransformAngle(this.getWorldTransform());
  }

  setRotate(newRotate: number, center?: IPoint) {
    const rotate = this.getRotate();
    const delta = newRotate - rotate;
    center ??= this.getWorldCenter();
    const rotateMatrix = new Matrix()
      .translate(-center.x, -center.y)
      .rotate(delta)
      .translate(center.x, center.y);
    this.prependWorldTransform(rotateMatrix.getArray());
  }

  dRotate(dRotation: number, originWorldTf: IMatrixArr, center: IPoint) {
    const rotateMatrix = new Matrix()
      .translate(-center.x, -center.y)
      .rotate(dRotation)
      .translate(center.x, center.y);

    const newWoldTf = rotateMatrix
      .append(new Matrix(...originWorldTf))
      .getArray();

    this.setWorldTransform(newWoldTf);
  }

  prependWorldTransform(m: IMatrixArr) {
    const parentTf = this.getParentWorldTransform();
    const tf = multiplyMatrix(
      m,
      multiplyMatrix(parentTf, this.attrs.transform),
    );
    this.updateAttrs(
      recomputeTransformRect({
        ...this.getSize(),
        transform: multiplyMatrix(invertMatrix(parentTf), tf),
      }),
    );
  }

  getWorldCenter(): IPoint {
    const tf = new Matrix(...this.getWorldTransform());
    return tf.apply({
      x: this.attrs.width / 2,
      y: this.attrs.height / 2,
    });
  }



  drawOutLine() {
    const { width, height } = this.attrs
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.beginPath();
    ctx.transform(...this.getWorldTransform());
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5]);
    ctx.rect(0, 0, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  hitTest(point: IPoint, tol = 0) {
    return isPointInTransformedRect(
      point,
      {
        ...this.getSize(),
        transform: this.getWorldTransform(),
      },
      tol+ this.getStrokeWidth() / 2,
    );
  }

  getStrokeWidth(){
    return this.attrs.strokeWidth ?? 0;
  }


  getParentWorldTransform() {
    const parent = this.getParent();
    return parent ? parent.getWorldTransform() : identityMatrix();
  }

  setWorldTransform(worldTf: IMatrixArr){
    const parentTf = this.getParentWorldTransform();
    const localTf = multiplyMatrix(invertMatrix(parentTf), worldTf);
    this.updateAttrs({
      transform: localTf,
    });
  }

  getRect():IRect {
    return {
      ...this.getLocalPosition(),
      width: this.attrs.width,
      height: this.attrs.height,
    };
  }

  getAttrs(): ATTRS {
    return cloneDeep(this.attrs);
  }

  getSize(){
    return {
      width:this.attrs.width,
      height:this.attrs.height
    }
  }


  draw() {
  
  }


  cancelCollectUpdate() {
    this.noCollectUpdate = true;
  }


  getControlHandles(_zoom: number, _initial?: boolean): ControlHandle[] {
    return [];
  }


}
