import {
  LazyComponent,
  FunctionComponent,
  SuspenseComponent,
  HostText,
  HostComponent,
  Fragment,
  HostRoot,
  NoLanes,
  NoFlags,
  DidCapture,
  OffscreenComponent,
  OffscreenLane,
  Update,
  StaticMask,
} from '@Jeact/shared/Constants';
import {
  getRootHostContainer,
  popHostContainer,
  popHostContext,
} from '@Jeact/vDOM/FiberHostContext';
import {
  mergeLanes,
  includesSomeLane,
} from '@Jeact/vDOM/FiberLane';
import { 
  createTextNode, 
  createElement,
  setInitialDOMProperties,
} from '@Jeact/vDOM/DOMComponent';
import {
  precacheFiberNode,
  updateFiberProps
} from '@Jeact/vDOM/DOMComponentTree';
import {
  popRootCachePool,
  popCacheProvider,
} from '@Jeact/vDOM/FiberCacheComponent';
import {
  suspenseStackCursor,
  InvisibleParentSuspenseContext,
  hasSuspenseContext
} from '@Jeact/vDOM/FiberSuspenseContext';
import {pop} from '@Jeact/vDOM/FiberStack';
import {
  renderDidSuspend,
  popRenderLanes,
  subtreeRenderLanes,
} from '@Jeact/vDOM/FiberWorkLoop';

function updateHostComponent(
  current, 
  workInProgress,
  type,
  newProps,
  rootContainerInstance,
){
  const oldProps = current.memoizedProps;
  if (oldProps === newProps){
    return;
  }

  const instance = workInProgress.stateNode;
  const updatePayload = prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
  )
  workInProgress.updateQueue = updatePayload;
}

function appendAllChildren(parent, workInProgress){
  let node = workInProgress.child;
  while (node!==null){
    if (node.tag === HostComponent || node.tag === HostText){
      let domInstance = node.stateNode;
      parent.appendChild(domInstance);
    } else if (node.child !== null){
      /*  <DOM>
       *       <Function Component > <- childFiber
       *          <Dom></Dom>
       *       </Function Component>
       *  </DOM>
       */
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    while (node.sibling === null){
      // when node's parent has siblings
      if (node.return === workInProgress){
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
};

function bubbleProperties(completedWork){
  const didBailout = completedWork.alternate !== null && 
    completedWork.alternate.child === completedWork.child;

    let newChildLanes = NoLanes;
    let subtreeFlags = NoFlags;

  if (!didBailout){
    let child = completedWork.child;
    while (child !== null){
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes),
      );

      subtreeFlags |= child.subtreeFlags;
      subtreeFlags |= child.flags;

      child = child.sibling;
    }
    completedWork.subtreeFlags |= subtreeFlags;
  } else {
    let child = completedWork.child;
    while (child !== null){
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes),
      );

      subtreeFlags |= child.subtreeFlags & StaticMask;
      subtreeFlags |= child.flags & StaticMask;
      // child.return = completedWork;
      child = child.sibling;
    }
    completedWork.subtreeFlags |= subtreeFlags;
  }

  completedWork.childLanes = newChildLanes;
}

export function completeWork(current, workInProgress,renderLanes){
  const newProps = workInProgress.pendingProps;
  
  switch(workInProgress.tag){
    case LazyComponent:
    case Fragment:
    case FunctionComponent://0
      bubbleProperties(workInProgress);
      return null;
    case HostRoot:{//3
      const fiberRoot = workInProgress.stateNode;
      popRootCachePool(fiberRoot, renderLanes);
      const cache = workInProgress.memoizedState.cache;
      popCacheProvider(workInProgress, cache);
      popHostContainer(workInProgress);
      bubbleProperties(workInProgress);
      return null;
    }
    case HostComponent:{//5
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if(current !== null && workInProgress.stateNode !== null){
        debugger;
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        )
      } else {
        if(!newProps){
          debugger;
          bubbleProperties(workInProgress);
          return null;
        }

        const instance = createElement(
          type,
          rootContainerInstance,
        );
        
        precacheFiberNode(workInProgress, instance);
        updateFiberProps(instance, newProps);

        appendAllChildren(instance, workInProgress);
        setInitialDOMProperties(instance, workInProgress) 
        
        workInProgress.stateNode = instance;
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case HostText: {//6
      debugger;
      const newText = newProps;
      if (workInProgress.alternate& workInProgress.stateNode!==null){
        console.error('x');
      }
      const rootContainerInstance = getRootHostContainer();
      const instance = createTextNode(
        newText,
        rootContainerInstance,
      );
      workInProgress.stateNode = instance;
      precacheFiberNode(workInProgress, instance)
      bubbleProperties(workInProgress);
      return null;
    }
    case SuspenseComponent:{
      pop(suspenseStackCursor, workInProgress);
      const nextState = workInProgress.memoizedState;
      if((workInProgress.flags & DidCapture) !== NoFlags){
        debugger;
      }
      const nextDidTimeout = nextState !== null;
      let prevDidTimeout = false;
      if(current !== null){
        const prevState = current.memoizedState;
        prevDidTimeout = prevState !== null;
      } 

      if(nextDidTimeout && !prevDidTimeout){
          const hasInvisibleChildContext = 
            current === null &&
            workInProgress.memoizedProps.avoid !== true;
          if(
              hasInvisibleChildContext ||
              hasSuspenseContext(
                suspenseStackCursor.current,
                (InvisibleParentSuspenseContext)
              )
            ){
            renderDidSuspend()
          } else {
            debugger;
          }
      }
      if (nextDidTimeout || prevDidTimeout){
        // If this boundary just timed out, schedule an effect to attach a 
        // retry listener to the promise. We also use this flag to toggle 
        // children.
        workInProgress.flags |= Update;
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case OffscreenComponent:{
      popRenderLanes(workInProgress);
      const nextState = workInProgress.memoizedState;
      const nextIsHidden = nextState !== null;

      if(current !== null){
        debugger;
      }

      // Don't bubble properties for hidden children.
      if (
        !nextIsHidden ||
        includesSomeLane(subtreeRenderLanes, OffscreenLane)
        ){
        bubbleProperties(workInProgress);
      }

      const spawnedCachePool = workInProgress.updateQueue;
      if(spawnedCachePool !== null){
        debugger;
        // popCachePool(workInProgress);
      }
      return null;
    }
    default:
      console.error('completeWork', workInProgress)
  }
}



