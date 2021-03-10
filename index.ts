import { pipeline } from 'stream'
import * as robot from 'robotjs'

import { GStreamer } from './streamer'
import { RTCVideoStream } from './video'
import { Transmitter } from './transmitter'

const streamer = new GStreamer()

const screenSize = robot.getScreenSize()

const transmitter = new Transmitter()

const videoSink = new RTCVideoStream(
  screenSize.width,
  screenSize.height,
  transmitter
)

pipeline(
  streamer.video(),
  videoSink,
  () => {

  }
)
