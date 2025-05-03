import { IPoint } from "../types";
import { distance } from "./geo_point";




/**
 * 获取线p1-p2上最接近p的点
 */
export const closestPtOnLine = (
  p1: IPoint,
  p2: IPoint,
  p: IPoint,
  canOutside = true,
) => {
  if (p1.x === p2.x && p1.y === p2.y) {
    return {
      t: 0,
      point: { x: p1.x, y: p1.y },
    };
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / (dx * dx + dy * dy);
  if (!canOutside) {
    t = Math.max(0, Math.min(1, t));
  }
  const closestPt = {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };
  return {
    t,
    point: closestPt,
  };
};

/**
 * 获得极坐标的最近点。0、45、90、135、150
 */
export const getPolarTrackSnapPt = (center: IPoint, p: IPoint, count = 4) => {
  let closestPt: IPoint = { x: 0, y: 0 };
  let closestDist = Infinity;
  for (let i = 1; i <= count; i++) {
    const rad = (Math.PI / count) * i;
    const pt = {
      x: center.x + Math.cos(rad),
      y: center.y + Math.sin(rad),
    };
    const { point } = closestPtOnLine(center, pt, p);
    const dist = distance(point, p);
    if (dist === 0) {
      return point;
    }
    if (dist < closestDist) {
      closestDist = dist;
      closestPt = point;
    }
  }
  return closestPt;
};
