import { IConfig, Optional } from "../../../types";
import { ILineAttrs } from "../line/type";
import { ITextAttrs } from "../text/type";
import { IComponentAttrs } from "../types";


export type IBarAttrs = IComponentAttrs   & IConfig['bar'];




export interface IBarTick{
  line:Optional<ILineAttrs, 'state'|'__id'|'transform'|'type'|'field'>,
  text:Optional<ITextAttrs, 'state'|'__id'|'transform'|'type'|'field'>,
}


