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
  components: {
    [GraphicsType.Text]: {
      type: GraphicsType.Text,
      fill: [{
        type: PaintType.Solid,
        attrs: {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        }
      }],
      style: {
        fontSize: 12,
        lineWidth: 1,
        textBaseline: 'top',
        padding: [12, 12]
      }
    },
    [GraphicsType.Rect]: {
      type: GraphicsType.Rect,
      fill: [{
        type: PaintType.Solid,
        attrs: {
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      }],
    },
  },
  handleStrokeWidth: 2,
  handleSize: 7,
  handleFill: '#fcfcfc',
  handleStroke: '#1592fe',
  neswHandleWidth: 10, // north/east/south/west handle width
}

export default class Settting {
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