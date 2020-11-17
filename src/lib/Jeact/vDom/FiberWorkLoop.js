import {
//   __ENV__,
  NoFlags,
  NoLanes,
  DiscreteEventContext,
  NoTimestamp,
//   SyncLane,
//   Placement,
//   Hydrating,
  HostRoot,
  DefaultLanePriority,
  NormalSchedulePriority,
  NoPriority,
  NormalPriority,
  Incomplete,
  noTimeout,
  NoContext,
  RenderContext,
  CommitContext,
//   ImmediatePriority,
//   PassiveMask,
//   BeforeMutationMask,
//   MutationMask,
//   LayoutMask,
} from '@Jeact/shared/Constants';
import {
  CurrentBatchConfig,
  CurrentOwner,
} from '@Jeact/shared/internals';
import {
  getCurrentSchedulePriority,
  PriorityToLanePriority,
  shouldYieldToHost,
//   runWithPriority,
} from '@Jeact/scheduler';
import {
  findUpdateLane,
  mergeLanes,
  getNextLanes,
  getNextLanesPriority,
  markStarvedLanesAsExpired,
  markRootUpdated,
  LanePriorityToPriority,
//   includesSomeLane,
//   markRootFinished,
} from '@Jeact/vDom/FiberLane';
import {
  CurrentDispatcher
} from '@Jeact/shared/internals';
import {
  createWorkInProgress
} from '@Jeact/vDom/Fiber';
import {
  ContextOnlyDispatcher,
} from '@Jeact/vDom/FiberHooks';

import {
  scheduleCallback,
} from '@Jeact/scheduler';
import { beginWork } from '@Jeact/vDom/FiberBeginWork';
import {
  completeWork
} from '@Jeact/vDom/FiberCompleteWork';
import { invariant } from '@Jeact/shared/invariant';
// import {
//   commitBeforeMutationEffects,
//   commitMutationEffects,
//   commitLayoutEffects,
// } from './JeactFiberCommitWork';

const RootIncomplete = 0;
// const RootCompleted = 5;

let executionContext = 0;
// The root we're working on
let wipRoot = null;
// The fiber we're working on
let wip = null;
// The lanes we're rendering
let wipRootRenderLanes = NoLanes;

// Stack that allows components to change the render lanes for its subtree
// This is a superset of the lanes we started working on at the root. The only
// case where it's different from `wipRootRenderLanes` is when we
// enter a subtree that is hidden and needs to be unhidden: Suspense and
// Offscreen component.
//
// Most things in the work loop should deal with wipRootRenderLanes.
// Most things in begin/complete phases should deal with subtreeRenderLanes.
export let subtreeRenderLanes = NoLanes;

let wipRootExitStatus = RootIncomplete;
let wipRootFatalError = null;

// // "Included" lanes refer to lanes that were worked on during this render. It's
// // slightly different than `renderLanes` because `renderLanes` can change as you
// // enter and exit an Offscreen tree. This value is the combination of all render
// lanes for the entire render phase.
let wipRootIncludedLanes = 0;
// // The work left over by components that were visited during this render. Only
// // includes unprocessed updates, not work in bailed out children.
let wipRootSkippedLanes = NoLanes;
let wipRootUpdatedLanes = NoLanes;

let wipRootPingedLanes = NoLanes;
// // The absolute time for when we should start giving up on rendering more and
// prefer CPU suspense heuristic instead.
let wipRootRenderTargetTime = Infinity;
// How long a render is supposed to take before we start following CPU suspense
// heuristics and opt out of rendering more content.
const RENDER_TIMEOUT = 500;

function resetRenderTimer(){
  wipRootRenderTargetTime = performance.now() + RENDER_TIMEOUT;
}

// let rootWithPendingPassiveEffects = null;
let pendingPassiveEffectsRenderPriority = NoPriority;
// let rootsWithPendingDiscreteUpdates = null;

// Use these to prevent an infinite loop of nested updates
const NESTED_UPDATE_LIMIT = 50;
let nestedUpdateCount = 0;
// let rootWithNestedUpdates = null

// const NESTED_PASSIVE_UPDATE_LIMIT = 50;
// let nestedPassiveUpdateCount = 0;

