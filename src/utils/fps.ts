import { performance } from 'perf_hooks'

export class FPSCounter {
    private count;
    private timer;
    private startFrameTime = 0;
    private frameElapsed = [];
    constructor (private namespace: string = 'fps') {
      this.count = 0
    }

    plusOne () {
      this.count++
      const now = performance.now()
      const elapsed = now - this.startFrameTime
      this.startFrameTime = now
      this.frameElapsed.push(elapsed)
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.log()
        }, 1000)
      }
    }

    log () {
      console.log(`${this.namespace}: `, this.count)
      console.log('frame elapsed time ', this.frameElapsed.reduce((a, b) => a + b, 0) / this.frameElapsed.length)
      this.frameElapsed = []
      this.count = 0
    }
}
