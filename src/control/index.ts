import { RTCDataChannel, RTCDataChannelEvent } from 'wrtc'
import { debounce } from 'lodash'
import * as robot from 'robotjs'
import { isKeyDownEvent, isMouseClickEvent, isMouseDoubleClickEvent, isMouseMoveEvent } from './helpers'

export class ControlManager {
    private screenSize: { width: number, height: number }
    private channels: Map<string, RTCDataChannel>;
    private active: string;
    constructor () {
      this.screenSize = robot.getScreenSize()
      robot.setMouseDelay(0)
      this.channels = new Map()
      this.controlEventHandler = this.controlEventHandler.bind(this)
    }

    addCandidate (id: string, dc: RTCDataChannel) {
      if (!this.active) {
        this.active = id
        this.registerHandler(dc)
      }
      this.channels.set(id, dc)
    }

    private registerHandler (dc: RTCDataChannel) {
      dc.addEventListener('message', debounce(this.controlEventHandler), 10, { leading: true, trailing: true })
    }

    private controlEventHandler ({ data }: RTCDataChannelEvent) {
      const event = JSON.parse(data)

      try {
        if (isMouseMoveEvent(event)) {
          const { payload } = event
          robot.moveMouse(
            payload.y * this.screenSize.height,
            payload.x * this.screenSize.width
          )
        }

        if (isMouseClickEvent(event)) {
          const { payload } = event
          console.log(payload)
          robot.mouseClick(payload.button, true)
        }

        if (isMouseDoubleClickEvent(event)) {
          const { payload } = event
          console.log('mouse double-click')
          robot.mouseClick(payload.button, true)
        }

        if (isKeyDownEvent(event)) {
          const { payload } = event

          robot.keyTap(
            payload.key,
            payload.modifiers
          )
        }
      } catch (err) {
        console.error('control error', err)
        console.log(event)
      }
    }
}
