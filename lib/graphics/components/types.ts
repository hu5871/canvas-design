import { Template } from './../../scene/template';
import Design from "../..";
import { IGraphicsAttrs } from "../../types";
import { Graphics } from "../graphics";



export enum GraphicsType {
  Text = 'Text',
  Rect = 'Rect',
  // Template = "Template"
}


export interface IComponentAttrs extends IGraphicsAttrs {
  type: GraphicsType;
}


export interface IComponentClassConstructor<T extends IComponentAttrs> {
  new(attrs: T, design: Design, ): Graphics;
  type: GraphicsType;
}

export interface IBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

