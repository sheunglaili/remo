import { RTCDataChannel, RTCDataChannelEvent } from 'wrtc'
import { debounce } from 'lodash'
import * as robot from 'robotjs';

export class ControlManager {
    private screenSize: { width: number, height: number }
    private channels: Map<string, RTCDataChannel>;
    private active: string;
    constructor() {
        this.screenSize = robot.getScreenSize()
        robot.setMouseDelay(0);
        this.channels = new Map();
        this.controlEventHandler = this.controlEventHandler.bind(this)
    }

    addCandidate(id: string ,dc: RTCDataChannel) {
        if(!this.active) {
            this.active = id
            this.registerHandler(dc)
        }
        this.channels.set(id,dc)
    }

    private registerHandler(dc: RTCDataChannel) {
        dc.addEventListener('message', debounce(this.controlEventHandler), 10, { leading: true, trailing: true })
    }

    private controlEventHandler({ data }: RTCDataChannelEvent) {
        const { type, payload } = JSON.parse(data)
        if (type === 'mouse-move') {
            robot.moveMouse(
                payload.y * this.screenSize.height,
                payload.x * this.screenSize.width
            )
        }
    }
}