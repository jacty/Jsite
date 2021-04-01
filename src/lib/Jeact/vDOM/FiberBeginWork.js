import {
  HostRoot,
  HostText,
  HostComponent,
  FunctionComponent,
  SuspenseComponent,
  LazyComponent,
  OffscreenComponent,
  NoLanes,
  Ref,
  DidCapture,
  NoFlags,
  Fragment,
  JEACT_OFFSCREEN_TYPE
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
  pushCacheProvider,
  getSuspendedCachePool
} from '@Jeact/vDOM/FiberCacheComponent';
import {
  suspenseStackCursor,
  ForceSuspenseFallback,
  InvisibleParentSuspenseContext,
  SubtreeSuspenseContextMask,
} from '@Jeact/vDOM/FiberSuspenseContext';
import {push} from '@Jeact/vDOM/FiberStack';
import {
  createFiber,
} from '@Jeact/vDOM/Fiber';
import {pushRenderLanes} from '@Jeact/vDOM/FiberWorkLoop';

let didReceiveUpdate = false;

function updateOffscreenComponent(
  current,
  workInProgress,
  renderLanes
){
  const nextProps = workInProgress.pendingProps;
  const nextChildren = nextProps.children;

  const prevState = current !== null ? current.memoizedState : null;

  let spawnedCachePool = null;

  if (nextProps.mode === 'hidden'){
    debugger;
  } else {
    // Rendering a visible tree.
    let subtreeRenderLanes;
    if (prevState !== null){
      debugger;
    } else{
      subtreeRenderLanes = renderLanes;
    }
    pushRenderLanes(workInProgress, subtreeRenderLanes);
  }
  workInProgress.updateQueue = spawnedCachePool;
  // reconcileChildren()
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      current,
      nextChildren,
      renderLanes
    );

  return workInProgress.child;
}

function updateFragment(current, workInProgress, renderLanes){
  const nextChildren = workInProgress.pendingProps;
  
  workInProgress.child = reconcileChildFibers(
      workInProgress,
      current,
      nextChildren,
      renderLanes
    );
  return workInProgress.child;
}