// If two updates are scheduled within the same event, we should treat their
// event times as simultaneous, even if the actual clock time has advanced
// between the first and second call.
let currentEventTime = NoTimestamp;
let currentEventWipLanes = 0;
let currentEventPendingLanes = NoLanes;

export function getCurrentPriority(){
  switch(getCurrentSchedulePriority()){
    case NormalSchedulePriority:
      return NormalPriority;
    default:
      console.log('getCurrentPriority', getCurrentSchedulePriority())
  }
}

export function requestEventTime(){
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext){
    // We're inside Jeact.
    return performance.now();
  }
  // We're not inside Jeact, so we may be in the middle of a browser event.
  if (currentEventTime !== NoTimestamp){
    // Use the same start time for all updates until we enter Jeact again.
    return currentEventTime;
  }

  // This is the first update since Jeact yield. Compute a new start time.
  currentEventTime = performance.now();

  return currentEventTime;
}

export function requestUpdateLane(fiber){
  // The algorithm for assigning an update to a lane should be stable for all
  // updates at the same priority within the same event. To do this, the inputs
  // to the algorithm must be the same. For example, we use the `renderLanes`
  // to avoid choosing a lane that is already in the middle of rendering.
  //
  // However, the "included" lanes could be mutated in between updates in the
  // same event, like if you perform an update inside `flushSync`. Or any other
  // code path that might call `prepareFreshStack`.
  //
  // The trick we use is to cache the first of each of these inputs within an
  // event. Then reset the cached values once we can be sure the event is over.
  // Our heuristic for that is whenever we enter a concurrent work loop.
  //
  // We'll do the same for `currentEventPendingLanes` below.
  if (currentEventWipLanes !== wipRootIncludedLanes){
    console.error('requestUpdateLane1');
  }

  const isTransition = CurrentBatchConfig.transition;
  if (isTransition){
    console.error('requestUpdateLane2')
  }
  // TODO: update normal priority to 100?
  const priority = getCurrentPriority();
  const LanePriority = PriorityToLanePriority(priority);

  let lane = findUpdateLane(LanePriority, currentEventWipLanes)

  return lane;
}

export function scheduleUpdateOnFiber(fiber, lane, eventTime){

  if (nestedUpdateCount > NESTED_UPDATE_LIMIT){
      console.error('Maximum update depth exceeded.')
  }
  console.error('scheduleUpdateOnFiber', fiber);
  return;
  // Update Fiber.lanes
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);

  if (root === null){
    console.log('scheduleUpdateOnFiber1')
    return null;
  }

  // Mark that the root has a pending update.
  markRootUpdated(root, lane, eventTime);

  if (root === wipRoot){
    console.log('scheduleUpdateOnFiber2')
  }

  // Schedule other updates after in case the callback is sync.
  ensureRootIsScheduled(root, eventTime);
  console.error('scheduleUpdateOnFiber')
}

function markUpdateLaneFromFiberToRoot(sourceFiber, lane){
  let node = sourceFiber;

  if (node.tag !== HostRoot){
    return null;
  }

  //Update the source fiber's lanes
  node.lanes = mergeLanes(node.lanes, lane);

  // Walk the parent path to the root and update the child expiration time.
  let parent = node.return;

  if(parent!==null){
    console.log('markUpdateLaneFromFiberToRoot3', parent);
  }

  return node.stateNode;
}

// Use this function to schedule a task for a root. There's only one task per root; if a task was already scheduled, we'll check to make sure the priority of the existing task is the same as the priority of the next level that the root has worked on. This function is called on every update, and right before existing a task.
function ensureRootIsScheduled(root, currentTime){

  const existingCallbackNode = root.callbackNode;

  // Check if any lanes are being starved by other work. If so, mark them as expired so we know how and when to work on those next.
  markStarvedLanesAsExpired(root, currentTime);

  // Determine the next lanes to work on, and their priority.
  const nextLanes = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  );

 
  if (nextLanes === NoLanes){
    console.log('ensureRootIsScheduled','nextLanes is NoLanes');
  }

  // Check if there's an existing task we may be able to reuse it.
  if (existingCallbackNode !== null){
    return;
  }

  const newCallbackPriority = getNextLanesPriority();
  // Schedule a new callback.
  let newCallbackNode;
  if (newCallbackPriority !== DefaultLanePriority){
    console.log('ensureRootIsScheduled1')
  } else {
    const priority = LanePriorityToPriority(newCallbackPriority);
    newCallbackNode = scheduleCallback(
      priority,
      performConcurrentWorkOnRoot.bind(null, root),
    )
  }

  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}

