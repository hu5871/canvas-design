import { ITransformRect } from "../control_handle_manager/types";
import { IBox, IPoint } from "../types";
import { applyMatrix } from "./geo_matrix";
import { rectToVertices } from "./geo_rect";

/**
 * calculate AABB
 */
export const calcRectBbox = (
  transformRect: ITransformRect,
  paddingBeforeTransform?: number,
): Readonly<IBox> => {
  // 直接计算矩形的起始坐标和尺寸
  const halfPadding = paddingBeforeTransform || 0;
  const x = -halfPadding;
  const y = -halfPadding;
  const width = transformRect.width + 2 * halfPadding;
  const height = transformRect.height + 2 * halfPadding;

  const tf = transformRect.transform;

  // 计算四个顶点 (避免单独调用 rectToVertices)
  const vertices = [
    applyMatrix(tf, { x, y }), // 左上角
    applyMatrix(tf, { x: x + width, y }), // 右上角
    applyMatrix(tf, { x, y: y + height }), // 左下角
    applyMatrix(tf, { x: x + width, y: y + height }), // 右下角
  ];

  // 计算 AABB
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const pt of vertices) {
    minX = Math.min(minX, pt.x);
    minY = Math.min(minY, pt.y);
    maxX = Math.max(maxX, pt.x);
    maxY = Math.max(maxY, pt.y);
  }

  return { minX, minY, maxX, maxY };
};


/**
 * 保留两位小数
 * 如果是 0，丢弃 0
 */
export const remainDecimal = (num: number, precision = 2) => {
  return Number(num.toFixed(precision));
};
