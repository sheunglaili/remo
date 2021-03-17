import { pipeline } from 'stream'
import * as robot from 'robotjs'

import { GStreamer } from './streamer'
import { RTCVideoStream } from './video'
import { Transmitter } from './transmitter'

class MediaModule {
  streamer: GStreamer
  video: RTCVideoStream
  transmitter: Transmitter

  private screenSize: { width: number, height: number}

  constructor () {
    this.screenSize = robot.getScreenSize()
    console.log(this.screenSize)

    this.streamer = new GStreamer()
    this.transmitter = new Transmitter()

    this.video = new RTCVideoStream(
      this.screenSize.width,
      this.screenSize.height,
      this.transmitter
    )
  }

  start () {
    pipeline(
      this.streamer.video(
        this.screenSize.width,
        this.screenSize.height
      ),
      this.video,
      (err) => {
        console.error('error while piping video stream', err)
      }
    )
  }

  output (): MediaStream {
    return this.transmitter.getStream()
  }
}

export default MediaModule
