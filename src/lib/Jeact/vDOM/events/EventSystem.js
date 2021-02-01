import {allNativeEvents} from '@Jeact/vDOM/events/EventRegistry';
import {listenToNativeEvent,
        getListener,
      } from '@Jeact/vDOM/events/EventListener';

const listeningMarker = '_jeactListening' + 
                        Math.random().toString(36).slice(2);


//Pair: dispatchEventsForPlugins()
export function dispatchEvents(domEventName, container, targetFiber){
  const dispatchQueue = [];
  const listener = getListener(targetFiber, domEventName);
  return listener();
}

export function listenToAllSupportedEvents(container){
  if (!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      listenToNativeEvent(domEventName, container);
    });
  }
}

