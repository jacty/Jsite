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
}

export function getPropsFromFiber(stateNode){
    return stateNode[internalPropsKey] || null;
}

export function updateFiberProps(node, props){
    node[internalPropsKey] = props;
}

