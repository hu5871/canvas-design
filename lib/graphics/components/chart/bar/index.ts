import Design from "../../../..";
import { IAdvancedAttrs,  IGraphicsOpts,Optional } from "../../../../types";
import { Graphics } from "../../../graphics";
import { DrawLine } from "../../line";
import { DrawRect } from "../../rect";
import { DrawText } from "../../text";
import { GraphicsType } from "../../types";
import { IBarAttrs } from "./type";
import { Axis, IAxisScale } from '../common/Axis';

export class DrawBar extends Graphics<IBarAttrs> {
  static type = GraphicsType.Bar
  rects: IAxisScale["rect"][] = []
  xAxisLines: IAxisScale["line"][] = []
  xAxisLabels: IAxisScale["text"][] = []
  yAxisLines: IAxisScale["line"][] = []
  yAxisLabels: IAxisScale["text"][] = []

  constructor(attrs: Optional<IBarAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
  }
  override updateAttrs(partialAttrs: Partial<IBarAttrs> & IAdvancedAttrs): void {
    super.updateAttrs(partialAttrs)
  }

  override draw() {
    if (!this.isVisible()) return
    const { transform, fill, width, height } = this.attrs
    this.getscalePoints()
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()

    ctx.rect(0, 0, width, height);
    ctx.strokeStyle="transparent",
    ctx.stroke()
    ctx.clip();

    this.drawScalesLine(this.xAxisLines)
    this.drawScaleText(this.xAxisLabels)


    this.drawScalesLine(this.yAxisLines)
    this.drawScaleText(this.yAxisLabels)
    this.drawRect()

    ctx.closePath();
    ctx.restore();
  }


  drawScalesLine(scales: IAxisScale["line"][]) {
    scales?.forEach(t => {
      new DrawLine(t, this.design).draw()
    })
  }


  drawScaleText(scales: IAxisScale["text"][]) {
    scales?.forEach(t => {
      new DrawText(t, this.design).draw(false)
    })
  }

  drawRect() {
    this.rects.map(a => {
      new DrawRect(a, this.design).draw()
    })
  }

  getscalePoints() {
    const { data, encode, height, width } = this.attrs
    const { xSafeMargin, ySafeMargin, scaleGap, scaleWidth, yscaleTextAlign, scaleTextBaseline, barFill, lineFill, barCategoryGap } = this.design.setting.get("bar")
    const stroke = [lineFill]

    const textBaseline = scaleTextBaseline
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
      scaleGap,
      scaleWidth,
      columnWidth
    })


    this.xAxisLines = lineTfs.map(({ value }) => {
      return {
        type: GraphicsType.Line,
        width: scaleWidth,
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


    const { lines: ylineTfs, labels: ylabelTfs } = axis.axisLeft({
      type:'bar',
      values,
      height,
      xSafeMargin,
      ySafeMargin,
      strokeWidth,
      scaleGap,
      columnWidth,
      yscaleTextAlign,
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
        width: xSafeMargin - scaleGap,
        height: fontSize,
        transform: value,
        fill: this.design.setting.get("textFill"),
        style: { ...this.design.setting.get("textStyle"), textBaseline, textAlign: yscaleTextAlign, padding: [0, 0], },
        text: String(label),
      }
    })


    const bars= axis.axisRect({
      values,
      height,
      ySafeMargin,
      xSafeMargin,
      strokeWidth,
      columnWidth,
      barCategoryGap
    })

    const columnBarWidth = (width - (xSafeMargin * 2) - (barCategoryGap * (values.length * 2))) / values.length
    this.rects = bars.map(({ value, height }) => {
      return {
        type: GraphicsType.Rect,
        width: columnBarWidth,
        height: height,
        transform: value,
        fill: [
          barFill
        ],
      };
    })
  }
}