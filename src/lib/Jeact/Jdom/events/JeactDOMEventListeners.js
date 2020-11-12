import {getEventPriorityForPluginSystem} from './DOMEventProperties.js';
import {
  DiscreteEvent,
  UserBlockingEvent,
  ContinuousEvent
} from '../../shared/Constants';

export function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags){
  const eventPriority = getEventPriorityForPluginSystem(domEventName);
  let listenerWrapper;
  switch(eventPriority){
    case DiscreteEvent:
      listenerWrapper = dispatchDiscreteEvent;
      break;
    case UserBlockingEvent:
      listenerWrapper = dispatchUserBlockingUpdate;
      break;
    case ContinuousEvent:
    default:
      listenerWrapper = dispatchEvent;
      break;
  }
  return listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer,
  );
}
