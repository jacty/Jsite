import {
  EventLane, 
  DefaultLane
} from '@Jeact/shared/Constants';

export function addEventBubbleListener(
  target,
  eventType,
  listener
){
  target.addEventListener(eventType, listener, false);
}

export function createEventListener(target, domEventName){
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
    target
  )
}

function dispatchDiscreteEvent(domEventName, target, nativeEvent){
  console.error('dispatchDiscreteEvent', domEventName,target,nativeEvent)
}

function dispatchEvent(domEventName, target, nativeEvent){
  console.error('dispatchEvent', domEventName, target, nativeEvent)
}

function getEventPriority(domEventName){
  switch (domEventName){
    case 'click':
      return EventLane;
    default:
      return DefaultLane;
  }
}