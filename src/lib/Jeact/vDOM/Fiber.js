import {
  __ENV__,
  NoFlags,
  NoLanes,
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  SuspenseComponent,
  LazyComponent,
  JEACT_SUSPENSE_TYPE,
  JEACT_FRAGMENT_TYPE,
  JEACT_OFFSCREEN_TYPE,
  JEACT_LAZY_TYPE,
  StaticMask,
} from '@Jeact/shared/Constants';

let debugCounter = 1;

function FiberNode(tag=HostRoot, pendingProps=null, lanes=NoLanes){
  this.tag = tag; 
  this.key = null;
  this.elementType = null;
  this.type = null;
  this.stateNode = null; 

  // Fiber chain
  this.return = null; 
  this.child = null;
  this.sibling = null;
  this.index = 0;
  
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.memoizedState = null;
  this.updateQueue = null;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = lanes;
  this.childLanes = NoLanes;

  this.alternate = null; 
  if (__ENV__){
    this._debugID = debugCounter++;
  }
}

export const createFiber = function(tag, pendingProps, lanes){
  return new FiberNode(tag, pendingProps, lanes);
};

// This is used to create an alternate fiber to do work on.
export function createWorkInProgress(current, pendingProps=null){
  let workInProgress = current.alternate;
  let cloneKeys = [];
  if (workInProgress === null){
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.lanes,
    );

    cloneKeys = [
      'elementType',
      'type',
      'stateNode',
      'key',
    ];

    if (__ENV__){
      cloneKeys = cloneKeys.concat([
        '_debugID'
      ])
    }   

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  }else{
    workInProgress.pendingProps = pendingProps;
    
    cloneKeys = [
      'type'
    ];

    // We already have an alternate.
    // Reset the flags.
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  // Static effects are not specific to a render. 
  workInProgress.flags = current.flags & StaticMask;

  cloneKeys = cloneKeys.concat([
    'childLanes',
    'lanes',
    'child',
    'memoizedProps',
    'memoizedState',
    'updateQueue',
    'sibling',
    'index',
    'ref',
  ]);
  
  clone(current,workInProgress,cloneKeys);

  return workInProgress;
}

export function createFiberFromElement(element, lanes){
  const type = element.type;
  const pendingProps = element.props;
  const key = element.key;

  let fiberTag;
  if (typeof type === 'function'){
    fiberTag = FunctionComponent;
  } else if(typeof type === 'string'){
    fiberTag = HostComponent;
  } else {
    getTag: switch(type){
      case JEACT_FRAGMENT_TYPE: debugger;
      case JEACT_SUSPENSE_TYPE:
        const fiber = createFiber(SuspenseComponent, pendingProps, key);
        fiber.elementType = JEACT_SUSPENSE_TYPE;
        fiber.lanes = lanes;
        return fiber;
      case JEACT_OFFSCREEN_TYPE:
        debugger;
      default:{
        if (typeof type === 'object' && type !== null){
          switch(type.$$typeof){
            case JEACT_LAZY_TYPE:
              fiberTag = LazyComponent;
              break getTag;
          }
        }
      }
    }
  }

  const fiber = createFiber(fiberTag, pendingProps, lanes);
  fiber.type = type;
  fiber.elementType = fiberTag === LazyComponent ? JEACT_LAZY_TYPE : type;
  fiber.key = key;

  return fiber;
}

export function createFiberFromText(content, lanes){
  const fiber = createFiber(HostText, content, lanes);
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
