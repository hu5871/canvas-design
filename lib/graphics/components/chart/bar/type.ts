import { IConfig, Optional } from "../../../../types";
import { ILineAttrs } from "../../line/type";
import { IRectAttrs } from "../../rect/type";
import { ITextAttrs } from "../../text/type";
import { IComponentAttrs } from "../../types";


export type IBarAttrs = IComponentAttrs   & IConfig['bar'];




export interface IBarTick{
  line:Optional<ILineAttrs, 'state'|'__id'|'transform'|'type'|'field'>,
  text:Optional<ITextAttrs, 'state'|'__id'|'transform'|'type'|'field'>,
  rect:Optional<IRectAttrs, 'state'|'__id'|'transform'|'type'|'field'>,
}


