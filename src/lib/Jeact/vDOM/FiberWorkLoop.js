import {
  NoFlags,
  NoLanes,
  NoTimestamp,
  ImmediatePriority,
  Incomplete,
  NoContext,
  RenderContext,
  CommitContext,
  DiscreteEventContext, 
  RetryAfterError,
  HostRoot,
  PassiveMask,
  BeforeMutationMask,
  MutationMask,
  LayoutMask,
  HostEffectMask,
} from '@Jeact/shared/Constants';
import {
  shouldYieldToHost,
  scheduleCallback,
  runWithPriority,
} from '@Jeact/scheduler';
import {
  mergeLanes,
  markStarvedLanesAsExpired,
  markRootUpdated,
  markRootFinished,
  markRootPinged,
  getNextLanes,
  isSubsetOfLanes,
  removeLanes,
  markRootSuspended,
  includesOnlyRetries,
} from '@Jeact/vDOM/FiberLane';
import {
  createWorkInProgress
} from '@Jeact/vDOM/Fiber';
import { beginWork } from '@Jeact/vDOM/FiberBeginWork';
import {
  completeWork
} from '@Jeact/vDOM/FiberCompleteWork';
import {
  commitBeforeMutationEffects,
  commitMutationEffects,
  commitLayoutEffects,
} from '@Jeact/vDOM/FiberCommitWork';
import {CurrentDispatcher} from '@Jeact/shared/internals';
import {throwException} from '@Jeact/vDOM/FiberThrow';
import {
  createCursor,
  push,
  pop
} from '@Jeact/vDOM/FiberStack';
import {unwindWork} from '@Jeact/vDOM/FiberUnwindWork';

const RootIncomplete = 0;
const RootFatalErrored = 1;
const RootErrored = 2;
const RootSuspended = 3;
const RootSuspendedWithDelay = 4;
const RootCompleted = 5;

let executionContext = NoContext;
let wipRoot = null;
let wip = null;
let wipRootRenderLanes = NoLanes;

export let subtreeRenderLanes = NoLanes;
const subtreeRenderLanesCursor = createCursor(NoLanes);

let wipRootExitStatus = RootIncomplete;
let wipRootFatalError = null;

let wipRootIncludedLanes = NoLanes;
let wipRootSkippedLanes = NoLanes;
let wipRootUpdatedLanes = NoLanes;
let wipRootPingedLanes = NoLanes;

let globalMostRecentFallbackTime = 0;
const FALLBACK_THROTTLE_MS = 500;

let rootDoesHavePassiveEffects = false;
let rootsWithPendingDiscreteUpdates = null;

let currentEventTime = NoTimestamp;
let currentEventWipLanes = NoLanes;
let currentEventTransitionLane = NoLanes;

export function requestEventTime(){
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext){
    // We're inside Jeact
    debugger;
  }
  // We're not inside Jeact, so we may be in the middle of a browser event like click.
  // TODO: explain why `currentEventTime` has been changed.
  if (currentEventTime !== NoTimestamp){
    debugger
    // Use the same start time for all updates until we enter Jeact again.
    return currentEventTime;
  }
  // First update.
  currentEventTime = performance.now();
  return currentEventTime;
}

export function scheduleUpdateOnFiber(fiber, lane, eventTime){
  // The code below is from markUpdateLaneFromFiberToRoot(), which is supposed 
  // to update all `fiber.lane`s. However, in current phrase of this version, 
  // fiber can only be the unprepared one without any children and parents.  
  // 
  // update fiber.lanes based on renderLanes;

  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const root = fiber.stateNode;

  // update root.pendingLanes, eventTimes etc.
  markRootUpdated(root, lane, eventTime);
  ensureRootIsScheduled(root, eventTime);

  return root;
}

