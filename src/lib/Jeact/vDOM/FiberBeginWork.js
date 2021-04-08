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
  JEACT_OFFSCREEN_TYPE,
  ChildDeletion
} from '@Jeact/shared/Constants';
import {
  includesSomeLane,
  mergeLanes
} from '@Jeact/vDOM/FiberLane';
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
import {
  pushHostContainer,
  pushHostContext,
} from '@Jeact/vDOM/FiberHostContext';
import {shouldSetTextContent} from '@Jeact/vDOM/DOMComponent';
import {
  pushRootCachePool,
  pushCacheProvider,
  getSuspendedCachePool,
  restoreSpawnedCachePool
} from '@Jeact/vDOM/FiberCacheComponent';
import {
  suspenseStackCursor,
  ForceSuspenseFallback,
  InvisibleParentSuspenseContext,
  SubtreeSuspenseContextMask,
  hasSuspenseContext,
  addSubtreeSuspenseContext,
  setDefaultShallowSuspenseContext,
} from '@Jeact/vDOM/FiberSuspenseContext';
import {push} from '@Jeact/vDOM/FiberStack';
import {
  createFiber,
  createWorkInProgress,
} from '@Jeact/vDOM/Fiber';
import {pushRenderLanes} from '@Jeact/vDOM/FiberWorkLoop';
import {createElement} from '@Jeact/Element';

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
      // toggle hidden tree to visible.
      subtreeRenderLanes = mergeLanes(prevState.baseLanes, renderLanes);
      const prevCachePool = prevState.cachePool;
      if(prevCachePool !== null){
        spawnedCachePool = restoreSpawnedCachePool(
          workInProgress,
          prevCachePool,
        )
      }
      // Not hidden anymore.
      workInProgress.memoizedState = null;
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
  pushHostContext(workInProgress)
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
    const suspenseState = current.memoizedState;
    if(suspenseState === null){
      debugger;
      return false;
    }
  }

  // Not currently showing content. Consult the Suspense context.
  return hasSuspenseContext(
    suspenseContext,
    ForceSuspenseFallback
    )
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
    // part of the subtree has suspended and render the fallback children.
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
     // could handle the fallback state..

      suspenseContext = addSubtreeSuspenseContext(
        suspenseContext,
        InvisibleParentSuspenseContext,
      )     
    }
  }
  // why?
  suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);

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
    // If the current fiber has a SuspenseState, that means it's already 
    // showing a fallback.
    const prevState = current.memoizedState;
    if (prevState !== null){
      if (showFallback){
        debugger;
      } else {
        const nextPrimaryChildren = nextProps.children;
        const primaryChildFragment = updateSuspensePrimaryChildren(
          current,
          workInProgress,
          nextPrimaryChildren,
          renderLanes,
        );
        workInProgress.memoizedState = null;
        return primaryChildFragment;
      }
    } else {
      debugger;
    }
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
const defaultFallbackChildren=createElement('p',null,'Loading...');

function mountSuspenseFallbackChildren(
  workInProgress,
  primaryChildren,
  fallbackChildren=defaultFallbackChildren,
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
  primaryChildFragment.lanes = NoLanes;

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


function updateSuspensePrimaryChildren(
  current,
  workInProgress,
  primaryChildren,
  renderLanes
){

  const currentPrimaryChildFragment = current.child;
  const currentFallbackChildFragment = currentPrimaryChildFragment.sibling;
  // createWorkInProgressOffscreenFiber()
  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    {
      mode: 'visible',
      children: primaryChildren,
    }
  )
  primaryChildFragment.return = workInProgress;
  primaryChildFragment.sibling = null;
  if (currentFallbackChildFragment !== null){
    // Delete the fallback child fragment
    const deletions = workInProgress.deletions;
    if (deletions === null){
      workInProgress.deletions = [currentFallbackChildFragment];
      workInProgress.flags |= ChildDeletion;
    } else {
      debugger;
    }
  }
  workInProgress.child = primaryChildFragment;
  return primaryChildFragment;
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
      didReceiveUpdate = true;
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
        case HostComponent:
          debugger;
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
                    setDefaultShallowSuspenseContext(
                      suspenseStackCursor.current
                    ),
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
    case Fragment:
      return updateFragment(current, workInProgress, renderLanes);
    case OffscreenComponent:
      return updateOffscreenComponent(current, workInProgress, renderLanes);
    default:
      console.error('beginWork4', workInProgress);
  }
}

export function markWorkInProgressReceivedUpdate(){
  didReceiveUpdate = true;
}
