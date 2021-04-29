function createSyntheticEvent(Interface){
  function SyntheticBaseEvent(
    vName,
    domEventName,
    targetInst,
    nativeEvent
  ){
    this._vName = vName;
    this._targetInst = targetInst;
    this.type = domEventName;
    this.nativeEvent = nativeEvent;
    this.curTarget = null;
  }

  return SyntheticBaseEvent;
}
const EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: (event) => (event.timeStamp || Date.now()),
  defaultPrevented: 0,
  isTrusted:0,
};
export const SyntheticEvent = createSyntheticEvent(EventInterface);

const MouseEventInterface = {
}

export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);