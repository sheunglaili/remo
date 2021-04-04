type BaseEvent<T, P> = {
    type: T
    payload: P
}

type MouseButton = 'left' | 'right'

type MouseMoveEvent = BaseEvent<'mouse-move', {
    x: number,
    y: number
}>

type MouseClickEvent = BaseEvent<'mouse-click', {
    button: MouseButton
}>

type MouseDoubleClickEvent = BaseEvent<'mouse-double-click', {
    button: MouseButton
}>

type MousePressedEvent = BaseEvent<'mouse-pressed', {
  button: MouseButton
}>

type MouseReleasedEvent = BaseEvent<'mouse-released', {
  button: MouseButton
}>

type KeydownEvent = BaseEvent<'keydown', {
    key: string,
    modifiers: ('ctrl' | 'command' | 'shift' | 'alt')[]
}>

type ScrollEvent = BaseEvent<'scroll', {
  x: number,
  y: number
}>

export const isOfType = <T>(
  varToBeChecked: any,
  propertyToCheckFor: keyof T,
  expectedValue: any
): varToBeChecked is T =>
    (varToBeChecked as T)[propertyToCheckFor] === expectedValue

export function isMouseMoveEvent (event: any): event is MouseMoveEvent {
  return isOfType<MouseMoveEvent>(event, 'type', 'mouse-move')
}

export function isMouseClickEvent (event: any): event is MouseClickEvent {
  return isOfType<MouseClickEvent>(event, 'type', 'mouse-click')
}

export function isMouseDoubleClickEvent (event: any): event is MouseDoubleClickEvent {
  return isOfType<MouseDoubleClickEvent>(event, 'type', 'mouse-double-click')
}

export function isMousePressEvent (event: any): event is MousePressedEvent {
  return isOfType<MousePressedEvent>(event, 'type', 'mouse-down')
}

export function isMouseReleaseEvent (event: any): event is MouseReleasedEvent {
  return isOfType<MouseReleasedEvent>(event, 'type', 'mouse-up')
}

export function isKeyDownEvent (event: any): event is KeydownEvent {
  return isOfType<KeydownEvent>(event, 'type', 'keydown')
}

export function isScrollEvent (event: any): event is ScrollEvent {
  return isOfType<ScrollEvent>(event, 'type', 'scroll')
}
