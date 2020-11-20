import {
  __ENV__,
  NoFlags,
  NoLanes,
//   DiscreteEventContext,
  NoTimestamp,
  HostRoot,
  NormalSchedulePriority,
  NoPriority,
  NormalPriority,
//   Incomplete,
  noTimeout,
  NoContext,
  RenderContext,
  CommitContext,
} from '@Jeact/shared/Constants';
import {
  CurrentBatchConfig,
  CurrentOwner,
  CurrentDispatcher
} from '@Jeact/shared/internals';
import {
  setCurrentDebugFiberInDev,
  resetCurrentDebugFiberInDev,
} from '@Jeact/dev/CurrentFiber'
import {
  getCurrentSchedulePriority,
  PriorityToLanePriority,
  shouldYieldToHost,
  scheduleCallback
} from '@Jeact/scheduler';
import {
  findUpdateLane,
  mergeLanes,
  getNextLanes,
  getNextLanesPriority,
  markStarvedLanesAsExpired,
  markRootUpdated,
  LanePriorityToPriority,
} from '@Jeact/vDOM/FiberLane';
import {
  createWorkInProgress
} from '@Jeact/vDOM/Fiber';
import {
  ContextOnlyDispatcher,
} from '@Jeact/vDOM/FiberHooks';
import { beginWork } from '@Jeact/vDOM/FiberBeginWork';
// import {
//   completeWork
// } from '@Jeact/vDom/FiberCompleteWork';
// import { invariant } from '@Jeact/shared/invariant';

const RootIncomplete = 0;
// const RootCompleted = 5;

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

let wipRootPingedLanes = NoLanes;
let mostRecentlyUpdatedRoot = null;
let wipRootRenderTargetTime = Infinity;
const RENDER_TIMEOUT = 500;

function resetRenderTimer(){
  wipRootRenderTargetTime = performance.now() + RENDER_TIMEOUT;
}

// let rootWithPendingPassiveEffects = null;
let pendingPassiveEffectsRenderPriority = NoPriority;
// let rootsWithPendingDiscreteUpdates = null;

// Use these to prevent an infinite loop of nested updates
// const NESTED_UPDATE_LIMIT = 50;
// let nestedUpdateCount = 0;
// let rootWithNestedUpdates = null

// const NESTED_PASSIVE_UPDATE_LIMIT = 50;
// let nestedPassiveUpdateCount = 0;


let currentEventTime = NoTimestamp;
let currentEventWipLanes = NoLanes;
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
    console.warn('We\'re inside Jeact');
    return performance.now();
  }
  // We're not inside Jeact, so we may be in the middle of a browser event.
  if (currentEventTime !== NoTimestamp){
    console.warn('We may be in a browser event');
    // Use the same start time for all updates until we enter Jeact again.
    return currentEventTime;
  }

  // This is the first update since Jeact yield. Compute a new start time.
  currentEventTime = performance.now();

  return currentEventTime;
}

export function requestUpdateLane(fiber){
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
  // Update fiber.lanes
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  if (root === null){
    console.error('scheduleUpdateOnFiber1')
  }
  // update root.pendingLane, eventTimes etc.
  markRootUpdated(root, lane, eventTime);

  if(wipRoot){
    console.error('scheduleUpdateOnFiber2', wipRoot)
  }
  if(lane!==512||executionContext!==0){
    console.error('scheduleUpdateOnFiber3')
  }

  // Schedule other updates after in case the callback is sync.
  ensureRootIsScheduled(root, eventTime);

  mostRecentlyUpdatedRoot = root;// should be used in requestUpdatelane for a transition.
}

function markUpdateLaneFromFiberToRoot(fiber, lane){
  if (fiber.tag !== HostRoot){
    console.error('markUpdateLaneFromFiberToRoot1')
  }

  //Update the source fiber's lanes
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate;
  if (alternate!== null){
    console.error('markUpdateLaneFromFiberToRoot2')
  }
  if (__ENV__){
    if(alternate === null&& fiber.flags !== NoFlags){
      console.error('markUpdateLaneFromFiberToRoot3', fiber.flags)
    }
  }

  // Walk the parent path to the root and update the child expiration time.
  let parent = fiber.return;
  if(parent!==null){
    console.log('markUpdateLaneFromFiberToRoot3', parent);
  }

  return fiber.stateNode;
}