// This is the entry point for every concurrent task, i.e. anything that
// goes through Scheduler.
function performConcurrentWorkOnRoot(root){
  // Since we know we're in a Jeact event, we can clear the current
  // event time. The next update will compute a new event time.
  currentEventTime = NoTimestamp;
  currentEventWipLanes = NoLanes;
  currentEventPendingLanes = NoLanes;

  invariant (
    (executionContext & (RenderContext | CommitContext)) === NoContext,
    "Should not already be working.",);

  // Flush any pending passive effects before deciding which lanes to work on,
  // in case they schedule additional work.
  const didFlushPassiveEffects = flushPassiveEffects();
  if (didFlushPassiveEffects){
    console.log('performConcurrentWorkOnRoot')
  }

  // Determine the next expiration time to work on, using the fields stored on the root.
  let lanes = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  );

  if(lanes === NoLanes){
    // Defensive coding. This is never expected to happen.
    console.log('something is wrong here!')
    return null;
  }

  let exitStatus = renderRootConcurrent(root, lanes);
  console.error('performConcurrentWorkOnRoot', exitStatus);
  return;
  // We now have a consistent tree. The next step is to commit it.
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  finishConcurrentRender(root, exitStatus, lanes);
}

function finishConcurrentRender(root, exitStatus, lanes){
  switch (exitStatus){
    case RootCompleted:{
      commitRoot(root);
      break;
    }
    default:{
      console.error('finishConcurrentRender', exitStatus)
    }
  }
}

function prepareFreshStack(root, lanes){
  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  const timeoutHandle = root.timeoutHandle;
  if (timeoutHandle !== noTimeout){
    console.log('prepareFreshStack1');
  }
  if (wip !== null){
    console.log('prepareFreshStack2');
  }
  wipRoot = root;
  wip = createWorkInProgress(root.current);
  wipRootRenderLanes = subtreeRenderLanes =
    wipRootIncludedLanes = lanes;
  wipRootExitStatus = RootIncomplete;
  wipRootFatalError = null;
  wipRootSkippedLanes = NoLanes;
  wipRootUpdatedLanes = NoLanes;
  wipRootPingedLanes = NoLanes;
}

function handleError(root, thrownValue){
  console.error('handleError', thrownValue);
}

function pushDispatcher(){
  const prevDispatcher = CurrentDispatcher.current;
  CurrentDispatcher.current = ContextOnlyDispatcher;
  if (prevDispatcher === null){
    return ContextOnlyDispatcher;
  }
  return prevDispatcher;
}

function popDispatcher(prevDispatcher){
  JeactCurrentDispatcher.current = prevDispatcher;
}

export function markSkippedUpdateLanes(lane){
  wipRootSkippedLanes = mergeLanes(
    lane,
    wipRootSkippedLanes,
  )
}

function renderRootConcurrent(root, lanes){

  executionContext |= RenderContext;
  const prevDispatcher = pushDispatcher();

  // If the root or lanes have changed, throw out the existing stack and
  // prepare a fresh one. Otherwise we'll continue where we left off.
  if (wipRoot !== root || wipRootRenderLanes !== lanes){
    resetRenderTimer();

    // set wip to root.current
    prepareFreshStack(root, lanes);
  }

  // do{
    try{
      workLoopConcurrent();
      // break;
    } catch(thrownValue){
      handleError(root, thrownValue)
    }
  // } while(true) // Why do while?
  console.error('renderRootConcurrent');
  return;
  popDispatcher(prevDispatcher);//?

  // Check if the tree has completed.
  if ( wip !== null){
    // Still work remaining.
    return RootIncomplete;
  }  else {
    // Set this to null to indicate there's no in-progress render.
    wipRoot = null;
    wipRootRenderLanes = NoLanes;

    // Return the final exit status.
    return wipRootExitStatus;
  }
}

