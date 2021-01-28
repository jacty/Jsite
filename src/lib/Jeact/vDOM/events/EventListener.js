import {getClosestFiberFromNode} from '@Jeact/vDOM/DOMComponentTree';

export function dispatchEvent(domEventName, targetContainer, nativeEvent){
    const nativeEventTarget = nativeEvent.target;
    let targetFiber = getClosestFiberFromNode(nativeEventTarget);

    console.error('dispatchEvent', closestMounted);
}