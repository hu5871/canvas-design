import { Columns, IConfig, IMatrixArr } from '../../../types';
import { IComponentAttrs } from "../types";


export  type ITableAttrs  = IComponentAttrs & IConfig["tableOptions"]




export interface IHeaderColumns extends Omit<Columns,"columns">  {
  level:number;
  width:number;
  height:number;
  transform:IMatrixArr
  columns?:IHeaderColumns[]
}
