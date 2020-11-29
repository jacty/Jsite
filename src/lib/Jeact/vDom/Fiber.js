import {
  __ENV__,
  NoFlags,
  NoLanes,
  HostRoot,
  HostComponent,
  FunctionComponent,
} from '@Jeact/shared/Constants';

let debugCounter = 1;

function FiberNode(tag, pendingProps, key){
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
  this.updateQueue = {
    baseState: this.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    pending: null,
    effects: null,
  };
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

export const createFiber = function(tag=HostRoot, pendingProps, key){
  return new FiberNode(tag, pendingProps, key);
};

// This is used to create an alternate fiber to do work on.
// Why it is not a completed copy of current?
export function createWorkInProgress(current){
  //TODO: Optimize the clone part using a function to iterate.
  let workInProgress = current.alternate;

  if (workInProgress === null){
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other"
    // unused node that we're free to reuse. This is lazily created rather
    // than totally clone to avoid allocating extra objects for things that are never updated. It also allows us to reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
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

  if(__ENV__){
    workInProgress._debugNeedsRemount = current._debugNeedsRemount;
    switch(workInProgress.tag){
      default:
        workInProgress.tag!==3?console.error('createWorkInProgress3'):'';
        break;
    }
  }

  return workInProgress;
}

export function createFiberFromTypeAndProps(element,lanes, owner){
  const type = element.type;
  const pendingProps = element.props;
  const key = element.key;

  let fiberTag;

  if (typeof type === 'function'){
    fiberTag = FunctionComponent;
  } else if(typeof type === 'string'){
    fiberTag = HostComponent;
  } else {
    console.error('createFiberFromTypeAndProps1')
  }

  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.elementType = type;
  fiber.type = type;
  fiber.lanes = lanes;

  if (__ENV__){
    fiber._debugOwner = owner;
  }

  return fiber;
}

export function createFiberFromElement(element, lanes){
  let owner = null;
  if (__ENV__){
    owner = element._owner;
  }
  const fiber = createFiberFromTypeAndProps(element, lanes, owner);
  if (__ENV__){
    fiber._debugSource = element._source;
    fiber._debugOwner = element._owner;
  }
  return fiber;
}

export function createFiberFromText(content, mode, lanes){
  console.error('createFiberFromText');
  return;
  const fiber = createFiber(HostText, content, null, mode);
  fiber.lanes = lanes;
  return fiber;
}