function updateFunctionComponent(current,workInProgress,renderLanes){
  let nextChildren = renderWithHooks(
    current,
    workInProgress,
    renderLanes,
  );

  if(current!==null && !didReceiveUpdate){
    debugger;
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }

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
  const root = workInProgress.stateNode;
  const nextCache = nextState.cache;
  pushRootCachePool(root);
  pushCacheProvider(workInProgress, nextCache);
  if(nextCache !== prevState.cache){
    debugger;
  }

  const nextChildren = nextState.element;
  if(nextChildren === prevChildren){
    /* 
    * First run of UpdateHostRoot() will not have a child, since 
    * first Fiber(RootFiber) which has no any relevant DOM/VDOM node yet.
    */
    debugger;
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
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
  const isDirectTextChild = shouldSetTextContent(nextProps);

  if (isDirectTextChild){
    // Handle direct text node in host environment to avoid another traversing.
    nextChildren = null;
  } else if(prevProps !== null && shouldSetTextContent(type, prevProps)) {
    debugger;
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
  const lazyComponent = workInProgress.elementType;
  const payload = lazyComponent._payload;
  const init = lazyComponent._init;
  let Component = init(payload);

  workInProgress.type = Component;
  const resolvedTag = workInProgress.tag = FunctionComponent;
  switch(resolvedTag){
    case FunctionComponent:{
      return updateFunctionComponent(
        null,
        workInProgress,
        renderLanes
      )
    }
  }
  debugger;
}

const SUSPENDED_MARKER = {
  retryLane: NoLanes,
}

function mountSuspenseOffscreenState(renderLanes){
  return {
    baseLanes: renderLanes,
    cachePool: getSuspendedCachePool(),
  }
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
    // rendering the fallback children.
    showFallback = true;
    workInProgress.flags &= ~DidCapture;
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
  push(suspenseStackCursor, suspenseContext, workInProgress);

  if (current === null){
    // Initial mount
    const nextPrimaryChildren = nextProps.children;
    const nextFallbackChildren = nextProps.fallback;
    if (showFallback){
      const fallbackFragment = mountSuspenseFallbackChildren(
        workInProgress,
        nextPrimaryChildren,
        nextFallbackChildren,
        renderLanes,
      );
      const primaryChildFragment = workInProgress.child;
      primaryChildFragment.memoizedState = mountSuspenseOffscreenState(
        renderLanes,
      );
      workInProgress.memoizedState = SUSPENDED_MARKER;
      return fallbackFragment;
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
  primaryChildFragment.elementType = JEACT_OFFSCREEN_TYPE;
  primaryChildFragment.lanes = renderLanes;
  primaryChildFragment.return = workInProgress;
  workInProgress.child = primaryChildFragment;
  return primaryChildFragment;
}

function mountSuspenseFallbackChildren(
  workInProgress,
  primaryChildren,
  fallbackChildren,
  renderLanes,
){
  const primaryChildProps = {
    mode: 'hidden',
    children: primaryChildren,
  };

  let primaryChildFragment;
  let fallbackChildFragment;

  primaryChildFragment = createFiber(
    OffscreenComponent,
    primaryChildProps,
    null,
  );
  primaryChildFragment.elementType = JEACT_OFFSCREEN_TYPE;
  primaryChildFragment.lanes = renderLanes;

  fallbackChildFragment = createFiber(
    Fragment,
    fallbackChildren,
    null
  );
  fallbackChildFragment.lanes = renderLanes;

  primaryChildFragment.return = workInProgress;
  fallbackChildFragment.return = workInProgress;
  primaryChildFragment.sibling = fallbackChildFragment;
  workInProgress.child = primaryChildFragment;
  return fallbackChildFragment;
}

function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes){
  if (workInProgress.lanes !== 0) debugger;
  // Check if the children have any pending work.
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)){
    // The children don't have any work either.
    return null;
  }
    // This fiber doesn't have work, but its subtree does. Clone the child fibers and continue.
    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
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
      didReceiveUpdate = true;
    } else if(!includesSomeLane(renderLanes, updateLanes)){
      didReceiveUpdate = false;
      debugger;
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
        case HostComponent:
          // pushHostContext()
          break;
        case SuspenseComponent:{
          const state = workInProgress.memoizedState;
          if (state !== null){
            const primaryChildFragment = workInProgress.child;
            const primaryChildLanes = primaryChildFragment.childLanes;
            if(includesSomeLane(renderLanes, primaryChildLanes)){
              debugger
              return updateSuspenseComponent(
                current,
                workInProgress,
                renderLanes,
              );
            } else {
              push(suspenseStackCursor, 
                   suspenseStackCursor.current & SubtreeSuspenseContextMask,
                   workInProgress);   
              const child = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress,
                renderLanes,
              ) 
              if(child !== null){
                return child.sibling;
              } else {
                return null;
              }
            }
          } else {
            debugger;
          }
          break;
        }
        case OffscreenComponent:
          debugger;
      }
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    } else {
      didReceiveUpdate = false;
    }
  } else {
    didReceiveUpdate = false;
  }
  // prevent lanes from passing to fiber.lanes of HostComponent's child fibers, and further to childLanes in bubbleProperties().
  workInProgress.lanes = NoLanes;
  switch (workInProgress.tag){
    case LazyComponent:{
      debugger;
      return mountLazyComponent(
        current, 
        workInProgress,
        updateLanes,
        renderLanes
      );
    }
    case FunctionComponent:
      debugger;
      return updateFunctionComponent(current,workInProgress,renderLanes);
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      debugger;
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return null;
    case SuspenseComponent:
      debugger;
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    case Fragment:
      debugger;
      return updateFragment(current, workInProgress, renderLanes);
    case OffscreenComponent:
      debugger;
      return updateOffscreenComponent(current, workInProgress, renderLanes);
    default:
      console.error('beginWork4', workInProgress);
  }
}

export function markWorkInProgressReceivedUpdate(){
  didReceiveUpdate = true;
}
