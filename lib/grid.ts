import Design from ".";
import { getClosestTimesVal, nearestPixelVal } from "./utils/common";

/**
 * draw grid
 */
class Grid {
  constructor(private design: Design) {}
  draw() {
    const ctx = this.design.canvas.ctx;
    ctx.save();

    const {
      x: offsetX,
      y: offsetY,
      width,
      height,
    } = this.design.canvas.getViewPortRect();
    const zoom = this.design.zoom.getZoom();
    const setting = this.design.setting;
    const stepX = this.design.setting.get('gridViewX');
    const stepY = this.design.setting.get('gridViewY');

    /*** draw vertical lines ***/
    let startXInScene = getClosestTimesVal(offsetX, stepX);
    const endXInScene = getClosestTimesVal(offsetX + width / zoom, stepX);

    while (startXInScene <= endXInScene) {
      ctx.strokeStyle = setting.get('pixelGridLineColor');
      const x = nearestPixelVal((startXInScene - offsetX) * zoom);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.closePath();
      startXInScene += stepX;
    }

    /*** draw horizontal lines ***/
    let startYInScene = getClosestTimesVal(offsetY, stepY);
    const endYInScene = getClosestTimesVal(offsetY + height / zoom, stepY);

    while (startYInScene <= endYInScene) {
      ctx.strokeStyle = setting.get('pixelGridLineColor');
      const y = nearestPixelVal((startYInScene - offsetY) * zoom);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.closePath();
      startYInScene += stepY;
    }

    ctx.restore();
  }
}

export default Grid;