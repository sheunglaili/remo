class MouseState {
    isDragging: boolean = false;

    press () {
      this.isDragging = true
    }

    release () {
      this.isDragging = false
    }
}

export default class ControlState {
    mouse: MouseState = new MouseState();
}
