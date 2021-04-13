import {
  getClosestFiberFromNode,
  getPropsFromFiber,
} from '@Jeact/vDOM/DOMComponentTree';

const listeningMarker = '_jeactListening' + 
                        Math.random().toString(36).slice(2);

function dispatchEvent(domEventName, container, nativeEvent){
  const nativeEventTarget = nativeEvent.target;
  let targetFiber = getClosestFiberFromNode(nativeEventTarget);
  const listener = getListener(targetFiber, domEventName);
  if (!!listener){
    return listener();
  }
}

export function listenToAllSupportedEvents(container){
  const listener = dispatchEvent.bind(null, 'click', container);
  container.addEventListener('click', listener);
}

function getListener(fiber, domEventName){
  const stateNode = fiber.stateNode;
  // getFiberCurrentPropsFromNode()
  const props = getPropsFromFiber(stateNode);
  domEventName = 'on' + domEventName[0].toUpperCase() + domEventName.slice(1);
  const listener = props[domEventName];
  return listener;
}

