import { IPaint } from "../../../types"
import { IComponentAttrs } from "../types"


export  interface ILineAttrs  extends IComponentAttrs{
  stroke:IPaint[]
  strokeWidth:number
}
