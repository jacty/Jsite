// UpdateQueue is a linked list of prioritized updates.
//
// Like fibers, update queues come in pairs: a current queue, which represents
// the visible state of the screen, and a work-in-progress queue, which can be
// mutated and processed asynchronously before it is committed — a form of
// double buffering. If a work-in-progress render is discarded before
// finishing, we create a new work-in-progress by cloning the current queue.
//
// Both queues share a persistent, singly-linked list structure. To schedule an
// update, we append it to the end of both queues. Each queue maintains a
// pointer to first update in the persistent list that hasn't been processed.
// The work-in-progress pointer always has a position equal to or greater than
// the current queue, since we always work on that one. The current queue's
// pointer is only updated during the commit phase, when we swap in the
// work-in-progress.
//
// For example:
//
//   Current pointer:           A - B - C - D - E - F
//   Work-in-progress pointer:              D - E - F
//                                          ^
//                                          The work-in-progress queue has
//                                        processed more updates than current.
//
// The reason we append to both queues is because otherwise we might drop
// updates without ever processing them. For example, if we only add updates to
// the work-in-progress queue, some updates could be lost whenever a work-in
// -progress render restarts by cloning from current. Similarly, if we only add
// updates to the current queue, the updates will be lost whenever an already
// in-progress queue commits and swaps with the current queue. However, by
// adding to both queues, we guarantee that the update will be part of the next
// work-in-progress. (And because the work-in-progress queue becomes the
// current queue once it commits, there's no danger of applying the same
// update twice.)
//
// Prioritization
// --------------
//
// Updates are not sorted by priority, but by insertion; new updates are always
// appended to the end of the list.
//
// The priority is still important, though. When processing the update queue
// during the render phase, only the updates with sufficient priority are
// included in the result. If we skip an update because it has insufficient
// priority, it remains in the queue to be processed later, during a lower
// priority render. Crucially, all updates subsequent to a skipped update also
// remain in the queue *regardless of their priority*. That means high priority
// updates are sometimes processed twice, at two separate priorities. We also
// keep track of a base state, that represents the state before the first
// update in the queue is applied.
//
// For example:
//
//   Given a base state of '', and the following queue of updates
//
//     A1 - B2 - C1 - D2
//
//   where the number indicates the priority, and the update is applied to the
//   previous state by appending a letter, Jeact will process these updates as
//   two separate renders, one per distinct priority level:
//
//   First render, at priority 1:
//     Base state: ''
//     Updates: [A1, C1]
//     Result state: 'AC'
//
//   Second render, at priority 2:
//     Base state: 'A'            <-  The base state does not include C1,
//                                    because B2 was skipped.
//     Updates: [B2, C1, D2]      <-  C1 was rebased on top of B2
//     Result state: 'ABCD'
//
// Because we process updates in insertion order, and rebase high priority
// updates when preceding updates are skipped, the final result is
// deterministic regardless of priority. Intermediate state may vary according
// to system resources, but the final state is always the same.

import {
  __ENV__,
  UpdateState,
  NoLanes,
} from '../shared/Constants';
import {
  isSubsetOfLanes,
} from './JeactFiberLane';
import { markSkippedUpdateLanes } from './JeactFiberWorkLoop';

// Global state that is reset at the beginning of calling `processUpdateQueue`.
// It should only be read right after calling `processUpdateQueue`, via
// `checkHasForceUpdateAfterProcessing`.
let hasForceUpdate = false;

let currentlyProcessingQueue;

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

export function cloneUpdateQueue(current, workInProgress){
  // Clone the update queue from current. Unless it's already a clone.
  const queue = workInProgress.updateQueue;
  const currentQueue = current.updateQueue;

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
  if(updateQueue === null) {
    // Only occurs if the fiber has been unmounted.
    return;
  }

  let pending = updateQueue.pending;
  if (pending === null) {
    // This is the first update. Create a circular list.
    update.next = update;// Why not just set it to sharedQueue.pending only?
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
  // This is always non-null on a ClassComponent or HostRoot
  const queue = workInProgress.updateQueue;

  hasForceUpdate = false;

  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  // Check if there are pending updates. If so, transfer them to the base queue.
  let pendingQueue = queue.pending;

  if (pendingQueue !== null){
    queue.pending = null;

    // The pending queue is circular. Disconnect the pointer between first and
    // last so that it's non-circular.
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

    // If there's a current queue, and it's different from the base queue, then
    // we need to transfer the updates to that queue, too. Because the base
    // queue is a singly-linked list with no cycles, we can append to both
    // lists and take advantage of structural sharing.
    // TODO: Pass `current` as argument
    const current = workInProgress.alternate;
    if (current !== null){
      // This is always non-null on a ClassComponent or HostRoot
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
