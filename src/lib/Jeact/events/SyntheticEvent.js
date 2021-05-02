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

const EventInterface = {};
export const SyntheticEvent = createSyntheticEvent(EventInterface);

const MouseEventInterface = {}
export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);