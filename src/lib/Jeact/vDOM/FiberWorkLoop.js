import {
  NoFlags,
  NoLane,
  NoLanes,
  NoTimestamp,
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
  SyncLane,
  NormalSchedulePriority,
} from '@Jeact/shared/Constants';
import {
  shouldYieldToHost,
  scheduleCallback
} from '@Jeact/scheduler';
import {
  mergeLanes,
  markStarvedLanesAsExpired,
  markRootUpdated,
  markRootFinished,
  markRootPinged,
  getNextLanes,
  isSubsetOfLanes,
  markRootSuspended,
  includesOnlyRetries,
  claimNextRetryLane,
  getHighestPriorityLane,
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
import {throwException} from '@Jeact/vDOM/FiberThrow';
import {
  createCursor,
  push,
  pop
} from '@Jeact/vDOM/FiberStack';
import {unwindWork} from '@Jeact/vDOM/FiberUnwindWork';
import {
  DiscreteEventPriority,
  ContinuousEventPriority,
  DefaultEventPriority,
  IdleEventPriority,
  lanesToEventPriority,
} from '@Jeact/vDOM/events/EventPriorities';
import {
  getCurrentUpdatePriority
} from '@Jeact/vDOM/UpdatePriorities';

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
let currentEventTransitionLane = NoLanes;

export function requestEventTime(){
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext){
    // We're inside Jeact
    debugger;
  }
  // We're not inside Jeact, so we may be in the middle of a browser event like click.
  if (currentEventTime !== NoTimestamp){
    // Use the same start time for all updates until we enter Jeact again.
    return currentEventTime;
  }
  // First update.
  currentEventTime = performance.now();
  return currentEventTime;
}

export function scheduleUpdateOnFiber(fiber, lane, eventTime){
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if(root === null){
    return null;
  } 
  // update root.pendingLanes, eventTimes etc.
  markRootUpdated(root, lane, eventTime);

  if (root === wipRoot){
    debugger;
  }
  if (lane === SyncLane){
    debugger;
  }

  ensureRootIsScheduled(root, eventTime);

  return root;
}

function markUpdateLaneFromFiberToRoot(sourceFiber, lane){
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  let alternate = sourceFiber.alternate;
  if (alternate !== null){
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
  let node = sourceFiber;
  let parent = sourceFiber.return;
  while(parent !== null){
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    if(alternate !== null){
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }
    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot){
    return node.stateNode
  } 
  return null;
}

function ensureRootIsScheduled(root, currentTime){
  const existingCallbackNode = root.callbackNode;
  // update root.expirationTime. 
  markStarvedLanesAsExpired(root, currentTime);

  const nextLanes = getNextLanes(
    root, 
    root===wipRoot ? wipRootRenderLanes : NoLanes,
  );

  if (nextLanes === NoLanes){
     if (existingCallbackNode !== null){
       debugger;
     }
     root.callbackNode = null;
     root.callbackPriority = NoLane;
     return;
  }

  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  // Reuse existing task with the same priority.
  const existingCallbackPriority = root.callbackPriority;
  if (existingCallbackPriority === newCallbackPriority){
    return;
  }

  if (existingCallbackNode !== null) debugger;

  let newCallbackNode;
  if (newCallbackPriority === SyncLane){
    debugger;
  } else {
    let schedulerPriorityLevel;
    switch(lanesToEventPriority(nextLanes)){
      case DiscreteEventContext:
        debugger;
        schedulerPriorityLevel = ImmediateSchedulePriority;
        break;
      case ContinuousEventPriority:
        debugger;
        schedulerPriorityLevel = UserBlockingSchedulePriority;
        break;
      case DefaultEventPriority:
        schedulerPriorityLevel = NormalSchedulePriority;
        break;
      case IdleEventPriority:
        debugger;
        schedulerPriorityLevel = IdleSchedulePriority;
        break;
      default:
        schedulerPriorityLevel = NormalSchedulePriority;
        break;        
    }
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    )
  }

  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}

// Entry point for every concurrent task, i.e. anything that
// goes through Scheduler.
function performConcurrentWorkOnRoot(root){
  currentEventTime = NoTimestamp;
  currentEventTransitionLane = NoLanes;

  const originalCallbackNode = root.callbackNode;

  let lanes = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  )

  let exitStatus = renderRootConcurrent(root, lanes);  
  if(exitStatus !== RootIncomplete){
    if(exitStatus === RootErrored || exitStatus===RootFatalErrored){
      executionContext |= RetryAfterError;
      debugger;
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
      // work expired. Commit immediately.
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

  if(wip !== null){
    return RootIncomplete;
  }

  wipRoot = null;
  wipRootRenderLanes = NoLanes

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

function completeUnitOfWork(unitOfWork){
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
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
    const updateLanePriority = getCurrentUpdatePriority();
    commitRootImpl(root, updateLanePriority)
}

function commitRootImpl(root, renderPriority){
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  if (finishedWork === null){
    debugger;
    return null;
  }
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  root.callbackNode = null;
  root.callbackPriority = NoLane;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
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
  const rootHasEffect = 
    (finishedWork.flags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;

  if (subtreeHasEffects || rootHasEffect){
    const prevExecutionContext= executionContext;
    executionContext |= CommitContext;

    commitBeforeMutationEffects(finishedWork);

    commitMutationEffects(root, finishedWork);

    commitLayoutEffects(finishedWork, root, lanes);
    executionContext = prevExecutionContext;
  } 

  root.current = finishedWork;
  
  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if (rootDoesHavePassiveEffects){
    debugger;
    }

  // Read this again, since an effect might have updated it.

  ensureRootIsScheduled(root, performance.now())

}
export function pingSuspendedRoot(root, wakeable, pingedLanes){
  // The earliest attach to catch the change from Promise.
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
    debugger;
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

function retryTimedOutBoundary(boundaryFiber, retryLane=NoLane){
  // The boundary fiber (Suspense) previously was rendered in its fallback 
  // state. One of the promises that suspended is has resolved and try 
  // rendering again at a new expiration time.
  if (retryLane === NoLane) {
    retryLane = claimNextRetryLane();
  }
  const eventTime = requestEventTime();
  const root = markUpdateLaneFromFiberToRoot(boundaryFiber, retryLane);
  if (root !== null){
    markRootUpdated(root, retryLane, eventTime);
    ensureRootIsScheduled(root, eventTime);
  }
}

export function resolveRetryWakeable(boundaryFiber, wakeable){
  let retryCache = boundaryFiber.stateNode;
  if(retryCache !== null){
    retryCache.delete(wakeable);
  }
  retryTimedOutBoundary(boundaryFiber);
}

export function updateExecutionContext(){
  executionContext |= DiscreteEventContext;
}