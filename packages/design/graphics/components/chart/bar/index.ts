import Design from "../../../../";
import { IAdvancedAttrs, IGraphicsOpts, Optional } from "../../../../types";
import { Graphics } from "../../../graphics";
import { DrawLine } from "../../line";
import { DrawRect } from "../../rect";
import { DrawText } from "../../text";
import { GraphicsType } from "../../types";
import { IBarAttrs } from "./type";
import { Axis, IAxisScale } from '../common/Axis';
import { Matrix } from "../../../../geo/geo_matrix";
import { minBy } from "../../../../utils/array";

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
    ctx.strokeStyle = "transparent",
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
    const axis = new Axis()
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
      type: 'bar',
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


    const bars = this.scaleRect({
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

  scaleRect(options: {
    values: number[],
    height: number,
    ySafeMargin: number,
    xSafeMargin: number,
    strokeWidth: number,
    columnWidth: number,
    barCategoryGap: number
  }) {
    const { values, height, ySafeMargin, xSafeMargin, strokeWidth, columnWidth, barCategoryGap } = options


    const max = Math.max(...values)
    const min = Math.min(...values, 0)
    const scaleNumbers = new Axis().finalScaleNumbers(values, min, max)
    const scaleStep = ((height - ySafeMargin * 2) / (scaleNumbers.length - 1))

    //y坐标的坐标范围区间
    const range = [height - ySafeMargin, ySafeMargin] as [number, number]
    //柱子最大高度
    const rangeSpan = range[0]

    //正数索引
    const positiveMinimum = scaleNumbers.findIndex(item => {
      return item >= 0
    })
    const bars = [
      ...Array.from({ length: values.length }, (_, i) => {
        const val = values[i]
        //最接近值
        const recentVal = minBy(scaleNumbers, val)
        const index = scaleNumbers.indexOf(recentVal);

        //从第一个正数开始计算高度
        let height = (index - positiveMinimum) * scaleStep
        const prev = scaleNumbers[index];

        if (prev !== val) {
          const next = scaleNumbers[index + 1];
          const last = scaleNumbers[index - 1]
          // 计算step步进值
          const currStep = Math.abs(prev - (next ?? last));
          let diffValue = val - recentVal
          let percentage = 100
          const isNegative = diffValue < 0
          diffValue = Math.abs(diffValue)
          percentage = diffValue / currStep
          //负数
          if (isNegative) {
            height -= scaleStep * percentage
          } else {
            height += scaleStep * percentage
          }
        }

        const barTf = new Matrix().translate(xSafeMargin, rangeSpan - height - (positiveMinimum * scaleStep) - strokeWidth / 2)
        barTf.translate(i * columnWidth, 0).translate(barCategoryGap, 0)

        return {
          value: barTf.getArray(),
          height,
        }
      })
    ]
    return bars
  }

}