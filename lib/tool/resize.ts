import Design from "..";
import { isTransformHandle } from "../control_handle_manager";
import { ITransformRect } from "../control_handle_manager/types";
import { Matrix, invertMatrix } from "../geo/geo_matrix";
import { recomputeTransformRect } from "../geo/geo_rect";
import { Graphics, multiplyMatrix } from "../graphics/graphics";
import { IGraphicsAttrs, IMatrixArr, IPoint } from "../types";
import { cloneDeep, isEqual } from "../utils/loadsh";
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
    if (!selectedItem) {
      return;
    }
    this.design.render();

    this.originAttrs = null;
    this.updatedAttrs = null;
    this.startPoint = { x: -1, y: -1 };

    this.lastPoint = null;

  }

  updateGraphics() {
    if (!this.lastPoint) return;
    let prependedTransform: Matrix = new Matrix();

    const originWorldTf = this.originWorldTransform
    const originAttrs = this.originAttrs

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

    const selectedGraphics = this.design.store.getGraphics()

    if(!selectedGraphics) return 

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
    this.updatedAttrs = cloneDeep(newAttrs)
  }

}



// 缩放操作的行为
interface IResizeOp {
  getLocalOrigin(width: number, height: number): IPoint; // 获取局部原点
  getNewSize(
    newLocalPt: IPoint, // 新的局部点
    localOrigin: IPoint, // 局部原点
    rect: { width: number; height: number }, // 当前矩形的宽高
  ): {
    width: number; // 计算得到的新宽度
    height: number; // 计算得到的新高度
  };
  /**
   * 在保持缩放比例时，判断是基于 width 还是 height 去计算新的 width 和 height
   */
  isBaseWidthWhenKeepRatio(isWidthLarger: boolean): boolean;
  /**
   * 当从中心缩放时，对尺寸进行修正
   */
  getSizeWhenScaleFromCenter(
    width: number, // 当前宽度
    height: number, // 当前高度
  ): { width: number; height: number }; // 返回修正后的宽高
}

// 定义一个函数，将尺寸加倍
const doubleSize = (width: number, height: number) => ({
  width: width * 2, // 宽度加倍
  height: height * 2, // 高度加倍
});

// 定义不同方向的缩放操作
const resizeOps: Record<string, IResizeOp> = {
  sw: {
    getLocalOrigin: (width: number) => ({ x: width, y: 0 }), // 左下角的局部原点
    getNewSize: (newLocalPt: IPoint, localOrigin: IPoint) => ({
      width: localOrigin.x - newLocalPt.x, // 计算新的宽度
      height: newLocalPt.y - localOrigin.y, // 计算新的高度
    }),
    isBaseWidthWhenKeepRatio: (isWidthLarger: boolean) => isWidthLarger, // 基于宽度保持比例
    getSizeWhenScaleFromCenter: doubleSize, // 缩放时修正尺寸
  },
  se: {
    getLocalOrigin: () => ({ x: 0, y: 0 }), // 右下角的局部原点
    getNewSize: (newLocalPt, localOrigin) => ({
      width: newLocalPt.x - localOrigin.x, // 计算新的宽度
      height: newLocalPt.y - localOrigin.y, // 计算新的高度
    }),
    isBaseWidthWhenKeepRatio: (isWidthLarger: boolean) => isWidthLarger,
    getSizeWhenScaleFromCenter: doubleSize,
  },
  nw: {
    getLocalOrigin: (width, height) => ({ x: width, y: height }), // 左上角的局部原点
    getNewSize: (newLocalPt, localOrigin) => ({
      width: localOrigin.x - newLocalPt.x, // 计算新的宽度
      height: localOrigin.y - newLocalPt.y, // 计算新的高度
    }),
    isBaseWidthWhenKeepRatio: (isWidthLarger: boolean) => isWidthLarger,
    getSizeWhenScaleFromCenter: doubleSize,
  },
  ne: {
    getLocalOrigin: (_width, height) => ({ x: 0, y: height }), // 右上角的局部原点
    getNewSize: (newLocalPt, localOrigin) => ({
      width: newLocalPt.x - localOrigin.x, // 计算新的宽度
      height: localOrigin.y - newLocalPt.y, // 计算新的高度
    }),
    isBaseWidthWhenKeepRatio: (isWidthLarger: boolean) => isWidthLarger,
    getSizeWhenScaleFromCenter: doubleSize,
  },
  n: {
    getLocalOrigin: (width, height) => ({ x: width / 2, y: height }), // 顶部中央的局部原点
    getNewSize: (newLocalPt, localOrigin, rect) => ({
      width: rect.width, // 宽度保持不变
      height: localOrigin.y - newLocalPt.y, // 计算新的高度
    }),
    isBaseWidthWhenKeepRatio: () => false, // 不基于宽度保持比例
    getSizeWhenScaleFromCenter: (width, height) => ({
      width: width, // 宽度保持不变
      height: height * 2, // 高度加倍
    }),
  },
  s: {
    getLocalOrigin: (width) => ({ x: width / 2, y: 0 }), // 底部中央的局部原点
    getNewSize: (newLocalPt, localOrigin, rect) => ({
      width: rect.width, // 宽度保持不变
      height: newLocalPt.y - localOrigin.y, // 计算新的高度
    }),
    isBaseWidthWhenKeepRatio: () => false, // 不基于宽度保持比例
    getSizeWhenScaleFromCenter: (width, height) => ({
      width: width, // 宽度保持不变
      height: height * 2, // 高度加倍
    }),
  },
  e: {
    getLocalOrigin: (_width, height) => ({ x: 0, y: height / 2 }), // 右侧中央的局部原点
    getNewSize: (newLocalPt, localOrigin, rect) => ({
      width: newLocalPt.x - localOrigin.x, // 计算新的宽度
      height: rect.height, // 高度保持不变
    }),
    isBaseWidthWhenKeepRatio: () => true, // 基于宽度保持比例
    getSizeWhenScaleFromCenter: (width, height) => ({
      width: width * 2, // 宽度加倍
      height: height, // 高度保持不变
    }),
  },
  w: {
    getLocalOrigin: (width, height) => ({ x: width, y: height / 2 }), // 左侧中央的局部原点
    getNewSize: (newLocalPt, localOrigin, rect) => ({
      width: localOrigin.x - newLocalPt.x, // 计算新的宽度
      height: rect.height, // 高度保持不变
    }),
    isBaseWidthWhenKeepRatio: () => true, // 基于宽度保持比例
    getSizeWhenScaleFromCenter: (width, height) => ({
      width: width * 2, // 宽度加倍
      height: height, // 高度保持不变
    }),
  },
};

