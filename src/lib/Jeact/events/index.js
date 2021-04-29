import {HostComponent} from '@Jeact/shared/Constants';
import {
  allNativeEvents,
  EventMapTovEvent,
} from '@Jeact/events/Registry';
import {
  createEventListener,
  addListener,
  getListener
} from '@Jeact/events/Listener';
import {
  SyntheticEvent,
  SyntheticMouseEvent
} from '@Jeact/events/SyntheticEvent';
import {getEventListenerSet} from '@Jeact/vDOM/DOMComponentTree';

const listeningMarker = '_jeactListening' 
          + Math.random().toString(36).slice(2);

const nonDelegatedEvents = new Set(['error']);
//listenToAllSupportedEvents
export function listenToAllEvents(container){
  if(!container[listeningMarker]){
    container[listeningMarker] = true;
    allNativeEvents.forEach(domEventName =>{
      if(!nonDelegatedEvents.has(domEventName)){
        listenToNativeEvent(domEventName, false, container);
      }
      listenToNativeEvent(domEventName, true, container);
    })
  }
}

function addTrappedEventListener(
  target,
  domEventName,
  eventSystemFlags,
  isCapturePhaseListener
){
  const listener = createEventListener(
    target,
    domEventName,
    eventSystemFlags
  );
  addListener(target, domEventName, listener, isCapturePhaseListener)
}

export const IS_NON_DELEGATED = 1 << 1;
export const IS_CAPTURE_PHASE = 1 << 2;

export function listenToNonDelegatedEvent(domEventName, target){
  const isCapturePhaseListener = false;
  const listenerSet = getEventListenerSet(target);
  const listenerSetKey = getListenerSetKey(
    domEventName, 
    isCapturePhaseListener
  );
  if(!listenerSet.has(listenerSetKey)){
    addTrappedEventListener(
      target,
      domEventName,
      IS_NON_DELEGATED,
      isCapturePhaseListener
    );
    listenerSet.add(listenerSetKey);
  }
}

function getListenerSetKey(domEventName,capture){
  return `${domEventName}__${capture ? 'capture' : 'bubble'}`;
}

function listenToNativeEvent(domEventName, isCapturePhaseListener, target){
  let eventSystemFlags = 0;
  if (isCapturePhaseListener){
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  )
}

function executeDispatch(event, listener, curTarget){
  const type = event.type || 'unknown-event';
  event.curTarget = curTarget;
  listener.apply(event);
  event.curTarget = null;
}

function processDispatchQueueItemsInOrder(
  event,
  dispatchListeners,
  inCapturePhase
){
  if(inCapturePhase){
    console.error('Unimplemented feature')
  } else {
    for (let item of dispatchListeners){
      const {instance, curTarget, listener} = item;
      executeDispatch(event, listener, curTarget);
    }
  }
}

function processDispatchQueue(dispatchQueue, eventSystemFlags){
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  for (let item of dispatchQueue){
    const {event, listeners} = item;
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
  }
}

// dispatchEventsForPlugins()
export function dispatchEventsFromSystem(
  domEventName,
  nativeEvent,
  targetFiber,
  targetContainer,
  eventSystemFlags
){
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,
    targetFiber,
    nativeEvent,
    eventSystemFlags
  )
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}

function createDispatchListener(
  instance,
  listener,
  curTarget
){
  return {
    instance,
    listener,
    curTarget
  }
}

function accumulateSinglePhaseListeners(
  targetFiber,
  vEventName,
  nativeEvent,
  inCapturePhase
){
  const captureName = !!vEventName ? vEventName + 'Capture' : null;
  const eventName = inCapturePhase ? captureName : vEventName;
  let listeners = [];

  let instance = targetFiber;
  let lastHostComponent = null;
  // Accumulate all instance and listeners via the target -> root path.
  while (instance !== null){
    const {stateNode, tag} = instance;
    // Handle listeners on HostComponents
    if (tag === HostComponent && stateNode !== null){
      lastHostComponent = stateNode;
      if (!!eventName){
        const listener = getListener(instance, eventName);
        if (listener){
          listeners.push(
            createDispatchListener(instance, listener, lastHostComponent),
          );
        }
      }
    }
    instance = instance.return;
  }
  return listeners;
}

function extractEvents(
  dispatchQueue,
  domEventName,
  targetFiber,
  nativeEvent,
  eventSystemFlags
){
  const vEventName = EventMapTovEvent.get(domEventName)
  if (!vEventName){
    return;
  }
  let SyntheticEventCtor;
  switch (domEventName){
    case 'click':
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    default:
      SyntheticEventCtor = SyntheticEvent;
  }
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;

  const listeners = accumulateSinglePhaseListeners(
    targetFiber,
    vEventName,
    nativeEvent,
    inCapturePhase
  )

  if(listeners.length > 0){
    const event = new SyntheticEventCtor(
      vEventName,
      domEventName,
      null,
      nativeEvent,
    )
    dispatchQueue.push({event, listeners});
  }
}
