const randomKey = Math.random().toString(36).slice(2);
const interalInstanceKey = '__jeactFiber$' + randomKey;
const internalPropsKey = '__jeactProps$' + randomKey;
const internalEventHandlersKey = '__jeactEvents$' + randomKey;

export function precacheFiberNode(hostInst, node){
    node[interalInstanceKey] = hostInst;
}

export function getClosestFiberFromNode(targetNode){
    let targetFiber = targetNode[interalInstanceKey];
    if (targetFiber){
        return targetFiber;
    }
    console.error('getClosestFiberFromNode', targetFiber)
}

export function updateFiberProps(node, props){
    node[internalPropsKey] = props;
}

export function getEventListenerSet(node){
    let elementListenerSet = node[internalEventHandlersKey];
    if (elementListenerSet === undefined){
        elementListenerSet = node[internalEventHandlersKey] = new Set();
    }
    return elementListenerSet;
}