import {
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
} from '@Jeact/shared/Constants';
import {
  getRootHostContainer,
  popHostContainer
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
} from '@Jeact/vDOM/FiberSuspenseContext';
import {pop} from '@Jeact/vDOM/FiberStack';
import {
  renderDidSuspend,
  popRenderLanes
} from '@Jeact/vDOM/FiberWorkLoop';

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
    console.error('x');
  }

  completedWork.childLanes = newChildLanes;
}

export function completeWork(current, workInProgress,renderLanes){
  const newProps = workInProgress.pendingProps;
  
  switch(workInProgress.tag){
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
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if(current !== null && workInProgress.stateNode !== null){
        debugger;
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
      bubbleProperties(workInProgress);
      return null;
    }
    case HostText: {//6
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
        debugger;
        const prevState = current.memoizedState;
        prevDidTimeout = prevState !== null;
      } 

      if(nextDidTimeout && !prevDidTimeout){
          if(
            (current === null) ||
            ((suspenseStackCursor.current & InvisibleParentSuspenseContext)!==0)
            ){
            renderDidSuspend()
          } else {
            debugger;
          }
      }
      if (nextDidTimeout){
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

function updateHostContainer(workInProgress){
  const root = workInProgress.stateNode;
  const childrenUnchanged = workInProgress.firstEffect === null;
  if(childrenUnchanged){
    console.error('updateHostContainer2')
  } else {
    const container = root.containerInfo;
    const newChildSet = createContainerChildSet(container);
    console.error('updateHostContainer1')  
  }
}


