import { ToolType } from './../events/tool';
import { Tool } from "../events/tool";
import Design from "../index";
import { IMatrixArr, IPoint, IRect, IView } from "../types";
import { UniqueId } from "../utils/uuid";
import { identityMatrix } from '../geo/geo_matrix';
import { View } from './view';




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

export default class Views {
  views: View[] = []
  public tool: Tool = new Tool(this.design)
  startPoint: IPoint = { x: -1, y: -1 };
  lastPoint: IPoint = { x: -1, y: -1 };
  toolAction: ToolType = ""
  currentView: View | undefined = undefined
  private __is_draw: boolean = false
  private __is_dragging: boolean = false
  private drawView: View | null = null
  constructor(private design: Design) {
    this.registerEvent()
  }
  registerEvent() {
    this.tool.on("onChange", this.setAction)
    this.design.designEvents.on("pointerDown", this.start)
    this.design.designEvents.on("dbclick", this.dblclick)
    this.design.designEvents.on("pointerMove", this.move)
    this.design.designEvents.on("pointerUp", this.end)
  }
  setAction = (action: ToolType) => {
    this.toolAction = action
  }
  dblclick = (e: MouseEvent) => {
    if (this.__is_dragging) {
      this.__is_dragging = false
      return
    }
    if (this.toolAction || !this.views.length) return
    this.currentView = this.hitTest(e)
  }

  start = (e: PointerEvent) => {
    if (!this.toolAction || this.hitTest(e)) return
    this.__is_draw = true
    this.__is_dragging = false
    this.drawView=null
    this.startPoint = this.design.canvas.getSceneCursorXY(e)
  }

  move = (e: PointerEvent) => {
    if (!this.toolAction) return
    e.stopPropagation()
    if (this.toolAction && this.hitTest(e)) {
      this.design.canvas.Cursor.setCursor("no-drop")
    } else {
      this.design.canvas.Cursor.setCursor("default")
    }
    if(!this.__is_draw) return
   
    this.lastPoint = this.design.canvas.getSceneCursorXY(e)
    if (!this.drawView) {
      const attrs= {
        width:0,
        height:0
      }
      const opts= {
        x: this.startPoint.x,
        y: this.startPoint.y
      }
      this.drawView = new View(attrs,opts,this.design)
      this.appendView(this.drawView)
    }
    this.__is_dragging = true
    this.updateView()
    this.design.canvas.render()
  }

  end = (e: PointerEvent) => {
    e.stopPropagation()
    if (!this.toolAction) return
    this.design.activeTool("")
    this.updateView()
    this.__is_draw = false
    this.drawView = null
    this.design.canvas.render()
  }

  updateView() {
    let viewInfo: View| null = this.drawView
    const { x: startX, y: startY } = this.startPoint;
    if (!this.__is_dragging || !viewInfo) {
      const { width, height } = this.design.setting.settingConfig.view
      this.appendView(new View({width,height},{x:startX,y:startY},this.design)) 
      return
    }
    const { x, y } = this.lastPoint;
    let width = x - startX;
    let height = y - startY;
    if (width === 0 || height === 0) {
      return
    }
    const rect = normalizeRect({ x: startX, y: startY, width, height })
    viewInfo.updateAttrs(rect)
  }

  draw() {
    this.views.forEach(item=> item.draw())
  }

  hitTest(e: MouseEvent){
    return this.views.find(item=> item.hitView(e))
  }

  appendView(view: View) {
   this.views.push(view)
  }

}