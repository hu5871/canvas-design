import { IConfig } from "../../../../types";
import { IComponentAttrs } from "../../types";

export type IChartPieAttrs = IComponentAttrs  & IConfig['pie'];

export interface  PieData {
  value: number;
  label: string;
}

export interface LableBox extends PieData {
  width: number;
}