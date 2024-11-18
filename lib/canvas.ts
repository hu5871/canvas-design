import Cursor from "./cursor";
import { DragCanvas } from "./events/drag_canvas";
import Design from "./index";
import { IBox, IRect } from "./types";
import getDpr from "./utils/dpr";



// 工具函数：将场景坐标转换为视口坐标
export const sceneCoordsToViewportUtil = (
  x: number,
  y: number,
  zoom: number,
  scrollX: number,
  scrollY: number,
) => {
  return {
    x: (x - scrollX) * zoom,// 计算视口中的X坐标
    y: (y - scrollY) * zoom,// 计算视口中的Y坐标
  };
};


// 工具函数：将视口坐标转换为场景坐标
export const viewportCoordsToSceneUtil = (
  x: number,
  y: number,
  zoom: number,
  scrollX: number,
  scrollY: number,
  /**
   * 是否四舍五入取整
   */
  round = false,
) => {
  let newX = scrollX + x / zoom;// 计算场景中的X坐标
  let newY = scrollY + y / zoom;// 计算场景中的Y坐标
  if (round) {
    newX = Math.round(newX); // 四舍五入取整X坐标
    newY = Math.round(newY);// 四舍五入取整Y坐标
  }
  return {
    x: newX,
    y: newY,
  };
};

export default class Canvas {
  canvasElement: HTMLCanvasElement;// HTMLCanvasElement实例，用于绘图
  ctx: CanvasRenderingContext2D;// Canvas的2D绘图上下文
  width: number;// 画布的宽度
  height: number;// 画布的高度
  offsetX: number = 0;// 画布在页面中的X偏移量
  offsetY: number = 0;// 画布在页面中的Y偏移量
  private scrollX = 0;// 视口的X滚动位置
  private scrollY = 0;// 视口的Y滚动位置
  Cursor: Cursor
  constructor(private target: string, private design: Design) {
    this.width = 0
    this.height = 0
    this.canvasElement = document.createElement("canvas")
    this.ctx = this.canvasElement.getContext('2d')!;
    this.initView()// 初始化视图
    this.Cursor = new Cursor(this, design)
  }


  translate(dx: number, dy: number){
    this.scrollX += dx;
    this.scrollY += dy;
  }

  //初始化视口
  initView() {
    const target = document.querySelector(this.target) as HTMLDivElement
    target?.appendChild(this.canvasElement)
    const width = this.width = target?.clientWidth || 0
    const height = this.height = target?.clientHeight || 0
    const x = target?.offsetLeft
    const y = target?.offsetTop
    const dpr = getDpr() //获取设备像素比
    if (width !== undefined) {
      this.canvasElement.width = width * dpr;
      this.canvasElement.style.width = width + 'px';
    }
    if (height !== undefined) {
      this.canvasElement.height = height * dpr;
      this.canvasElement.style.height = height + 'px';
    }
    this.offsetX = x
    this.offsetY = y

  }

  // 设置视口
  setViewport({ x, y, width, height }: Partial<IRect>) {
    const prevX = this.scrollX;
    const prevY = this.scrollY;
    const dpr = getDpr();
    if (x !== undefined) {
      this.scrollX = x;
    }
    if (y !== undefined) {
      this.scrollY = y;
    }
    if (width !== undefined) {
      this.canvasElement.width = width * dpr;
      this.canvasElement.style.width = width + 'px';
    }
    if (height !== undefined) {
      this.canvasElement.height = height * dpr;
      this.canvasElement.style.height = height + 'px';
    }
    if (prevX !== x || prevY !== y) {
      this.render()
    }
  }



  // 获取视口矩形
  getViewPortRect() {
    return {
      x: this.scrollX,
      y: this.scrollY,
      width: this.width,
      height: this.height
    }
  }

  //   获取边界盒
  getBbox(): IBox {
    const { x, y, width, height } = this.getViewPortRect();
    const zoom = this.design.zoom.getZoom();
    return {
      minX: x,
      minY: y,
      maxX: x + width / zoom,
      maxY: y + height / zoom,
    };
  }

  // 获取视口中心点
  get center() {
    const { width, height } = this.getViewPortRect();
    return {
      x: width / 2,
      y: height / 2,
    }
  }


  // 获取光标坐标
  getCursorPoint(event: { clientX: number; clientY: number }) {
    return {
      x: event.clientX - this.offsetX, // 计算相对于画布的X坐标
      y: event.clientY - this.offsetY,// 计算相对于画布的Y坐标
    }
  }

  // 获取场景中的光标坐标
  getSceneCursorXY(event: { clientX: number; clientY: number }, round = false) {
    const zoom = this.design.zoom.getZoom();
    const { x, y } = this.getCursorPoint(event);// 获取光标在画布中的坐标
    return this.toScenePt(x, y, round);// 转换为场景坐标
  }

  // 将视口坐标转换为场景坐标
  toScenePt(x: number, y: number, round = false) {
    const zoom = this.design.zoom.getZoom();// 获取当前缩放比例
    const { x: scrollX, y: scrollY } = this.getViewPortRect();// 获取视口滚动位置
    return viewportCoordsToSceneUtil(x, y, zoom, scrollX, scrollY, round);// 调用工具函数进行转换
  }

  // 转换视口坐标
  toViewportPt(x: number, y: number) {
    const zoom = this.design.zoom.getZoom();
    const { x: scrollX, y: scrollY } = this.getViewPortRect();
    return sceneCoordsToViewportUtil(x, y, zoom, scrollX, scrollY);
  }

  render() {
    const viewport = this.getViewPortRect()
    const zoom = this.design.zoom.getZoom();
    const dpr = getDpr()
    const ctx = this.ctx
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 2. 清空画布，然后绘制所有可见元素
    ctx.clearRect(0, 0, this.canvasElement.width , this.canvasElement.height);

    // 绘制背景色
    ctx.save();
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    const dx = -viewport.x;
    const dy = -viewport.y;
    ctx.scale(dpr * zoom, dpr * zoom);
    ctx.translate(dx, dy);

    this.design.sceneGraph.draw()
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    if (
      this.design.setting.get('enablePixelGrid') &&
      zoom >= this.design.setting.get('minPixelGridZoom')
    ) {
      this.design.sceneGraph.grid.draw();
    }

    this.design.sceneGraph.controlHandleManager.draw()

    ctx.restore();
  }

}
