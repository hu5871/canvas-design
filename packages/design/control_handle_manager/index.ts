import Design from "..";
import { ICursor } from "../cursor";
import { getTransformAngle } from "../geo/geo_angle";
import { Matrix } from "../geo/geo_matrix";
import { offsetRect, rectToMidPoints, rectToVertices } from "../geo/geo_rect";
import { DrawRect } from "../graphics/components/rect";
import { GraphicsType } from "../graphics/components/types";
import { Graphics } from "../graphics/graphics";
import { HALF_PI } from "../setting";
import { IGraphicsOpts, IPaint, IPoint, PaintType } from "../types";
import { parseHexToRGBA } from "../utils/color";
import { ControlHandle } from "./handler";
import { ITransformRect } from "./types";


const types = [
  'n',
  'e',
  's',
  'w',
  'nwRotation',
  'neRotation',
  'seRotation',
  'swRotation',
  'nw',
  'ne',
  'se',
  'sw',
] as const;

export const isTransformHandle = (handleName: string) => {
  return types.includes(handleName as any);
};




export type ITransformHandleType =
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'nwRotation'
  | 'neRotation'
  | 'seRotation'
  | 'swRotation'
  | 'n'
  | 'e'
  | 's'
  | 'w';
export class ControlHandleManager {
  private transformHandles: Map<ITransformHandleType, ControlHandle>;
  private customHandles: ControlHandle[] = [];
  constructor(private design: Design) {
    this.transformHandles = createTransformHandles({
      size: 10,
      fill: design.setting.get("handleFill"),
      stroke: design.setting.get("handleStroke"),
      strokeWidth: design.setting.get("handleStrokeWidth")
    },
      design
    )
  }

  setCustomHandles(handles: ControlHandle[]) {
    this.customHandles = handles;
  }

  hasCustomHandles() {
    return this.customHandles.length > 0;
  }

  private updateTransformHandles(rect: ITransformRect) {
    const zoom = this.design.zoom.getZoom();
    const handleSize = this.design.setting.get('handleSize');
    const handleStrokeWidth = this.design.setting.get('handleStrokeWidth');
    const neswHandleWidth = this.design.setting.get('neswHandleWidth');

    // calculate handle position
    const _rect = {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
    };
    const handlePoints = (() => {
      const cornerPoints = rectToVertices(_rect, rect.transform);

      const offset = handleSize / 2 / zoom;
      const cornerRotates = rectToVertices(
        offsetRect(_rect, offset),
        rect.transform,
      );

      // when rect size < 40（viewport）, nwse handle should outside the selectedBox
      const MIN_SIZE = 40;
      const offsets: number[] = new Array(4).fill(0);
      if (rect.width * zoom < MIN_SIZE) {
        offsets[1] = offsets[3] = neswHandleWidth / 2 / zoom;
      }
      if (rect.height * zoom < MIN_SIZE) {
        offsets[0] = offsets[2] = neswHandleWidth / 2 / zoom;
      }
      const neswRect = offsetRect(_rect, offsets);

      const tf = new Matrix(...rect.transform);
      const midPoints = rectToMidPoints(neswRect).map((point) => {
        const { x, y } = tf.apply(point);
        return { x, y };
      });

      return {
        nw: cornerPoints[0],
        ne: cornerPoints[1],
        se: cornerPoints[2],
        sw: cornerPoints[3],

        n: midPoints[0],
        e: midPoints[1],
        s: midPoints[2],
        w: midPoints[3],

        nwRotation: cornerRotates[0],
        neRotation: cornerRotates[1],
        seRotation: cornerRotates[2],
        swRotation: cornerRotates[3],
      };
    })();

    // update handle position
    for (const type of types) {
      const point = handlePoints[type];
      const handle = this.transformHandles.get(type);
      if (!handle) {
        console.warn(`handle ${type} not found`);
        continue;
      }
      handle.cx = point.x;
      handle.cy = point.y;
    }

    // update n/s/w/e handle graphics size
    const n = this.transformHandles.get('n')!;
    const s = this.transformHandles.get('s')!;
    const w = this.transformHandles.get('w')!;
    const e = this.transformHandles.get('e')!;
    n.graphics.attrs.width = s.graphics.attrs.width =
      rect.width * zoom - handleSize - handleStrokeWidth;
    w.graphics.attrs.height = e.graphics.attrs.height =
      rect.height * zoom - handleSize - handleStrokeWidth;
    n.graphics.attrs.height =
      s.graphics.attrs.height =
      w.graphics.attrs.width =
      e.graphics.attrs.width =
      neswHandleWidth;

    const heightTransform = new Matrix()
      .rotate(HALF_PI)
      .prepend(new Matrix(...rect.transform))
      .rotate(HALF_PI);
    const heightRotate = getTransformAngle([
      heightTransform.a,
      heightTransform.b,
      heightTransform.c,
      heightTransform.d,
      heightTransform.tx,
      heightTransform.ty,
    ]);
    n.rotation = heightRotate;
    s.rotation = heightRotate;
  }


  getHandleInfoByPoint(hitPoint: IPoint): {
    handleName: string;
  } | null {
    const handles: ControlHandle[] = [];
    const graphics = this.design.store.getGraphics()
    if (graphics) {
      handles.push(...Array.from(this.transformHandles.values()));
    } else {
      return null
    }
    if (handles.length === 0) {
      return null;
    }

    const hitPointVW = this.design.canvas.toViewportPt(hitPoint.x, hitPoint.y);
    const box = {
      ...graphics!.getSize(),
      transform: graphics!.getWorldTransform()
    }

    for (let i = handles.length - 1; i >= 0; i--) {
      const handle = handles[i];
      const type = handle.type;
      if (!handle) {
        console.warn(`handle ${type} not found`);
        continue;
      }

      const isHit = handle.hitTest
        ? handle.hitTest(hitPointVW,  handle.padding, box)
        : handle.graphics.hitTest(hitPointVW, handle.padding);

      if (isHit) {
        return {
          handleName: type,
        };
      }
    }

    return null;
  }




