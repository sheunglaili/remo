import { pipeline } from 'stream'
import * as robot from 'robotjs'

import { GStreamer } from './streamer'
import { RTCVideoStream } from './video'
import { Transmitter } from './transmitter'

class MediaModule {
  streamer: GStreamer
  video: RTCVideoStream
  transmitter: Transmitter

  constructor () {
    this.streamer = new GStreamer()
    this.transmitter = new Transmitter()

    const { width, height } = robot.getScreenSize()

    this.video = new RTCVideoStream(
      width,
      height,
      this.transmitter
    )
  }

  start () {
    pipeline(
      this.streamer.video(),
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
