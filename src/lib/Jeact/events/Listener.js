import {
  EventLane, 
  DefaultLane,
  SuspenseComponent,
} from '@Jeact/shared/Constants';
import { 
  getClosestFiberFromNode,
  getFiberCurPropsFromNode
} from '@Jeact/vDOM/DOMComponentTree';
import {dispatchEventsFromSystem} from '@Jeact/events/';
import {batchedEventUpdates} from '@Jeact/vDOM/FiberWorkLoop';
import {discreteUpdates} from '@Jeact/vDOM/DOMUpdateBatching';

export function addListener(
  target,
  eventType,
  listener,
  isCapture
){
  target.addEventListener(eventType, listener, isCapture);
}

export function createEventListener(target, domEventName, eventSystemFlags){
  const eventPriority = getEventPriority(domEventName);

  let listenerWrapper;
  switch (eventPriority){
    case EventLane:
      listenerWrapper = dispatchDiscreteEvent;
      break;
    case DefaultLane:
    default:
      listenerWrapper = dispatchEvent
  }

  return listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    target
  )
}

function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  target, 
  nativeEvent, 
){
  discreteUpdates(
    dispatchEvent,
    domEventName,
    eventSystemFlags,
    target,
    nativeEvent
  )
}

function dispatchEvent(domEventName, eventSystemFlags, target, nativeEvent){
  const nativeEventTarget = nativeEvent.target;
  let targetInst = getClosestFiberFromNode(nativeEventTarget);
  
  batchedEventUpdates(()=>
    dispatchEventsFromSystem(
      domEventName,
      nativeEvent,
      targetInst,
      target,
      eventSystemFlags
    )
  );
  // nothing blocked
  return null;
}

function getEventPriority(domEventName){
  switch (domEventName){
    case 'click':
      return EventLane;
    default:
      return DefaultLane;
  }
}

export function getListener(inst, registrationName){
  const stateNode = inst.stateNode;
  if (!stateNode){
    return null;
  }
  const props = getFiberCurPropsFromNode(stateNode);
  if (!props){
    return null;
  }
  const listener = props[registrationName];

  return listener;
}