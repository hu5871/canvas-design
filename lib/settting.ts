import { DeepRequired, IConfig } from "./types"
import { cloneDeep } from "./utils/deepClone"



const defaultConfig:IConfig ={
  view:{
    width:300,
    height:200
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