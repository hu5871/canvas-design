import { GraphicsType } from "./graphics/components/types"
import { DeepRequired, IConfig } from "./types"
import { cloneDeep } from "./utils/deepClone"



const defaultConfig:IConfig ={
  template:{
    width:300,
    height:200
  },
  components:{
    [GraphicsType.Text]:{
      width:100,
      height:50,
      type:GraphicsType.Text,
      style:{
        fontSize: 12,
        lineWidth: 1,
        fill: "#000000",
        textBaseline: 'top',
        padding:[12,12]
      }
    }
  }
}

export default class Settting{
  private version="0.0.1"
  private config: IConfig
  constructor(config:Partial<IConfig>={}){
    this.config=cloneDeep({...defaultConfig,...config})
  }


  get v(){
    return this.version
  }
 

  get settingConfig(){
    return this.config
  }

}