  draw() {
    const graphics = this.design.store.getGraphics();

    if (!graphics || !graphics.getParent()?.isEdit()) return
    const rect: ITransformRect = {
      ...graphics.getSize(),
      transform: graphics.getWorldTransform()
    }
    if (!rect) return
    this.updateTransformHandles(rect);
    const handles: ControlHandle[] = [];
    handles.push(...Array.from(this.transformHandles.values()));
    const rotate = rect ? getTransformAngle(rect.transform) : 0;
    handles.forEach((handle) => {
      const graphics = handle.graphics;
      const { x, y } = this.design.canvas.toViewportPt(
        handle.cx,
        handle.cy,
      );
      graphics.updateAttrs({
        transform: [
          1,
          0,
          0,
          1,
          x - graphics.attrs.width / 2,
          y - graphics.attrs.height / 2,
        ],
      });
      if (rect && handle.isTransformHandle) {
        graphics.setRotate(rotate);
      }
      if (handle.rotation !== undefined) {
        graphics.setRotate(handle.rotation);
      }

      if (!graphics.isVisible()) {
        return;
      }
      graphics.draw();
    });
  }

}


const createTransformHandles = (
  params: {
    size: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  },
  design: Design
) => {
  const getDefaultAttrs = () => {
    const attrs: {
      width: number;
      height: number;
      fill: IPaint[];
      stroke: IPaint[];
      strokeWidth: number;
    } = {
      width: params.size,
      height: params.size,
      fill: [
        {
          type: PaintType.Solid,
          attrs: parseHexToRGBA(params.fill)!,
        },
      ],
      stroke: [
        {
          type: PaintType.Solid,
          attrs: parseHexToRGBA(params.stroke)!,
        },
      ],
      strokeWidth: 1,
    };
    return attrs;
  };



  const opts: IGraphicsOpts = {
    noCollectUpdate: true,
  };


  const hitTest = function (
    this: ControlHandle,
    point: IPoint,
    tol: number,
    rect: ITransformRect | null,
  ) {
    if (!rect || rect.width === 0 || rect.height === 0) {
      return false;
    }
    return this.graphics.hitTest(point);
  };
  const nw = new ControlHandle({
    graphics: new DrawRect(
      {
        ...getDefaultAttrs(),
        field: 'nw',
        state: 0,
        type: GraphicsType.Rect
      },
      design,
      opts,
    ),
    type: 'nw',
    // hitTest,
    padding: 3,
    // 
    isTransformHandle: true,
  });



  const ne = new ControlHandle({
    graphics: new DrawRect(
      {
        ...getDefaultAttrs(),
        field: 'ne',
        state: 0,
        type: GraphicsType.Rect
      },
      design,
      opts,
    ),
    type: 'ne',
    padding: 3,
    // 
    isTransformHandle: true,
  });

  const se = new ControlHandle({
    graphics: new DrawRect(
      {
        ...getDefaultAttrs(),
        field: 'se',
        state: 0,
        type: GraphicsType.Rect
      },
      design,
      opts,
    ),
    type: 'se',
    padding: 3,
    // 
    isTransformHandle: true,
  });

  const sw = new ControlHandle({
    graphics: new DrawRect(
      {
        ...getDefaultAttrs(),
        field: 'sw',
        state: 0,
        type: GraphicsType.Rect
      },
      design,
      opts,
    ),
    type: 'sw',
    padding: 3,
    // 
    isTransformHandle: true,
  });

  /************************* rotation handle  **********************/
  const rotationHandleSize = params.size * 2.5;

  const defaultRotationAttrs = {
    field: 'nwRotation',
    state: 0,
    type: GraphicsType.Rect,
    ...getDefaultAttrs(),
    width: rotationHandleSize,
    height: rotationHandleSize,
    visible: false
  }
  const nwRotation = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'nwRotation',
      },
      design,
      opts,
    ),
    type: 'nwRotation',
    isTransformHandle: true,
  });

  const neRotation = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'neRotation',
      },
      design,
      opts,
    ),
    type: 'neRotation',
    isTransformHandle: true,
  });

  const seRotation = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'seRotation',
      },
      design,
      opts,
    ),
    type: 'seRotation',
    isTransformHandle: true,
  });

  const swRotation = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'swRotation',
      },
      design,
      opts,
    ),
    type: 'swRotation',
    isTransformHandle: true,
  });

  /************* north/south/west/east ************/

  const n = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'n',
      },
      design,
      opts,
    ),
    type: 'n',
    hitTest,

    isTransformHandle: true,
  });
  const e = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'e',
      },
      design,
      opts,
    ),
    type: 'e',
    hitTest,
    isTransformHandle: true,
  });

  const s = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 's',
      },
      design,
      opts,
    ),
    type: 's',
    hitTest,
    isTransformHandle: true,
  });

  const w = new ControlHandle({
    graphics: new DrawRect(
      {
        ...defaultRotationAttrs,
        field: 'w',

      },
      design,
      opts,
    ),
    type: 'w',
    hitTest,
    isTransformHandle: true,
  });

  return new Map<ITransformHandleType, ControlHandle>([
    ['n', n],
    ['e', e],
    ['s', s],
    ['w', w],
    ['nwRotation', nwRotation],
    ['neRotation', neRotation],
    ['seRotation', seRotation],
    ['swRotation', swRotation],
    ['nw', nw],
    ['ne', ne],
    ['se', se],
    ['sw', sw],
  ]);
};


