import EventEmitter from "./events/eventEmitter";
import Design from "./index";
import { IPoint, IZoomConfig } from "./types";
import { viewportCoordsToSceneUtil } from "./utils/common";


interface EmitEvents {
  [key: string | symbol]: (...args: any[]) => void
  zoomChange(zoom: number): void;
}
class Zoom {
  private zoom = 1;
  private emitter = new EventEmitter<EmitEvents>()
  config :IZoomConfig = {
    zoomStep: 0.2325,
    zoomMin: 0.015625,
    zoomMax: 256,
    zoomLevels: [
      0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128,
      256,
    ],
  }
  constructor(private design: Design) { }
  getZoom() {
    return this.zoom
  }

  setZoom(zoom: number) {
    const zoomMax = this.config.zoomMax;
    if (zoom > zoomMax) {
      zoom = zoomMax;
    }

    const zoomMin = this.config.zoomMin;
    if (zoom < zoomMin) {
      zoom = zoomMin;
    }
    this.zoom = zoom;

    Promise.resolve().then(() => {
      // 异步通知
      this.emitter.emit('zoomChange', zoom);
    });

  }

  zoomOut(opts?: { center?: IPoint; enableLevel?: boolean }) {
    const zoomStep = this.config.zoomStep;
    const prevZoom = this.zoom;
    let zoom: number;
    if (opts?.enableLevel) {
      const levels = this.config.zoomLevels;
      const [left] = getNearestVals(levels, prevZoom);
      zoom = left;
    } else {
      zoom = Math.max(
        prevZoom / (1 + zoomStep),
        this.config.zoomMin,
      );
    }

    this.setZoom(zoom);
    this.adjustScroll(prevZoom, opts?.center);
  }

  zoomIn(opts?: { center?: IPoint; enableLevel?: boolean }) {
    const zoomStep = this.config.zoomStep;
    const prevZoom = this.zoom;

    let zoom: number;
    if (opts?.enableLevel) {
      const levels = this.config.zoomLevels;
      const [_, right] = getNearestVals(levels, prevZoom);
      zoom = right;
    } else {
      zoom = Math.min(
        prevZoom * (1 + zoomStep),
        this.config.zoomMax
      );
    }

    this.setZoom(zoom);
    this.adjustScroll(prevZoom, opts?.center);
  }


  private adjustScroll(prevZoom: number, center?: IPoint) {
    const canvas = this.design.canvas;
    const zoom = this.zoom;

    const { x: scrollX, y: scrollY } = canvas.getViewPortRect();
    if (!center) {
      center = canvas.center;
    }

    const { x: sceneX, y: sceneY } = viewportCoordsToSceneUtil(
      center.x,
      center.y,
      prevZoom,
      scrollX,
      scrollY,
    );
    const newScrollX = sceneX - center.x / zoom;
    const newScrollY = sceneY - center.y / zoom;

    canvas.setViewport({
      x: newScrollX,
      y: newScrollY,
    });
  }


  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }
}


const getNearestVals = <T>(arr: T[], target: T): [T, T] => {
  let left = 0;
  let right = arr.length - 1;

  // 进行二分查找
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      // 当找到精确的目标值时，最近的值就是目标值本身
      return [arr[mid], arr[mid]];
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 如果边界超出数组范围，进行调整
  if (right < 0) right = 0;
  if (left >= arr.length) left = arr.length - 1;

  // 返回最近的值
  return [arr[right], arr[left]];
};


export default Zoom