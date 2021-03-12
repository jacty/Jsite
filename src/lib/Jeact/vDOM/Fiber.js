import {
  __ENV__,
  NoFlags,
  NoLanes,
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  LazyComponent,
  SuspenseComponent,
  JEACT_LAZY_TYPE,
  JEACT_SUSPENSE_TYPE,
  StaticMask,
} from '@Jeact/shared/Constants';

let debugCounter = 1;

function FiberNode(tag=HostRoot, pendingProps=null, key=null){
  this.tag = tag; 
  this.key = key;
  this.type = null;
  this.stateNode = null; 

  // Fiber chain
  this.return = null; 
  this.child = null;
  this.sibling = null;
  this.index = 0;
  
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.memoizedState = null; // As baseState in update queue.
  this.updateQueue = null;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null; 
  if (__ENV__){
    this._debugID = debugCounter++;
    this._debugOwner = null;
    Object.preventExtensions(this);
  }
}

export const createFiber = function(tag, pendingProps, key){
  // TODO: add argument lane
  return new FiberNode(tag, pendingProps, key);
};


// This is used to create an alternate fiber to do work on.
// Why it is not a completed copy of current?
export function createWorkInProgress(current, pendingProps){
  let workInProgress = current.alternate;
  let cloneKeys = [];
  if (workInProgress === null){
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
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
  }else{}

  workInProgress.flags = current.flags & StaticMask;
  cloneKeys = [
    'childLanes',
    'lanes',
    'child',
    'memoizedProps',
    'memoizedState',
    'updateQueue',
    'sibling',
    'index',
    'ref',
  ];
  clone(current,workInProgress,cloneKeys);

  return workInProgress;
}

export function createFiberFromTypeAndProps(element, lanes, owner){
  const type = element.type;
  const pendingProps = element.props;
  const key = element.key;

  let fiberTag;
  if (typeof type === 'function'){
    fiberTag = FunctionComponent;
  } else if(typeof type === 'string'){
    fiberTag = HostComponent;
  } else {
    switch(type){
      case JEACT_SUSPENSE_TYPE:
        const fiber = createFiber(SuspenseComponent, pendingProps, key);
        fiber.lanes = lanes;
        return fiber;
      default:{
        if (typeof type ==='object' && type !== null){
          switch (type.$$typeof){
            case JEACT_LAZY_TYPE:
              fiberTag = LazyComponent;
              break;
            default:{
              debugger;
            }
          }
        }
      }
    }
  }

  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.type = type;
  fiber.lanes = lanes;

  return fiber;
}

export function createFiberFromElement(element, lanes){
  const fiber = createFiberFromTypeAndProps(element, lanes);
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
