import {
  __ENV__,
  UpdateState,
  NoLanes,
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
    shared: {
      pending: null,
      interleaved: null,
      lanes: NoLanes,
    },
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
      shared: currentQueue.shared,
      effects: currentQueue.effects,
    };
    workInProgress.updateQueue = clone;
  }
}

export function createUpdate(eventTime, lane){
  const update = {
    eventTime,
    lane,

    tag: UpdateState,
    payload: null,
    callback: null,
    
    next: null,
  };
  return update;
}

export function enqueueUpdate(fiber, update){
  const updateQueue = fiber.updateQueue;

  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;

  if (pending === null) {
    // First update.
    update.next = update;
  } else {
    // TD: Add more explanation
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;
}

export function entangleTransitions(rootFiber, currentFiber, lane){
  const updateQueue = currentFiber.updateQueue;
  if (isTransitionLane(lane)){
    console.error('entangleTransitions');
  }
}

function getStateFromUpdate(update, prevState){
  switch (update.tag){
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
  let pendingQueue = queue.shared.pending;
  if (pendingQueue !== null){
    queue.shared.pending = null;

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
          pendingQueue = queue.shared.pending;
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

      const lastInterleaved = queue.shared.interleaved;
      if (lastInterleaved !== null){
        debugger;
      } else if (firstBaseUpdate === null){
        debugger;
      }

      markSkippedUpdateLanes(newLanes);
      workInProgress.lanes = newLanes;
      workInProgress.memoizedState = newState;
  }
}
