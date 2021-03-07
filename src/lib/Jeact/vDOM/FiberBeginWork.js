import {
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  SuspenseComponent,
  LazyComponent,
  OffscreenComponent,
  NoLanes,
  PerformedWork,
  Ref,
  DidCapture,
  NoFlags,
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
import {
  suspenseStackCursor,
  ForceSuspenseFallback,
  InvisibleParentSuspenseContext,
  SubtreeSuspenseContextMask,
} from '@Jeact/vDOM/FiberSuspenseContext';
import {push} from '@Jeact/vDOM/FiberStack';
import {createFiber} from '@Jeact/vDOM/Fiber';
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
      renderLanes
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

function updateHostComponent(current, workInProgress,renderLanes){
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

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
      current,
      nextChildren,
      renderLanes,
    );

  return workInProgress.child;
}

function mountLazyComponent(
  _current, 
  workInProgress,
  updateLanes, 
  renderLanes
){
  if (_current !== null) debugger;
  const props = workInProgress.pendingProps;
  const lazyComponent = workInProgress.type;
  const payload = lazyComponent._payload;
  const init = lazyComponent._init;
  let Component = init(payload);
    debugger;
}

function shouldRemainOnFallback(suspenseContext, current, workInProgress){
  // If we're already showing a fallback, there are cases where we need to 
  // remain on that fallback regardless of whether the content has resolved.
  if (current !== null){
    debugger;
  }

  // Not currently showing content. 
  // hasSuspenseContext()
  return suspenseContext & ForceSuspenseFallback !== 0

}

function updateSuspenseComponent(current, workInProgress, renderLanes){ 
  const nextProps = workInProgress.pendingProps;

  let suspenseContext = suspenseStackCursor.current;

  let showFallback = false;
  const didSuspend = (workInProgress.flags & DidCapture) !== NoFlags;
  
  if(
    didSuspend ||
    shouldRemainOnFallback(
      suspenseContext,
      current,
      workInProgress,
      renderLanes,
    )
  ){
    debugger;
  } else {
    // Attempting the main content
    if(
      current === null ||
      (current.memoizedState !== null)
    ){
      // This is a new mount or this boundary is already showing a fallback 
     // state.
     // Mark this subtree context as having at least one invisible parent that 
     // could handle the fallback state.
     // Boundaries without fallbacks or should be avoided are not considered
     // since they cannot handle preferred fallback states.
     if(
      nextProps.fallback !== undefined
      ){
      // addSubtreeSuspenseContext()
      suspenseContext = suspenseContext | InvisibleParentSuspenseContext
     }
    }
  }
  // setDefaultShallowSuspenseContext
  suspenseContext &= SubtreeSuspenseContextMask;

  // pushSuspenseContext()
  push(suspenseStackCursor, suspenseContext);

  if (current === null){
    // Initial mount
    const nextPrimaryChildren = nextProps.children;
    const nextFallbackChildren = nextProps.fallback;
    if (showFallback){
      debugger
    } else {
      return mountSuspensePrimaryChildren(
        workInProgress,
        nextPrimaryChildren,
        renderLanes,
      )
    }
  } else {
    // Update.
    debugger;
  }
}

function mountSuspensePrimaryChildren(
  workInProgress,
  primaryChildren,
  renderLanes
){
  const primaryChildProps = {
    mode: 'visible',
    children: primaryChildren,
  };
  // createFiberFromOffscreen()
  const primaryChildFragment = createFiber(
    OffscreenComponent,
    primaryChildProps
  );
  primaryChildFragment.lanes = renderLanes;
  primaryChildFragment.return = workInProgress;
  workInProgress.child = primaryChildFragment;
  return primaryChildFragment;
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
        case SuspenseComponent:
          debugger;
      }
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    }
  } else {
    didReceiveUpdate = false;
  }
  // prevent lanes from passing to fiber.lanes of HostComponent's child fibers, and further to childLanes in bubbleProperties().
  workInProgress.lanes = NoLanes;
  switch (workInProgress.tag){
    case LazyComponent:{//16
      return mountLazyComponent(
        current, 
        workInProgress,
        updateLanes,
        renderLanes
      );
    }
    case FunctionComponent:
      return updateFunctionComponent(current,workInProgress,renderLanes);
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return null;
    case SuspenseComponent:
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    default:
      console.error('beginWork4', workInProgress);
  }
}

export function markWorkInProgressReceivedUpdate(){
  didReceiveUpdate = true;
}
