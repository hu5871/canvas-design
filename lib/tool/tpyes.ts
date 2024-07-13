export  interface IBaseTool {
  onActive: () => void;
  onStart: (event: PointerEvent) => void;
  onDrag: (event: PointerEvent) => void;
  onEnd: (event: PointerEvent, isDragHappened: boolean) => void;
}