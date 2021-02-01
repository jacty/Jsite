import {allNativeEvents} from '@Jeact/vDOM/events/EventRegistry';

const listeningMarker = '_jeactListening' + Math.random().toString(36).slice(2);

export function listenToAllSupportedEvents(container){
  if (!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      console.log('listenToAllSupportedEvents', domEventName)
    });
  }
}




