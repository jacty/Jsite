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
  LayoutMask
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
  getNextLanes,
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

const RootIncomplete = 0;
const RootFatalErrored = 1;
const RootErrored = 2;
const RootCompleted = 5;

let executionContext = NoContext;
let wipRoot = null;
let wip = null;
let wipRootRenderLanes = NoLanes;

export let subtreeRenderLanes = NoLanes;

let wipRootExitStatus = RootIncomplete;
let wipRootFatalError = null;

let wipRootIncludedLanes = NoLanes;
let wipRootSkippedLanes = NoLanes;
let wipRootUpdatedLanes = NoLanes;

let rootDoesHavePassiveEffects = false;
let rootsWithPendingDiscreteUpdates = null;

let currentEventTime = NoTimestamp;
let currentEventWipLanes = NoLanes;

export function requestEventTime(){
  // This is the first update.
  if (executionContext&(RenderContext|CommitContext)!==NoContext){
    // We're inside Jeact, so it's fine to read the actual time.
    console.error('Error in requestEventTime')
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
    debugger;
    return null;
  } 
  // update root.pendingLane, eventTimes etc.
  markRootUpdated(root, lane, eventTime);
  if(root === wipRoot){
    debugger;
  }

  if((executionContext & DiscreteEventContext)!==NoContext){
    if(rootsWithPendingDiscreteUpdates === null){
      rootsWithPendingDiscreteUpdates = new Set([root]);
    } else {
      rootsWithPendingDiscreteUpdates.add(root);
    }
  }

  ensureRootIsScheduled(root, eventTime);

  return root;
}

function markUpdateLaneFromFiberToRoot(fiber, lane){
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  let alternate = fiber.alternate;
  if(alternate!==null){
    debugger;
  }

  let node = fiber;
  let parent = fiber.return;
  while(parent!==null){
    debugger;
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    if (alternate !== null){
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }

    node = parent;
    parent = parent.return;
  }


  if(node.tag === HostRoot){
    return node.stateNode;
  }
  return null;
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

  // Reuse existing task if there is.
  if (existingCallbackNode !== null){
    return;
  }

  let newCallbackNode = scheduleCallback(
    nextLanesPriority,
    performConcurrentWorkOnRoot.bind(null, root),
  )

  root.callbackNode = newCallbackNode;
}

// Entry point for every concurrent task, i.e. anything that
// goes through Scheduler.
function performConcurrentWorkOnRoot(root){
  currentEventTime = NoTimestamp;
  currentEventWipLanes = NoLanes;

  const originalCallbackNode = root.callbackNode;

  let [lanes] = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  )

  let exitStatus = renderRootConcurrent(root, lanes);  
  if(exitStatus !== RootIncomplete){
    if(exitStatus === RootErrored || exitStatus===RootFatalErrored){
      console.error('Error')
      executionContext |= RetryAfterError;
      return null;
    }
    // now we have a consistent tree.
    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root, exitStatus);
  }
  //schedule to finish Incomplete work.
  ensureRootIsScheduled(root, performance.now());
  if (exitStatus!==RootCompleted){
    // Continue expired tasks.
    return performConcurrentWorkOnRoot.bind(null, root, lanes);
  }
  return null;
}

function finishConcurrentRender(root, exitStatus){
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

function prepareFreshStack(root, updateLanes){
  // to keep next stack fresh.
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  if (wip !== null){
    debugger;
  }
  wipRoot = root;
  wip = createWorkInProgress(root.current);
  wipRootRenderLanes = subtreeRenderLanes =
    wipRootIncludedLanes = updateLanes;
  wipRootExitStatus = RootIncomplete;
  wipRootFatalError = null;
  wipRootSkippedLanes = NoLanes;
  wipRootUpdatedLanes = NoLanes;
}

export function markSkippedUpdateLanes(lane){
  wipRootSkippedLanes = mergeLanes(
    lane, 
    wipRootSkippedLanes,
  )
}

function renderRootConcurrent(root, updateLanes){
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  const prevDispatcher = CurrentDispatcher.current;
  
  // If the root or lanes have changed, throw out the existing stack
  // and prepare a fresh one. Otherwise we'll continue where we left off.
  if (wipRoot !== root || wipRootRenderLanes !== updateLanes){
    //create a new FiberNode by cloning root.current and set it to wip.
    prepareFreshStack(root, updateLanes);
  }

  //Keep trying until all caught error handled.
    try {
      workLoopConcurrent();
    } catch(thrownValue){
      console.error('Err:',thrownValue);
      wip = null;
      wipRootExitStatus = RootErrored;
    }

  executionContext = prevExecutionContext;
  // Check if the tree has completed.
  if ( wip !== null){
    return RootIncomplete;
  }  else {
    // Set this to null to indicate there's no in-progress render.
    wipRoot = null;
    wipRootRenderLanes = NoLanes;

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
        console.error('x');
        wip = next;
        return;
      }
    } else {
      console.error('completeUnitOfWork2')
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
  runWithPriority(
    commitRootImpl.bind(null, root, ImmediatePriority)
  );
  return null;
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
  markRootFinished(root, remainingLanes);  debugger;
  if((finishedWork.subtreeFlags & PassiveMask)!== NoFlags ||
      (finishedWork.flags & PassiveMask) !== NoFlags
    ){
    console.error('y');
  }
  const subtreeHasEffects = (finishedWork.subtreeFlags &
    (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== NoFlags;
  const rootHasEffect = (finishedWork.flags &
    (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== NoFlags;

  if (subtreeHasEffects || rootHasEffect){
    const prevExecutionContext= executionContext;
    executionContext |= CommitContext;
    commitBeforeMutationEffects(finishedWork);
    commitMutationEffects(root, finishedWork);
    root.current = finishedWork;
    commitLayoutEffects(finishedWork, root, lanes);
    executionContext = prevExecutionContext;
  } else {
    debugger;
  }

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if (rootDoesHavePassiveEffects){
    debugger;
  }

  return null;
}

export function updateEventWipLanes(){
  if (currentEventWipLanes === NoLanes){
    currentEventWipLanes = wipRootIncludedLanes;
  }
}

export function updateExecutionContext(){
  executionContext |= DiscreteEventContext;
}