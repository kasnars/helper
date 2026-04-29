import * as pdfjs from 'pdfjs-dist'

export interface PageViewport {
  width: number
  height: number
  scale: number
  transforms: number[]
}

export interface RenderParameters {
  canvasContext: CanvasRenderingContext2D
  viewport: PageViewport
}

declare module 'pdfjs-dist' {
  export interface PDFPageProxy {
    getViewport(options: { scale: number }): PageViewport
    render(params: RenderParameters): { promise: Promise<void> }
  }
}

declare module 'qrcode' {
  function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any
  ): Promise<void>
  
  function toDataURL(
    text: string,
    options?: any
  ): Promise<string>
}
