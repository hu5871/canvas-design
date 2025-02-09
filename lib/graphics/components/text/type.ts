import { TextAlign, TextBaseline } from "../../../types";
import { IComponentAttrs } from "../types";

export  interface ITextAttrs  extends IComponentAttrs{
  style:ITextStyle
  text:string;
}


export interface ITextStyle{
  fontSize: number;
  lineWidth: number;
  textAlign : TextAlign;
  textBaseline : TextBaseline;
  padding:number[]
}