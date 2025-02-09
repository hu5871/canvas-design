import { Matrix } from './../../../geo/geo_matrix';
import Design from "../../..";
import { AxisCalculator, } from "../../../geo/geo_chart";
import { IAdvancedAttrs, IGraphicsAttrs, IGraphicsOpts, IMatrixArr, IPaint, IPoint, Optional, PaintType } from "../../../types";
import { Graphics } from "../../graphics";
import { DrawLine } from "../line";
import { DrawRect } from "../rect";
import { DrawText } from "../text";
import { GraphicsType } from "../types";
import { IBarAttrs, IBarTick } from "./type";

import { PI_OVER_TWO } from '../../../utils/number';
import { minBy } from '../../../utils/array';

const opts: IGraphicsOpts = {
  noCollectUpdate: true,
};



export class DrawBar extends Graphics<IBarAttrs> {
  static type = GraphicsType.Bar
  columnWidth: number | undefined
  xTicks: IBarTick[] = []
  yTicks: IBarTick[] = []
  rects: IBarTick["rect"][] = []
  lineAttrs: IBarTick["line"] | undefined
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
    this.calcAttts()
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()

    // ctx.rect(0, 0, width, height);
    // ctx.strokeStyle="#ccc",
    // ctx.stroke()
    // ctx.clip();

    // new DrawLine(this.lineAttrs!, this.design).draw()
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
    const { xSafeMargin, ySafeMargin, tickGap, tickWidth, xTickTextAlign, yTickTextAlign, tickTextBaseline, barFill, lineFill, barCategoryGap } = this.design.setting.get("bar")
    const labels = data.map(item => item[encode.x]) as string[]
    const values = data.map(item => item[encode.y] as number)
    const valMax = Math.max(...values)
    const valMin = Math.min(...values)
    //y坐标的坐标范围区间
    const range = [height - ySafeMargin, ySafeMargin] as [number, number]
    //柱子最大高度
    const rangeSpan = range[0]
    //获取总高度
    

    let tickValues= new AxisCalculator().calculateTicks(valMin < 0 ? valMin : 0,valMax,6)
    const topTick = Math.max(...tickValues)

    if (topTick > Math.max(...values) && tickValues.length >= 8) {
      tickValues.pop()
    }

    //刻度步进值
    const tickStep = ((height - ySafeMargin * 2) / (tickValues.length - 1))
    //y轴的刻度值
    const strokeWidth = this.design.setting.get("strokeWidth")
    const ticks = Array.from({ length: tickValues.length }, (t, i) => {
      return {
        label: tickValues[i] ?? '',
        point: new Matrix().translate(xSafeMargin, (height - ySafeMargin) - (i * tickStep)).getArray(),
      }
    })

    // 计算每项分类的宽度
    const columnWidth = (width - xSafeMargin * 2) / labels.length


    //创建初始偏移
    const tf = new Matrix().translate(xSafeMargin, (height - ySafeMargin + strokeWidth / 2))

    const xAxisLineTf = new Matrix().rotate(PI_OVER_TWO).prepend(tf)
    const startTf = xAxisLineTf.translate(strokeWidth / 2, 0).getArray()

    xAxisLineTf.resetToPrevious()

    tf.translate(0, tickGap + tickWidth)

    const xAxisLines = [
      {
        value: startTf,
      },
      ...Array.from({ length: labels.length }, (_, i) => {
        //偏移一项的宽度
        xAxisLineTf.translate(columnWidth, 0)
        //左偏移线宽的一半，避免末尾线条突出
        const matrix = xAxisLineTf.translate(-(strokeWidth / 2), 0).getArray()
        //需要右偏移回去，使得每个线条都只是偏移了线宽一半
        xAxisLineTf.resetToPrevious()
        return {
          value: matrix
        }
      })
    ]
    const xAxisLabels = [
      ...Array.from({ length: labels.length }, (_, i) => {
        tf.translate(columnWidth, 0)
        const labelMatix = tf.translate(-(columnWidth / 2), 0).getArray()
        tf.resetToPrevious()
        return {
          value: labelMatix
        }
      })
    ]

    const yAxisLines = [
      ...Array.from({ length: tickValues.length }, (v, i) => {
        return {
          value: ticks[i].point
        }
      })
    ]


