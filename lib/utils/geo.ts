import { getSweepAngle } from "../geo/geo_angle";
import { HALF_PI } from "../setting";
import { IRect } from "../types";

export const adjustSizeToKeepPolarSnap = (rect: IRect): IRect => {
  const radian = getSweepAngle(
    { x: 0, y: -1 },
    {
      x: rect.width,
      y: rect.height,
    },
  );

  const { width, height } = rect;
  const remainder = radian % HALF_PI;
  if (remainder < Math.PI / 8 || remainder > (Math.PI * 3) / 8) {
    if (Math.abs(width) > Math.abs(height)) {
      rect.height = 0;
    } else {
      rect.width = 0;
    }
  } else {
    const min = Math.min(Math.abs(width), Math.abs(height));
    const max = Math.max(Math.abs(width), Math.abs(height));
    const size = min + (max - min) / 2;

    rect.height = (Math.sign(height) || 1) * size;
    rect.width = (Math.sign(width) || 1) * size;
  }
  return rect;
};