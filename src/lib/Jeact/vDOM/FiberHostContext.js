import {createCursor, push, pop} from '@Jeact/vDOM/FiberStack';
const NO_CONTEXT = {};
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
}

export function popHostContainer(fiber){
    pop(rootInstanceStackCursor, fiber);
}


