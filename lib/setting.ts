import { GraphicsType } from "./graphics/components/types"
import { DeepRequired, IConfig, PaintType } from "./types"
import { cloneDeep } from "./utils/loadsh"

export const DOUBLE_PI = Math.PI * 2;

export const HALF_PI = Math.PI / 2;

const defaultConfig: IConfig = {
  theme: "#38bdf8",
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
    textAlign:"left",
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
  bwipOptions:{
    bcid: 'code128',      
    text: '0123456789',   
    includetext: true,       
    textxalign: 'center', 
  },
  tableOptions:{
    defaultRowHeight:40,//默认行高
    defaultHeaderRowHeight:40,//默认表头行高
    // defaultColWidth: 80,// 列宽
    autoColWidth: true,//自动平分列宽
    columns:[
      {
        field: 'id',
        title: 'ID',
        width: 100
      },
      {
        field: 'info',
        title: '信息',
        width: 400,
        columns:[
          {
            field: 'degree',
            title: '学历',
            width: 100,
          },
          {
            field: 'user',
            title: '用户',
            columns:[
              {
                field: 'name',
                title: '姓名',
              },
              {
                field: 'gender',
                title: '性别',
              },
            ]
          },
        ]
      },
      {
        field: 'address',
        title: '地址',
        columns:[
          {
            field:'city',
            title:"城市"
          },
          {
            field:"street",
            title:"街道"
          }
        ]
      }
    ],
    textColor: "#a1a1a1",
    textAlign:'center',
    borderColor: "gray",
  },
  bar:{
    data:[
      // { area: "东北", sales: 300 },
      // { area: "中南", sales: 650 },
      // { area: "华东", sales: 500},
      // { area: "华北", sales: 200},
      // { area: "西北", sales: 150 },
      // { area: "西南", sales: 100},



      { area: "东北", sales: 20 },
      { area: "中南", sales: 50 },
      { area: "华东", sales: 46},
      { area: "华北", sales: -14},
      { area: "西北", sales: 89 },
      { area: "西南", sales: 100},
    ],
    xSafeMargin:60,
    ySafeMargin:30,
    tickGap: 5,// 刻度和文本间隙
    tickWidth: 5,// 每项刻度线条的长度
    tickTextBaseline: "middle",
    xTickTextAlign: 'center',
    yTickTextAlign: 'right',
    barCategoryGap: 8,
    lineFill: {
      type: PaintType.Solid,
      attrs: {
        r: 156,
        g: 163,
        b: 175,
        a: 1
      }
    },
    barFill: {
      type: PaintType.Solid,
      attrs: {
        r: 91,
        g: 143,
        b: 249,
        a: 1
      }
    },
    encode:{
      x:"area",
      y:"sales"
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

   // size indicator
   sizeIndicatorMinSize: 10, // if length less this value, not render
   sizeIndicatorOffset: 10,
   sizeIndicatorRectRadius: 2,
   sizeIndicatorRectPadding: [0, 4, 0, 4],
   sizeIndicatorTextColor: '#fff',
   sizeIndicatorTextFontStyle: '12px sans-serif',
   sizeIndicatorNumPrecision: 2,

   selectBoxStroke: '#1592fe',
   selectBoxStrokeWidth: 1.2,
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