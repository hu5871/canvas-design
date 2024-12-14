import Design from "../../..";
import bwipjs from '@bwip-js/browser';
import { IAdvancedAttrs, IGraphicsAttrs, IGraphicsOpts, IMatrixArr, IPaint, Optional, PaintType } from "../../../types";
import { parseRGBAStr } from "../../../utils/color";
import getDpr from "../../../utils/dpr";
import { Graphics } from "../../graphics";
import { ITextAttrs } from "../text/type";
import { GraphicsType } from "../types";
import { IBarcodeAttrs } from "./type";




export class DrawBarcode extends Graphics<IBarcodeAttrs> {
  type = GraphicsType.Barcode
  static type = GraphicsType.Barcode
  canvas: HTMLCanvasElement
  barcodeCtx: CanvasRenderingContext2D
  constructor(attrs: Optional<IBarcodeAttrs, 'state' | '__id' | 'transform' | 'type' | 'field'>, design: Design, opts?: IGraphicsOpts) {
    super(attrs, design, opts)
    this.canvas = document.createElement("canvas")
    this.barcodeCtx = this.canvas.getContext('2d')!;
  }
  override updateAttrs(partialAttrs: Partial<IGraphicsAttrs> & IAdvancedAttrs): void {
    super.updateAttrs(partialAttrs)
    const width = this.attrs.width
    const height = this.attrs.height
    const dpr = getDpr() //获取设备像素比
    if (width !== undefined) {
      this.canvas.width = width * dpr;
      this.canvas.style.width = width + 'px';
    }
    if (height !== undefined) {
      this.canvas.height = height * dpr;
      this.canvas.style.height = height + 'px';
    }
  }

  override async draw() {
    const { bcid, includetext, text, textxalign,transform } = this.attrs

    this.barcodeCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    let canvas = bwipjs.toCanvas(this.canvas, {
      scale: getDpr(),
      height: 10,
      bcid, 
      includetext,
      text,
      textxalign
    });
    const ctx = this.design.canvas.ctx
    ctx.save();
    ctx.transform(...transform);
    ctx.beginPath()
    ctx.drawImage(canvas, 0, 0, this.attrs.width, this.attrs.height)
    ctx.closePath();
    ctx.restore();
  }
}