    let textXPoint = 0
    if (yTickTextAlign === 'right' || yTickTextAlign === 'end') {
      textXPoint = xSafeMargin - tickGap
    } else if (yTickTextAlign === 'center') {
      textXPoint = xSafeMargin / 2
    } else {
      textXPoint = 0
    }

    const yTickLabelTf = new Matrix().translate(textXPoint, 0)
    yTickLabelTf.translate(0, 0)
    const yAxisLabels = [
      ...Array.from({ length: tickValues.length }, (v, i) => {
        yTickLabelTf.resetToPrevious()
        return {
          value: yTickLabelTf.translate(0, ticks[i].point[5]).getArray()
        }
      })
    ]











    const yBars = [
      ...Array.from({ length: values.length }, (_, i) => {

        const val = values[i]

        //最接近值
        const recentVal = minBy(tickValues, val)
        const index = tickValues.indexOf(recentVal);
        let height = index * tickStep
        const prev = tickValues[index];
        if (prev !== val) {
          const next = tickValues[index + 1];
          const last = tickValues[index - 1]
          // 计算step步进val值
          const currStep = Math.abs(prev - (next ?? last));
          let diffValue = val - recentVal
          let percentage = 100
          const isNegative = diffValue < 0
          diffValue = Math.abs(diffValue)
          percentage = diffValue / currStep

          if (isNegative) {
            height -= tickStep * percentage
          }else{
            height += tickStep * percentage
          }
        }


        const barTf = new Matrix().translate(xSafeMargin, rangeSpan - height - strokeWidth / 2)
        barTf.translate(i * columnWidth, 0).translate(barCategoryGap, 0)
        return {
          value: barTf.getArray(),
          height,
        }
      })
    ]

    return {
      xAxisLines,
      xAxisLabels,
      yAxisLines,
      yAxisLabels,
      ticks,
      yBars
    }
  }


  calcAttts() {
    const { data, encode, height, width } = this.attrs
    const { xSafeMargin, ySafeMargin, tickGap, tickWidth, xTickTextAlign, yTickTextAlign, tickTextBaseline, barFill, lineFill, barCategoryGap } = this.design.setting.get("bar")
    const { fontSize } = this.design.setting.get("textStyle")
    const ctx = this.design.canvas.ctx
    const values = data.map(item => item[encode.y]) as number[]
    const labels = data.map(item => item[encode.x]) as string[]
    const { xAxisLines, xAxisLabels, yAxisLines, yAxisLabels, ticks, yBars } = this.getTickPoints()


    const columnWidth = (width - (xSafeMargin * 2) - (barCategoryGap * (values.length * 2))) / values.length


    const stroke = [lineFill]
    const strokeWidth = this.design.setting.get("strokeWidth")
    this.lineAttrs = {
      type: GraphicsType.Line,
      width: width - xSafeMargin * 2,
      height: 0,
      stroke: stroke,
      strokeWidth: strokeWidth,
      transform: new Matrix().translate(xSafeMargin, height - ySafeMargin).getArray()
    }

    const textBaseline = tickTextBaseline

    this.xAxisLines = xAxisLines.map(({ value }) => {
      return {
        type: GraphicsType.Line,
        width: tickWidth,
        height: 0,
        stroke,
        strokeWidth,
        transform: value
      }
    })

    this.xAxisLabels = xAxisLabels.map(({ value }, i) => {
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

    this.yAxisLines = yAxisLines.map(({ value }, i) => {
      return {
        type: GraphicsType.Line,
        width: width - xSafeMargin * 2,
        height: 0,
        stroke,
        strokeWidth,
        transform: value
      }
    })


    this.yAxisLabels = yAxisLabels.map(({ value }, i) => {
      return {
        type: GraphicsType.Text,
        width: xSafeMargin - tickGap,
        height: fontSize,
        transform: value,
        fill: this.design.setting.get("textFill"),
        style: { ...this.design.setting.get("textStyle"), textBaseline, textAlign: yTickTextAlign, padding: [0, 0], },
        text: String(ticks[i].label),
      }
    })

    this.rects = yBars.map(({ value, height }, i) => {
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