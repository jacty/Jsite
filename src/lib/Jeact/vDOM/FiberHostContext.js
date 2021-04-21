import {createCursor, push, pop} from '@Jeact/vDOM/FiberStack';
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
  push(rootInstanceStackCursor,  fiber.stateNode.containerInfo);
  push(contextFiberStackCursor, fiber);
}

export function popHostContainer(fiber){
    pop(contextFiberStackCursor, fiber);
    pop(rootInstanceStackCursor, fiber);
}

export function pushHostContext(fiber){
    push(contextFiberStackCursor, fiber);
}

export function popHostContext(fiber){
  if(contextFiberStackCursor.current !== fiber){
    return;
  }
  pop(contextFiberStackCursor, fiber);
}

