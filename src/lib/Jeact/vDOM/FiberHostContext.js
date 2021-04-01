import {createCursor, push, pop} from '@Jeact/vDOM/FiberStack';
import {
  getChildNamespace
} from '@Jeact/vDOM/DOMNamespaces';
const NO_CONTEXT = {};
const contextFiberStackCursor = createCursor(NO_CONTEXT);
const rootInstanceStackCursor = createCursor(NO_CONTEXT);

function requiredContext(cur){
  if(cur===NO_CONTEXT){
    console.error('Host context is missing!')
  };
  return cur;
}

export function getRootHostContainer(){
  const rootInstance = requiredContext(rootInstanceStackCursor.current);
  return rootInstance;
}

export function pushHostContainer(fiber){
  push(rootInstanceStackCursor,  fiber.stateNode.containerInfo, fiber);
  push(contextFiberStackCursor, fiber, fiber);
}

export function popHostContainer(fiber){
    pop(contextFiberStackCursor, fiber);
    pop(rootInstanceStackCursor, fiber);
}

export function pushHostContext(fiber){
    push(contextFiberStackCursor, fiber, fiber);
}

export function popHostContext(fiber){
  if(contextFiberStackCursor.current !== fiber){
    return;
  }
  pop(contextFiberStackCursor, fiber);
}

function getChildHostContext(
    parentHostContext,
    type,
    rootContainerInstance
){
    const parentNamespace = parentHostContext;
    return getChildNamespace(parentNamespace);
}