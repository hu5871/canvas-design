import Design from "../../../..";
import { IGraphicsOpts, Optional } from "../../../../types";
import { Graphics } from "../../../graphics";
import { GraphicsType } from "../../types";
import { IChartLineAttrs } from "./type";

export class DrawChartLine extends Graphics<IChartLineAttrs> {
  static type = GraphicsType.ChartLine
  type = GraphicsType.ChartLine
  constructor(attrs: Optional<IChartLineAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts){
    super(attrs, design, opts)
  }



  draw(){
    console.log("drawChartLine")
  }
}