import { Graphics } from "../graphics/graphics";
import { IMatrixArr, IPoint } from "../types";
import { ITransformRect } from "./types";


type HitTest = (
  point: IPoint,
  tol: number,
  rect: ITransformRect | null,
) => boolean;
export class ControlHandle {
  cx: number;
  cy: number;
  rotation?: number;
  transform?: IMatrixArr;
  type: string;
  graphics: Graphics;
  padding: number;
  /** rotation will follow rotated bbox */
  isTransformHandle: boolean;
  hitTest?: HitTest;
   constructor(attrs: {
      cx?: number;
      cy?: number;
      type: string;
      rotation?: number;
      transform?: IMatrixArr;
      padding?: number;
      graphics: Graphics;
      hitTest?: HitTest;
      isTransformHandle?: boolean;
    }){
      this.cx = attrs.cx ?? 0;
      this.cy = attrs.cy ?? 0;
      if (attrs.rotation !== undefined) {
        this.rotation = attrs.rotation;
      }
      if (attrs.transform) {
        this.transform = attrs.transform;
      }
      this.type = attrs.type;
      this.padding = attrs.padding ?? 0;
      this.graphics = attrs.graphics;
      // this.getCursor = attrs.getCursor;
      if (attrs.hitTest) {
        this.hitTest = attrs.hitTest;
      }
      this.isTransformHandle = attrs.isTransformHandle ?? false;
  
      this.graphics.cancelCollectUpdate();
   }


}

