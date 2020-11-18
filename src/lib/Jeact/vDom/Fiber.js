import {
  __ENV__,
  NoFlags,
  NoLanes,
  // StaticMask,
  HostRoot,
  // IndeterminateComponent,
  // HostComponent,
  // HostText,
} from '@Jeact/shared/Constants';

let debugCounter = 1;

function FiberNode(tag, pendingProps, key, mode){
  /* Instance */
  this.tag = tag; // Decides which kind of component the fiber is
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
  this.flags = NoFlags;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null; 

  if (__ENV__){
    this._debugID = debugCounter++;
    this._debugSource = null;
    this._debugOwner = null;
    this._debugNeedsRemount = false;
    this._debugHookTypes = null;
    Object.preventExtensions(this);
  }

}

export const createFiber = function(tag=HostRoot, pendingProps=null, key=null){
  return new FiberNode(tag, pendingProps, key);
};

function shouldConstruct(Component){
  const prototype = Component.prototype;
  return !!(prototype && prototype.isJeactComponent);
}

// This is used to create an alternate fiber to do work on.
// Why it is not a completed copy of current?
export function createWorkInProgress(current, pendingProps=null){
  console.error('createWorkInProgress');
  return;
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

export function createFiberFromTypeAndProps(element,lanes){
  console.error('createFiberFromTypeAndProps');
  return;
  const type = element.type;
  const pendingProps = element.props;
  const key = element.key;

  let fiberTag;

  if (typeof type === 'function'){
    if(shouldConstruct(type)){
      console.error('createFiberFromTypeAndProps2')
    }
  } else if(typeof type === 'string'){
    fiberTag = HostComponent;
  } else {
    console.error('createFiberFromTypeAndProps1')
  }

  const fiber = createFiber(fiberTag, pendingProps, key);

  fiber.type = type;
  fiber.lanes = lanes;

  return fiber;
}

export function createFiberFromText(content, mode, lanes){
  console.error('createFiberFromText');
  return;
  const fiber = createFiber(HostText, content, null, mode);
  fiber.lanes = lanes;
  return fiber;
}