import {
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  NoLanes,
  PerformedWork,
  Ref,
} from '@Jeact/shared/Constants';
import {includesSomeLane} from '@Jeact/vDOM/FiberLane';
import {
  reconcileChildFibers,
  cloneChildFibers,
} from '@Jeact/vDOM/ChildFiber';
import {
  cloneUpdateQueue,
  processUpdateQueue
} from '@Jeact/vDOM/UpdateQueue';
import {
  renderWithHooks,
  bailoutHooks
} from '@Jeact/vDOM/FiberHooks';
import {pushHostContainer} from '@Jeact/vDOM/FiberHostContext';
import {shouldSetTextContent} from '@Jeact/vDOM/DOMComponent';
import {
  pushRootCachePool,
  pushCacheProvider
} from '@Jeact/vDOM/FiberCacheComponent';

let didReceiveUpdate = false;

function updateFunctionComponent(current,workInProgress,renderLanes){

  let nextChildren = renderWithHooks(
    current,
    workInProgress,
    renderLanes,
  );

  if(current!==null && !didReceiveUpdate){
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }

  workInProgress.flags |= PerformedWork;
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      current,
      nextChildren,
      renderLanes,
      current
    );

  return workInProgress.child;
}

function updateHostRoot(current, workInProgress, renderLanes){
  // push host container like div#root into stack, so we can get it to refer in any depth when we are reconcile fiber children.
  pushHostContainer(workInProgress);//pushHostRootContext()
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState.element;
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, renderLanes);

  const nextState = workInProgress.memoizedState;

  const nextCache = nextState.cache;
  pushRootCachePool(workInProgress.stateNode);
  pushCacheProvider(workInProgress, nextCache);
  if(nextCache !== prevState.cache){
    debugger;
  }

  const nextChildren = nextState.element;
  if(nextChildren === prevChildren){
    debugger;
  }

  workInProgress.child = reconcileChildFibers(
      workInProgress,
      current,
      nextChildren,
      renderLanes
  );
  return workInProgress.child;
}

function updateHostComponent(alternate, workInProgress,renderLanes){
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = alternate !== null ? alternate.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild){
    // Handle direct text node in host environment to avoid another traversing.
    nextChildren = null;
  } else if(prevProps !== null && shouldSetTextContent(type, prevProps)) {
    console.error('updateHostComponent1')
  }
  
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      alternate,
      nextChildren,
      renderLanes,
      alternate
    );

  return workInProgress.child;
}

export function markWorkInProgressReceivedUpdate(){
  didReceiveUpdate = true;
}

function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes){
  // Check if the children have any pending work.
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)){
    // The children don't have any work either.
    return null;
  } else {
    // This fiber doesn't have work, but its subtree does. Clone the child fibers and continue.
    cloneChildFibers(workInProgress);
    return workInProgress.child;
  }
}
// Iterate from parent fibers to child fibers(including sibling fibers) to build the whole fiber chain.
export function beginWork(current, workInProgress, renderLanes){
  if (workInProgress._debugID === 3) debugger;
  const updateLanes = workInProgress.lanes;
  if(current!==null){
    // Update phase
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if(oldProps !== newProps){
      debugger;
    } else if(!includesSomeLane(renderLanes, updateLanes)){
      didReceiveUpdate = false;
      // This fiber does not have any pending work. Bailout without entering 
      // the begin phase.
      switch (workInProgress.tag){
        case HostRoot:
          pushHostContainer(workInProgress);
          const root = workInProgress.stateNode;
          const cache = current.memoizedState.cache;
          pushCacheProvider(workInProgress, cache);
          pushRootCachePool(root);
          break;
      }
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    }
  } else {
    didReceiveUpdate = false;
  }
  // stop lanes pass to fiber.childLane
  workInProgress.lanes = NoLanes;
  switch (workInProgress.tag){
    case FunctionComponent://0
      return updateFunctionComponent(current,workInProgress,renderLanes);
    case HostRoot://3
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent://5
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText://6
      return null;
    default:
      console.error('beginWork4', workInProgress);
  }
}

