import { Tool } from "../tool";
import Design from "..";
import { IGraphicsInfo, IPoint, IRect, ITemplateAttrs } from "../types";
import { Template } from '../graphics/template';
import EventEmitter from '../events/eventEmitter';
import { EDIT, IMenuItem, Menu } from '../tool/menu';
import { Store } from '../store';
import { Graphics, setters } from '../graphics/graphics';
import { ControlHandleManager } from '../control_handle_manager';
import Grid from '../grid';
import { offsetRect, rectToVertices } from '../geo/geo_rect';
import { distance, getPerpendicularPoints, isPointEqual, midPoint, pointSub } from '../geo/geo_point';
import { getSweepAngle } from '../geo/geo_angle';
import { remainDecimal } from '../geo';
import { Matrix } from '../geo/geo_matrix';
import { ToolType } from "../tool/tpyes";
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
  attrsChange(rect: IRect | undefined): void
  contextmenu(): void
  getMenuList(emnu: IMenuItem[]): void
  [key: string | symbol]: (...args: any[]) => void
}

export default class SceneGraph {
  private emitter = new EventEmitter<EmitEvents>()
  templates: Template[] = []
  public tool: Tool
  private menu: Menu
  controlHandleManager: ControlHandleManager
  grid: Grid
  constructor(private design: Design, private data: ITemplateAttrs[]) {
    this.tool = new Tool(this.design)
    this.menu = new Menu(this.design)
    this.grid = new Grid(design);

    this.registerEvent()
    this.controlHandleManager = new ControlHandleManager(design)
    this.createTemplates(data)
  }

  createTemplates(data: ITemplateAttrs[]) {
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


  getTemplates() {
    return this.templates
  }

  updateByGrapicsAttr<K extends keyof IGraphicsInfo>({ key, value }: {
    key: K;
    value: IGraphicsInfo[K]; // 值类型与key对应
  }) {


    // ?.updateAttrs({[key]:value},{
    //   resetRender:true,
    // })

    const grp = this.design.store.getGraphics()
    const handler = setters[key];

    if (grp && handler) {
      handler(grp, value);
      this.design.sceneGraph.attrsChange({...grp.getGraphicsInfo()})
      this.design.render()
    }

  }

  registerEvent() {
    this.design.designEvent.on("pointerDown", this.onStart)
    this.design.designEvent.on("pointerMove", this.onDrag)
    this.design.designEvent.on("pointerUp", this.onEnd)
    this.design.designEvent.on("contextmenu", this.contextmenu)
    this.design.designEvent.on("delete", this.deleteGraphics.bind(this))
    this.design.on("updateByGrapicsAttr", this.updateByGrapicsAttr.bind(this))
  }

  deleteGraphics() {
    const graphics = this.design.store.getGraphics()
    const temp = this.design.store.getTemplate()

    if (graphics) {
      const uuid = graphics.getId()
      if (!uuid) return
      const temp = this.getTemplates().find(t => t.childrenGraphics.find(grap => grap.getId() === uuid))
      temp?.delete(uuid)
    } else {
      const uuid = temp?.getId()
      this.templates = this.templates.filter(t => t !== temp)
      this.data = this.data.filter(t => t.__id != uuid)
      this.design.store.delete()
    }
    this.design.store.delete()
    this.design.render()
  }

  contextmenu = (e: MouseEvent) => {
    this.emitter.emit("contentmenu", { x: e.clientX, y: e.clientY })
    this.emitMenu(this.menu.getMenu())
  }

  selectedGraphics(info: IGraphicsInfo | undefined) {
    this.emitter.emit("selected", {...info})
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

  attrsChange(info: IGraphicsInfo | undefined) {
    this.emitter.emit("attrsChange", info ? {...info} : undefined)
  }

  emitMenu(menu: IMenuItem[]) {
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

  drawIndicator(graphics: Graphics) {
    const bbox = this.getBBox(graphics)
    const polygon: IPoint[] = rectToVertices(
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

  getBBox(graphics: Graphics) {
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

  destroy() {
    this.tool.destroy()
  }
}