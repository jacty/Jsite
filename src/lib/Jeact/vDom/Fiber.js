import {
  StaticMask,
  HostRoot,
  IndeterminateComponent,
  HostComponent,
} from '@Jeact/shared/Constants';

let debugCounter = 1;

function FiberNode(tag, pendingProps, key, mode){
  /* Instance */
  this.tag = tag;// Decides which kind of component the fiber is, e.g.
                 // HostRoot, Unknown Component, Function Component etc.
  this.key = key; // {key} attribute in lists' items
  this.elementType = null;
  this.type = null;
  this.stateNode = null; // refer to FiberRootNode

  // Fiber
  this.return = null; // refer to parent
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null; // As baseState in update queue.
  this.dependencies = null;

  // Effects
  this.flags = 0;
  this.subtreeFlags = 0;
  this.deletions = null;

  this.lanes = 0;
  this.childLanes = 0;

  this.alternate = null; // Kind of back up for lanes' operation in case we need to recover it after mistakes.

}

export const createFiber = function(tag, pendingProps=null, key=null){
  return new FiberNode(tag, pendingProps, key);
};

function shouldConstruct(Component){
  const prototype = Component.prototype;
  return !!(prototype && prototype.isJeactComponent);
}

// This is used to create an alternate fiber to do work on.
// Why it is not a completed copy of current?
export function createWorkInProgress(current, pendingProps=null){
  let workInProgress = current.alternate;
  if (workInProgress === null){
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other"
    // unused node that we're free to reuse. This is lazily created rather
    // than totally clone to avoid allocating extra objects for things that are never updated. It also allows us to reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else{
    console.error('createWorkInProgress1')
  }

  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  // Clone the dependencies object. This is mutated during the render phase,
  // so it cannot be shared with the current fiber.
  const currentDependencies = current.dependencies;
  workInProgress.dependencies =
    currentDependencies === null
    ? null
    : console.log('createWorkInProgress2')

  // These will be overridden during the parent's reconciliation
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}

export function createFiberFromTypeAndProps(
  type,
  key,
  pendingProps,
  owner,
  mode,
  lanes
  ){
  let fiberTag = IndeterminateComponent;
  let resolvedType = type;

  if (typeof type === 'function'){
    if(shouldConstruct(type)){
      console.error('createFiberFromTypeAndProps2')
    }
  } else if(typeof type === 'string'){
    fiberTag = HostComponent;
  } else {
    console.error('createFiberFromTypeAndProps1')
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode);

  fiber.elementType = type;
  fiber.type = resolvedType;
  fiber.lanes = lanes;

  return fiber;
}

export function createFiberFromElement(
  element,
  mode,
  lanes
){
  let owner = null;
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    owner,
    mode,
    lanes,
  );
  return fiber;
}
