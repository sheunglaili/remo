import { Writable } from 'stream'
import { Transmitter } from './transmitter'
import { ImageData } from 'canvas'
import { FPSCounter } from '../utils/fps'

class Frame extends ImageData {
  private bufferIndex: number = 0;

  constructor (public width: number, public height: number) {
    super(new Uint8ClampedArray(width * height * 1.5), width, height)
  }

  addByte (byte: number): void {
    this.data[this.bufferIndex++] = byte
  }

  isComplete (): boolean {
    return this.data.length === this.bufferIndex
  }

  reset () {
    this.bufferIndex = 0
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

      for (let i = 0, n = buffer.length; i < n; i++) {
        this.lastFrame.addByte(buffer[i])
        if (this.lastFrame.isComplete()) {
          this.trasmitter.transmitVideo(this.lastFrame)
          this.lastFrame.reset()
          this.fps.plusOne()
          // print(this.lastFrame.data, this.lastFrame.width, this.lastFrame.height)
        }
      }
      next()
    } else {
      next(new Error('data passed in is not buffer.'))
    }
  }
}
