import {
  __ENV__,
  UpdateState,
  NoLanes,
} from '@Jeact/shared/Constants';
import {
  isSubsetOfLanes,
} from '@Jeact/vDOM/FiberLane';
import { markSkippedUpdateLanes } from '@Jeact/vDOM/FiberWorkLoop';

let currentlyProcessingQueue;// to denote currently processing queue in DEV.

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
    // First update.
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  updateQueue.pending = update;

}

function getStateFromUpdate(update, prevState){
  switch (update.tag){
    case UpdateState: {
      const payload = update.payload;
      let partialState;
      // Partial state object
      partialState = payload;
      
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

export function processUpdateQueue(
  workInProgress,  
  renderLanes,
){

  const queue = workInProgress.updateQueue;
  const props = workInProgress.pendingProps;


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
          currentLastBaseUpdate.next = firstPendingUpdate;
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
            update,
            newState
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