function ensureRootIsScheduled(root, currentTime){
  const existingCallbackNode = root.callbackNode;

  // update root.expirationTime. 
  markStarvedLanesAsExpired(root, currentTime);

  const [nextLanes, nextLanesPriority] = getNextLanes(
    root, 
    root===wipRoot ? wipRootRenderLanes : NoLanes,
  );
  
  if (nextLanes === NoLanes){
     if (existingCallbackNode !== null){
       debugger;
     }
     return;
  }

  // Reuse existing task with the same priority.
  const existingCallbackPriority = root.callbackPriority;
  if (existingCallbackPriority === nextLanesPriority){
    return;
  }

  if (nextLanesPriority !==1) debugger;

  let newCallbackNode = scheduleCallback(
    nextLanesPriority,
    performConcurrentWorkOnRoot.bind(null, root),
  )

  root.callbackPriority = nextLanesPriority;
  root.callbackNode = newCallbackNode;
}

// Entry point for every concurrent task, i.e. anything that
// goes through Scheduler.
function performConcurrentWorkOnRoot(root){
  // TODO: explain why reset it is necessary like when it will be misused.
  currentEventTime = NoTimestamp;
  currentEventWipLanes = NoLanes;
  currentEventTransitionLane = NoLanes;


  const originalCallbackNode = root.callbackNode;

  let [lanes] = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  )

  let exitStatus = renderRootConcurrent(root, lanes);  
  if(exitStatus !== RootIncomplete){
    if(exitStatus === RootErrored || exitStatus===RootFatalErrored){
      executionContext |= RetryAfterError;
      return null;
    }

    // now we have a consistent tree.
    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root, exitStatus, lanes);
  }
  //schedule to finish extra work scheduled in Render Phase
  ensureRootIsScheduled(root, performance.now());
  if (root.callbackNode === originalCallbackNode){
    // Continue expired tasks.
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  return null;
}

function finishConcurrentRender(root, exitStatus, lanes){
  switch (exitStatus){
    case RootCompleted:{
      commitRoot(root);
      break;
    }
    case RootSuspended:{  
      markRootSuspended(root, lanes);

      // figure out if we should immediately commit it or wait a bit.
      if(
        includesOnlyRetries(lanes)
      ){
        const msUntilTimeout = globalMostRecentFallbackTime + FALLBACK_THROTTLE_MS - performance.now();
        if(msUntilTimeout > 10){
          debugger;
        }

      }
      commitRoot(root);
      break;
    }
    default:{
      debugger
      console.error('finishConcurrentRender', exitStatus)
    }
  }
}

export function pushRenderLanes(fiber, lanes){
  push(subtreeRenderLanesCursor, subtreeRenderLanes, fiber);
  subtreeRenderLanes = mergeLanes(subtreeRenderLanes, lanes);
  wipRootIncludedLanes = mergeLanes(
    wipRootIncludedLanes,
    lanes,
  );
}

export function popRenderLanes(fiber){
  subtreeRenderLanes = subtreeRenderLanesCursor.current;
  pop(subtreeRenderLanesCursor, fiber);
}

