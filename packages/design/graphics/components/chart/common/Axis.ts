import { PaintType } from '../../../../types';
import { Matrix } from "../../../../geo/geo_matrix"
import { Optional } from "../../../../types"
import { minBy } from "../../../../utils/array"
import { PI_OVER_TWO } from "../../../../utils/number"
import { ILineAttrs } from "../../line/type"
import { IRectAttrs } from "../../rect/type"
import { ITextAttrs } from "../../text/type"



export interface IAxisScale {
  line: Optional<ILineAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>,
  text: Optional<ITextAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>,
  rect: Optional<IRectAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>,
}



export class Axis {

  constructor() {

  }


  finalScaleNumbers(values: number[], min: number, max: number) {
    let scaleNumbers = this.calculatescales(min, max, 6)
    const topscale = Math.max(...scaleNumbers)

    //尽量减少不必要的刻度，避免臃肿导致刻度压缩
    if (topscale > Math.max(...values) && scaleNumbers.length >= 8) {
      scaleNumbers.pop()
    }

    return scaleNumbers
  }

  axisLeft(options: {
    type: 'bar' | 'line'
    values: number[],
    height: number,
    xSafeMargin: number,
    ySafeMargin: number,
    strokeWidth: number,
    scaleGap: number,
    columnWidth: number,
    yscaleTextAlign: string,
    barCategoryGap?: number
  }) {

    const { values, height, xSafeMargin, ySafeMargin, strokeWidth, scaleGap, columnWidth, yscaleTextAlign, barCategoryGap } = options


    const max = Math.max(...values)
    const min = Math.min(...values, 0)


    const scaleNumbers = this.finalScaleNumbers(values, min, max)

    const scaleStep = ((height - ySafeMargin * 2) / (scaleNumbers.length - 1))
    //y轴的刻度值
    const scales = Array.from({ length: scaleNumbers.length }, (t, i) => {
      return {
        label: scaleNumbers[i] ?? '',
        point: new Matrix().translate(xSafeMargin, (height - ySafeMargin) - (i * scaleStep)).getArray(),
      }
    })
    const lines = [
      ...Array.from({ length: scaleNumbers.length }, (v, i) => {
        return {
          value: scales[i].point
        }
      })
    ]


    let textXPoint = 0
    if (yscaleTextAlign === 'right' || yscaleTextAlign === 'end') {
      textXPoint = xSafeMargin - scaleGap
    } else if (yscaleTextAlign === 'center') {
      textXPoint = xSafeMargin / 2
    } else {
      textXPoint = 0
    }

    const yscaleLabelTf = new Matrix().translate(textXPoint, 0)
    yscaleLabelTf.translate(0, 0)
    const labels = [
      ...Array.from({ length: scaleNumbers.length }, (v, i) => {
        yscaleLabelTf.resetToPrevious()
        return {
          value: yscaleLabelTf.translate(0, scales[i].point[5]).getArray(),
          label: scales[i].label
        }
      })
    ]

    return {
      lines,
      labels,
    }

  }


 

  axisBootom(options: {
    labels: string[],
    height: number,
    xSafeMargin: number,
    ySafeMargin: number,
    strokeWidth: number,
    scaleGap: number,
    scaleWidth: number,
    columnWidth: number
  }) {

    const { labels, height, xSafeMargin, ySafeMargin, strokeWidth, scaleGap, scaleWidth, columnWidth } = options

    //创建初始偏移
    const tf = new Matrix().translate(xSafeMargin, (height - ySafeMargin + strokeWidth / 2))

    const xAxisLineTf = new Matrix().rotate(PI_OVER_TWO).prepend(tf)
    const startTf = xAxisLineTf.translate(strokeWidth / 2, 0).getArray()

    xAxisLineTf.resetToPrevious()

    tf.translate(0, scaleGap + scaleWidth)

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
     * @param scaleCount 期望的刻度数量
     * @param forceIncludeZero 是否强制包含 0
     * @returns 刻度值数组
     */
  public calculatescales(
    min: number,
    max: number,
    scaleCount: number = 5,
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
    const interval = this.calculateNiceInterval(min, max, scaleCount);

    // 计算刻度值的起始点和结束点
    const start = Math.floor(min / interval) * interval;
    const end = Math.ceil(max / interval) * interval;

    // 生成刻度值
    const scales: number[] = [];
    for (let value = start; value <= end + interval * 0.5; value += interval) {
      scales.push(value);
    }

    return scales;
  }

  /**
   * 计算合适的刻度间隔
   * @param min 最小值
   * @param max 最大值
   * @param scaleCount 期望的刻度数量
   * @returns 刻度间隔
   */
  private calculateNiceInterval(min: number, max: number, scaleCount: number): number {
    const range = max - min;

    // 初始间隔
    let interval = range / scaleCount;

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