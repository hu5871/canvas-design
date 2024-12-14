import type Design from "../../..";
import { Matrix, identityMatrix, invertMatrix } from "../../../geo/geo_matrix";
import { type Columns, IAdvancedAttrs, IGraphicsAttrs, IGraphicsOpts, IMatrixArr, Optional } from "../../../types";
import { flattenArray } from "../../../utils/array";
import { cloneDeep } from "../../../utils/loadsh";
import { Graphics, multiplyMatrix } from "../../graphics";
import { GraphicsType } from "../types";
import { IHeaderColumns, ITableAttrs } from "./type";



export class DrawTable extends Graphics<ITableAttrs> {
  type = GraphicsType.Table
  static type = GraphicsType.Table
  columns: IHeaderColumns[] = []
  maxLevel: number = 1
  constructor(attrs: Optional<ITableAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
    if (attrs?.columns) {
      this.maxLevel = this.depthLevel(attrs?.columns)
      this.columns = this.calcColumns(cloneDeep(this.attrs.columns), this.attrs.width, identityMatrix())
    }
  }


  override draw() {
    const { transform, width, height, defaultRowHeight, defaultHeaderRowHeight, autoColWidth, columns } = this.attrs
    const options = this.design.setting.get("tableOptions")
    const { borderColor} = options

    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()
    ctx.rect(0, 0, width, height);
    ctx.strokeStyle=borderColor,
    ctx.stroke()
    ctx.clip()
    this.drawHeader()

    ctx.closePath();
    ctx.restore();
  }

  drawHeader() {
    this.drawHeaderCell(this.columns)
  }
  override updateAttrs(partialAttrs: Partial<ITableAttrs> & IAdvancedAttrs): void {
    super.updateAttrs(partialAttrs)
    const { columns } = this.attrs
    this.maxLevel = this.depthLevel(columns)
    this.columns = this.calcColumns(cloneDeep(this.attrs.columns), this.attrs.width, identityMatrix())
  }

  //计算列
  calcColumns(columns: Columns[], width: number, transform: IMatrixArr, level = 0): IHeaderColumns[] {
    if (!transform) {
      transform = identityMatrix()
    }
    const { defaultHeaderRowHeight } = this.attrs
    const fixedWidth = columns
      .filter((col) => col?.width !== undefined)
      .reduce((sum, col) => sum + (col.width || 0), 0);

    // 统计未定义宽度列的数量
    const undefinedWidthCount = columns.filter((col) => col?.width === undefined)
      .length;

    // 计算剩余宽度
    const remainingWidth = Math.max(width - fixedWidth, 0);

    // 每个未定义宽度列的宽度
    const colWidth =
      undefinedWidthCount > 0
        ? remainingWidth / undefinedWidthCount
        : 0;
    //y轴偏移
    const y = level > 0 ? defaultHeaderRowHeight : 0
    //记录矩阵，方便计算每行中的列偏移
    let matrix:IMatrixArr = [...transform];
    return columns.map((item) => {
      //如果定义则使用，否则默认平均宽度
      let width = item.width || colWidth
      //高度计算，存在子列时：默认高度 * （最大层级 - 当前层级） ： 否则区默认高度
      const height = !(item.columns?.length) ? defaultHeaderRowHeight * (this.maxLevel - level) : defaultHeaderRowHeight
      //平移矩阵的y轴
      const tf = new Matrix(...matrix).translate(0,y).getArray(); // 更新变换矩阵
      // 返回内容
      const nt: IHeaderColumns = { ...item, level, width, height, transform: tf, columns: [] }
      if (item.columns) {
        nt.columns = this.calcColumns(item.columns, width,tf, level + 1)
        //子项宽度
        width = nt.columns.reduce((sum, child) => sum + child.width, 0);
      }
      matrix = new Matrix(...matrix).translate(width,0).getArray(); // 平移矩阵x轴
      return nt
    })
  }





  drawHeaderCell(columns: IHeaderColumns[]) {
    const flatColumns: Omit<IHeaderColumns, 'columns'>[] = flattenArray(columns, 'columns')
    const ctx = this.design.canvas.ctx
    const options = this.design.setting.get("tableOptions")
    const { borderColor, textColor, textAlign } = options
    flatColumns.forEach((head) => {
      ctx.save();
      ctx.transform(...head.transform);
      ctx.beginPath()
      ctx.rect(0, 0, head.width, head.height);
      ctx.strokeStyle =borderColor
      ctx.stroke()
      ctx.clip()
      ctx.fillStyle = textColor
      ctx.font = `${14}px Helvetica Neue,Helvetica,Arial,PingFangSC-Regular,Microsoft YaHei,SimSun,sans-serif`
      ctx.textBaseline = 'top'
      const textMetrics = ctx.measureText(head.title)
      let fontHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
      let textAlignLeft = 0
      switch (textAlign) {
        case "left":
          break;
        case "center":
          textAlignLeft = (head.width / 2) - (textMetrics.width / 2)
          break;
        case "right":
          textAlignLeft = head.width - textMetrics.width
          break;
        default:
          break;
      }
      ctx.fillText(head.title, textAlignLeft, head.height / 2 - (fontHeight / 2))
      ctx.restore();
    })
  }


  depthLevel(columns: Columns[]) {
    if (!Array.isArray(columns)) return 0;
    let depth = 0;
    for (const item of columns) {
      if (item?.columns && Array.isArray(item.columns)) {
        depth = Math.max(depth, this.depthLevel(item.columns));
      }
    }
    return depth + 1;
  }

}