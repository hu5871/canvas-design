export const viewportCoordsToSceneUtil = (
  x: number,
  y: number,
  zoom: number,
  scrollX: number,
  scrollY: number,
  /**
   * 是否四舍五入取整
   */
  round = false,
) => {
  let newX = scrollX + x / zoom;
  let newY = scrollY + y / zoom;
  if (round) {
    newX = Math.round(newX);
    newY = Math.round(newY);
  }
  return {
    x: newX,
    y: newY,
  };
};