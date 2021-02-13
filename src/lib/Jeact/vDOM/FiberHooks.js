import {
  InputDiscreteLanePriority,
  NoLanes,
  __ENV__,
  Passive,
  Update
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

// Set right before calling the component.
let renderLanes = NoLanes;
// The work-in-progress fiber. 
let currentlyRenderingFiber = null;

let currentHook = null; //Hooks belong to the current fiber;
let workInProgressHook = null;

// Whether an update was scheduled at any point during the render phase. This
// does not get reset if we do another render pass; only when we're completely
// finished evaluating this component. This is an optimization so we know 
// whether we need to clear render phase updates after a throw.
let didScheduleRenderPhaseUpdate = false;
// Where an update was scheduled only during the current render pass. This
// gets reset after each attempt.
// TODO: Maybe there's some way to consolidate this with
// `didScheduleRenderPhaseUpdate`. Or with `numberOfReRenders`.
let didScheduleRenderPhaseUpdateDuringThisPass = false;

const RE_RENDER_LIMIT = 25;

// In DEV, this list ensures that hooks are called in the same order between renders.
let hookTypesDev = null;
let hookTypesUpdateIndexDev = -1;

export function renderWithHooks(current,workInProgress,nextRenderLanes){
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;

  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;

  CurrentDispatcher.current =
    current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

  let children = Component(props);

  // Check if there was a render phase update
  if (didScheduleRenderPhaseUpdateDuringThisPass){
    console.error('renderWithHooks1')
  }

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
    } 
  } else {
    nextCurrentHook = currentHook.next;
  }

  let nextWorkInProgressHook;
  if (workInProgressHook === null){
    console.error('x');
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null){
    // There's already a work-in-progress. Reuse it.
    console.error('x');
  } else {
    // Clone from the current hook.
    if(nextCurrentHook === null){
      console.error('Rendered more hooks than during the previous render.')
    };

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
      console.error('y');
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
    // We have new updates that haven't been processed yet. We'll add them to // the base queue.
    if(baseQueue !==null){
      // Merge the pending queue and the base queue.
      console.error('x');
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
        console.error('x');
      } else {
        // This update does have sufficient priority.
        if (newBaseQueueLast!==null){
          console.error('x');
        }

        // Process this update.
        if(update.eagerReducer === reducer){
          console.error('x')
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
      console.error('x');
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
    lastRenderedReducer:basicStateReducer,
    lastRenderedState: initialState, 
  }

  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;
  
  return [hook.memoizedState, dispatch];
}

function updateState(initialState){
  return updateReducer(basicStateReducer, initialState);
}

function dispatchAction(fiber, queue, action){
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(InputDiscreteLanePriority,fiber.lanes);

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
  ){
    console.error('dispatchAction1');
  } else {
    const pending = queue.pending;
    if(pending === null){
      // First update.
      update.next = update;
    } else {
      console.error('dispatchAction2');
    }
    queue.pending = update;

    if(
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
      ){
      console.error('dispatchAction3')
    }

    const root = scheduleUpdateOnFiber(fiber, lane, eventTime);

    if(isTransitionLane(lane) && root !== null){
      console.error('dispatchAction4')
    }
  }
}

export const ContextOnlyDispatcher = {
  'ContextOnlyDispatcher':1
}

const HooksDispatcherOnMount ={
  useState: mountState,
}

const HooksDispatcherOnUpdate = {
  useState: updateState
}