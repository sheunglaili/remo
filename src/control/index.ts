import { RTCDataChannel, RTCDataChannelEvent } from 'wrtc'
import { debounce } from 'lodash'
import * as robot from 'robotjs'

import ControlState from './state'
import { isKeyDownEvent, isMouseClickEvent, isMouseDoubleClickEvent, isMouseMoveEvent, isMousePressEvent, isMouseReleaseEvent, isScrollEvent } from './helpers'

export class ControlManager {
    private screenSize: { width: number, height: number }
    private state: ControlState
    private channels: Map<string, RTCDataChannel>;
    private active: string;
    constructor () {
      this.screenSize = robot.getScreenSize()
      robot.setMouseDelay(0)
      this.channels = new Map()
      this.controlEventHandler = this.controlEventHandler.bind(this)
      this.state = new ControlState()
    }

    // TODO: Do not maintain a pool of channe.
    //       create data channel on demand.
    addCandidate (id: string, dc: RTCDataChannel) {
      if (!this.active) {
        this.active = id
        this.registerHandler(dc)
      }
      this.channels.set(id, dc)
    }

    private registerHandler (dc: RTCDataChannel) {
      dc.addEventListener('message', debounce(this.controlEventHandler, 10, { leading: true, trailing: true }))
    }

    private controlEventHandler ({ data }: RTCDataChannelEvent) {
      const event = JSON.parse(data)

      try {
        if (isMouseMoveEvent(event)) {
          const { payload } = event
          const { x, y } = robot.getMousePos()
          const newX = payload.x * this.screenSize.width + x
          const newY = payload.y * this.screenSize.height + y

          if (this.state.mouse.isDragging) {
            robot.dragMouse(
              newX,
              newY
            )
          } else {
            robot.moveMouse(
              newX,
              newY
            )
          }
        }

        if (isMouseClickEvent(event)) {
          const { payload } = event
          console.log(payload)
          robot.mouseClick(payload.button, false)
        }

        if (isMouseDoubleClickEvent(event)) {
          const { payload } = event
          console.log('mouse double-click')
          robot.mouseClick(payload.button, true)
        }

        if (isMousePressEvent(event)) {
          robot.mouseToggle('down', event.payload.button)
          this.state.mouse.press()
        }

        if (isMouseReleaseEvent(event)) {
          this.state.mouse.release()
          robot.mouseToggle('up', event.payload.button)
        }

        if (isKeyDownEvent(event)) {
          const { payload } = event

          robot.keyTap(
            payload.key,
            payload.modifiers
          )
        }

        if (isScrollEvent(event)) {
          const { payload } = event

          robot.scrollMouse(
            payload.x,
            payload.y
          )
        }
      } catch (err) {
        console.error('control error', err)
        console.log(event)
      }
    }
}
