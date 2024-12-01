import { type ToolType } from '../tool/index';
import { Tool } from "../tool";
import Design from "../index";
import { IPoint, IRect, ITemplateAttrs } from "../types";
import { Template } from './template';
import EventEmitter from '../events/eventEmitter';
import { EDIT, IMenuItem, Menu } from '../tool/menu';
import { Store } from '../store';
import { Graphics } from '../graphics/graphics';
import { ControlHandleManager } from '../control_handle_manager';
import Grid from '../grid';
import { offsetRect, rectToVertices } from '../geo/geo_rect';
import { distance, getPerpendicularPoints, isPointEqual, midPoint, pointSub } from '../geo/geo_point';
import { getSweepAngle } from '../geo/geo_angle';
import { remainDecimal } from '../geo';
import { Matrix } from '../geo/geo_matrix';
// import { createComponent } from '../graphics/components';

/**
 * normalize rect,
 * width or height may be negative
 */
export const normalizeRect = ({ x, y, width, height }: IRect): IRect => {
  const x2 = x + width;
  const y2 = y + height;
  return getRectByTwoPoint({ x, y }, { x: x2, y: y2 });
};


export const getRectByTwoPoint = (point1: IPoint, point2: IPoint): IRect => {
  return {
    x: Math.min(point1.x, point2.x),
    y: Math.min(point1.y, point2.y),
    width: Math.abs(point1.x - point2.x),
    height: Math.abs(point1.y - point2.y),
  };
};


interface EmitEvents {
  selectTemplate(rect: IRect | null): void;
  watchRect(rect: IRect | undefined): void
  contextmenu(): void
  getMenuList(emnu: IMenuItem[] | undefined): void
  [key: string | symbol]: (...args: any[]) => void
}

export default class SceneGraph {
  private emitter = new EventEmitter<EmitEvents>()
  templates: Template[] = []
  public tool: Tool
  private menu: Menu
  controlHandleManager: ControlHandleManager
  grid: Grid
  constructor(private design: Design, data: ITemplateAttrs[]) {
    this.tool = new Tool(this.design)
    this.menu = new Menu(this.design)
    this.grid = new Grid(design);
    this.registerEvent()
    this.controlHandleManager = new ControlHandleManager(design)
    data?.forEach(attrs => {
      const { transform } = attrs
      const tmp = new Template(attrs, this.design, {
        advancedAttrs: { x: transform[4], y: transform[5] },
      })
      this.appendTemplate(tmp)
      if (attrs.state & EDIT) {
        // this.design.store.add({
        //   graphics:tmp,
        //   parent:undefined
        // })
      }
    })
  }

  getParent(childId: string) {
    return this.templates.find(item => item.attrs.children?.some(child => child.__id === childId))
  }

  registerEvent() {
    this.design.designEvent.on("pointerDown", this.onStart)
    this.design.designEvent.on("pointerMove", this.onDrag)
    this.design.designEvent.on("pointerUp", this.onEnd)
    this.design.designEvent.on("contextmenu", this.contextmenu)
  }

  contextmenu = (e: MouseEvent) => {
    this.emitter.emit("contentmenu", { x: e.clientX, y: e.clientY })
    this.emitMenu(this.menu?.getMenu())
  }


  activeTool(tool: ToolType) {
    this.tool.setAction(tool)
  }

  onStart = (e: PointerEvent) => {
    this.tool.onStart(e);
  }
  onDrag = (e: PointerEvent) => {
    this.tool.onDrag(e)
  }
  onEnd = (e: PointerEvent) => {
    this.tool.onEnd(e)
  }


  emitWatchRect(rect: IRect | undefined) {
    this.emitter.emit("watchRect", rect)
  }

  emitMenu(menu: IMenuItem[] | undefined) {
    this.emitter.emit("getMenuList", menu)
  }

  activeMenu(type: string) {
    this.menu?.activeMenu(type)
  }


  draw() {
    this.templates.forEach(item => item.draw())
    const graphics = this.design.store.getTemplate() || this.design.store.getGraphics()
    graphics?.getParent()?.drawOutLine()
    graphics?.drawOutLine()
  }

