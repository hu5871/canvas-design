import { Matrix } from "../../../../geo/geo_matrix"
import { minBy } from "../../../../utils/array"
import { PI_OVER_TWO } from "../../../../utils/number"



export class Axis {

  lines: any[] = []

  constructor() {

  }

  axisLeft(options: {
    values: number[],
    height: number,
    xSafeMargin: number,
    ySafeMargin: number,
    strokeWidth: number,
    tickGap: number,
    columnWidth: number,
    yTickTextAlign: string,
    barCategoryGap:number
  }) {

    const { values, height, xSafeMargin, ySafeMargin, strokeWidth, tickGap, columnWidth, yTickTextAlign,barCategoryGap } = options
    //y坐标的坐标范围区间
    const range = [height - ySafeMargin, ySafeMargin] as [number, number]
    //柱子最大高度
    const rangeSpan = range[0]

    const max = Math.max(...values)
    const min = Math.min(...values, 0)

    let tickValues = this.calculateTicks(min, max, 6)
    console.log(tickValues)
    const topTick = Math.max(...tickValues)

    //尽量减少不必要的刻度，避免臃肿导致刻度压缩
    if (topTick > Math.max(...values) && tickValues.length >= 8) {
      tickValues.pop()
    }

    const tickStep = ((height - ySafeMargin * 2) / (tickValues.length - 1))
    //y轴的刻度值
    const ticks = Array.from({ length: tickValues.length }, (t, i) => {
      return {
        label: tickValues[i] ?? '',
        point: new Matrix().translate(xSafeMargin, (height - ySafeMargin) - (i * tickStep)).getArray(),
      }
    })
    const lines = [
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
    const labels = [
      ...Array.from({ length: tickValues.length }, (v, i) => {
        yTickLabelTf.resetToPrevious()
        return {
          value: yTickLabelTf.translate(0, ticks[i].point[5]).getArray(),
          label:ticks[i].label
        }
      })
    ]

    const bars = [
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

          //负数
          if (isNegative) {
            height -= tickStep * percentage
          } else {
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
      lines,
      labels,
      bars
    }

  }

  axisBootom(options: {
    labels: string[],
    height: number,
    xSafeMargin: number,
    ySafeMargin: number,
    strokeWidth: number,
    tickGap: number,
    tickWidth: number,
    columnWidth: number
  }) {

    const { labels, height, xSafeMargin, ySafeMargin, strokeWidth, tickGap, tickWidth, columnWidth } = options



    //创建初始偏移
    const tf = new Matrix().translate(xSafeMargin, (height - ySafeMargin + strokeWidth / 2))

    const xAxisLineTf = new Matrix().rotate(PI_OVER_TWO).prepend(tf)
    const startTf = xAxisLineTf.translate(strokeWidth / 2, 0).getArray()

    xAxisLineTf.resetToPrevious()

    tf.translate(0, tickGap + tickWidth)

    const lines = [
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
    const labs = [
      ...Array.from({ length: labels.length }, (_, i) => {
        tf.translate(columnWidth, 0)
        const labelMatix = tf.translate(-(columnWidth / 2), 0).getArray()
        tf.resetToPrevious()
        return {
          value: labelMatix
        }
      })
    ]


    return {
      labels: labs,
      lines
    }

  }


  /**
     * 计算刻度值
     * @param min 最小值
     * @param max 最大值
     * @param tickCount 期望的刻度数量
     * @param forceIncludeZero 是否强制包含 0
     * @returns 刻度值数组
     */
  public calculateTicks(
    min: number,
    max: number,
    tickCount: number = 5,
    forceIncludeZero: boolean = true
  ): number[] {
    if (min === max) {
      return [min];
    }

    // 如果需要强制包含 0，调整 min 和 max
    if (forceIncludeZero) {
      min = Math.min(min, 0);
      max = Math.max(max, 0);
    }

    // 计算合适的刻度间隔
    const interval = this.calculateNiceInterval(min, max, tickCount);

    // 计算刻度值的起始点和结束点
    const start = Math.floor(min / interval) * interval;
    const end = Math.ceil(max / interval) * interval;

    // 生成刻度值
    const ticks: number[] = [];
    for (let value = start; value <= end + interval * 0.5; value += interval) {
      ticks.push(value);
    }

    return ticks;
  }

  /**
   * 计算合适的刻度间隔
   * @param min 最小值
   * @param max 最大值
   * @param tickCount 期望的刻度数量
   * @returns 刻度间隔
   */
  private calculateNiceInterval(min: number, max: number, tickCount: number): number {
    const range = max - min;

    // 初始间隔
    let interval = range / tickCount;

    // 计算间隔的指数部分
    const exponent = Math.floor(Math.log10(interval));
    const fraction = interval / Math.pow(10, exponent);

    // 常见的“漂亮”间隔
    const niceFractions = [1, 2, 5, 10];
    let niceFraction = niceFractions[0]; // 默认选择最小的间隔

    // 找到最接近的“漂亮”间隔
    for (const f of niceFractions) {
      if (fraction <= f) {
        niceFraction = f;
        break;
      }
    }

    // 计算最终的间隔
    interval = niceFraction * Math.pow(10, exponent);

    return interval;
  }

  /**
   * 格式化刻度标签
   * @param value 刻度值
   * @param precision 小数位数
   * @returns 格式化后的标签
   */
  public formatLabel(value: number, precision: number = 2): string {
    return value.toFixed(precision);
  }



  drawText() {

  }


  drawLine() {

  }
}