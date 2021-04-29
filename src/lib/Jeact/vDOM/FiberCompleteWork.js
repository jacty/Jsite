import {
  LazyComponent,
  FunctionComponent,
  SuspenseComponent,
  HostText,
  HostComponent,
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
  popHostContainer,
} from '@Jeact/vDOM/FiberHostContext';
import {
  mergeLanes,
  includesSomeLane,
} from '@Jeact/vDOM/FiberLane';
import { 
  createTextNode, 
  createElement,
  setInitialDOMProperties,
  diffProperties,
} from '@Jeact/vDOM/DOMComponent';
import {
  precacheFiberNode,
  updateFiberProps
} from '@Jeact/vDOM/DOMComponentTree';
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

function markUpdate(workInProgress){
  workInProgress.flags |= Update;
}

function updateHostComponent(
  current, 
  workInProgress,
  type,
  newProps,
){
  const oldProps = current.memoizedProps;  
  const instance = workInProgress.stateNode;
  const updatePayload = diffProperties(
    instance,
    type,
    oldProps,
    newProps
  )
  workInProgress.updateQueue = updatePayload;
  if (updatePayload){
    markUpdate(workInProgress);
  }
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
    case FunctionComponent:
      bubbleProperties(workInProgress);
      return null;
    case HostRoot:{
      const fiberRoot = workInProgress.stateNode;
      popHostContainer(workInProgress);
      bubbleProperties(workInProgress);
      return null;
    }
    case HostComponent:{
      const type = workInProgress.type;
      if(current !== null && workInProgress.stateNode !== null){
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps
        )
      } else {
        if(!newProps){
          bubbleProperties(workInProgress);
          return null;
        }

        const instance = createElement(
          type,
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
      const newText = newProps;
      const current = workInProgress.alternate;
      if (current && workInProgress.stateNode!==null){
        // Update text node
        const oldText = current.memoizedProps;
        // updateHostText
        if (oldText !== newText){
          markUpdate(workInProgress);
        }
      } else {
        // Mount text node
        const instance = createTextNode(
          newText
        );      
        workInProgress.stateNode = instance;
        precacheFiberNode(workInProgress, instance)
      }

      bubbleProperties(workInProgress);
      return null;
    }
    case SuspenseComponent:{
      pop(suspenseStackCursor);
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
        const prevState = current.memoizedState;
        const prevIsHidden = prevState !== null;
        if (prevIsHidden !== nextIsHidden){
          workInProgress.flags |= Update;
        }
      }

      // Don't bubble properties for hidden children.
      if (
        !nextIsHidden ||
        includesSomeLane(subtreeRenderLanes, OffscreenLane)
        ){
        bubbleProperties(workInProgress);
      }

      return null;
    }
    default:
      console.error('completeWork', workInProgress)
  }
}
