import {allNativeEvents} from '@Jeact/vDOM/events/EventRegistry';
import {getEventListenerSet} from '@Jeact/vDOM/DOMComponentTree';
import {dispatchEvent} from '@Jeact/vDOM/events/EventListener';

const listeningMarker = '_jeactListening' + Math.random().toString(36).slice(2);

export function listenToNonDelegatedEvent(domEventName, targetElement){
  let listener = dispatchEvent.bind(null, domEventName, targetElement);
  targetElement.addEventListener(domEventName,listener,false);
}

export function listenToAllSupportedEvents(container){
  if (!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      console.log('listenToAllSupportedEvents', domEventName)
    });
  }
}




