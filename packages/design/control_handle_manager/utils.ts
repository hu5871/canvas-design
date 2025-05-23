import { ICursor } from "../cursor";
import { checkTransformFlip, getTransformAngle, normalizeDegree } from "../geo/geo_angle";
import { Matrix } from "../geo/geo_matrix";
import { HALF_PI } from "../setting";
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



export const getResizeCursor = (
  type: string,
  selectedBox: ITransformRect | null,
): ICursor => {
  if (!selectedBox) {
    return 'default';
  }
  if (selectedBox.height === 0) {
    // be considered as a line
    return 'move';
  }

  if (type === 'n' || type === 's') {
    const heightTransform = new Matrix()
      .rotate(HALF_PI)
      .prepend(new Matrix(...selectedBox.transform))
      .rotate(HALF_PI);
    const heightRotate = getTransformAngle([
      heightTransform.a,
      heightTransform.b,
      heightTransform.c,
      heightTransform.d,
      heightTransform.tx,
      heightTransform.ty,
    ]);
    const degree = rad2Deg(heightRotate);
    return { type: 'resize', degree };
  }

  const rotation = getTransformAngle(selectedBox.transform);
  const isFlip = checkTransformFlip(selectedBox.transform);

  let dDegree = 0;
  switch (type) {
    case 'se':
    case 'nw':
      dDegree = -45;
      break;
    case 'ne':
    case 'sw':
      dDegree = 45;
      break;
    case 'e':
    case 'w':
      dDegree = 90;
      break;
    default:
      console.warn('unknown type', type);
  }

  const degree = rad2Deg(rotation) + (isFlip ? -dDegree : dDegree);
  return { type: 'resize', degree };
};
