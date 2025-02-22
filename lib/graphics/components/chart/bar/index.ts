import Design from "../../../..";
import { IAdvancedAttrs,  IGraphicsOpts,Optional } from "../../../../types";
import { Graphics } from "../../../graphics";
import { DrawLine } from "../../line";
import { DrawRect } from "../../rect";
import { DrawText } from "../../text";
import { GraphicsType } from "../../types";
import { IBarAttrs, IBarTick } from "./type";
import { Axis } from '../common/Axis';

export class DrawBar extends Graphics<IBarAttrs> {
  static type = GraphicsType.Bar
  rects: IBarTick["rect"][] = []
  xAxisLines: IBarTick["line"][] = []
  xAxisLabels: IBarTick["text"][] = []
  yAxisLines: IBarTick["line"][] = []
  yAxisLabels: IBarTick["text"][] = []

  constructor(attrs: Optional<IBarAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
  }
  override updateAttrs(partialAttrs: Partial<IBarAttrs> & IAdvancedAttrs): void {
    super.updateAttrs(partialAttrs)
  }

  override draw() {
    if (!this.isVisible()) return
    const { transform, fill, width, height } = this.attrs
    this.getTickPoints()
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()

    ctx.rect(0, 0, width, height);
    ctx.strokeStyle="#ccc",
    ctx.stroke()
    ctx.clip();

    this.drawTicksLine(this.xAxisLines)
    this.drawTickText(this.xAxisLabels)


    this.drawTicksLine(this.yAxisLines)
    this.drawTickText(this.yAxisLabels)
    this.drawRect()

    ctx.closePath();
    ctx.restore();
  }


  drawTicksLine(ticks: IBarTick["line"][]) {
    ticks?.forEach(t => {
      new DrawLine(t, this.design).draw()
    })
  }


  drawTickText(ticks: IBarTick["text"][]) {
    ticks?.forEach(t => {
      new DrawText(t, this.design).draw(false)
    })
  }

  drawRect() {
    this.rects.map(a => {
      new DrawRect(a, this.design).draw()
    })
  }





  getTickPoints() {
    const { data, encode, height, width } = this.attrs
    const { xSafeMargin, ySafeMargin, tickGap, tickWidth, yTickTextAlign, tickTextBaseline, barFill, lineFill, barCategoryGap } = this.design.setting.get("bar")
    const stroke = [lineFill]
    const textBaseline = tickTextBaseline
    const { fontSize } = this.design.setting.get("textStyle")
    const labels = data.map(item => item[encode.x]) as string[]
    const values = data.map(item => item[encode.y] as number)
    const strokeWidth = this.design.setting.get("strokeWidth")
    // 计算每项分类的宽度
    const columnWidth = (width - xSafeMargin * 2) / labels.length
    const axis= new Axis()
    const { lines: lineTfs, labels: labelTfs } = axis.axisBootom({
      labels,
      height,
      xSafeMargin,
      ySafeMargin,
      strokeWidth,
      tickGap,
      tickWidth,
      columnWidth
    })


    this.xAxisLines = lineTfs.map(({ value }) => {
      return {
        type: GraphicsType.Line,
        width: tickWidth,
        height: 0,
        stroke,
        strokeWidth,
        transform: value
      }
    })

    this.xAxisLabels = labelTfs.map(({ value }, i) => {
      return {
        type: GraphicsType.Text,
        width: columnWidth,
        height: fontSize,
        transform: value,
        fill: this.design.setting.get("textFill"),
        style: { ...this.design.setting.get("textStyle"), textBaseline, textAlign: 'center', padding: [0, 0], },
        text: labels[i],
      }
    })


    const { lines: ylineTfs, labels: ylabelTfs, bars } = axis.axisLeft({
      values,
      height,
      xSafeMargin,
      ySafeMargin,
      strokeWidth,
      tickGap,
      columnWidth,
      yTickTextAlign,
      barCategoryGap
    })


    this.yAxisLines = ylineTfs.map(({ value }) => {
      return {
        type: GraphicsType.Line,
        width: width - xSafeMargin * 2,
        height: 0,
        stroke,
        strokeWidth,
        transform: value
      }
    })


    this.yAxisLabels = ylabelTfs.map(({ value, label }) => {
      return {
        type: GraphicsType.Text,
        width: xSafeMargin - tickGap,
        height: fontSize,
        transform: value,
        fill: this.design.setting.get("textFill"),
        style: { ...this.design.setting.get("textStyle"), textBaseline, textAlign: yTickTextAlign, padding: [0, 0], },
        text: String(label),
      }
    })

    this.rects = bars.map(({ value, height }) => {
      return {
        type: GraphicsType.Rect,
        width: columnWidth,
        height: height,
        transform: value,
        fill: [
          barFill
        ],
      };
    })
  }
}