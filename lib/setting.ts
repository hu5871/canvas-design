import { GraphicsType } from "./graphics/components/types"
import { DeepRequired, IConfig, PaintType } from "./types"
import { cloneDeep } from "./utils/loadsh"

export const DOUBLE_PI = Math.PI * 2;

export const HALF_PI = Math.PI / 2;

const defaultConfig: IConfig = {
  template: {
    width: 300,
    height: 200
  },
  textFill: [{
    type: PaintType.Solid,
    attrs: {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    }
  }],
  textStyle: {
    fontSize: 12,
    lineWidth: 1,
    textBaseline: 'top',
    padding: [12, 12]
  },

  stroke: {
    type: PaintType.Solid,
    attrs: {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    }
  },
  dragBlockStep: 4, // 如果移动距离小于此值，则不会发生拖曳处理程序
  strokeWidth: 1,
  handleStrokeWidth: 2,
  handleSize: 7,
  handleFill: '#fcfcfc',
  handleStroke: '#1592fe',
  neswHandleWidth: 10, // north/east/south/west handle width
  lockRotation: Math.PI / 12, // 旋转时，通过 shift 约束旋转角度为该值的整数倍。
  minStepInViewport: 50, // 视口区域下的最小步长

  /**** pixel grid ****/
  enablePixelGrid: true,
  snapToGrid: true, // 是否吸附到网格
  minPixelGridZoom: 8, // draw pixel grid When zoom reach this value
  pixelGridLineColor: '#cccccc55', // pixel grid line color
  gridViewX: 1,
  gridViewY: 1,
  gridSnapX: 1,
  gridSnapY: 1,

  selectionHitPadding:2,
  flipObjectsWhileResizing: true,
}

export default class Setting {
  private version = "0.0.1"
  private config: IConfig
  constructor(config: Partial<IConfig> = {}) {
    this.config = cloneDeep({ ...defaultConfig, ...config })
  }

  get v() {
    return this.version
  }

  get<K extends keyof IConfig>(key: K) {
    return this.config[key]
  }

  get settingConfig() {
    return this.config
  }

}