import { nonstandard, MediaStream } from 'wrtc'

export class Transmitter {
  private videoSource: nonstandard.RTCVideoSource;
  private audioSource: nonstandard.RTCAudioSource;
  private stream: MediaStream

  constructor () {
    this.videoSource = new nonstandard.RTCVideoSource()
    this.audioSource = new nonstandard.RTCAudioSource()
    this.stream = new MediaStream([
      this.videoSource.createTrack(),
      this.audioSource.createTrack()
    ])
  }

  transmitVideo (frame: ImageData) {
    this.videoSource.onFrame(frame)
  }

  transmitAudio () {

  }

  getStream () {
    return this.stream
  }
}
