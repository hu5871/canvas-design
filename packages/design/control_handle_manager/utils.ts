import { ICursor } from "../cursor";
import { checkTransformFlip, getTransformAngle, normalizeDegree } from "../geo/geo_angle";
import { ITransformRect } from "./types";


export function rad2Deg(radian: number) {
  return (radian * 180) / Math.PI;
}

export const getRotationCursor = (
  type: string,
  selectedBox: ITransformRect | null,
): ICursor => {
  if (!selectedBox) {
    return 'default';
  }
  const rotation = getTransformAngle(selectedBox.transform);
  const isFlip = checkTransformFlip(selectedBox.transform);
  let dDegree = 0;

  if (selectedBox.height === 0) {
    // be considered as a line
    dDegree = {
      neRotation: 90,
      seRotation: 90,
      swRotation: 270,
      nwRotation: 270,
    }[type]!;
  } else {
    dDegree = {
      neRotation: 45,
      seRotation: 135,
      swRotation: 225,
      nwRotation: 315,
    }[type]!;
  }
  const degree = normalizeDegree(
    rad2Deg(rotation) + (isFlip ? -dDegree : dDegree),
  );
  const r = { type: 'rotation', degree } as const;
  return r;
};