function prepareFreshStack(root, lanes){
  // to keep next stack fresh.
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  if (wip !== null){
    debugger;
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
    let erroredWork = wip;
    try {
      throwException(
        root,
        erroredWork.return,
        erroredWork,
        thrownValue,
        wipRootRenderLanes
      );
      completeUnitOfWork(erroredWork);
    } catch (yetAnotherThrownValue){
      console.error('x', yetAnotherThrownValue);
      debugger;
    }
}

export function markSkippedUpdateLanes(lane){
  wipRootSkippedLanes = mergeLanes(
    lane, 
    wipRootSkippedLanes,
  )
}

export function renderDidSuspend(){
  if(wipRootExitStatus === RootIncomplete){
    wipRootExitStatus = RootSuspended;
  }
}

export function renderDidError(){
  if (wipRootExitStatus !== RootCompleted){
    wipRootExitStatus = RootErrored;
  }
}

function renderRootConcurrent(root, lanes){
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  const prevDispatcher = CurrentDispatcher.current;

  // If the root or lanes have changed, throw out the existing stack
  // and prepare a fresh one. Otherwise we'll continue where we left off.
  if (wipRoot !== root || wipRootRenderLanes !== lanes){
    //create a new FiberNode by cloning root.current and set it to wip.
    prepareFreshStack(root, lanes);
  }
  //Keep trying until all caught error handled.
  do{
    try {
      workLoopConcurrent();
      break;
    } catch(thrownValue){
      handleError(root, thrownValue);
    }
  } while (true);
  
  executionContext = prevExecutionContext;
  
  return wipRootExitStatus;
}

function workLoopConcurrent(){
  // Perform work until Scheduler asks us to yield
  while(wip !== null && !shouldYieldToHost()){
    performUnitOfWork(wip);
  }
}

function performUnitOfWork(unitOfWork){
  const current = unitOfWork.alternate;
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null){
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    wip = next;
  }
}
// set stateNode to domInstance and append all children, build effects list.
function completeUnitOfWork(unitOfWork){
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    if ((completedWork.flags & Incomplete) === NoFlags){      
      let next = completeWork(current, completedWork, subtreeRenderLanes);
      if (next !== null) {
        wip = next;
        return;
      }
    } else {
      // Error threw
      const next = unwindWork(completedWork, subtreeRenderLanes);

      if (next !== null){
        // Error fixed and return to normal render phase.
        next.flags &= HostEffectMask;
        wip = next;
        return;
      }

      if (returnFiber!==null){
        returnFiber.flags |= Incomplete;
        returnFiber.subtreeFlags = NoFlags;
        returnFiber.deletions = null;
      }

    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      wip = siblingFiber;
      return;
    }
    completedWork = returnFiber;
    // when reached the root, returnFiber is null, set wip to null to make sure performUnitOfWork() in workLoopConcurrent() wont keep running.
    wip = completedWork;
  } while (completedWork !== null);

  // We've reached the root.
  if (wipRootExitStatus === RootIncomplete) {
    wipRootExitStatus = RootCompleted;
  }
}

function commitRoot(root){
    commitRootImpl(root, ImmediatePriority)
}

function commitRootImpl(root, renderPriority){
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  if (finishedWork === null){
    debugger;
  }
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  root.callbackNode = null;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  //update lanes and eventTimes
  markRootFinished(root, remainingLanes);  

  if (root === wipRoot){
    wipRoot = null;
    wipRootRenderLanes = NoLanes;
  }

  if((finishedWork.subtreeFlags & PassiveMask)!== NoFlags ||
      (finishedWork.flags & PassiveMask) !== NoFlags
    ){
    debugger;
  }

  const subtreeHasEffects = 
    (finishedWork.subtreeFlags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== 
    NoFlags;
  const rootHasEffect = (finishedWork.flags &
    (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;

  if (subtreeHasEffects || rootHasEffect){
    const prevExecutionContext= executionContext;
    executionContext |= CommitContext;
    commitBeforeMutationEffects(finishedWork);
    commitMutationEffects(root, renderPriority, finishedWork);
    root.current = finishedWork;
    commitLayoutEffects(finishedWork, root, lanes);
    executionContext = prevExecutionContext;
  } else {
    // No effects.
    root.current = finishedWork;
  }

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if (rootDoesHavePassiveEffects){
    debugger;
  }

  ensureRootIsScheduled(root, performance.now())

  return null;
}
export function pingSuspendedRoot(root, wakeable, pingedLanes){
  const pingCache = root.pingCache;
  if (pingCache !== null){
    pingCache.delete(wakeable);
  }
  const eventTime = requestEventTime();
  markRootPinged(root, pingedLanes, eventTime);

  if (
    wipRoot === root &&
    isSubsetOfLanes(wipRootRenderLanes, pingedLanes)
  ){
    
    if(
      wipRootExitStatus === RootSuspendedWithDelay ||
      wipRootExitStatus === RootSuspended
    )
    {// More conditions above.
      debugger;
    } else {
      wipRootPingedLanes = mergeLanes(
        wipRootPingedLanes,
        pingedLanes,
      )
    }
  }

  ensureRootIsScheduled(root, eventTime);
}
export function updateEventWipLanes(){
  if (currentEventWipLanes === NoLanes){
    if (wipRootIncludedLanes !== NoLanes) debugger;
    currentEventWipLanes = wipRootIncludedLanes;
  }
}

export function updateExecutionContext(){
  executionContext |= DiscreteEventContext;
}