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
  PerformedWork,
  Placement,
  Snapshot, 
  RetryAfterError,
  HostRoot
} from '@Jeact/shared/Constants';
import {
  CurrentOwner,
} from '@Jeact/shared/internals';
import {
  shouldYieldToHost,
  scheduleCallback,
  runWithPriority,
} from '@Jeact/scheduler';
import {
  mergeLanes,
  markStarvedLanesAsExpired,
  markRootUpdated,
  includesSomeLane,
  markRootFinished,
  getNextLanes,
} from '@Jeact/vDOM/FiberLane';
import {
  createWorkInProgress
} from '@Jeact/vDOM/Fiber';
import { beginWork } from '@Jeact/vDOM/FiberBeginWork';
import {
  throwException
} from '@Jeact/vDOM/FiberThrow';
import {
  completeWork
} from '@Jeact/vDOM/FiberCompleteWork';
import {
  commitPlacement,
  commitBeforeMutationLifeCycles,
} from '@Jeact/vDOM/FiberCommitWork';
import {
  resetHooksAfterThrow
} from '@Jeact/vDOM/FiberHooks';

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
let wipRootUpdatedLanes = NoLanes;

let nextLanesPriority = 0;
let nextLanes = NoLanes;
let nextEffect = null;

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
  // Update fiber.lanes
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);

  if(root === null){
    return null;
  }
  // update root.pendingLane, eventTimes etc.
  markRootUpdated(root, lane, eventTime);
  if(root === wipRoot){
    console.error('scheduleUpdateOnFiber');
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
    console.error('markUpdateLaneFromFiberToRoot');
  }

  let node = fiber;
  let parent = fiber.return;
  while(parent!==null){
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

  [nextLanes, nextLanesPriority] = getNextLanes(
    root, 
    root===wipRoot ? wipRootRenderLanes : NoLanes,
  );
  
  if (nextLanes === NoLanes){
     if (existingCallbackNode !== null){
       console.error('ensureRootIsScheduled1')
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
  let exitStatus = renderRootConcurrent(root, nextLanes);
  if (includesSomeLane(wipRootIncludedLanes, wipRootUpdatedLanes)){
    console.error('performConcurrentWorkOnRoot4')
  } else if(exitStatus !== RootIncomplete){
    if(exitStatus === RootErrored || exitStatus===RootFatalErrored){
      console.error('Error')
      executionContext |= RetryAfterError;
      return null;
    }

    // now we have a consistent tree.
    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork;
    root.finishedLanes = nextLanes;
    finishConcurrentRender(root, exitStatus);
  }
  //schedule to finish Incomplete work.
  ensureRootIsScheduled(root, performance.now());
  if (exitStatus!==RootCompleted){
    // Continue expired tasks.
    return performConcurrentWorkOnRoot.bind(null, root, nextLanes);
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
    console.log('interruptedWork');
  }
  wipRoot = root;
  wip = createWorkInProgress(root.current);
  wipRootRenderLanes = subtreeRenderLanes =
    wipRootIncludedLanes = updateLanes;
  wipRootExitStatus = RootIncomplete;
  wipRootFatalError = null;
  wipRootUpdatedLanes = NoLanes;
}

function renderRootConcurrent(root, updateLanes){
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;

  // If the root or lanes have changed, throw out the existing stack
  // and prepare a fresh one. Otherwise we'll continue where we left off.
  if (wipRoot !== root || wipRootRenderLanes !== updateLanes){
    // GET WIP:create a new Node by cloning root.current and set it to wip.
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
    const returnFiber = completedWork.return;

    if ((completedWork.flags & Incomplete) === NoFlags){
      
      completeWork(completedWork, subtreeRenderLanes);

      if(returnFiber !== null &&
          (returnFiber.flags & Incomplete) === NoFlags){
        // Append all the effects of the subtree and this fiber onto the effect
        // list of the parent. The completion order of the children affects the
        // side-effect order.
        if (returnFiber.firstEffect === null){
          returnFiber.firstEffect = completedWork.firstEffect;
        }
        if (completedWork.lastEffect !== null){
          if (returnFiber.lastEffect !== null){
            returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
          }
          returnFiber.lastEffect = completedWork.lastEffect;
        }

        const flags = completedWork.flags;
        if (flags > PerformedWork){
          if(returnFiber.lastEffect !== null){// next sibling effect.
            returnFiber.lastEffect.nextEffect = completedWork;
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
    ImmediatePriority,
    commitRootImpl.bind(null, root),
  );
  return null;
}

function commitRootImpl(root, renderPriority){
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  root.callbackNode = null;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  //update lanes and eventTimes
  markRootFinished(root, remainingLanes);

  // Get the list of effects.
  let firstEffect;
  if (finishedWork.flags > PerformedWork){
    if (finishedWork.lastEffect !== null){
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    // There is no effect on the root.
    firstEffect = finishedWork.firstEffect;
  }

  if(firstEffect!==null){
    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;

    nextEffect = firstEffect;
    do {
      commitBeforeMutationEffects();
    } while (nextEffect !== null);

    nextEffect = firstEffect
    do {
      commitMutationEffects(root, renderPriority);
    } while (nextEffect !== null);
    // now wip tree is now the current tree. 
    root.current = finishedWork;

    // nextEffect = firstEffect;
    // do{
    //   commitLayoutEffects(root, lanes);
    // } while(nextEffect!==null);

    nextEffect = null;
    executionContext = prevExecutionContext;
  } else {
    // No effects.
    root.current = finishedWork;
  }

  // GC
  nextEffect = firstEffect;
  while (nextEffect !== null){
    const nextNextEffect = nextEffect.nextEffect;
    nextEffect.nextEffect = null;
    nextEffect = nextNextEffect;
  }

  ensureRootIsScheduled(root, performance.now());
  root.callbackNode = null;
  return null;
}

function commitBeforeMutationEffects(){
  while (nextEffect !== null){
    const current = nextEffect.alternate;

    const flags = nextEffect.flags;
    if ((flags & Snapshot )!== NoFlags){
      commitBeforeMutationLifeCycles(current, nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }
}

function commitMutationEffects(root, renderPriority){
  while (nextEffect !== null){   
    const flags = nextEffect.flags;
    const primaryFlags = flags & Placement;
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

    nextEffect = nextEffect.nextEffect;
  }
}

function commitLayoutEffects(root, committedLanes){
  while(nextEffect!== null){
    
    const flags = nextEffect.flags;


    nextEffect = nextEffect.nextEffect;
  }
}

export function updateEventWipLanes(){
  if (currentEventWipLanes === NoLanes){
    currentEventWipLanes = wipRootIncludedLanes;
  }
}