// Use this function to schedule a task for a root. There's only one task per root; if a task was already scheduled, we'll check to make sure the priority of the existing task is the same as the priority of the next level that the root has worked on. This function is called on every update, and right before existing a task.
function ensureRootIsScheduled(root, currentTime){
  const existingCallbackNode = root.callbackNode;
  // update root.expirationTime
  markStarvedLanesAsExpired(root, currentTime);

  // Determine the next lanes to work on, and their priority.
  const nextLanes = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  );

  if (nextLanes === NoLanes){
    console.log('ensureRootIsScheduled1');
  }

  // Check if there's an existing task we may be able to reuse it.
  if (existingCallbackNode !== null){
    console.error('ensureRootIsScheduled2')
    return;
  }

  const newCallbackPriority = getNextLanesPriority();

  // Schedule a new callback.
  let newCallbackNode;
  if (newCallbackPriority !== 8){// DefaultLanePriority:8
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

  if(executionContext !== NoContext){
    console.error('performConcurrentWorkOnRoot1')
  };

  // Flush any pending passive effects before deciding which lanes to work on,
  // in case they schedule additional work.
  const originalCallbackNode = root.callbackNode;
  const didFlushPassiveEffects = flushPassiveEffects();
  if (didFlushPassiveEffects){
    console.log('performConcurrentWorkOnRoot2')
  }

  // Determine the next expiration time to work on, using the fields stored on the root.
  let lanes = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  );
  if (lanes === NoLanes){
    console.error('performConcurrentWorkOnRoot3')
  }

  let exitStatus = renderRootConcurrent(root, lanes);
  !!exitStatus?
    console.error('performConcurrentWorkOnRoot', exitStatus):'';
  return;
//   // We now have a consistent tree. The next step is to commit it.
//   const finishedWork = root.current.alternate;
//   root.finishedWork = finishedWork;
//   root.finishedLanes = lanes;
//   finishConcurrentRender(root, exitStatus, lanes);
}

// function finishConcurrentRender(root, exitStatus, lanes){
//   switch (exitStatus){
//     case RootCompleted:{
//       commitRoot(root);
//       break;
//     }
//     default:{
//       console.error('finishConcurrentRender', exitStatus)
//     }
//   }
// }

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

// function popDispatcher(prevDispatcher){
//   JeactCurrentDispatcher.current = prevDispatcher;
// }


export function markSkippedUpdateLanes(lane){
  wipRootSkippedLanes = mergeLanes(
    lane,
    wipRootSkippedLanes,
  )
}

function renderRootConcurrent(root, lanes){
  if (executionContext!==0){//debug
    console.error('renderRootConcurrent1')
  }
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  const prevDispatcher = pushDispatcher();

  if (wipRoot !== root || wipRootRenderLanes !== lanes){
    resetRenderTimer();
    // create a new Node by copying root.current
    prepareFreshStack(root, lanes);
  }

  workLoopConcurrent()
  
  console.error('renderRootConcurrent');
  return;
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
  const current = unitOfWork.alternate;
  if(__ENV__){
    setCurrentDebugFiberInDev(unitOfWork);    
  }
  let next = beginWork(unitOfWork, subtreeRenderLanes);

  if(__ENV__){
    resetCurrentDebugFiberInDev()
  }

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next == null){
    // If this doesn't spawn new work, complete the current work.
    console.error('performUnitOfWork1')
    // completeUnitOfWork(unitOfWork);
  } else {
    wip = next;
  }
  CurrentOwner.current = null;
}

