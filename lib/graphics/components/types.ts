import Design from "../..";
import { IGraphicsAttrs } from "../../types";
import { Graphics } from "../graphics";



export enum GraphicsType {
  Text = 'Text',
}


export interface IComponentAttrs extends IGraphicsAttrs {
  type: GraphicsType;
}


export interface IComponentClassConstructor<T extends IComponentAttrs> {
  new(attrs: T, design: Design, ): Graphics;
  type: GraphicsType;
}



