import { createImageData, createCanvas } from 'canvas'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
// @ts-ignore
import { nonstandard } from 'wrtc'

export function print (i420FrameData: Uint8ClampedArray, width: number, height: number) {
  const rgbaData = new Uint8ClampedArray(width * height * 4)
  const i420Frame = createImageData(i420FrameData, width, height)
  const rgbaFrame = createImageData(rgbaData, width, height)

  nonstandard.i420ToRgba(i420Frame, rgbaFrame)

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.putImageData(rgbaFrame as ImageData, 0, 0)

  const out = createWriteStream(resolve(__dirname, 'test.png'))
  canvas.createPNGStream().pipe(out)
}
