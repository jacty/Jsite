import {
  Placement,
  NoFlags,
  HostRoot
} from '@Jeact/shared/Constants';

const randomKey = Math.random().toString(36).slice(2);
const interalInstanceKey = '__jeactFiber$' + randomKey;
const internalPropsKey = '__jeactProps$' + randomKey;
const internalEventHandlersKey = '__jeactEvents' + randomKey;

export function detachDeletedInstance(node){
    delete node[interalInstanceKey];
    delete node[internalPropsKey];
    delete node[internalEventHandlersKey];
}

export function precacheFiberNode(hostInst, node){
    node[interalInstanceKey] = hostInst;
}

export function getClosestFiberFromNode(targetNode){
    let targetFiber = targetNode[interalInstanceKey];
    if (targetFiber){
        return targetFiber;
    }
    console.error('Failed to find targetFiber');
}

export function getNearestMountedFiber(fiber){
  let node = fiber;
  let nearestMounted = fiber;
  if (!fiber.alternate){
      // a new tree hasn't inserted
      let nextNode = node;
      do {
        node = nextNode;
        if((node.flags & Placement) !== NoFlags){
          nearestMounted = node.return;
        }
        nextNode = node.return;
      } while(nextNode)
  } else {
    while (node.return){
      node = node.return;
    }
  }
  if (node.tag === HostRoot){
    return nearestMounted;
  }
  // Probably hit a unmounted tree.
  return null;
}

export function getPropsFromFiber(stateNode){
    return stateNode[internalPropsKey] || null;
}

export function getFiberCurPropsFromNode(node){
  return node[internalPropsKey] || null;
}

export function updateFiberProps(node, props){
    node[internalPropsKey] = props;
}

export function getEventListenerSet(node){
  let elementListenerSet = node[internalEventHandlersKey];
  if (!elementListenerSet){
    elementListenerSet = node[internalEventHandlersKey] = new Set();
  }
  return elementListenerSet;
}
