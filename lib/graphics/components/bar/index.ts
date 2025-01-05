import Design from "../../..";
import { getNumberTicks, getStringTicks } from "../../../geo/geo_chart";
import { Matrix, identityMatrix } from "../../../geo/geo_matrix";
import { IAdvancedAttrs, IGraphicsAttrs, IGraphicsOpts, IMatrixArr, IPaint, IPoint, Optional, PaintType } from "../../../types";
import { Graphics } from "../../graphics";
import { DrawLine } from "../line";
import { DrawText } from "../text";
import { GraphicsType } from "../types";
import { IBarAttrs, IBarTick } from "./type";


const opts: IGraphicsOpts = {
  noCollectUpdate: true,
};



export class DrawBar extends Graphics<IBarAttrs> {
  static type = GraphicsType.Bar
  columnWidth: number | undefined
  xTicks: IBarTick[] | undefined
  lineAttrs: IBarTick['line'] | undefined


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

    this.drawTicksLine()
    this.drawTickText()

    ctx.closePath();
    ctx.restore();
  }


  drawTicksLine(){
    new DrawLine(this.lineAttrs!,this.design).draw()

    this.xTicks?.forEach(t=>{
      new DrawLine(t.line,this.design).draw()
    })
  }


  drawTickText(){
    this.xTicks?.forEach(t=>{
      new DrawText(t.text,this.design).draw()
    })
  }
  

  calcAttts() {
    const { data, encode, height, width, labelWidth } = this.attrs
    const { xSafeMargin, ySafeMargin } = this.design.setting.get("bar")

    const ctx = this.design.canvas.ctx
    const values = data.map(item => item[encode.y]) as number[]
    const labels = data.map(item => item[encode.x]) as string[]
    const yTicks = getNumberTicks(values, [xSafeMargin, height - xSafeMargin])
    const xTicks = getStringTicks(labels, [xSafeMargin, width - xSafeMargin])


    const columnWidth = this.columnWidth =
      values.length > 1
        ? (yTicks[1].rectPoint - yTicks[0].rectPoint) * 0.5
        : (width - 40) * 0.5;
    const piOver2 = Math.PI / 2


    const stroke = [this.design.setting.get("stroke")]
    const strokeWidth = this.design.setting.get("strokeWidth")


    this.lineAttrs = {
      type: GraphicsType.Line,
      width: width - xSafeMargin * 2,
      height: 0,
      stroke: stroke,
      strokeWidth: strokeWidth,
      transform: new Matrix().translate(xSafeMargin, height - xSafeMargin).getArray()
    }

    this.xTicks = xTicks.map(item => {
      const tf = new Matrix().rotate(piOver2).translate(item.lineX, height - xSafeMargin)
      return {
        line: {
          type: GraphicsType.Line,
          width: 5,
          height: 0,
          stroke,
          strokeWidth,
          transform: tf.getArray()
        },
        text: {
          type: GraphicsType.Text,
          width: columnWidth,
          height: xSafeMargin - 5,
          transform: new Matrix().translate(item.lineX - (columnWidth / 2), height - xSafeMargin+15).getArray(),
          fill: this.design.setting.get("textFill"),
          style: { ...this.design.setting.get("textStyle"), padding: [0, 0], },
          text: item.label,
        }
      }
    })


  }

}