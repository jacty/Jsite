import {
  InputDiscreteLanePriority,
  NoLanes,
  __ENV__,
} from '@Jeact/shared/Constants';
import {CurrentDispatcher} from '@Jeact/shared/internals';
import {
  requestEventTime,
  scheduleUpdateOnFiber
} from '@Jeact/vDOM/FiberWorkLoop';
import {
  requestUpdateLane,
  isTransitionLane
} from '@Jeact/vDOM/FiberLane';

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

  if (__ENV__){
    hookTypesUpdateIndexDev = -1;
  }

  CurrentDispatcher.current =
    current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

  let children = Component(props);

  // Check if there was a render phase update
  if (didScheduleRenderPhaseUpdateDuringThisPass){
    console.error('renderWithHooks1')
  }

  CurrentDispatcher.current = ContextOnlyDispatcher;

  if (__ENV__){
    workInProgress._debugHookTypes = hookTypesDev;
  }

  return children
}

export function resetHooksAfterThrow(){
  CurrentDispatcher.current = ContextOnlyDispatcher;
  if (didScheduleRenderPhaseUpdate){
    console.error('resetHooksAfterThrow1')
  }
  renderLanes = NoLanes;
  currentlyRenderingFiber = null;

  currentHook = null;
  workInProgressHook = null;

  if (__ENV__){
    hookTypesDev = null;
    hookTypesUpdateIndexDev = -1;
  }

  didScheduleRenderPhaseUpdateDuringThisPass = false;
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
    lastRenderedState: initialState, 
  }

  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;
  
  return [hook.memoizedState, dispatch];
}

function dispatchAction(fiber, queue, action){
  const eventTime = requestEventTime();
  const currentEventWipLanes = fiber.lanes;
  const lane = requestUpdateLane(InputDiscreteLanePriority,fiber.lanes);

  const update = {
    lane,
    action,
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

