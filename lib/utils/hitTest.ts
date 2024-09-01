import { IPoint, IRect } from "../types"


export const hitRect=(scenePoint:IPoint,localPoint:IPoint,rect:Pick<IRect,'width'|'height'>)=>{
  const { x: cx, y: cy } = scenePoint
  const { x, y } = localPoint
  const {width,height} =rect
  const isHit = (
    x <= cx &&
    x + width >= cx &&
    y <= cy &&
    y + height >= cy
  )
  return isHit
}