import {
  UpdateState,
//   NoLanes,
} from '@Jeact/shared/Constants';
// import {
//   isSubsetOfLanes,
// } from '@Jeact/vDom/FiberLane';
// import { markSkippedUpdateLanes } from '@Jeact/vDom/FiberWorkLoop';


export function initializeUpdateQueue(fiber){
  const queue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    pending: null,
    effects: null,
  };
  fiber.updateQueue = queue;
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

function getStateFromUpdate(workInProgress, queue, update, nextProps, instance){
  console.error('getStateFromUpdate');
  return;
  const prevState = queue.baseState;
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

export function processUpdateQueue(
  workInProgress, 
  props, 
  instance, 
  renderLanes){
  console.error('processUpdateQueue');
  return;
  // This is always non-null on a ClassComponent or HostRoot
  const queue = workInProgress.updateQueue;

  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  // Check if there are pending updates. If so, transfer them to the base queue.

  let pendingQueue = queue.pending;
  if (pendingQueue !== null){
    queue.pending = null;

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
      let newState;
      // TODO: Don't need to accumulate this. Instead, we can remove
      // renderLanes from the original lanes.
      let newLanes = NoLanes;

      let newBaseState = null;
      let newFirstBaseUpdate = null;
      let newLastBaseUpdate = null;

      let update = firstBaseUpdate;
      do {
        const updateLane = update.lane;
        const updateEventTime = update.eventTime;
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

      // Set the remaining expiration time to be whatever is remaining in the queue.
      // This should be fine because the only two other things that contribute
      // to expiration time are props and context. We're already in the middle
      // of the begin phase by the time we start processing the queue, so
      // we've already dealt with the props. Context in components that
      // specify shouldComponentUpdate is tricky. but we'll have to account
      // for that regardless.
      markSkippedUpdateLanes(newLanes);

      workInProgress.lanes = newLanes;
      workInProgress.memoizedState = newState;
  }
}
