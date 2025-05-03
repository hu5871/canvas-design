import { Graphics } from "../graphics/graphics";
import { IPoint } from "../types";
import { Template } from "../graphics/template";


export const getTemplateItem=( point: IPoint,
  nodes: Graphics[],)=>{
    for (let i = nodes.length - 1; i >= 0; i--) {
      const child = nodes[i];
    
      if (isTempGraphics(child)  && child.hitTest(point)) {
        return child;
      }
    }
    return null;
}



export const isTempGraphics = (
  graphics: Graphics,
): graphics is Template => {
  return graphics instanceof Template;
};
