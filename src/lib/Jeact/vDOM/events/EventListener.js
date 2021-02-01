import {getClosestFiberFromNode, 
        getPropsFromFiber} from '@Jeact/vDOM/DOMComponentTree';
import {dispatchEvents} from '@Jeact/vDOM/events/EventSystem';
import {batchedEventUpdates} from '@Jeact/vDOM/events/UpdateBatching';

export function listenToNativeEvent(domEventName, container){
    const listener = dispatchEvent.bind(null,domEventName, container);
    container.addEventListener(domEventName,listener)
}

export function dispatchEvent(domEventName, container, nativeEvent){
    const blockedOn = attemptToDispatchEvent(domEventName,container,nativeEvent)
    if(!!blockedOn){
        console.error('dispatchEvent')
    }
}
// Attempt dispatching an event. Returns a SuspenseInstance or Container if it's blocked.
export function attemptToDispatchEvent(domEventName,container,nativeEvent){
    const nativeEventTarget = nativeEvent.target;
    // Pair: getClosestInstanceFromNode()
    let targetFiber = getClosestFiberFromNode(nativeEventTarget);
      
    batchedEventUpdates(()=>
        dispatchEvents(domEventName,container,targetFiber)
    );
    return null;
}

export function getListener(fiber, domEventName){
    const stateNode = fiber.stateNode;
    //Pair: getFiberCurrentPropsFromNode()
    const props = getPropsFromFiber(stateNode);
    domEventName = 'on' + domEventName[0].toUpperCase() + domEventName.slice(1);
    const listener = props[domEventName]

    return listener;
}