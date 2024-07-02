import { ToolType } from './../events/tool';
import { Tool } from "../events/tool";
import Design from "../index";
import { IPoint, IRect } from "../types";
import { UniqueId } from "../utils/uuid";

interface IView {
  __version: string;
  __id: string
  width: number;
  height: number;
  lock: boolean;
  x: number;
  y: number;
  scale: number;
}


export default class Views {
  views: IView[] = []
  public tool: Tool = new Tool(this.design)
  startPoint: IPoint = { x: -1, y: -1 };
  lastPoint: IPoint = { x: -1, y: -1 };
  toolAction: ToolType = ""
  currentView: IView | undefined = undefined
  private __is_draw: boolean = false
  private __is_dragging: boolean = false
  private drawElement: IView | null = null
  constructor(private design: Design) {
    this.registerEvent()
  }
  registerEvent() {
    this.tool.on("onChange", this.setAction)
    this.design.designEvents.on("pointerDown", this.start)
    this.design.designEvents.on("click", this.hitView)
    this.design.designEvents.on("pointerMove", this.move)
    this.design.designEvents.on("pointerUp", this.end)
  }
  setAction = (action: ToolType) => {
    this.toolAction = action
  }
  click = (e: MouseEvent) => {
    if (this.__is_dragging) {
      this.__is_dragging = false
      return
    }
    if (this.toolAction || !this.views.length) return
    this.currentView = this.hitView(e)
  }

  start = (e: PointerEvent) => {
    if (!this.toolAction || this.hitView(e)) return
    this.__is_draw = true
    this.__is_dragging = false
    this.startPoint = this.design.canvas.getSceneCursorXY(e)
  }

  move = (e: PointerEvent) => {
    e.stopPropagation()
    if (this.toolAction && this.hitView(e)) {
      this.design.canvas.Cursor.setCursor("no-drop")
    } else {
      this.design.canvas.Cursor.setCursor("default")
    }
    if (!this.__is_draw) return
    this.lastPoint = this.design.canvas.getSceneCursorXY(e)
    if (!this.drawElement) {
      this.drawElement = this.appendView({ x: this.startPoint.x, y: this.startPoint.y, width: 0, height: 0 })
    }
    this.__is_dragging = true
    this.updateView()
    this.design.canvas.render()
  }



  end = (e: PointerEvent) => {
    e.stopPropagation()
    if (!this.__is_dragging) return
    this.updateView()
    this.design.activeTool("")
    this.__is_draw = false
    this.drawElement = null
    this.design.canvas.render()
  }

  updateView() {
    let rectInfo: IRect | null = this.drawElement || null
    const { x: startX, y: startY } = this.startPoint;
    if (!this.__is_dragging || !rectInfo) {
      const { width, height } = this.design.setting.settingConfig.view
      rectInfo = {
        x: startX,
        y: startY,
        width,
        height
      }
    }
    const { x, y } = this.lastPoint;
    let width = x - startX;
    let height = y - startY;
    if (width === 0 || height === 0) {
      return
    }
    rectInfo.x = startX
    rectInfo.y = startY
    rectInfo.width = width
    rectInfo.height = height
  }


  hitView = (e: MouseEvent) => {
    const { x, y } = this.design.canvas.getSceneCursorXY(e)
    const view = this.views.find(item => {
      return (
        item.x <= x &&
        item.x + item.width >= x &&
        item.y <= y &&
        item.y + item.height >= y
      )
    })
    return view
  }


  draw() {
    const { ctx } = this.design.canvas
    this.views.forEach(view => {
      const { x, y, width, height, __id } = view
      ctx.beginPath(); // 开始新的路径
      if (this.currentView && this.currentView.__id == __id) {

      }
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(x, y, width, height);
    })
    ctx.stroke()
  }



  appendView({ width, height, x, y }: IRect) {
    const { v } = this.design.setting
    const id = UniqueId()
    const view = {
      __version: v,
      __id: id,
      width,
      height,
      x,
      y,
      lock: false,
      scale: 1
    }
    this.views.push(view)
    return view
  }

  render() {

  }


}