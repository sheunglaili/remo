import { Writable } from 'stream'
import { Transmitter } from './transmitter'
import { ImageData } from 'canvas'

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
}

export class RTCVideoStream extends Writable {
  public lastFrame: Frame;
  constructor (private width: number, private height: number, private trasmitter: Transmitter) {
    super()
    this.lastFrame = new Frame(this.width, this.height)
  }

  nextFrame () {
    this.lastFrame = new Frame(this.width, this.height)
  }

  _write (chunk: any, encoding: string, next: (error?: Error | null) => void) {
    if (encoding === 'buffer') {
      const buffer = <Buffer>chunk
      buffer.forEach((byte) => {
        this.lastFrame.addByte(byte)
        if (this.lastFrame.isComplete()) {
          this.trasmitter.transmitVideo(this.lastFrame)
          this.nextFrame()
        }
      })
      next()
    } else {
      next(new Error('data passed in is not buffer.'))
    }
  }
}
