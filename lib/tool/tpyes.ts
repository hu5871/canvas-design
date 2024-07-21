import Design from "..";

export interface ITool  extends IBaseTool{

}
export  interface IBaseTool {
  onActive: () => void;
  onInactive: () => void;
  onStart: (event: PointerEvent) => void;
  onDrag: (event: PointerEvent) => void;
  onEnd: (event: PointerEvent) => void;
}


export interface IToolClassConstructor {
  new (design: Design): ITool;
  type: string;
}
