import { spawn } from 'child_process'
import { createSocket, Socket } from 'dgram'
import { AddressInfo } from 'net'
import * as net from 'net'
import { platform } from 'os'
import { Readable } from 'stream'
// @ts-ignore
import gstreamer from 'gstreamer-superficial'
import { FPSCounter } from '../utils/fps'
export class UDPReadStream extends Readable {
  private udpSocket: Socket
  private shouldPush: boolean
  constructor (onBind: (addr: AddressInfo) => void) {
    super()
    this.shouldPush = false
    this.udpSocket = createSocket('udp4')
    this.udpSocket.on('message', (message: Buffer) => {
      if (this.shouldPush) {
        const shouldContinue = this.push(message)
        if (!shouldContinue) {
          this.shouldPush = false
        }
      }
    })
    this.udpSocket.on('error', (err: Error) => {
      this.destroy(err)
    })
    this.udpSocket.bind(0, () => {
      onBind(this.udpSocket.address())
    })
  }

  _read () {
    this.shouldPush = true
  }

  _destroy () {
    this.udpSocket.close()
  }
}

export class TCPReadStream extends Readable {
  private tcpServer: net.Server
  private shouldPush: boolean
  constructor (onBind: (addr: AddressInfo) => void) {
    super()
    this.shouldPush = false
    let chunkCount = 0
    const fps = new FPSCounter('tcp fps: ')
    this.tcpServer = net.createServer((socket: net.Socket) => {
      socket.on('data', (data: Buffer) => {
        chunkCount += data.length
        if (chunkCount >= 1440 * 900 * 1.5) {
          fps.plusOne()
          chunkCount = 0
        }
        if (this.shouldPush) {
          const shouldContinue = this.push(data)
          if (!shouldContinue) {
            this.shouldPush = false
          }
        }
      })

      socket.on('error', (err: Error) => {
        this.destroy(err)
      })
    })

    this.tcpServer.listen(0, '127.0.0.1', () => {
      const addr = this.tcpServer.address()
      console.log(addr)
      if (typeof addr === 'string') {
        console.log(addr)
        return
      }
      onBind(addr)
    })
  }

  _read () {
    this.shouldPush = true
  }

  _destroy (err: Error) {
    console.error('destroyed with error', err)
    this.tcpServer.close()
  }
}

class AppSinkReadStream extends Readable {
  private appsink: any
  private fpsCounter: FPSCounter;
  private chunkCount = 0
  private shouldPush = true;
  constructor (private width: number, private height: number) {
    super()
    // eslint-disable-next-line no-new
    const pipeline = new gstreamer.Pipeline(this._getPipeline().join(' '))
    this.appsink = pipeline.findChild('sink')
    this.fpsCounter = new FPSCounter('app sink fps: ')

    pipeline.play()
  }

  _getPipeline () {
    const os = platform()
    if (os === 'darwin') {
      return [
        'avfvideosrc',
        'capture-screen=true',
        'capture-screen-cursor=true',
        '!',
        'video/x-raw,format=BGRA',
        '!',
        'glupload',
        '!',
        'glcolorconvert',
        '!',
        'glcolorscale',
        '!',
        'glcolorconvert',
        '!',
        'gldownload',
        '!',
        `video/x-raw,height=${this.height},width=${this.width},format=I420,framerate=30/1`,
        '!',
        'appsink',
        'name=sink',
        'sync=false'
      ]
    }

    if (os === 'linux') {
      return [
        'ximagesrc',
        'use-damage=0',
        '!',
        'glupload',
        '!',
        'glcolorconvert',
        '!',
        'glcolorscale',
        '!',
        'glcolorconvert',
        '!',
        'gldownload',
        '!',
        'video/x-raw,format=I420,framerate=30/1',
        '!',
        'appsink',
        'name=sink',
        'sync=false'
      ]
    }

    if (os === 'win32') {
      return [
        'dxgiscreencapsrc',
        'cursor=true',
          `width=${this.width}`,
          `height=${this.height}`,
          'x=0',
          'y=0',
          '!',
          'glupload',
          '!',
          'glcolorconvert',
          '!',
          'glcolorscale',
          '!',
          'glcolorconvert',
          '!',
          'gldownload',
          '!',
          'video/x-raw,format=I420,framerate=60/1',
          '!',
          'appsink',
          'name=sink',
          'sync=false'
      ]
    }

    throw new Error(`Unsupported OS: ${os}`)
  }

