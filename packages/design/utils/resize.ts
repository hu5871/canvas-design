import { ITransformRect } from "../control_handle_manager/types";
import { getSweepAngle } from "../geo/geo_angle";
import { getPolarTrackSnapPt } from "../geo/geo_line";
import { Matrix } from "../geo/geo_matrix";
import { distance } from "../geo/geo_point";
import { IPoint } from "../types";




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

/**
 * Get the new position of the line when resizing
 * we consider the graphics with 0 height as a line
 *
 * TODO: reuse, this is something same code in tool_draw_graph.ts
 */
export const resizeLine = (
  /** control type, 'se' | 'ne' | 'nw' | 'sw' */
  type: string,
  newPos: IPoint,
  rect: ITransformRect,
  options: {
    /** keep rotation in 0 45 90 ... */
    keepPolarSnap?: boolean;
    scaleFromCenter?: boolean;
  } = {
    keepPolarSnap: false,
    scaleFromCenter: false,
  },
): ITransformRect => {
  if (!['se', 'ne', 'nw', 'sw'].includes(type)) {
    throw new Error(`invalid type "${type}"`);
  }

  const isRightControl = type === 'se' || type === 'ne';

  let globalOrigin: IPoint = { x: 0, y: 0 };
  if (options.scaleFromCenter) {
    globalOrigin = new Matrix(...rect.transform).apply({
      x: rect.width / 2,
      y: rect.height / 2,
    });
  } else if (isRightControl) {
    globalOrigin = {
      x: rect.transform[4],
      y: rect.transform[5],
    };
  } else {
    globalOrigin = new Matrix(...rect.transform).apply({
      x: rect.width,
      y: rect.height,
    });
  }

  if (options.keepPolarSnap) {
    newPos = getPolarTrackSnapPt(globalOrigin, newPos);
  }

  let width = distance(newPos, globalOrigin);
  if (options.scaleFromCenter) {
    width *= 2;
  }

  if (isRightControl) {
    const offset = {
      x: newPos.x - globalOrigin.x,
      y: newPos.y - globalOrigin.y,
    };
    const rotate = getSweepAngle(
      { x: 1, y: 0 },
      {
        x: newPos.x - globalOrigin.x,
        y: newPos.y - globalOrigin.y,
      },
    );
    const tf = new Matrix()
      .rotate(rotate)
      .translate(globalOrigin.x, globalOrigin.y);

    if (options.scaleFromCenter) {
      tf.translate(-offset.x, -offset.y);
    }

    return {
      width,
      height: 0,
      transform: tf.getArray(),
    };
  } else {
    const offset = {
      x: globalOrigin.x - newPos.x,
      y: globalOrigin.y - newPos.y,
    };
    const rotate = getSweepAngle({ x: 1, y: 0 }, offset);

    const tf = new Matrix().rotate(rotate);
    const newRightBottom = tf.apply({ x: width, y: rect.height });
    tf.translate(
      globalOrigin.x - newRightBottom.x,
      globalOrigin.y - newRightBottom.y,
    );

    if (options.scaleFromCenter) {
      tf.translate(offset.x, offset.y);
    }

    return {
      width,
      height: 0,
      transform: tf.getArray(),
    };
  }
};
