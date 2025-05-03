import { IPoint } from "../types";

/**
 * 计算两个点的中点坐标。
 * 
 * @param p1 - 第一个点，具有 `x` 和 `y` 属性的对象。
 * @param p2 - 第二个点，具有 `x` 和 `y` 属性的对象。
 * @returns 一个新的点对象，其 `x` 和 `y` 坐标分别是 `(p1.x + p2.x) / 2` 和 `(p1.y + p2.y) / 2`。
 *          结果表示点 `p1` 和点 `p2` 连线的中点。
 */
export const midPoint = (p1: IPoint, p2: IPoint) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};


/**
 * 计算两个二维点的向量和（即 p1 加上 p2 的结果）。
 * 
 * @param p1 - 第一个点，具有 `x` 和 `y` 属性的对象。
 * @param p2 - 第二个点，具有 `x` 和 `y` 属性的对象。
 * @returns 一个新的点对象，其 `x` 和 `y` 坐标分别是 `p1.x + p2.x` 和 `p1.y + p2.y`。
 *          结果表示点 `p1` 和点 `p2` 的坐标相加形成的新点。
 */
export const pointAdd = (p1: IPoint, p2: IPoint) => {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
};

/**
 * 计算两个二维点之间的欧几里得距离。
 * 
 * @param p1 - 第一个点，具有 `x` 和 `y` 属性的对象。
 * @param p2 - 第二个点，具有 `x` 和 `y` 属性的对象。
 * @returns 两点之间的距离，使用公式 √((x2 - x1)² + (y2 - y1)²) 计算。
 */
export const distance = (p1: IPoint, p2: IPoint) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};


/**
 * 计算两个二维点的向量差（即 p1 减去 p2 的结果）。
 * 
 * @param p1 - 第一个点，具有 `x` 和 `y` 属性的对象。
 * @param p2 - 第二个点，具有 `x` 和 `y` 属性的对象。
 * @returns 一个新的点对象，其 `x` 和 `y` 坐标分别是 `p1.x - p2.x` 和 `p1.y - p2.y`。
 *          结果表示从点 `p2` 指向点 `p1` 的向量。
 */
export const pointSub = (p1: IPoint, p2: IPoint): IPoint => {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
};

//容差精度
const TOL = 0.0000000001;

/**
 * 判断两个二维点是否相等，允许一定的浮点数误差范围。
 * 
 * @param p1 - 第一个点，具有 `x` 和 `y` 属性的对象。
 * @param p2 - 第二个点，具有 `x` 和 `y` 属性的对象。
 * @param tol - 容差值，默认为 0.0000000001。表示两点在 x 和 y 坐标上的最大允许误差。
 * @returns 如果两点的 x 和 y 坐标差值均在容差范围内，则返回 `true`，否则返回 `false`。
 */
export const isPointEqual = (p1: IPoint, p2: IPoint, tol = TOL) => {
  return Math.abs(p1.x - p2.x) < tol && Math.abs(p1.y - p2.y) < tol;
};


/**
 * 将一个二维向量归一化（将其长度调整为 1）。
 * 
 * @param p - 要归一化的向量，表示为具有 `x` 和 `y` 属性的点对象。
 * @returns 一个新的点对象，表示归一化后的单位向量，其方向与原向量相同但长度为 1。
 *          如果输入向量的长度为 0，返回 `{x: NaN, y: NaN}`。
 */
export const normalizeVec = (p: IPoint) => {
  // 计算向量的长度（模）
  const len = Math.sqrt(p.x * p.x + p.y * p.y);
  // 返回归一化后的向量
  return {
    x: p.x / len,
    y: p.y / len,
  };
};

/**
 * 计算一个点沿某条线段的垂线方向偏移指定距离后的两个点。
 * 
 * @param line - 一个线段，由两个点组成的数组，格式为 `[point1, point2]`，表示线段的起点和终点。
 * @param p - 基准点，表示计算垂线偏移的起点。
 * @param distance - 偏移距离，表示从基准点沿垂直方向偏移的长度。
 * @returns 一个包含两个点的数组，分别表示基准点沿垂直方向正向和负向偏移后的点。
 */

export const getPerpendicularPoints = (
  line: [IPoint, IPoint],
  p: IPoint,
  distance: number,
) => {
  // 计算线段的向量
  const vec = pointSub(line[1], line[0]);
  // 计算线段的垂直向量，逆时针旋转 90 度
  const perpendicularVec = {
    x: -vec.y,
    y: vec.x,
  };
  // 将垂直向量归一化，得到单位向量
  const unitVec = normalizeVec(perpendicularVec);
  // 计算基准点沿垂直方向正向偏移后的点
  const p1 = {
    x: p.x + unitVec.x * distance,
    y: p.y + unitVec.y * distance,
  };
  // 计算基准点沿垂直方向负向偏移后的点
  const p2 = {
    x: p.x - unitVec.x * distance,
    y: p.y - unitVec.y * distance,
  };
  // 返回两个偏移点
  return [p1, p2];
};
