import { IComponentAttrs } from "../types";

export  interface ITextAttrs  extends IComponentAttrs{
  style:ITextStyle
  field:string
}


export interface ITextStyle{
  fontSize: number;
  lineWidth: number;
  textBaseline:"alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top"
  padding:number[]
}