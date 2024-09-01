import Design from "..";
import { IGraphicsAttrs } from "../types";



export enum GraphicsType {
  Text = 'Text',
}

export interface IBaseComponents {
  draw: () => void;
  onStart: (event: PointerEvent) => void;
  onDrag: (event: PointerEvent) => void;
  onEnd: (event: PointerEvent) => void;
}


export interface IComponentAttrs extends IGraphicsAttrs {
  type: GraphicsType;
}


export interface IComponentClassConstructor<T extends IComponentAttrs> {
  new(attrs: T, design: Design, ): IBaseComponents;
  type: GraphicsType;
}