function workLoopConcurrent(){
  // Perform work until Scheduler asks us to yield
  while(wip !== null && !shouldYieldToHost()){
    performUnitOfWork(wip);
  }
}

function performUnitOfWork(unitOfWork){
  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const alternate = unitOfWork.alternate;

  let next = beginWork(alternate, unitOfWork, subtreeRenderLanes);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next == null){
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    // set wip to alternate.child and default the tag to 2;
    wip = next;
  }
  CurrentOwner.current = null;
}

function completeUnitOfWork(unitOfWork){
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
  let completedWork = unitOfWork;
  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // Check if the work completed or if something threw.
    if ((completedWork.flags & Incomplete) === NoFlags){
      let next;
      // Process alternate.child
      next = completeWork(current, completedWork, subtreeRenderLanes);
      if (next !== null){
        console.error('completeUnitOfWork1')
      }

    } else {
      console.error('completeUnitOfWork2')
    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      console.error('completeUnitOfWork3');
    }

    // Otherwise, return to the parent.
    completedWork = returnFiber;
    // Update the next thing we're working on in case something throws.
    wip = completedWork;
  } while (completedWork !== null);

  // We've reached the root.
  if (wipRootExitStatus === RootIncomplete) {
    wipRootExitStatus = RootCompleted;
  }
}

function commitRoot(root){
  const renderPriority = getCurrentPriority();

  runWithPriority(
    ImmediatePriority,
    commitRootImpl.bind(null, root, renderPriority),
  );
  return null;
}

function commitRootImpl(root, renderPriority){
  // Debug
  rootWithPendingPassiveEffects !== null ?
    console.error('commitRootImpl1'):'';

  do {
    flushPassiveEffects();
  } while (rootWithPendingPassiveEffects!==null);

  //TODO: Check if flushPassiveEffects() above will change executionContext.
  // If it changes, move this condition before do while condition.
  if((executionContext & (RenderContext | CommitContext)) === NoContext){
    console.error('Something is wrong here.');
  }

  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  if (finishedWork === null){
    console.error('commitRootImpl1:finishedWork shouldn\'t be null');
  }

  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  if (finishedWork === root.current){
    console.error('The same tree is being committed!')
  }

  // Why?
  root.callbackNode = null;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);

  if (rootsWithPendingDiscreteUpdates !== null){
    console.error('commitRootImpl3')
  }

  if (root === wipRoot) {
    console.error('commitRootImpl4')
  }

  const rootDoesHavePassiveEffects =
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags;
  if (rootDoesHavePassiveEffects){
    console.error('commitRootImpl5');
  }

  const subtreeHasEffects =
    (finishedWork.subtreeFlags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;
  const rootHasEffect =
    (finishedWork.flags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
  NoFlags;

  if(subtreeHasEffects || rootHasEffect){
    // The commit phase is broken into several sub-phases. We do a separate
    // pass of the effect list for each phase: all mutation effects come
    // before all layout effects, and so on.

    // The first phase a "before mutation" phase. We use this phase to read the
    // state of the host tree right before we mutate it. This is where
    // getSnapshotBeforeUpdate is called.
    commitBeforeMutationEffects(finishedWork);

    // The next phase is the mutation phase, where we mutate the host tree.
    commitMutationEffects(finishedWork, root, renderPriority)
    root.current = finishedWork;

    commitLayoutEffects(finishedWork, root);

  } else {
    console.error('commitRootImpl2')
  }
  remainingLanes = root.pendingLanes;
  if (remainingLanes !== NoLanes){
    console.error('commitRootImpl3');
  }
  if (remainingLanes === SyncLane){
    console.error('commitRootImpl5')
  } else {
    nestedUpdateCount = 0;
  }

  ensureRootIsScheduled(root, performance.now());

  return null;
}

export function flushPassiveEffects(){
  // Returns whether passive effects were flushed.
  if (pendingPassiveEffectsRenderPriority !== NoPriority){
    console.log('flushPassiveEffects2')
  }
  return false;
}


