import {allNativeEvents} from '@Jeact/events/Registry';
import {
  createEventListener,
  addEventBubbleListener
} from '@Jeact/events/Listener';

const listeningMarker = '_jeactListening' 
          + Math.random().toString(36).slice(2);

export function listenToAllEvents(container){
  if(!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName =>{
      listenToNativeEvent(domEventName, container);
    })
  }
}

function listenToNativeEvent(domEventName, target){
  const listener = createEventListener(
    target,
    domEventName
  );
  addEventBubbleListener(
    target,
    domEventName,
    listener
  )
}

