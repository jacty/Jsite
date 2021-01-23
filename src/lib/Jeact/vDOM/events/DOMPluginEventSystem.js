import { allNativeEvents } from './EventRegistry';

// We should not delegate these events to the container, but rather set them
// on the actual target element itself. This is primarily because these events
// do not consistently bubble in the DOM.
export const nonDelegatedEvents = new Set([
  'load',
  'scroll',
]);

const listeningMarker = '_jeactListening' + Math.random().toString(36).slice(2);

export function listenToAllSupportedEvents(container){
  if (!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      console.log('listenToAllSupportedEvents', domEventName)
    });
  }
}

export function listenToNativeEvent(domEventName, isCapturePhaseListener, target){
  let eventSystemFlags = 0;
  if (isCapturePhaseListener){
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener,
  );
}


