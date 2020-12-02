import {
  NoLanes,
  __ENV__,
} from '@Jeact/shared/Constants';
import {
  CurrentDispatcher
} from '@Jeact/shared/internals';

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
// The list stores the order of hooks used during the initial render (mount).
// Subsequent renders (updates) reference this list.
let hookTypesDev = null;
let hookTypesUpdateIndexDev = -1;

export function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  secondArg,
  nextRenderLanes
){
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;

  if (__ENV__){
    hookTypesDev = 
      current !== null
        ? current._debugHookTypes
        : null;
    hookTypesUpdateIndexDev = -1;
  }
  // why?
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;

  CurrentDispatcher.current =
    current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

  let children = Component(props, secondArg);
  console.error('renderWithHooks', children);
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

export const ContextOnlyDispatcher = {
  'ContextOnlyDispatcher':1
}

const HooksDispatcherOnMount ={
  'HooksDispatcherOnMount':1
}

