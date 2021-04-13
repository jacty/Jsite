import {
  NoLanes,
  Passive,
  PassiveStatic,
  HookHasEffect,
  HookPassive,
  Update,
} from '@Jeact/shared/Constants';
import {CurrentDispatcher} from '@Jeact/shared/internals';
import {
  requestEventTime,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop';
import {
  requestUpdateLane,
  isTransitionLane,
  isSubsetOfLanes,
  removeLanes
} from '@Jeact/vDOM/FiberLane';
import { markWorkInProgressReceivedUpdate } from '@Jeact/vDOM/FiberBeginWork';

// Set for the first time in renderWithHooks().
let renderLanes = NoLanes;
// The work-in-progress fiber. 
let currentlyRenderingFiber = null;
// Hooks belong to the current fiber.
let currentHook = null; 
// Hooks will be added to work-in-progress fiber.
let workInProgressHook = null;

// Whether an update was scheduled at any point during the render phase. This
// does not get reset if we do another render pass; 
let didScheduleRenderPhaseUpdate = false;
// Where an update was scheduled only during the current render pass. This
// gets reset after each attempt.
// TODO: Maybe there's some way to consolidate this with
// `didScheduleRenderPhaseUpdate`. Or with `numberOfReRenders`.
let didScheduleRenderPhaseUpdateDuringThisPass = false;

function areHookInputsEqual(nextDeps, prevDeps){
  if (prevDeps === null){
    return false;
  }
  for (let i=0; i < prevDeps.length && i < nextDeps.length; i++){
    if (Object.is(nextDeps[i], prevDeps[i])){
      continue;
    }
    return false;
  }
  return true;
}

export function renderWithHooks(current,workInProgress,nextRenderLanes){
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;

  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  // Only when current.memoizedState is not null, the Hooks have been mounted
  CurrentDispatcher.current =
    current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

  let children = Component(props);

  // Check if there was a render phase update
  if (didScheduleRenderPhaseUpdateDuringThisPass){
    debugger;
  }
  currentlyRenderingFiber = null;

  return children
}

export function bailoutHooks(current, workInProgress, lanes){
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.flags &= ~(Passive | Update);

  current.lanes = removeLanes(current.lanes, lanes);
}

function mountWorkInProgressHook(){
  const hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  };
  if (workInProgressHook === null){
    // first hook in the list.
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // append to the end of the list.
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

function updateWorkInProgressHook(){
  // This function is used both for updates and for re-renders triggered by a 
  // render phase update. It assumes there is either a current hook we can 
  // clone, or a work-in-progress hook from a previous render pass that we can // use as a base. When we reach the end of the base list, we must switch to 
  // the dispatcher used for mounts.
  let nextCurrentHook = null;
  if (currentHook === null){
    const current = currentlyRenderingFiber.alternate;
    if (current !== null){
      nextCurrentHook = current.memoizedState;
    } else {
      debugger;
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  let nextWorkInProgressHook;
  if (workInProgressHook === null){
    // shouldn't be reached since workInProgressHook will always be set
    // in mountWorkInProgressHook().
    debugger;
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null){
    // There's already a work-in-progress. Reuse it.
    debugger;
  } else {
    // Clone from the current hook.

    currentHook = nextCurrentHook;

    const newHook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,

      next: null,
    };

    if (workInProgressHook === null){
      // This is the first hook in the list.
      debugger;
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      // Append to the end of the list.
      workInProgressHook = workInProgressHook.next = newHook;
    }
    return workInProgressHook;
  }
}

function basicStateReducer(state, action){
  return typeof action === 'function' ? action(state) : action;
}

function updateReducer(reducer, initial){
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  queue.lastRenderedReducer = reducer;
  const current = currentHook;

  let baseQueue = current.baseQueue;
  const pendingQueue = queue.pending;

  if(pendingQueue !== null){
    // Found unprocessed new updates and add them to the base queue.
    if(baseQueue !==null){
      // Merge the pending queue and the base queue.
      debugger;
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next; 
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  
  if (baseQueue !== null){
    // We have a queue to process.
    const first = baseQueue.next;
    let newState = current.baseState;
    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;

    do {
      const updateLane = update.lane;
      if (!isSubsetOfLanes(renderLanes, updateLane)){
        debugger;
      } else {
        if (newBaseQueueLast!==null){
          debugger;
        }
        // Process this update.
        if(update.eagerReducer === reducer){
          newState = update.eagerState;
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      update = update.next;
    } while (update !== null && update !== first);

    if (newBaseQueueLast === null){
      newBaseState = newState;
    } else {
      debugger;
    }

    // Mark that the fiber performed work, but only if the new state is 
    // different from the current state.
    if (!Object.is(newState, hook.memoizedState)){
      markWorkInProgressReceivedUpdate();
    }

    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;

    queue.lastRenderedState = newState;
  }
  if(baseQueue === null){
    queue.lanes = NoLanes;
  }
  const dispatch = queue.dispatch;

  return [hook.memoizedState, dispatch];
}

function mountState(initialState){
  const hook = mountWorkInProgressHook()
  if (typeof initialState === 'function'){
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue = hook.queue = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState, 
  }

  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;

  return [hook.memoizedState, dispatch];
}

function updateState(initialState){
  return updateReducer(basicStateReducer, initialState);
}

function pushEffect(tag, create, destroy, deps){
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null
  };
  let updateQueue = currentlyRenderingFiber.updateQueue;
  if (updateQueue === null){
    // createFunctionComponentUpdateQueue()
    updateQueue = {
      lastEffect: null,
    };
    currentlyRenderingFiber.updateQueue = updateQueue;
    updateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = updateQueue.lastEffect;
    if (lastEffect === null){
      updateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      updateQueue.lastEffect = effect;
    }
  }
  return effect;
}

// mountEffectImpl()
function mountEffect(create, deps){
  const fiberFlags = Passive | PassiveStatic;
  const hookFlags = HookPassive;
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps,
  ); 
}
// updateEffectImpl
function updateEffect(create, deps){
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null){
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if(nextDeps !== null){
      const prevDeps = prevEffect.deps;
      if(areHookInputsEqual(nextDeps, prevDeps)){
        hook.memoizedState = pushEffect(HookPassive,create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.flags |= Passive;

  hook.memoizedState = pushEffect(
    HookHasEffect | HookPassive,
    create,
    destroy,
    nextDeps,
  )
}

function dispatchAction(fiber, queue, action){
  const eventTime = requestEventTime();
  const lane = requestUpdateLane();
  const update = {
    lane,
    action,
    eagerReducer:null,
    eagerState: null,
    next:null,
  };
  const alternate = fiber.alternate;

  if(
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  ){// render phase update.
    debugger;
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    const pending = queue.pending
    if (pending === null){ 
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    queue.pending = update;
  } else {
    const pending = queue.pending;
    if (pending === null){
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    queue.pending = update;

    if (
        fiber.lanes === NoLanes && 
        (alternate === null || alternate.lanes === NoLanes)
      )
    { 
      // prepare the first item for the queue without schedule a task in 
      // scheduler for Render Phase 
      const lastRenderedReducer = queue.lastRenderedReducer;
      const currentState = queue.lastRenderedState;
      const eagerState = lastRenderedReducer(currentState, action);
      update.eagerReducer = lastRenderedReducer;
      update.eagerState = eagerState;
      if (Object.is(eagerState, currentState)){
        return;
      }
    }
    
    const root = scheduleUpdateOnFiber(fiber, lane, eventTime);

    if (isTransitionLane(lane) && root !== null){
      debugger;
    }
  }
}

const HooksDispatcherOnMount ={
  useState: mountState,
  useEffect: mountEffect,
}
const HooksDispatcherOnUpdate = {
  useState: updateState,
  useEffect: updateEffect,
}