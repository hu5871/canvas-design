import Design from "../../../..";
import { Matrix } from "../../../../geo/geo_matrix";
import { IGraphicsOpts, IPoint, Optional } from "../../../../types";
import { minBy } from "../../../../utils/array";
import { parseRGBAStr } from "../../../../utils/color";
import { Graphics } from "../../../graphics";
import { DrawLine } from "../../line";
import { DrawText } from "../../text";
import { GraphicsType } from "../../types";
import { Axis, IAxisScale } from "../common/Axis";
import { IChartLineAttrs } from "./type";

export class DrawChartLine extends Graphics<IChartLineAttrs> {
  static type = GraphicsType.ChartLine
  type = GraphicsType.ChartLine

  lines: IAxisScale["line"][] = []
  xAxisLines: IAxisScale["line"][] = []
  xAxisLabels: IAxisScale["text"][] = []
  yAxisLines: IAxisScale["line"][] = []
  yAxisLabels: IAxisScale["text"][] = []
  segs: IPoint[] = []


  constructor(attrs: Optional<IChartLineAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
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

    this.drawscalesLine(this.xAxisLines)
    this.drawscaleText(this.xAxisLabels)



    this.drawscalesLine(this.yAxisLines)
    this.drawscaleText(this.yAxisLabels)
    this.drawLiner()

    ctx.closePath();
    ctx.restore();
  }


  drawscalesLine(scales: IAxisScale["line"][]) {
    scales?.forEach(t => {
      new DrawLine(t, this.design).draw()
    })
  }


  drawscaleText(scales: IAxisScale["text"][]) {
    scales?.forEach(t => {
      new DrawText(t, this.design).draw(false)
    })
  }

  drawLiner() {
    const { lineFill } = this.design.setting.get("chartLine")
    const ctx = this.design.canvas.ctx

    const segs = this.segs
    ctx.beginPath();
    ctx.moveTo(segs[0].x, segs[0].y);
    ctx.lineCap = "square"
    for (let i = 0; i < this.segs.length; i++) {
      const seg = this.segs[i];
      const pointX = seg.x;
      const pointY = seg.y;

      ctx.lineTo(pointX, pointY);
    }
    ctx.strokeStyle = parseRGBAStr(lineFill.attrs);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
    ctx.lineCap = "butt"

    for (let i = 0; i < this.segs.length; i++) {
      const seg = this.segs[i];
      const pointX = seg.x;
      const pointY = seg.y;
      ctx.beginPath();
      ctx.arc(pointX, pointY, 3, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.strokeStyle = parseRGBAStr(lineFill.attrs)
      ctx.closePath();
      ctx.fill()
      ctx.stroke()
    }
  }

  getscalePoints() {
    const { data, encode, height, width } = this.attrs
    const { xSafeMargin, ySafeMargin, scaleGap, scaleWidth, yscaleTextAlign, scaleTextBaseline, lineFill,  } = this.design.setting.get("chartLine")
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
      type: 'line',
      values,
      height,
      xSafeMargin,
      ySafeMargin,
      strokeWidth,
      scaleGap,
      columnWidth,
      yscaleTextAlign,
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



    const points = this.scaleLineGraph({
      values,
      height,
      ySafeMargin,
      xSafeMargin,
      strokeWidth,
      columnWidth,
      stroke
    })

    this.segs = points

  }


  scaleLineGraph(options: {
    values: number[],
    height: number,
    ySafeMargin: number,
    xSafeMargin: number,
    strokeWidth: number,
    columnWidth: number,
    stroke: any
  }) {
    const { values, height, ySafeMargin, xSafeMargin, stroke, strokeWidth, columnWidth } = options
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
    const points = [
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


        const point = {
          x: xSafeMargin + (i * columnWidth) + (columnWidth / 2) + 0.5,
          y: rangeSpan - height - (positiveMinimum * scaleStep) - strokeWidth / 2 + 0.5
        }

        return point
      }).map(({ x, y }, i, ps) => {
        return {
          x,
          y,
        }
      })
    ]
    return points
  }



}