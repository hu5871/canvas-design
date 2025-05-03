import { ITransformRect } from "../control_handle_manager/types";
import { IBox, IMatrixArr, IPoint, IRect, ISize } from "../types";
import { Matrix } from "./geo_matrix";
import { distance } from "./geo_point";

export const rectToVertices = (rect: IRect, tf?: IMatrixArr): IPoint[] => {
  const { x, y, width, height } = rect;
  let pts = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
  if (tf) {
    const matrix = new Matrix(...tf);
    pts = pts.map((point) => {
      const pt = matrix.apply(point);
      return { x: pt.x, y: pt.y };
    });
  }
  return pts;
};


export const offsetRect = (rect: IRect, padding: number | number[]) => {
  if (typeof padding === 'number') {
    padding = [padding, padding, padding, padding];
  }
  const { x, y, width, height } = rect;

  return {
    x: x - padding[3],
    y: y - padding[0],
    width: width + padding[1] + padding[3],
    height: height + padding[0] + padding[2],
  };
};



/** get mid-point of each segment */
export const rectToMidPoints = (rect: IRect) => {
  const { x, y, width, height } = rect;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return [
    { x: x + halfWidth, y },
    { x: x + width, y: y + halfHeight },
    { x: x + halfWidth, y: y + height },
    { x, y: y + halfHeight },
  ];
};


/**
 * 重新计算 width、height 和 transform
 * 确保 transform 后的 size 和 transform 前的 size 相同
 */
export const recomputeTransformRect = (
  rect: ITransformRect,
): ITransformRect => {
  const newSize = getTransformedSize(rect);
  const scaleX = newSize.width ? rect.width / newSize.width : 1;
  const scaleY = newSize.height ? rect.height / newSize.height : 1;
  const scaleMatrix = new Matrix().scale(scaleX, scaleY);

  const tf = new Matrix(...rect.transform).append(scaleMatrix);
  return {
    width: newSize.width,
    height: newSize.height,
    transform: tf.getArray(),
  };
};



export const getTransformedSize = (rect: ITransformRect): ISize => {
  const tf = new Matrix(
    rect.transform[0],
    rect.transform[1],
    rect.transform[2],
    rect.transform[3],
    0,
    0,
  );
  const rightTop = tf.apply({ x: rect.width, y: 0 });
  const leftBottom = tf.apply({ x: 0, y: rect.height });
  const zero = { x: 0, y: 0 };
  return {
    width: distance(rightTop, zero),
    height: distance(leftBottom, zero),
  };
};


export const boxToRect = (box: IBox): IRect => {
  return {
    x: box.minX,
    y: box.minY,
    width: box.maxX - box.minX,
    height: box.maxY - box.minY,
  };
};
