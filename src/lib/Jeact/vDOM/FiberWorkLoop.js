import {
  NoFlags,
  NoLane,
  NoLanes,
  NoTimestamp,
  Incomplete,
  NoContext,
  RenderContext,
  CommitContext, 
  HostRoot,
  PassiveMask,
  BeforeMutationMask,
  MutationMask,
  LayoutMask,
  HostEffectMask,
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
  getNextLanes,
  markRootSuspended,
  claimNextRetryLane,
  getHighestPriorityLane,
} from '@Jeact/vDOM/FiberLane';
import {createWorkInProgress} from '@Jeact/vDOM/Fiber';
import {beginWork} from '@Jeact/vDOM/FiberBeginWork';
import {completeWork} from '@Jeact/vDOM/FiberCompleteWork';
import {
  commitBeforeMutationEffects,
  commitMutationEffects,
  commitLayoutEffects,
  commitPassiveUnmountEffects,
  commitPassiveMountEffects,
} from '@Jeact/vDOM/FiberCommitWork';
import {throwException} from '@Jeact/vDOM/FiberThrow';
import {
  createCursor,
  push,
  pop
} from '@Jeact/vDOM/FiberStack';
import {unwindWork} from '@Jeact/vDOM/FiberUnwindWork';

const RootIncomplete = 0;
const RootCompleted = 1;
const RootSuspended = 2;
const RootErrored = 3;

let executionContext = NoContext;
let wipRoot = null;
let wip = null;
let wipRootRenderLanes = NoLanes;
// Most work in the work loop should deal with wipRootRenderLanes, however, 
// most work in begin/complete phase should deal with subtreeRenderLanes.
export let subtreeRenderLanes = NoLanes;
const subtreeRenderLanesCursor = createCursor(NoLanes);

let wipRootExitStatus = RootIncomplete;
// Lanes that *were* worked on during this render.
let wipRootIncludedLanes = NoLanes;
let wipRootSkippedLanes = NoLanes;
let wipRootUpdatedLanes = NoLanes;
let wipRootPingedLanes = NoLanes;

let rootDoesHavePassiveEffects = false;
let rootWithPendingPassiveEffects = null;
let pendingPassiveEffectsLanes = NoLanes;

let currentEventTime = NoTimestamp;
let currentEventTransitionLane = NoLanes;

export function requestEventTime(){
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext){
    return performance.now();
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
  const root = markUpdateLaneFromChildToRoot(fiber, lane);
  // update root.pendingLanes, eventTimes etc.
  markRootUpdated(root, lane, eventTime);
  ensureRootIsScheduled(root, eventTime);

  return root;
}

function markUpdateLaneFromChildToRoot(sourceFiber, lane){
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
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  );

  if (nextLanes === NoLanes){
     return;
  }

  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  // Reuse existing task with the same priority.
  const existingCallbackPriority = root.callbackPriority;
  if (existingCallbackPriority === newCallbackPriority){
    return;
  }

  let newCallbackNode = scheduleCallback(
    performConcurrentWorkOnRoot.bind(null, root),
  )

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
    if(exitStatus === RootErrored){
      executionContext |= RootErrored;
      debugger;
      return null;
    }

    // now we have a consistent tree and ready to commit.
    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root, exitStatus, lanes);
  }
  //schedule new tasks found in Render Phase
  ensureRootIsScheduled(root, performance.now());
  // root.callbackNode is always relevant to a task which hasn't completely 
  // finished due to expiration or some other reasons and it will be set to 
  // null in Commit Phase.
  if (root.callbackNode === originalCallbackNode){
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
  push(subtreeRenderLanesCursor, subtreeRenderLanes);
  subtreeRenderLanes = mergeLanes(subtreeRenderLanes, lanes);
  wipRootIncludedLanes = mergeLanes(
    wipRootIncludedLanes,
    lanes,
  );
}

export function popRenderLanes(){
  subtreeRenderLanes = subtreeRenderLanesCursor.current;
  pop(subtreeRenderLanesCursor);
}

function prepareFreshStack(root, lanes){
  wipRoot = root;
  wip = createWorkInProgress(root.current);
  wipRootRenderLanes = subtreeRenderLanes =
    wipRootIncludedLanes = lanes;
  wipRootExitStatus = RootIncomplete;
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
      console.error(yetAnotherThrownValue);
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
  //Keep trying until all caught errors handled.
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
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

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

  // schedule a callback to process pending passive effects.
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ){
    if(!rootDoesHavePassiveEffects){
      rootDoesHavePassiveEffects = true;
      scheduleCallback(()=>{
        flushPassiveEffects();
        return null;
      })
    }
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
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
  }

  ensureRootIsScheduled(root, performance.now())
}

function flushPassiveEffects(){
  if (pendingPassiveEffectsLanes !== NoLanes){
    flushPassiveEffectsImpl();
  }
  return false;
}

function flushPassiveEffectsImpl(){
  const root = rootWithPendingPassiveEffects;
  const lanes = pendingPassiveEffectsLanes;
  rootWithPendingPassiveEffects = null;
  pendingPassiveEffectsLanes = NoLanes;

  const prevExecutionContext = executionContext;
  executionContext |= CommitContext;

  commitPassiveUnmountEffects(root.current);
  commitPassiveMountEffects(root, root.current);

  executionContext = prevExecutionContext;
}

export function pingSuspendedRoot(root, wakeable, pingedLanes){
  // The earliest attach to catch the change from Promise. And to resolve 
  // Suspended Lanes before Commit Phase.
  const pingCache = root.pingCache;
  if (pingCache !== null){
    pingCache.delete(wakeable);
  }
  const eventTime = requestEventTime();

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
  const root = markUpdateLaneFromChildToRoot(boundaryFiber, retryLane);
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
