import {
  NoLane,
  NoLanes,
  DefaultLane,
  NoTimestamp,
  RetryLanes,
  EventLane,
  RetryLane1
} from '@Jeact/shared/Constants';

let nextRetryLane = RetryLane1;

function getHighestPriorityLanes(lanes){
  switch(getHighestPriorityLane(lanes)){
    case EventLane:
      return EventLane;
    case RetryLane1:
      return lanes & RetryLanes;
    case DefaultLane:
    default:
      return DefaultLane
  }
}

export function getNextLanes(root, wipLanes){
  const pendingLanes = root.pendingLanes;
  if (pendingLanes === NoLanes){
    return NoLanes;
  }
  
  let nextLanes = NoLanes;

  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  
  const nonIdleUnblockedLanes = pendingLanes & ~suspendedLanes;
  if (nonIdleUnblockedLanes !== NoLanes){
    nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
  }
  
  if (nextLanes === NoLanes){
    // suspended case
    debugger;
    return NoLanes;
  }

  return nextLanes;
}

function computeExpirationTime(lane, currentTime){
  switch (lane){
    case EventLane:
      return currentTime + 250;
    case DefaultLane:
    case RetryLane1:
      return currentTime + 5000;
    default:
      return NoTimestamp;
  }
}

export function markStarvedLanesAsExpired(root, currentTime){
  let lanes = root.pendingLanes;
  if(lanes === 0){// early bail out.
    return;
  }
  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  const expirationTimes = root.expirationTimes;

  // Iterate through the pending lanes and check if we've reached their expiration time. If so, we'll assume the update is being starved and mark it as expired to force it to finish.
  let expiredLanes = 0;
  while (lanes > 0) {
    const index = laneToIndex(lanes);
    const lane = 1 << index; // move 1 towards left for {index} bits.
    
    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp){
      if (
        (lane & suspendedLanes) === NoLanes ||
        (lane & pingedLanes) !== NoLanes
        ){
        expirationTimes[index] = computeExpirationTime(lane, currentTime);
      }
    } else if(expirationTime <= currentTime){
      // This lane expired
      expiredLanes |= lane;
    }
    lanes &= ~lane;
  }

  if (expiredLanes !== 0){
    markRootExpired(root, expiredLanes);
  }
}

export function includesOnlyRetries(lanes){
  return (lanes & RetryLanes) === lanes;
}

export function requestUpdateLane(){
  const currentEvent = window.event;
  if (currentEvent === undefined){
    return DefaultLane;
  }
  return EventLane;
}

export function claimNextRetryLane(){
  const lane = nextRetryLane;
  nextRetryLane <<= 1;
  if((nextRetryLane & RetryLanes) === 0){
    nextRetryLane = RetryLane1;
  }
  return lane;
}

export function getHighestPriorityLane(lanes){
  return lanes & -lanes; 
}

function laneToIndex(lanes){
  return 31 - Math.clz32(lanes);
}

export function includesSomeLane(a, b){
  return (a & b) !== NoLanes;
}

export function isSubsetOfLanes(set, subset){
  return (set & subset) === subset;
}

export function mergeLanes(a, b){
  return a | b;
}

export function markRootUpdated(root, updateLane, eventTime){
  root.pendingLanes |= updateLane;
  
  const eventTimes = root.eventTimes;
  const index = laneToIndex(updateLane);

  eventTimes[index] = eventTime;
}

export function markRootSuspended(root, suspendedLanes){
  root.suspendedLanes |= suspendedLanes;
  root.pingedLanes &= ~suspendedLanes;
  // The suspended lanes are no longer CPU-bound. Clear the expiration times.
  const expirationTimes = root.expirationTimes;
  let lanes = suspendedLanes;
  while (lanes > 0){
    const index = laneToIndex(lanes);
    const lane = 1 << index;

    expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }
}

export function markRootPinged(root, pingedLanes, eventTime){
  root.pingedLanes |= root.suspendedLanes & pingedLanes;
}

export function markRootFinished(root, remainingLanes){
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes;

  root.pendingLanes = remainingLanes;
  root.suspendedLanes = 0;
  root.entangledLanes &= remainingLanes;

  const pooledCacheLanes = root.pooledCacheLanes &= remainingLanes;
  if(pooledCacheLanes === NoLanes){
    root.pooledCache = null;
  }

  const eventTimes = root.eventTimes;
  const expirationTimes = root.expirationTimes;

  // Clear the lanes that no longer have pending work
  let lanes = noLongerPendingLanes;
  while(lanes > 0){
    const index = laneToIndex(lanes);
    const lane = 1 << index;

    eventTimes[index] = 0;
    expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }
}
