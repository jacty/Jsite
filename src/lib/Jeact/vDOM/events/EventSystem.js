import {allNativeEvents} from '@Jeact/vDOM/events/EventRegistry';
import {createEventListenerWrapper} from '@Jeact/vDOM/events/EventListener';

const listeningMarker = '_jeactListening' + 
                        Math.random().toString(36).slice(2);

function listenToNativeEvent(domEventName){
   addTrappedEventListener(domEventName); 
}

export function listenToAllSupportedEvents(container){
  if (!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      listenToNativeEvent(domEventName);
    });
  }
}

function addTrappedEventListener(domEventName){
    const listener = createEventListenerWrapper(domEventName);
}

