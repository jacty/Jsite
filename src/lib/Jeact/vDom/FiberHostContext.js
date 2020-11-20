import {
  __ENV__
} from '@Jeact/shared/Constants';
import {createCursor, push, pop} from '@Jeact/vDOM/FiberStack';
import {
  getChildNamespace
} from '@Jeact/vDOM/DOMNamespaces';
const NO_CONTEXT = {};
const contextStackCursor = createCursor(NO_CONTEXT);
const contextFiberStackCursor = createCursor(NO_CONTEXT);
const rootInstanceStackCursor = createCursor(NO_CONTEXT);

export function getRootHostContext(rootContainerInstance){
  let type;
  let namespace;
  const nodeType = rootContainerInstance.nodeType;
  switch (nodeType){
    default:{
      nodeType!==1 ? console.log('getRootHostContext1'):'';
      const container = rootContainerInstance;
      const ownNamespace = container.namespaceURI || null;
      type = container.tagName;
      namespace = getChildNamespace(ownNamespace, type);
      break;
    }
  }

  return namespace;
}

export function getChildHostContext(parentHostContext, type, rootContainerInstance){
  const parentNamespace = parentHostContext;
  return getChildNamespace(parentNamespace, type);
}

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

  const nextRootInstance = fiber.stateNode.containerInfo;
  // Push current root instance onto the stack;
  // This allows us to reset root when portals are popped.
  push(rootInstanceStackCursor, nextRootInstance, fiber);

  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber, fiber);

  // Finally, we need to push the host context to the stack.
  // However, we can't just call getRootHostContext() and push it because
  // we'd have a different number of entries on the stack depending on
  // whether getRootHostContext() throws somewhere in renderer code or not.
  // So we push an empty value first. This lets us safely unwind on errors.
  push(contextStackCursor, NO_CONTEXT, fiber);
  const nextRootContext = getRootHostContext(nextRootInstance);

  // Now that we know this function doesn't throw, replace it.
  pop(contextStackCursor, fiber);
  push(contextStackCursor, nextRootContext, fiber);
}

export function popHostContainer(fiber){
  pop(contextStackCursor, fiber);
  pop(contextFiberStackCursor, fiber);
  pop(rootInstanceStackCursor, fiber);
}

export function pushHostContext(fiber){
  const rootInstance = requiredContext(
    rootInstanceStackCursor.current,
  );
  const context = requiredContext(contextStackCursor.current);
  const nextContext = getChildHostContext(context, fiber.type, rootInstance);
  if (context === nextContext){
    return;
  }
  console.error('pushHostContext1')
}