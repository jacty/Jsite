import {
  __ENV__,
  NoFlags,
  NoLanes,
  NoTimestamp,
  HostRoot,
  NormalSchedulePriority,
  ImmediatePriority,
  NoPriority,
  NormalPriority,
  Incomplete,
  noTimeout,
  NoContext,
  RenderContext,
  CommitContext,
  PerformedWork,
  Placement,
  Update, 
  Deletion,
  Snapshot,
  Passive,
  ContentReset,
  Ref,
  Callback,
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
  scheduleCallback,
  runWithPriority,
  requestPaint
} from '@Jeact/scheduler';
import {
  findUpdateLane,
  mergeLanes,
  getNextLanes,
  getNextLanesPriority,
  markStarvedLanesAsExpired,
  markRootUpdated,
  LanePriorityToPriority,
  includesSomeLane,
  markRootFinished,
} from '@Jeact/vDOM/FiberLane';
import {
  createWorkInProgress
} from '@Jeact/vDOM/Fiber';
import {
  ContextOnlyDispatcher,
} from '@Jeact/vDOM/FiberHooks';
import { beginWork } from '@Jeact/vDOM/FiberBeginWork';
import {
  completeWork
} from '@Jeact/vDOM/FiberCompleteWork';
import {
  resetContextDependencies
} from '@Jeact/vDOM/FiberNewContext';
import {
  commitBeforeMutationEffectOnFiber,
  commitPlacement,
} from '@Jeact/vDOM/FiberCommitWork';
import {
  resetAfterCommit,
} from '@Jeact/vDOM/FiberHost';

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

let wipRootPingedLanes = NoLanes;
let mostRecentlyUpdatedRoot = null;
let wipRootRenderTargetTime = Infinity;
const RENDER_TIMEOUT = 500;

function resetRenderTimer(){
  wipRootRenderTargetTime = performance.now() + RENDER_TIMEOUT;
}

let nextEffect = null;

let rootDoesHavePassiveEffects = false;
let rootWithPendingPassiveEffects = null;
let pendingPassiveEffectsRenderPriority = NoPriority;
let rootsWithPendingDiscreteUpdates = null;


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
    if (existingCallbackNode !== null){
      console.log('ensureRootIsScheduled1', existingCallbackNode);
    }
    return;
  }

  // Check if there's an existing task we may be able to reuse it.
  if (existingCallbackNode !== null){
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
    root === wipRoot ?  console.error('ensureRootIsScheduled0', root, wipRoot) : NoLanes,
  );
  if (lanes === NoLanes){
    console.error('performConcurrentWorkOnRoot3')
  }

  let exitStatus = renderRootConcurrent(root, lanes);
  
  if (includesSomeLane(wipRootIncludedLanes, wipRootUpdatedLanes)){
    console.error('performConcurrentWorkOnRoot4')
  } else if(exitStatus !== RootIncomplete){
    if(exitStatus === RootErrored){
      console.error('performConcurrentWorkOnRoot5')
    }
    if (exitStatus === RootFatalErrored){
      console.error('performConcurrentWorkOnRoot6')
    }

    // now we have a consistent tree.
    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root, exitStatus, lanes);
  }
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
  CurrentDispatcher.current = prevDispatcher;
}


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
    // create a new Node by cloning root.current and set it to wip.
    prepareFreshStack(root, lanes);
  }

  workLoopConcurrent()

  resetContextDependencies();

  popDispatcher(prevDispatcher);
  executionContext = prevExecutionContext;

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
    completeUnitOfWork(unitOfWork);
  } else {
    wip = next;
  }
  CurrentOwner.current = null;
}

