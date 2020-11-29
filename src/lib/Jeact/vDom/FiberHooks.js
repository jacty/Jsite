import {
  NoLanes
} from '@Jeact/shared/Constants';
import {
  CurrentDispatcher
} from '@Jeact/shared/internals';

// These are set right before calling the component.
let renderLanes = NoLanes;
// The work-in-progress fiber. named it differently to distinguish it from
// the work-in-progress hook.
let currentlyRenderingFiber = null;
// Where an update was scheduled only during the current render pass. This
// gets reset after each attempt.
// TODO: Maybe there's some way to consolidate this with
// `didScheduleRenderPhaseUpdate`. Or with `numberOfReRenders`.
let didScheduleRenderPhaseUpdateDuringThisPass = false;

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

  CurrentDispatcher.current =
    current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

  let children = Component(props, secondArg);

  // Check if there was a render phase update
  if (didScheduleRenderPhaseUpdateDuringThisPass){
    console.error('renderWithHooks1')
  }

  CurrentDispatcher.current = ContextOnlyDispatcher;

  return children
}

export const ContextOnlyDispatcher = {
  'ContextOnlyDispatcher':1
}

const HooksDispatcherOnMount ={
  'HooksDispatcherOnMount':1
}