  _calculateFPS = (buf: Buffer) => {
    this.chunkCount += buf.length
    if (this.chunkCount >= this.width * this.height * 1.5) {
      this.fpsCounter.plusOne()
      this.chunkCount = 0
    }
  }

  _pull = (buffer: Buffer) => {
    if (buffer && this.shouldPush) {
      this.shouldPush = this.push(buffer)
      this._calculateFPS(buffer)
      this.appsink.pull(this._pull)
    }
  }

  _read = () => {
    this.shouldPush = true
    this.appsink.pull(this._pull)
  }
}

export class GStreamer {
  recordVideo (dest: AddressInfo, width: number, height: number) {
    const os = platform()
    if (os === 'darwin') {
      const proc = spawn(
        'gst-launch-1.0',
        [
          'avfvideosrc',
          'capture-screen=true',
          'capture-screen-cursor=true',
          '!',
          'video/x-raw,format=BGRA',
          '!',
          'glupload',
          '!',
          'glcolorconvert',
          '!',
          'glcolorscale',
          '!',
          'glcolorconvert',
          '!',
          'gldownload',
          '!',
          'video/x-raw,format=I420,framerate=30/1',
          '!',
          'tcpclientsink',
          `host=${dest.address}`,
          `port=${dest.port}`,
          'sync=false'
        ],
        { stdio: 'pipe' }
      )
      proc.stderr.on('data', (data) => {
        console.log(Buffer.from(data).toString('utf-8'))
      })
      proc.stdout.on('data', (data) => {
        console.log(Buffer.from(data).toString('utf-8'))
      })
      return proc.stdout
    } else if (os === 'linux') {
      const proc = spawn(
        'gst-launch-1.0',
        [
          '-q',
          'ximagesrc',
          'use-damage=0',
          '!',
          'glupload',
          '!',
          'glcolorconvert',
          '!',
          'glcolorscale',
          '!',
          'glcolorconvert',
          '!',
          'gldownload',
          '!',
          'video/x-raw,format=I420,framerate=30/1',
          '!',
          'tcpclientsink',
          `host=${dest.address}`,
          `port=${dest.port}`,
          'sync=false'
        ],
        { stdio: 'pipe' }
      )
      proc.stderr.on('data', (data) => {
        console.log(Buffer.from(data).toString('utf-8'))
      })
      proc.stdout.on('data', (data) => {
        console.log(Buffer.from(data).toString('utf-8'))
      })
      return proc.stdout
    } else if (os === 'win32') {
      const proc = spawn(
        'gst-launch-1.0',
        [
          '-q',
          'dxgiscreencapsrc',
          'cursor=true',
          `width=${width}`,
          `height=${height}`,
          'x=0',
          'y=0',
          '!',
          'glupload',
          '!',
          'glcolorconvert',
          '!',
          'glcolorscale',
          '!',
          'glcolorconvert',
          '!',
          'gldownload',
          '!',
          'video/x-raw,format=I420,framerate=60/1',
          '!',
          'tcpclientsink',
          `host=${dest.address}`,
          `port=${dest.port}`,
          'sync=false'
        ],
        { stdio: 'pipe' }
      )
      proc.stderr.on('data', (data) => {
        console.log(Buffer.from(data).toString('utf-8'))
      })
      proc.stdout.on('data', (data) => {
        console.log(Buffer.from(data).toString('utf-8'))
      })
      return proc.stdout
    } else {
      throw new Error(`unsupported OS: ${os}`)
    }
  }

  video (width: number, height: number): Readable {
    return new AppSinkReadStream(width, height)
  }

  audio () {

  }
}
