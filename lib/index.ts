import Canvas from "./canvas";
import EventEmitter from "./events/eventEmitter";
import DesignEvents from "./events/index";
import { ToolType } from "./tool";
import Settting from "./settting";
import SceneGraph from "./scene/index";
import Zoom from "./zoom";



interface IOps {
  target: string;
}

interface EmitEvents {
  [key: string | symbol]: (...args: any[]) => void
  switchTool(type: string): void;
}

class Design {
  private emitter = new EventEmitter<EmitEvents>()
  canvas: Canvas;
  zoom: Zoom;
  sceneGraph: SceneGraph;
  designEvents: DesignEvents 
  setting = new Settting()
  constructor(ops: IOps) {
    this.canvas = new Canvas(ops.target, this)
    this.designEvents = new DesignEvents(this);
    this.sceneGraph = new SceneGraph(this)
    this.zoom = new Zoom(this)
    this.render()
  }
  render() {
    this.canvas.render()
  }

  
  
  activeTool(type:ToolType){
    this.sceneGraph.activeTool(type)
  }


  getTools(){
    return this.sceneGraph
  }

  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }
}


export default Design