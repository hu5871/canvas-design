

import Design from "../../../../";
import { Matrix } from "../../../../geo/geo_matrix";
import { getWordWidth } from "../../../../geo/geo_text";
import { IConfig, IGraphicsOpts, IPoint, Optional, PaintType } from "../../../../types";
import { findMaxIndex } from "../../../../utils/array";
import { parseHexToRGBA } from "../../../../utils/color";
import { Graphics } from "../../../graphics";
import { DrawRect } from "../../rect";
import { DrawText } from "../../text";
import { GraphicsType } from "../../types";
import { IChartPieAttrs, LableBox, PieData } from "./type";


const ANGLE = - Math.PI / 2; // 从12点方向开始
const rectWidth = 32
const rectHeight= 18
const spacing = 8;
const cellGap = 16
const rowLineGap = 4




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


    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()
    ctx.rect(0, 0, width, height);
    ctx.strokeStyle = "transparent"
    ctx.stroke()
    ctx.clip();
    let startAngle = ANGLE

    let i = 0
    //找出最长的一行计算两边距离
    const rowIndex= findMaxIndex(rows.map(row=> row.length))
    const row= rows[rowIndex]
    const rowTotalWidth = row.reduce((w:number,c:LableBox)=> w+ c.width,0)
    const widthRemaining = width  - rowTotalWidth
    const startPointX  =  Math.max(widthRemaining / 2,0)
    // console.log(startPointX)
    let startPointY = paddingTop 
    let endPointY = 0


    rows.forEach((row, rowIndex) => {
      let y = startPointY  + (rowIndex ?( rowIndex * (rectHeight+ rowLineGap)) : 0)
      let x = startPointX 

      rows.length == rowIndex+1  && (endPointY = y+rectHeight)
      row.forEach(item => {
        i++
        new DrawRect({
          width: rectWidth,
          height: rectHeight,
          transform: new Matrix().translate(x,y).getArray(),
          fill: [
            {
              type: PaintType.Solid,
              attrs: parseHexToRGBA(this.colors[i])!,
            },
          ],
        }, this.design).draw()
        const textWidth = getWordWidth(ctx,item.label)
        new DrawText({
          width: textWidth,
          visible:true,
          height: 12,
          transform: new Matrix().translate(x + rectWidth + spacing,y+rectHeight/2).getArray(),
          text:item.label,
          fill:[{
            type: PaintType.Solid,
            attrs: {
              r: 0,
              g:0,
              b:0,
              a:.6
            }
          }],
          style:{
            fontSize: 12,
            lineWidth: 1,
            textBaseline:"middle",
            textAlign: "left",
            padding: [0,0]
          }
        }, this.design).draw(false)
        x+=item.width
      });
    })

    const pieHieght= height - endPointY
    this.data.forEach((item, i) => {
      const sliceAngle = (item.value / this.total) * Math.PI * 2;
      this.drawSlice(ctx,width, pieHieght,endPointY,startAngle, startAngle + sliceAngle, i);
      startAngle += sliceAngle;
    });
    ctx.closePath();
    ctx.restore();
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

    // 遍历所有元素
    for (let i = 0;i < elements.length;i++) {
      const el = elements[i]
      const labelWidth = getWordWidth(ctx, el.label) + rectWidth  + spacing + cellGap;
      const potentialWidth = currentWidth  + labelWidth 
      const cell = {
        ...el,
        width: labelWidth 
      }
      // 判断是否需要换行
      if (potentialWidth > boxWidth && i) {
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

 
  get colors() {
    const { color } = this.design.setting.get("pie")
    return color
  }


  get data() {
    const { data } = this.design.setting.get("pie")
    return data
  }

  get total() {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }


  drawSlice(ctx: CanvasRenderingContext2D,width:number,height:number, startPointY:number,start: number, end: number, index: number) {
    const center =  [width / 2, height / 2]
    const min= Math.min(...center)
    const radius =  Math.max(min - (min * 0.2),0) 
    const [x,y] = [width / 2, startPointY+  height/2]
    ctx.save()
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y,
      radius,
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