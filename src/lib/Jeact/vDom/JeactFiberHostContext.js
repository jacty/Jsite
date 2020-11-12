import {createCursor, push, pop} from './JeactFiberStack';
import {
  getChildNamespace
} from './DOMNamespaces';
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

export function pushHostContainer(fiber, nextRootInstance){
  // Push current root instance onto the stack;
  // This allows us to reset root when portals are popped.
  push(rootInstanceStackCursor, nextRootInstance);

  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber);

  // Finally, we need to push the host context to the stack.
  // However, we can't just call getRootHostContext() and push it because
  // we'd have a different number of entries on the stack depending on
  // whether getRootHostContext() throws somewhere in renderer code or not.
  // So we push an empty value first. This lets us safely unwind on errors.
  push(contextStackCursor, NO_CONTEXT);
  const nextRootContext = getRootHostContext(nextRootInstance);

  // Now that we know this function doesn't throw, replace it.
  pop(contextStackCursor);
  push(contextStackCursor, nextRootContext);
}

export function popHostContainer(fiber){
  pop(contextStackCursor, fiber);
  pop(contextFiberStackCursor, fiber);
  pop(rootInstanceStackCursor, fiber);
}
