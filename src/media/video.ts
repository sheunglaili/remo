import { Writable } from 'stream'
import { Transmitter } from './transmitter'
import { ImageData } from 'canvas'
import { FPSCounter } from '../utils/fps'

class Frame extends ImageData {
  private availableIndex: number = 0;

  constructor (public width: number, public height: number) {
    super(new Uint8ClampedArray(width * height * 1.5), width, height)
  }

  addByte (byte: number): void {
    this.data[this.availableIndex++] = byte
  }

  // addBytes (buffer: Buffer): Buffer | null {
  //   const remainingSpace = this.data.length - 1 - this.availableIndex
  //   if (remainingSpace > buffer.length) {
  //     this.data.set(buffer, this.availableIndex)
  //     this.availableIndex += buffer.length - 1
  //   } else {
  //     const fitIndex = this.data.length - this.availableIndex
  //     const fitBuffet = buffer.slice(0, fitIndex)
  //     this.data.set(fitBuffet, this.availableIndex)
  //     return buffer.slice(fitIndex)
  //   }
  // }

  isComplete (): boolean {
    return this.data.length === this.availableIndex
  }

  reset () {
    this.availableIndex = 0
  }
}

export class RTCVideoStream extends Writable {
  public lastFrame: Frame;
  private fps:FPSCounter
  constructor (private width: number, private height: number, private trasmitter: Transmitter) {
    super({ highWaterMark: 131072 })
    this.lastFrame = new Frame(this.width, this.height)
    // this.fps = new FPSCounter()
  }

  _write (chunk: any, encoding: string, next: (error?: Error | null) => void) {
    if (encoding === 'buffer') {
      const buffer = <Buffer>chunk

      let bufferIndex = 0
      while (!this.lastFrame.isComplete() && bufferIndex < buffer.length) {
        this.lastFrame.addByte(buffer[bufferIndex++])
      }
      // const remains = this.lastFrame.addBytes(buffer)

      if (this.lastFrame.isComplete()) {
        this.trasmitter.transmitVideo(this.lastFrame)
        this.lastFrame.reset()
        // this.fps.plusOne()
      }

      while (bufferIndex < buffer.length) {
        this.lastFrame.addByte(buffer[bufferIndex++])
      }
      // for (let i = 0, n = buffer.length; i < n; i++) {
      //   this.lastFrame.addByte(buffer[i])
      //   if (this.lastFrame.isComplete()) {
      //     this.trasmitter.transmitVideo(this.lastFrame)
      //     this.lastFrame.reset()
      //     this.fps.plusOne()
      //     // print(this.lastFrame.data, this.lastFrame.width, this.lastFrame.height)
      //   }
      // }
      next()
    } else {
      next(new Error('data passed in is not buffer.'))
    }
  }
}
