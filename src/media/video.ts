import { Writable } from 'stream'
import { Transmitter } from './transmitter'
import { ImageData } from 'canvas'
import { FPSCounter } from '../utils/fps'

class Frame extends ImageData {
  private availableIndex: number = 0;
  private frameSize: number;

  constructor (public width: number, public height: number) {
    super(new Uint8ClampedArray(width * height * 1.5), width, height)
    this.frameSize = width * height * 1.5
  }

  addByte (byte: number): void {
    this.data[this.availableIndex++] = byte
  }

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
    super()
    this.lastFrame = new Frame(this.width, this.height)
    this.fps = new FPSCounter()
  }

  _write (chunk: any, encoding: string, next: (error?: Error | null) => void) {
    if (encoding === 'buffer') {
      const buffer = <Buffer>chunk

      // for (let i = 0, n = buffer.length; i < n; i++) {
      //   this.lastFrame.addByte(buffer[i])
      //   if (this.lastFrame.isComplete()) {
      //     this.trasmitter.transmitVideo(this.lastFrame)
      //     this.lastFrame.reset()
      //     // print(this.lastFrame.data, this.lastFrame.width, this.lastFrame.height)
      //   }
      // }
      let index = 0
      while (!this.lastFrame.isComplete() && index < buffer.length) {
        this.lastFrame.addByte(buffer[index++])
      }

      if (this.lastFrame.isComplete()) {
        this.trasmitter.transmitVideo(this.lastFrame)
        this.lastFrame.reset()
        this.fps.plusOne()
      }

      next()
    } else {
      next(new Error('data passed in is not buffer.'))
    }
  }
}
