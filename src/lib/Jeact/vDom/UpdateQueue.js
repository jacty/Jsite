import {
  __ENV__,
  UpdateState,
  NoLanes,
} from '@Jeact/shared/Constants';
import {
  isSubsetOfLanes,
} from '@Jeact/vDOM/FiberLane';
import { markSkippedUpdateLanes } from '@Jeact/vDOM/FiberWorkLoop';

let hasForceUpdate = false;
let currentlyProcessingQueue;

export function cloneUpdateQueue(workInProgress){
  const queue = workInProgress.updateQueue;
  const currentQueue = workInProgress.alternate.updateQueue;
  if (queue === currentQueue){
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
  let pending = updateQueue.pending;
  if (pending === null) {
    // This is the first update.
    update.next = update;
  } else {
    console.log('another update');
  }
  updateQueue.pending = update;
}

function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance){

  switch (update.tag){
    case UpdateState: {
      const payload = update.payload;
      let partialState;
      if (typeof payload === 'function'){// Updater function
        console.error('getStateFromUpdate1')
      } else {
        // Partial state object
        partialState = payload;
      }
      if (partialState === null || partialState === undefined){
        // Null and undefined are treated as no-ops.
        return prevState;
      }
      // Merge the partial state and the previous state.
      return Object.assign({}, prevState, partialState);
    }
    default:
      console.error('getStateFromUpdate2', update.tag)
  }
  return prevState;
}

export function processUpdateQueue(workInProgress, props, instance, renderLanes){

  const queue = workInProgress.updateQueue;

  hasForceUpdate = false;

  if (__ENV__){
    currentlyProcessingQueue = queue.pending;
  }


  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  // Check if there are pending updates. If so, transfer them to the base queue.
  let pendingQueue = queue.pending;
  if (pendingQueue !== null){
    queue.pending = null;

    // Disconnect the pointer between first and last.
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    // Append pending updates to base queue
    if (lastBaseUpdate === null){
      firstBaseUpdate = firstPendingUpdate;
    } else {
      console.error('processUpdateQueue2')
    }
    lastBaseUpdate = lastPendingUpdate;

    const current = workInProgress.alternate;
    if (current !== null){
      // Update relevantly as above.
      // TODO: clone workInProgress.updateQueue to current.updateQueue?
      const currentQueue = current.updateQueue;
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
      if (currentLastBaseUpdate !== lastBaseUpdate){
        if (currentLastBaseUpdate === null){
          currentQueue.firstBaseUpdate = firstPendingUpdate;
        } else {
          console.error('processUpdateQueue1')
        }
        currentQueue.lastBaseUpdate = lastPendingUpdate;
      }
    }
  }

  // These values may change as we process the queue.
  if (firstBaseUpdate !== null){
      // Iterate through the list of updates to compute the result.
      let newState = queue.baseState;
      // TODO: Don't need to accumulate this. Instead, we can remove
      // renderLanes from the original lanes.
      let newLanes = NoLanes;

      let newBaseState = null;
      let newFirstBaseUpdate = null;
      let newLastBaseUpdate = null;

      let update = firstBaseUpdate;

      do {
        const updateLane = update.lane;
        if(!isSubsetOfLanes(renderLanes, updateLane)){
          console.error('processUpdateQueue3')
        } else {
          // This update does have sufficient priority.
          if (newLastBaseUpdate !== null){
            console.error('processUpdateQueue4');
          }
          // Process this update.
          newState = getStateFromUpdate(
            workInProgress,
            queue,
            update,
            newState,
            props,
            instance,
          );
          const callback = update.callback;
          if (callback !== null) {
            console.error('processUpdateQueue5');
          }
        }

        update = update.next;
        if (update=== null){
          pendingQueue = queue.pending;
          if (pendingQueue === null){
            break;
          } else {
            console.error('processUpdateQueue7');
          }
        }
      } while(true);

      if (newLastBaseUpdate === null){
        newBaseState = newState;
      }

      queue.baseState = newBaseState;
      queue.firstBaseUpdate = newFirstBaseUpdate;
      queue.lastBaseUpdate = newLastBaseUpdate;

      markSkippedUpdateLanes(newLanes);
      workInProgress.lanes = newLanes;
      workInProgress.memoizedState = newState;
  }
}
