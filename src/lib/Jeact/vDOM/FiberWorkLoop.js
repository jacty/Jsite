import {
  __ENV__,
  NoFlags,
  NoLanes,
  NoTimestamp,
  ImmediatePriority,
  Incomplete,
  NoContext,
  RenderContext,
  CommitContext,
  PerformedWork,
  Placement, 
} from '@Jeact/shared/Constants';
import {
  CurrentOwner,
  CurrentDispatcher
} from '@Jeact/shared/internals';
import {
  setCurrentFiber,
  resetCurrentFiber,
} from '@Jeact/shared/dev'
import {
  shouldYieldToHost,
  scheduleCallback,
  runWithPriority,
} from '@Jeact/scheduler';
import {
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
  throwException
} from '@Jeact/vDOM/FiberThrow';
import {
  completeWork
} from '@Jeact/vDOM/FiberCompleteWork';
import {
  commitPlacement,
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

let wipRootSkippedLanes = NoLanes;
let wipRootUpdatedLanes = NoLanes;

let wipRootPingedLanes = NoLanes;

let wipRootRenderTargetTime = Infinity;
const RENDER_TIMEOUT = 500;

function resetRenderTimer(){// Used by Suspense
  wipRootRenderTargetTime = performance.now() + RENDER_TIMEOUT;
}

let nextEffect = null;

let currentEventTime = NoTimestamp;

export function requestEventTime(){
  // This is the first update.
  currentEventTime = performance.now();

  return currentEventTime;
}

export function scheduleUpdateOnFiber(fiber, lane, eventTime){
  // Update fiber.lanes
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);

  // update root.pendingLane, eventTimes etc.
  markRootUpdated(root, lane, eventTime);
  ensureRootIsScheduled(root, eventTime);
}

function markUpdateLaneFromFiberToRoot(fiber, lane){
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  return fiber.stateNode;
}

function ensureRootIsScheduled(root, currentTime){
  const existingCallbackNode = root.callbackNode;
  // update root.expirationTime. 
  // TODO: Possible to merge with markRootUpdated()?
  markStarvedLanesAsExpired(root, currentTime);

  const nextLanes = getNextLanes(
    root,
    root === wipRoot ? wipRootRenderLanes : NoLanes,
  );

  if (nextLanes === NoLanes){
    if (existingCallbackNode !== null){
      // There shouldn't have tasks to work on.
      console.log('ensureRootIsScheduled1', existingCallbackNode);
    }
    return;
  }
  
  // Check if there's an existing task. We may be able to reuse it.
  if (existingCallbackNode !== null){
    return;
  }

  const newCallbackPriority = getNextLanesPriority();

  // Schedule a new callback.
  const priority = LanePriorityToPriority(newCallbackPriority);
  let newCallbackNode = scheduleCallback(
    priority,
    performConcurrentWorkOnRoot.bind(null, root, nextLanes),
  )

  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}

// Entry point for every concurrent task, i.e. anything that
// goes through Scheduler.
function performConcurrentWorkOnRoot(root, nextLanes){
  currentEventTime = NoTimestamp;

  let exitStatus = renderRootConcurrent(root, nextLanes);

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

  if (wip !== null){// interrupted work.
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
  do {
    let erroredWork = wip;
    try{
      resetContextDependencies();
      resetHooksAfterThrow();
      resetCurrentFiber();

      CurrentOwner.current = null;
      if (erroredWork === null || erroredWork.return === null){
        console.error('handleError1');
      }
      throwException(
        root,
        erroredWork.return,
        erroredWork,
        thrownValue,
        wipRootRenderLanes,
      );
      console.error('handleError', erroredWork);
      completeUnitOfWork(erroredWork);
    } catch (yetAnotherThrownValue){
      console.error('handleError.catch', wip);
    }
    return;
  } while(true);
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
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;

  // If the root or lanes have changed, throw out the existing stack
  // and prepare a fresh one. Otherwise we'll continue where we left off.
  if (wipRoot !== root || wipRootRenderLanes !== lanes){
    resetRenderTimer();
    // GET WIP:create a new Node by cloning root.current and set it to wip.
    prepareFreshStack(root, lanes);
  }

  //Keep trying until all caught error handled.
  // do{
    // try {
      workLoopConcurrent();
      // break;
    // } catch(thrownValue){
      // handleError(root, thrownValue);
    // }
  // } while (true);
 
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
  // The current state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const alternate = unitOfWork.alternate;
  if(__ENV__){
    setCurrentFiber(unitOfWork);    
  }

  let next = beginWork(alternate, unitOfWork, subtreeRenderLanes);

  if(__ENV__){
    resetCurrentFiber()
  }

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null){
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
    const alternate = completedWork.alternate;
    const returnFiber = completedWork.return;
    // Check if the work completed or if something threw.

    if ((completedWork.flags & Incomplete) === NoFlags){
      setCurrentFiber(completedWork);
      // Process alternate.child
      let next = completeWork(alternate, completedWork, subtreeRenderLanes);

      resetCurrentFiber();
      if (next !== null){
        console.error('completeUnitOfWork1', next)
      }

      if(returnFiber !== null &&
        // Do not append effects to parents if a sibling failed to complete.
          (returnFiber.flags & Incomplete) === NoFlags
        ){
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
  runWithPriority(
    ImmediatePriority,
    commitRootImpl.bind(null, root),
  );
  return null;
}

function commitRootImpl(root, renderPriority){

  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  if (finishedWork === null){
    console.error('commitRootImpl2');
    return null;
  }

  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  if (finishedWork === root.current){
    console.error('The same tree is being committed!')
  }

  root.callbackNode = null;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);//update lanes and eventTimes

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
      firstEffect = finishedWork;
    }
  } else {
    firstEffect = finishedWork.firstEffect;
  }

  if(firstEffect!==null){
    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;

    CurrentOwner.current = null;

    nextEffect = firstEffect;
    do{
      commitBeforeMutationEffects();//Update flag
    } while(nextEffect !== null);

    nextEffect = firstEffect
    do {
      commitMutationEffects(root, renderPriority);
    } while (nextEffect !== null);

    root.current = finishedWork;

    nextEffect = firstEffect;
    do{
      commitLayoutEffects(root, lanes);
    } while(nextEffect!==null);

    nextEffect = null;
    executionContext = prevExecutionContext;
  } else {
    root.current = finishedWork;
  }

  nextEffect = firstEffect;
  while (nextEffect !== null){
    const nextNextEffect = nextEffect.nextEffect;
    nextEffect.nextEffect = null;
    nextEffect = nextNextEffect;
  }

  remainingLanes = root.pendingLanes;

  ensureRootIsScheduled(root, performance.now());
  root.callbackNode = null;
  return null;
}

function commitBeforeMutationEffects(){
  while (nextEffect !== null){
    const flags = nextEffect.flags;
    nextEffect = nextEffect.nextEffect;
  }
}

function commitMutationEffects(root, renderPriority){
  while (nextEffect !== null){
    __ENV__ ? setCurrentFiber(nextEffect):'';
    
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

    __ENV__ ? resetCurrentFiber() : '';

    nextEffect = nextEffect.nextEffect;
  }
}

function commitLayoutEffects(root, committedLanes){
  while(nextEffect!== null){
    __ENV__ ? setCurrentFiber(nextEffect) : '';
    
    const flags = nextEffect.flags;

    __ENV__ ? resetCurrentFiber():'';

    nextEffect = nextEffect.nextEffect;
  }
}