  drawIndicator(graphics:Graphics){
    const bbox = this.getBBox(graphics)
    const polygon:IPoint[] = rectToVertices(
      {
        x: 0,
        y: 0,
        width: bbox.width,
        height: bbox.height,
      },
      bbox.transform,
    ).map((pt) => this.design.canvas.toViewportPt(pt.x, pt.y));


    const minSize = this.design.setting.get('sizeIndicatorMinSize');
    if (
      distance(polygon[0], polygon[1]) < minSize &&
      distance(polygon[1], polygon[2]) < minSize
    ) {
      return;
    }


    let bottomPt = polygon[0];
    let bottomPtIndex = 0;
    for (let i = 1; i < polygon.length; i++) {
      if (polygon[i].y > bottomPt.y) {
        bottomPt = polygon[i];
        bottomPtIndex = i;
      }
    }

    let minAngle = Infinity;
    let minAnglePt = polygon[0];
    for (let i = 0; i < polygon.length; i++) {
      if (i === bottomPtIndex || isPointEqual(polygon[i], bottomPt)) {
        continue;
      }

      let angle = getSweepAngle(
        { x: 1, y: 0 },
        pointSub(polygon[i], bottomPt),
        true,
      );
      if (angle > Math.PI / 2) {
        angle = Math.PI - angle;
      }

      if (angle < minAngle) {
        minAngle = angle;
        minAnglePt = polygon[i];
      }
    }

    const centerPt = midPoint(bottomPt, minAnglePt);
    const [p1, p2] = getPerpendicularPoints(
      [bottomPt, minAnglePt],
      centerPt,
      this.design.setting.get('sizeIndicatorOffset'),
    );
    const targetPt = p1.y > p2.y ? p1 : p2;

    // config
    const rectRadius = this.design.setting.get('sizeIndicatorRectRadius');
    const rectPadding = this.design.setting.get('sizeIndicatorRectPadding');

    const numPrecision = this.design.setting.get('sizeIndicatorNumPrecision');
    const fontColor = this.design.setting.get('sizeIndicatorTextColor');
    const fontStyle = this.design.setting.get('sizeIndicatorTextFontStyle');

    const width = remainDecimal(bbox.width, numPrecision);
    const height = remainDecimal(bbox.height, numPrecision);

    const textContent = `${width} x ${height}`;
    const ctx = this.design.canvas.ctx
    this.design.canvas.ctx.font = fontStyle;
    const textMetrics = ctx.measureText(textContent);
    const textWidth = textMetrics.width;
    const fontBoundingBoxAscent = textMetrics.fontBoundingBoxAscent;
    const textHeight =
      fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;

    const matrix = new Matrix()
      .translate(-textWidth / 2, 0)
      .rotate(getSweepAngle({ x: 0, y: 1 }, pointSub(targetPt, centerPt)))
      .translate(targetPt.x, targetPt.y);

    const fill = this.design.setting.get('selectBoxStroke');
    ctx.fillStyle = fill;
    ctx.save();
    ctx.transform(...matrix.getArray());
    ctx.beginPath();
    const bgRect = offsetRect(
      { x: 0, y: 0, width: textWidth, height: textHeight },
      rectPadding,
    );
    ctx.roundRect(bgRect.x, bgRect.y, bgRect.width, bgRect.height, rectRadius);
    ctx.fill();

    ctx.translate(0, fontBoundingBoxAscent);
    ctx.fillStyle = fontColor;
    ctx.fillText(textContent, 0, 0);
    ctx.restore();
  }

  getBBox(graphics:Graphics) {
    const rect = graphics.getSize();
    return {
      width: rect.width,
      height: rect.height,
      transform: graphics.getWorldTransform(),
    };
  }

  hitTest(e: IPoint) {
    return this.templates.find(item => item.hitTest(e))
  }


  appendTemplate(temp: Template) {
    this.templates.push(temp)
  }


  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }

}