

import Design from "../../../../";
import { Matrix } from "../../../../geo/geo_matrix";
import { getWordWidth } from "../../../../geo/geo_text";
import { IConfig, IGraphicsOpts, IPoint, Optional, PaintType } from "../../../../types";
import { parseHexToRGBA } from "../../../../utils/color";
import { Graphics } from "../../../graphics";
import { DrawRect } from "../../rect";
import { GraphicsType } from "../../types";
import { IChartPieAttrs, LableBox, PieData } from "./type";


const ANGLE = - Math.PI / 2; // 从12点方向开始




export class DrawPie extends Graphics<IChartPieAttrs> {
  static type = GraphicsType.ChartPie
  type = GraphicsType.ChartPie



  constructor(attrs: Optional<IChartPieAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
  }



  override draw() {
    const { ctx } = this.design.canvas
    const { transform, fill, width, height } = this.attrs
    const {paddingTop}  = this.design.setting.get("pie")
    const rows = this.layoutElements(width, this.attrs.data, ctx)


    this.topLable()
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()
    ctx.rect(0, 0, width, height);
    ctx.strokeStyle = "transparent"
    ctx.stroke()
    ctx.clip();
    let startAngle = ANGLE

    let i = 0
    const firstRow = rows[0] 
    const firstTotalWidth = firstRow.reduce((w:number,c:LableBox)=> w+ c.width,0)
    const widthRemaining = width  - firstTotalWidth
    const startPointX  =  widthRemaining / 2
    let startPointY = paddingTop 


    rows.forEach((row, rowIndex) => {
      const len = row.length
      startPointY+= 28 + 16

      let x = startPointX 
      row.forEach(item => {
        i++
        const rect = new DrawRect({
          width: 32,
          height: 28,
          transform: new Matrix().translate(x,startPointY).getArray(),
          fill: [
            {
              type: PaintType.Solid,
              attrs: parseHexToRGBA(this.colors[i])!,
            },
          ],
        }, this.design).draw()
        x+=item.width
      });
    })
    this.data.forEach((item, i) => {


      // const sliceAngle = (item.value / this.total) * Math.PI * 2;
      // this.drawSlice(ctx, startAngle, startAngle + sliceAngle, i);
      // this.drawLabel(startAngle + sliceAngle/2, item);
      // startAngle += sliceAngle;
    });
    ctx.closePath();
    ctx.restore();
  }

  topLable() {
    const { mode, fontSize, textAlign, textBaseline } = this.design.setting.get("pie").label
    const ctx = this.design.canvas.ctx
    const totalWidth = this.data.reduce((total, curr) => {
      const text = curr.label
      ctx.font = `${fontSize}px sans-serif`
      ctx.textBaseline = textBaseline
      ctx.textAlign = textAlign
      return total + ctx.measureText(text).width;
    }, 0)

    const rectTotal = Array.from({ length: this.data.length }, () => {
      return {
        width: 32,
        height: 16
      }
    }).reduce((total, curr) => {
      return total + curr.width
    }, 0)
    const total = rectTotal + totalWidth

    if (total > this.attrs.width) {

    }

    console.log("totalWidth", totalWidth)
    return this.data.map(item => {

    })
  }


  /**
 * 将元素列表按盒子宽度分行的算法
 * @param {number} boxWidth 盒子的总宽度
 * @param {PieData[]} elements 待分行元素列表
 * @param {CanvasRenderingContext2D} ctx 已设置字体的Canvas上下文
 * @returns {LableBox[][]} 分行后的二维数组，每行为一组元素
 */
  layoutElements(boxWidth: number, elements: PieData[], ctx: CanvasRenderingContext2D): LableBox[][] {
    const lines: LableBox[][] = [];
    let currentLine: LableBox[] = [];
    let currentWidth = 0;
    const gap = 16

    // 遍历所有元素
    for (const el of elements) {
      const spacing = 8;

      const labelWidth = getWordWidth(ctx, el.label) + 32  + spacing;
      const potentialWidth = currentWidth + gap + labelWidth 
      const cell = {
        ...el,
        width: labelWidth 
      }
      // 判断是否需要换行
      if (potentialWidth > boxWidth) {
        if (currentLine.length === 0) {
          // 处理超长元素：强制放入独立行
          lines.push(currentLine);
          currentLine = [];
          currentWidth = 0;
      
          currentLine.push(cell);
        } else {
          // 当前行已满，换行处理
          lines.push(currentLine);
          currentLine = [cell];
          currentWidth = labelWidth;
        }
      } else {
        // 元素可放入当前行
        currentLine.push(cell);
        currentWidth += spacing + labelWidth;
      }
    }

    // 添加最后一行
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }



  get center() {
    const { width, height } = this.attrs
    return [width / 2, height / 2]
  }
  get colors() {
    const { color } = this.design.setting.get("pie")
    return color
  }

  get radius() {
    return Math.max((Math.min(this.center[0], this.center[1]) - 20), 0);
  }

  get data() {
    const { data } = this.design.setting.get("pie")
    return data
  }

  get total() {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }


  drawSlice(ctx: CanvasRenderingContext2D, start: number, end: number, index: number) {
    const { width, height } = this.attrs
    const [x, y] = [width / 2, height / 2]
    ctx.save()
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y,
      this.radius,
      start, end
    );
    ctx.fillStyle = this.colors[index];
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }


  // drawLabel(angle:number, item:{value: number;
  //   label: string;}) {
  //   const { ctx } = this.design.canvas
  //   const [cx, cy] = this.center;
  //   const labelRadius = this.radius * 1.2;
  //   const x = cx + Math.cos(angle) * labelRadius;
  //   const y = cy + Math.sin(angle) * labelRadius;

  //   ctx.save();
  //   ctx.translate(x, y);
  //   ctx.rotate(angle + Math.PI/2);
  //   ctx.textAlign = 'center';
  //   ctx.textBaseline = 'middle';
  //   ctx.fillStyle = '#333';
  //   ctx.font = '12px Arial';
  //   ctx.fillText(`${item.label}`, 0, 0);
  //   ctx.restore();
  // }

}