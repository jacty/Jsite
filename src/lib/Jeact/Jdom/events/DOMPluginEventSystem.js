// import { allNativeEvents } from './EventRegistry';
// import { __ENV__ } from '../../shared/Constants';
// import {
//   createEventListenerWrapperWithPriority
// } from './JeactDOMEventListeners';
// import { addEventBubbleListener } from './EventListener';

// List of events that need to be individually attached to media elements.
export const mediaEventTypes = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
];

// We should not delegate these events to the container, but rather set them
//on the actual target element itself. This is primarily because these events
// do not consistently buble in the DOM.
export const nonDelegatedEvents = new Set([
  'cancel',
  'close',
  'invalid',
  'load',
  'scroll',
  'toggle',
  // In order to reduce bytes, we insert the above array of media events into
  // this Set. Note: the "error" event isn't an exclusive media event, and can
  // occur on other elements too. Rather than duplicate that event, we just
  // take it from the media events array.
  ...mediaEventTypes,
]);

const listeningMarker = '_jeactListening' + Math.random().toString(36).slice(2);

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

export function listenToAllSupportedEvents(container){

  if (!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      console.log('listenToAllSupportedEvents')
    });
    const ownerDocument = container.ownerDocument;
    if (ownerDocument !== null){
      // The selectionchange event also needs deduplication but it is attached
      // to the document.
      if (!ownerDocument[listeningMarker]){
        ownerDocument[listeningMarker] = true;
        listenToNativeEvent('selectionchange', false, ownerDocument)
      }
    }
  }
}

function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener, isDefferedListenerForLegacyFBSupport){
  let listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags,
  );
  let isPassiveListener = undefined;
  // Chrome introduced an intervention, making these events passive by default on document. So we emulate the existing behavior manually on the roots now.
  // https://github.com/facebook/react/issues/19651
  if(
    domEventName === 'touchstart' ||
    domEventName === 'touchmove' ||
    domEventName === 'wheel'
  ){
    console.log('addTrappedEventListener', domEventName)
  }

  let unsubscribeListener;
  // TODO: There are too many combinations here. Consolidate them.
  if (isCapturePhaseListener){
    console.log('addTrappedEventListener');
  } else {
    if (isPassiveListener!== undefined){
      console.log('addTrappedEventListener')
    } else {
      unsubscribeListener = addEventBubbleListener(
        targetContainer,
        domEventName,
        listener,
      );
    }
  }
}
