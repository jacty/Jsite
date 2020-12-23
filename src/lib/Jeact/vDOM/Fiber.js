import {
  __ENV__,
  NoFlags,
  NoLanes,
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
} from '@Jeact/shared/Constants';

let debugCounter = 1;

function FiberNode(tag=HostRoot, pendingProps=null, key=null){
  // Instance
  this.tag = tag; // Decides which kind of component the fiber is
  this.key = key; // {key} attribute in lists' items
  this.type = null;
  this.stateNode = null; // point to FiberRootNode or DOMNode.

  // Fiber
  this.return = null; // point to parent
  this.child = null;
  this.sibling = null;
  this.index = 0;
  // props and states
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.memoizedState = null; // As baseState in update queue.
  this.updateQueue = {
    baseState: this.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    pending: null,
    effects: null,
  };

  // Effects
  this.flags = NoFlags;
  this.firstEffect = null;
  this.lastEffect = null;
  this.nextEffect = null;

  this.subtreeFlags = NoFlags;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null; 

  if (__ENV__){
    this._debugID = debugCounter++;
    this._debugOwner = null;
    this._debugHookTypes = null;
    Object.preventExtensions(this);
  }
}

export const createFiber = function(tag, pendingProps, key){
  return new FiberNode(tag, pendingProps, key);
};

// This is used to create an alternate fiber to do work on.
// Why it is not a completed copy of current?
export function createWorkInProgress(current){
  //TODO: Optimize the clone part using a function to iterate.
  let workInProgress = current.alternate;
  let cloneKeys = [];
  if (workInProgress === null){
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other"
    // unused node that we're free to reuse. This is lazily created rather
    // than totally clone to avoid allocating extra objects for things that are never updated. It also allows us to reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
    );

    cloneKeys = [
      'type',
      'stateNode',
    ];

    if (__ENV__){
      cloneKeys = cloneKeys.concat([
        '_debugID',
        '_debugOwner',
        '_debugHookTypes'
      ])
    }
    clone(current,workInProgress,cloneKeys)   

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else{
    console.error('createWorkInProgress1')
  }
  cloneKeys = [
    'childLanes',
    'lanes',
    'child',
    'memoizedProps',
    'memoizedState',
    'updateQueue',
    'sibling',
    'index',
  ];
  clone(current,workInProgress,cloneKeys);

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
    console.error('createFiberFromTypeAndProps1',type)
  }

  const fiber = createFiber(fiberTag, pendingProps, key);
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
    fiber._debugOwner = element._owner;
  }
  return fiber;
}

export function createFiberFromText(content, lanes){
  const fiber = createFiber(HostText, content);
  fiber.lanes = lanes;
  return fiber;
}
/* 
* cloneKeys: keys of items need to be cloned in {from}. Default to empty 
* array means clone all the items in {from} to {to}.
*/
function clone(from, to, cloneKeys=[]){
  for (const property in from){
    if (!from.hasOwnProperty(property)||
        (cloneKeys.length>0 && !cloneKeys.includes(property))
      ){
      continue
    }
    Object.defineProperty(
      to,
      property,
      Object.getOwnPropertyDescriptor(from, property)
    );
  }

  return to;
}
