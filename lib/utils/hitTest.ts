import { Matrix } from "../geo/geo_matrix";
import { IMatrixArr, IPoint, IRect } from "../types"


export const isPointInTransformedRect = (
  point: IPoint,
  rect: {
    width: number;
    height: number;
    transform?: IMatrixArr;
  },
  tol = 0,
) => {
  if (rect.transform) {
    const matrix = new Matrix(...rect.transform);
    point = matrix.applyInverse(point);
  }

  return (
    point.x >= -tol &&
    point.y >= -tol &&
    point.x <= rect.width + tol &&
    point.y <= rect.height + tol
  );
};