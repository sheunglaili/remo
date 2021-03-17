
export class FPSCounter {
    private count;
    private timer;
    constructor (private namespace: string = 'fps') {
      this.count = 0
    }

    plusOne () {
      this.count++
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.log()
        }, 1000)
      }
    }

    log () {
      console.log(`${this.namespace}: `, this.count)
      this.count = 0
    }
}
