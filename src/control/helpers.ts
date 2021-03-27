type BaseEvent<T, P> = {
    type: T
    payload: P
}
type MouseMoveEvent = BaseEvent<'mouse-move', {
    x: number,
    y: number
}>

type MouseClickEvent = BaseEvent<'mouse-click', {
    button: 'left' | 'right'
}>

type MouseDoubleClickEvent = BaseEvent<'mouse-double-click', {
    button: 'left' | 'right'
}>

type KeydownEvent = BaseEvent<'keydown', {
    key: string,
    modifiers: ('ctrl' | 'command' | 'shift' | 'alt')[]
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

export function isKeyDownEvent (event: any): event is KeydownEvent {
  return isOfType<KeydownEvent>(event, 'type', 'keydown')
}