function completeUnitOfWork(unitOfWork){

  // Attempt to complete the current unit of work, then move to the next
//   // sibling. If there are no more siblings, return to the parent fiber.
  let completedWork = unitOfWork;
  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // Check if the work completed or if something threw.
    if ((completedWork.flags & Incomplete) === NoFlags){
      // Process alternate.child
      let next = completeWork(completedWork, subtreeRenderLanes);
      if (next !== null){
        console.error('completeUnitOfWork1', next)
      }
    } else {
      console.error('completeUnitOfWork2')
    }

//     const siblingFiber = completedWork.sibling;
//     if (siblingFiber !== null) {
//       console.error('completeUnitOfWork3');
//     }

    // Otherwise, return to the parent.
    completedWork = returnFiber;
    // Update the next thing we're working on in case something throws.
    wip = completedWork;
  } while (completedWork !== null);

//   // We've reached the root.
//   if (wipRootExitStatus === RootIncomplete) {
//     wipRootExitStatus = RootCompleted;
//   }
}

// function commitRoot(root){
//   const renderPriority = getCurrentPriority();

//   runWithPriority(
//     ImmediatePriority,
//     commitRootImpl.bind(null, root, renderPriority),
//   );
//   return null;
// }

// function commitRootImpl(root, renderPriority){
//   // Debug
//   rootWithPendingPassiveEffects !== null ?
//     console.error('commitRootImpl1'):'';

//   do {
//     flushPassiveEffects();
//   } while (rootWithPendingPassiveEffects!==null);

//   //TODO: Check if flushPassiveEffects() above will change executionContext.
//   // If it changes, move this condition before do while condition.
//   if((executionContext & (RenderContext | CommitContext)) === NoContext){
//     console.error('Something is wrong here.');
//   }

//   const finishedWork = root.finishedWork;
//   const lanes = root.finishedLanes;

//   if (finishedWork === null){
//     console.error('commitRootImpl1:finishedWork shouldn\'t be null');
//   }

//   root.finishedWork = null;
//   root.finishedLanes = NoLanes;

//   if (finishedWork === root.current){
//     console.error('The same tree is being committed!')
//   }

//   // Why?
//   root.callbackNode = null;

//   let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
//   markRootFinished(root, remainingLanes);

//   if (rootsWithPendingDiscreteUpdates !== null){
//     console.error('commitRootImpl3')
//   }

//   if (root === wipRoot) {
//     console.error('commitRootImpl4')
//   }

//   const rootDoesHavePassiveEffects =
//     (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
//     (finishedWork.flags & PassiveMask) !== NoFlags;
//   if (rootDoesHavePassiveEffects){
//     console.error('commitRootImpl5');
//   }

//   const subtreeHasEffects =
//     (finishedWork.subtreeFlags &
//       (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
//     NoFlags;
//   const rootHasEffect =
//     (finishedWork.flags &
//       (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
//   NoFlags;

//   if(subtreeHasEffects || rootHasEffect){
//     // The commit phase is broken into several sub-phases. We do a separate
//     // pass of the effect list for each phase: all mutation effects come
//     // before all layout effects, and so on.

//     // The first phase a "before mutation" phase. We use this phase to read the
//     // state of the host tree right before we mutate it. This is where
//     // getSnapshotBeforeUpdate is called.
//     commitBeforeMutationEffects(finishedWork);

//     // The next phase is the mutation phase, where we mutate the host tree.
//     commitMutationEffects(finishedWork, root, renderPriority)
//     root.current = finishedWork;

//     commitLayoutEffects(finishedWork, root);

//   } else {
//     console.error('commitRootImpl2')
//   }
//   remainingLanes = root.pendingLanes;
//   if (remainingLanes !== NoLanes){
//     console.error('commitRootImpl3');
//   }
//   if (remainingLanes === SyncLane){
//     console.error('commitRootImpl5')
//   } else {
//     nestedUpdateCount = 0;
//   }

//   ensureRootIsScheduled(root, performance.now());

//   return null;
// }

export function flushPassiveEffects(){
  // Returns whether passive effects were flushed.
  if (pendingPassiveEffectsRenderPriority !== NoPriority){
    console.log('flushPassiveEffects2')
  }
  return false;
}

