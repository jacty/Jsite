import {
  __ENV__,
  UpdateState,
  NoLanes,
  ShouldCapture,
} from '@Jeact/shared/Constants';
import {
  isSubsetOfLanes,
  isTransitionLane,
} from '@Jeact/vDOM/FiberLane';
import {markSkippedUpdateLanes} from '@Jeact/vDOM/FiberWorkLoop';

export function initializeUpdateQueue(fiber){
  const queue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    pending:null,
    effects: null
  };
  fiber.updateQueue = queue;
}

export function cloneUpdateQueue(current, workInProgress){
  // Clone the update queue from current and disconnect the pointer between them.
  const queue = workInProgress.updateQueue;
  const currentQueue = current.updateQueue;
  if(queue === currentQueue){
    const clone = {
      baseState: currentQueue.baseState,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      pending: currentQueue.pending,
      effects: currentQueue.effects,
    };
    workInProgress.updateQueue = clone;
  }
}

export function createUpdate(eventTime, lane, element=null){
  const update = {
    eventTime,
    lane,

    tag: UpdateState,//0
    payload: {element},
    callback: null,
    
    next: null,
  };
  return update;
}

export function enqueueUpdate(fiber, update){
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null){// fiber has been unmounted.
    debugger;
    return;
  }

  const pending = updateQueue.pending;

  if (pending === null) {
    // First update.
    update.next = update;
  } else {
    debugger;
    update.next = pending.next;
    pending.next = update;
  }
  updateQueue.pending = update;
}

export function entangleTransitions(root, fiber, lane){
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null){
    // fiber unmounted.
    return;
  }
  if (isTransitionLane(lane)){
    debugger;
  }
}

function getStateFromUpdate(
  workInProgress,
  queue,
  update, 
  prevState
){
  switch (update.tag){
    // Intentional fallthrough
    case UpdateState: {
      if(typeof update.payload === 'function') debugger;
      let partialState = update.payload;     
      if (partialState === null || partialState === undefined){
        debugger;
        return prevState;
      }
      return Object.assign({}, prevState, partialState);
    }
    default:
      console.error('getStateFromUpdate2', update.tag)
  }
  return prevState;
}

export function processUpdateQueue(workInProgress,renderLanes){
  const queue = workInProgress.updateQueue;

  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  // Check if there are pending updates. If so, transfer them to the base queue.
  let pendingQueue = queue.pending;
  if (pendingQueue !== null){
    queue.pending = null;

    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    // Disconnect the pointer between first and last.
    lastPendingUpdate.next = null;

    //Append pending updates to base queue
    if (lastBaseUpdate === null){
      firstBaseUpdate = firstPendingUpdate;
    } else {
      debugger;
      lastBaseUpdate.next = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate;

    const current = workInProgress.alternate;
    if (current !== null){
      const currentQueue = current.updateQueue;
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
      if (currentLastBaseUpdate !== lastBaseUpdate){
        if (currentLastBaseUpdate === null){
          currentQueue.firstBaseUpdate = firstPendingUpdate;
        } else {
          debugger;
          currentLastBaseUpdate.next = firstPendingUpdate;
        }
        currentQueue.lastBaseUpdate = lastPendingUpdate;
      }
    }
  }

  if (firstBaseUpdate !== null){
      let newState = queue.baseState;
      let newLanes = NoLanes;

      let newBaseState = null;
      let newFirstBaseUpdate = null;
      let newLastBaseUpdate = null;

      let update = firstBaseUpdate;
      do {
        const updateLane = update.lane;
        const updateEventTime = update.eventTime;
        if(!isSubsetOfLanes(renderLanes, updateLane)){
          debugger;
        } else {
          if(newLastBaseUpdate!==null){
            debugger;
          }

          // Process this update.
          newState = getStateFromUpdate(
            workInProgress,
            queue,
            update,
            newState
          );

          const callback = update.callback;
          if (callback !== null) {
            debugger;
          }        
        }
        update = update.next;
        if (update=== null){
          pendingQueue = queue.pending;
          if (pendingQueue === null){
            break;
          } else {
            debugger;
          }
        }
      } while(true);

      if (newLastBaseUpdate === null){
        newBaseState = newState;
      }

      queue.baseState = newBaseState;
      queue.firstBaseUpdate = newFirstBaseUpdate;
      queue.lastBaseUpdate = newLastBaseUpdate;

      const lastInterleaved = queue.interleaved;
      if (lastInterleaved !== undefined){
        debugger;
      } else if (firstBaseUpdate === null){
        debugger;
      }

      markSkippedUpdateLanes(newLanes);
      workInProgress.lanes = newLanes;
      workInProgress.memoizedState = newState;
  }
}