/**
 * 获取缩放后的矩形
 * 用于缩放操作
 */
export const resizeRect = (
  /** 'se' | 'ne' | 'nw' | 'sw' | 'n' | 'e' | 's' | 'w' */
  type: string, // 缩放类型
  newGlobalPt: IPoint, // 新的全局点
  rect: ITransformRect, // 当前矩形
  options?: {
    keepRatio?: boolean; // 是否保持比例
    scaleFromCenter?: boolean; // 是否从中心缩放
    noChangeWidthAndHeight?: boolean; // 是否不改变宽高
    flip?: boolean; // 是否翻转
  },
): ITransformRect => {
  const resizeOp = resizeOps[type]; // 获取对应的缩放操作
  if (!resizeOp) {
    throw new Error(`resize type ${type} is invalid`); // 无效的缩放类型
  }

  const {
    keepRatio, // 保持比例选项
    scaleFromCenter, // 从中心缩放选项
    noChangeWidthAndHeight, // 不改变宽高选项
    flip = true, // 默认翻转为 true
  } = options ?? {};

  const transform = new Matrix(...rect.transform); // 创建变换矩阵
  const newRect = {
    width: 0, // 新的宽度
    height: 0, // 新的高度
    transform: transform.clone(), // 克隆变换矩阵
  };

  // 计算局部原点，考虑是否从中心缩放
  const localOrigin = scaleFromCenter
    ? { x: rect.width / 2, y: rect.height / 2 } // 从中心缩放
    : resizeOp.getLocalOrigin(rect.width, rect.height); // 通过操作获取局部原点

  // 将全局点转换为局部点
  const newLocalPt = transform.applyInverse(newGlobalPt);
  // FIXME: 考虑宽度或高度为 0 的情况
  let size = resizeOp.getNewSize(newLocalPt, localOrigin, rect); // 获取新的尺寸

  // 如果选择从中心缩放，修正尺寸
  if (scaleFromCenter) {
    size = resizeOp.getSizeWhenScaleFromCenter(size.width, size.height);
  }

  // 如果需要保持比例
  if (keepRatio) {
    const ratio = rect.width / rect.height; // 当前宽高比
    const newRatio = Math.abs(size.width / size.height); // 新的宽高比
    const isWidthLarger = newRatio > ratio; // 判断新宽高比是否大于当前宽高比
    // 根据比例调整宽高
    if (resizeOp.isBaseWidthWhenKeepRatio(isWidthLarger)) {
      size.height = (Math.sign(size.height) * Math.abs(size.width)) / ratio; // 基于宽度调整高度
    } else {
      size.width = Math.sign(size.width) * Math.abs(size.height) * ratio; // 基于高度调整宽度
    }
  }

  const scaleTf = new Matrix(); // 创建新的缩放矩阵
  const scaleX = Math.sign(size.width) || 1; // 获取宽度的符号
  const scaleY = Math.sign(size.height) || 1; // 获取高度的符号

  // 根据选项决定是否改变宽高
  if (noChangeWidthAndHeight) {
    scaleTf.scale(size.width / rect.width, size.height / rect.height); // 缩放比例
    newRect.width = rect.width; // 新宽度不变
    newRect.height = rect.height; // 新高度不变
  } else {
    newRect.width = Math.abs(size.width); // 新宽度
    newRect.height = Math.abs(size.height); // 新高度
    scaleTf.scale(scaleX, scaleY); // 按照符号进行缩放
  }

  newRect.transform = newRect.transform.append(scaleTf); // 更新变换矩阵

  // 计算新的全局原点
  const newGlobalOrigin = newRect.transform.apply(
    scaleFromCenter
      ? { x: newRect.width / 2, y: newRect.height / 2 } // 从中心缩放时的原点
      : resizeOp.getLocalOrigin(newRect.width, newRect.height), // 否则获取局部原点
  );
  const globalOrigin = transform.apply(localOrigin); // 计算当前全局原点

  // 计算偏移量
  const offset = {
    x: globalOrigin.x - newGlobalOrigin.x, // x 方向偏移
    y: globalOrigin.y - newGlobalOrigin.y, // y 方向偏移
  };
  newRect.transform.prepend(new Matrix().translate(offset.x, offset.y)); // 应用偏移

  // 如果不翻转，应用翻转修正
  if (!flip) {
    const flipFixedTf = new Matrix()
      .translate(-newRect.width / 2, -newRect.height / 2) // 平移到中心
      .scale(scaleX, scaleY) // 应用缩放
      .translate(newRect.width / 2, newRect.height / 2); // 平移回原位置
    newRect.transform.append(flipFixedTf); // 更新变换矩阵
  }

  return {
    width: newRect.width, // 返回新的宽度
    height: newRect.height, // 返回新的高度
    transform: newRect.transform.getArray(), // 返回新的变换矩阵
  };
};

