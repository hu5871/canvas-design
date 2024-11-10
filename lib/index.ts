import Canvas from "./canvas";
import EventEmitter from "./events/eventEmitter";
import DesignEvent from "./events/index";
import { ToolType } from "./tool";
import Settting from "./settting";
import SceneGraph from "./scene/index";
import Zoom from "./zoom";
import { ITemplateAttrs } from "./types";
import { Store } from "./store";



interface IOps {
  target: string;
  data:ITemplateAttrs[]
}

interface EmitEvents {
  [key: string | symbol]: (...args: any[]) => void
  switchTool(type: string): void;
}

class Design {
  private emitter = new EventEmitter<EmitEvents>()
  store:Store= new Store()
  canvas: Canvas;
  zoom: Zoom;
  sceneGraph: SceneGraph;
  designEvent: DesignEvent
  setting = new Settting()

  constructor(ops: IOps) {
    this.canvas = new Canvas(ops.target, this)
    this.designEvent = new DesignEvent(this);

    this.sceneGraph = new SceneGraph(this,ops?.data??[])
    this.zoom = new Zoom(this)
    this.render()
  }
  render() {
    this.canvas.render()
  }


  getJson(){
    return this.sceneGraph.templates.map(item=>{
      return {...item.getJson()}
    })
  }
  
  
  activeTool(type:ToolType){
    this.sceneGraph.activeTool(type)
  }


  getTools(){
    return this.sceneGraph
  }


  destroy(){
    this.designEvent.destroy()
  }

  on<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.on(eventName, handler);
  }

  off<K extends keyof EmitEvents>(eventName: K, handler: EmitEvents[K]) {
    this.emitter.off(eventName, handler);
  }
}




export default Design

