import { spawn } from 'child_process'
import { Readable } from 'node:stream'

export class GStreamer {
  video (): Readable {
    const proc = spawn(
      'gst-launch-1.0',
      [
        '-q',
        'ximagesrc',
        'use-damage=0',
        '!',
        'videoconvert',
        '!',
        'video/x-raw,framerate=30/1,format=I420',
        '!',
        'fdsink',
        'fd=1'
      ],
      { stdio: 'pipe' }
    )
    return proc.stdout
  }

  audio () {

  }
}