function completeUnitOfWork(unitOfWork){

  let completedWork = unitOfWork;
  do {
    const returnFiber = completedWork.return;
    // Check if the work completed or if something threw.
    if ((completedWork.flags & Incomplete) === NoFlags){
      setCurrentDebugFiberInDev(completedWork);
      // Process alternate.child
      let next = completeWork(completedWork, subtreeRenderLanes);
      resetCurrentDebugFiberInDev();
      if (next !== null){
        console.error('completeUnitOfWork1', next)
      }

      resetChildLanes(completedWork);

      if(returnFiber !== null &&
          (returnFiber.flags & Incomplete) === NoFlags
        ){
        if (returnFiber.firstEffect === null){
          returnFiber.firstEffect = completedWork.firstEffect;
        }
        if (completedWork.lastEffect !== null){
          console.error('completeUnitOfWork2')
        }
        const flags = completedWork.flags;
        if (flags > PerformedWork){
          if(returnFiber.lastEffect !== null){
            console.error('completeUnitOfWork3')
          } else {
            returnFiber.firstEffect = completedWork;
          }
          returnFiber.lastEffect = completedWork;
        }
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

function resetChildLanes(completedWork){
  let newChildLanes = NoLanes;
  let child = completedWork.child;
  if (child!== null){
    newChildLanes = mergeLanes(
      newChildLanes,
      mergeLanes(child.lanes, child.childLanes)
    );
    child = child.sibling;
  }

  completedWork.childLanes = newChildLanes;
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

  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  if (finishedWork === null){
    console.error('commitRootImpl2');
  }

  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  if (finishedWork === root.current){
    console.error('The same tree is being committed!')
  }

  root.callbackNode = null;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);

  if (rootsWithPendingDiscreteUpdates !== null){
    console.error('commitRootImpl3')
  }

  if (root === wipRoot) {
    console.error('commitRootImpl4')
  }

  // Get the list of effects.
  let firstEffect;
  if (finishedWork.flags > PerformedWork){
    if (finishedWork.lastEffect !== null){
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      // firstEffect = finishedWork;
      console.error('commitRootImpl6')
    }
  } else {
    console.error('commitRootImpl7');
  }

  if(firstEffect!==null){
    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;

    CurrentOwner.current = null;

    nextEffect = firstEffect;
    do{
      commitBeforeMutationEffects();
    } while(nextEffect !== null);

    nextEffect = firstEffect
    do {
      commitMutationEffects(root, renderPriority);
    } while (nextEffect !== null);
    resetAfterCommit(root.containerInfo);
    root.current = finishedWork;
    nextEffect = firstEffect;
    do{
      commitLayoutEffects(root, lanes);
    } while(nextEffect!==null);
    nextEffect = null;
    requestPaint();
    executionContext = prevExecutionContext;
  } else {
    console.error('commitRootImpl8')
  }
  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if (rootDidHavePassiveEffects){
    console.error('commitRootImpl9')
  } else {
    nextEffect = firstEffect;
    while (nextEffect !== null){
      const nextNextEffect = nextEffect.nextEffect;
      nextEffect.nextEffect = null;
      if (nextEffect.flags & Deletion){
        console.error('commitRootImpl10')
      }
      nextEffect = nextNextEffect;
    }
    remainingLanes = root.pendingLanes;

    ensureRootIsScheduled(root, performance.now());
    return null;
  }
}

function commitBeforeMutationEffects(){
  while (nextEffect !== null){
    const current = nextEffect.alternate;

    const flags = nextEffect.flags;
    if ((flags & Snapshot) !== NoFlags){
      setCurrentDebugFiberInDev(nextEffect);
      commitBeforeMutationEffectOnFiber(nextEffect);// Seems it do nothing actually..
      resetCurrentDebugFiberInDev()
    }
    if ((flags & Passive) !== NoFlags){
      console.error('commitBeforeMutationEffects2')
    }
    nextEffect = nextEffect.nextEffect;
  }
}

function commitMutationEffects(root, renderPriority){
  while (nextEffect !== null){
    setCurrentDebugFiberInDev(nextEffect);
    const flags = nextEffect.flags;
    if(flags & ContentReset){
      console.error('commitMutationEffects1')
    }
    if (flags & Ref){
      console.error('commitMutationEffects2')
    }
    const primaryFlags = flags & (Placement | Update | Deletion);
    switch(primaryFlags){
      case Placement:{//2
        commitPlacement(nextEffect);
        nextEffect.flags &= ~Placement;
        break;
      }
      default:
        primaryFlags !== 0 ?
        console.error('commitMutationEffects3', primaryFlags):0;
     }

    resetCurrentDebugFiberInDev();
    nextEffect = nextEffect.nextEffect;
  }
}

function commitLayoutEffects(root, committedLanes){
  while(nextEffect!== null){
    setCurrentDebugFiberInDev(nextEffect);
    const flags = nextEffect.flags;
    if (flags & (Update | Callback)){
      console.error('commitLayoutEffects1')
    }
    if (flags & Ref){
      console.error('commitLayoutEffects2')
    }
    resetCurrentDebugFiberInDev();
    nextEffect = nextEffect.nextEffect;
  }
}

export function flushPassiveEffects(){
  // Returns whether passive effects were flushed.
  if (pendingPassiveEffectsRenderPriority !== NoPriority){
    console.log('flushPassiveEffects2')
  }
  return false;
}

